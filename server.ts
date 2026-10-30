import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Model caller: uses gemini-3.1-flash-lite for instant sub-second response,
 * with graceful fallback to gemini-3.8-flash.
 */
async function generateWithFallback(params: {
  contents: string;
  systemInstruction: string;
  responseSchema?: any;
}) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: 'application/json',
          ...(params.responseSchema ? { responseSchema: params.responseSchema } : {}),
        },
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      if (i === models.length - 1) {
        throw err;
      }
    }
  }

  throw new Error('All model attempts failed.');
}

async function startServer() {
  const app = express();
  // Cloud Run deployment requirement: use process.env.PORT || 8080
  const PORT = Number(process.env.PORT) || 8080;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Extract action items & generate email endpoint
  app.post('/api/extract-actions', async (req: Request, res: Response) => {
    try {
      const {
        notes,
        meetingTitle,
        grouping = 'by_owner',
        tone = 'professional',
        senderName = 'Project Management',
      } = req.body;

      if (!notes || typeof notes !== 'string' || !notes.trim()) {
        return res.status(400).json({ error: 'Meeting notes text is required.' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
        });
      }

      // Check if the input is a direct request to write a client blast
      const lowerNotes = notes.toLowerCase();
      const lowerTitle = (meetingTitle || '').toLowerCase();
      const isClientBlastRequest =
        lowerNotes.includes('client blast') ||
        lowerNotes.includes('write a client blast') ||
        lowerNotes.includes('customer blast') ||
        lowerTitle.includes('client blast');

      // If it is explicitly a standalone request to write a client blast, strictly refuse immediately
      if (isClientBlastRequest && !lowerNotes.includes('attendees:') && !lowerNotes.includes('agenda:')) {
        return res.json({
          subject: 'Refusal: Client Blast Requests Are Strictly Prohibited',
          executiveSummary:
            'Request refused. This application is strictly dedicated to extracting internal action items from meeting notes into team emails. Writing external client blasts or customer broadcasts is strictly prohibited.',
          emailBody:
            'I cannot fulfill this request. You requested to write a client blast. Per the system policy, this tool is strictly restricted to extracting internal action items from meeting notes and formatting them into team action emails. It strictly refuses to write client blasts or external customer announcements.',
          actionItems: [],
          isRefused: true,
          refusalMessage:
            'Request strictly refused: Writing client blasts or external customer broadcasts is prohibited. This tool only processes internal meeting notes into action emails.',
          tbdWarnings: [],
          statistics: {
            totalActions: 0,
            tbdDeadlinesCount: 0,
            uniqueOwnersCount: 0,
          },
          _meta: { ruleEnforced: 'STRICT_CLIENT_BLAST_REFUSAL' },
        });
      }

      const prompt = `
MEETING CONTEXT:
${meetingTitle ? `Meeting Title / Subject: ${meetingTitle}\n` : ''}
Preferred Grouping: ${grouping} (options: by_owner, bulleted_list, by_priority)
Email Tone: ${tone} (options: professional, concise, executive)
Sender Sign-off Name: ${senderName}

RAW MEETING NOTES / TRANSCRIPT:
"""
${notes}
"""

INSTRUCTIONS:
1. Extract ALL internal actionable tasks, their owners, and dates.
2. If multiple tasks are assigned to one person, list every single task for that person.
3. CRITICAL DEADLINE RULE: If a deadline is not explicitly mentioned in the notes, write "[TBD]" for the deadline. NEVER invent, guess, or assume any deadlines.
4. CRITICAL FILTERING RULE: NEVER include non-actionable background discussions, social chit-chat, mic checks, or general conversational context. Only extract concrete commitments and deliverables.
5. CRITICAL CLIENT BLAST RULE: You must strictly REFUSE to write a client blast, customer broadcast, or external blast. If the input is a request to write a client blast, set isRefused to true and provide an explicit refusal explanation.
6. Assemble a complete, ready-to-send internal action email draft in emailBody with bullet points, owners, dates, and sign-off.
`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          subject: {
            type: Type.STRING,
            description: 'Concise, professional email subject line',
          },
          executiveSummary: {
            type: Type.STRING,
            description: '1-2 sentence actionable executive recap of meeting outcomes (strictly no background fluff)',
          },
          emailBody: {
            type: Type.STRING,
            description: 'The complete formatted email text ready to send, with greeting, bulleted action items, dates, and sign-off',
          },
          actionItems: {
            type: Type.ARRAY,
            description: 'List of extracted action items',
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'Sequential item ID, e.g. item-1' },
                task: { type: Type.STRING, description: 'Actionable task description' },
                owner: { type: Type.STRING, description: 'Assigned owner name or [Unassigned]' },
                deadline: { type: Type.STRING, description: 'Deadline date string or strictly [TBD]' },
                hasTbdDeadline: { type: Type.BOOLEAN, description: 'True if deadline is [TBD] or unspecified' },
                category: { type: Type.STRING, description: 'Functional area, e.g. Engineering, Product, Marketing, QA, Ops' },
              },
              required: ['id', 'task', 'owner', 'deadline', 'hasTbdDeadline'],
            },
          },
          isRefused: {
            type: Type.BOOLEAN,
            description: 'True if the request was to write a client blast or external broadcast, which must be strictly refused',
          },
          refusalMessage: {
            type: Type.STRING,
            description: 'Explanation if refused due to client blast request; otherwise empty string',
          },
          tbdWarnings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of items or owners that need confirmation or have [TBD] deadlines',
          },
          statistics: {
            type: Type.OBJECT,
            properties: {
              totalActions: { type: Type.INTEGER },
              tbdDeadlinesCount: { type: Type.INTEGER },
              uniqueOwnersCount: { type: Type.INTEGER },
            },
            required: ['totalActions', 'tbdDeadlinesCount', 'uniqueOwnersCount'],
          },
        },
        required: ['subject', 'executiveSummary', 'emailBody', 'actionItems', 'statistics'],
      };

      const systemInstruction = `You are a senior Project Manager assistant specializing in turning meeting notes and transcripts into clean, executive-ready action emails.

CRITICAL RULES:
1. Extract ALL actionable tasks, deliverables, and commitments for internal team members.
2. For every task, extract:
   - task: Clear, concise description starting with an active verb.
   - owner: The person or team directly responsible. If multiple tasks are given to one person, keep every one. If unmentioned, mark "[Unassigned]".
   - deadline: The exact due date stated in the notes.
   - DEADLINE STRICT RULE: If NO deadline was mentioned in the notes, you MUST write "[TBD]". NEVER invent or infer deadlines.
3. NEVER include non-actionable background discussions, friendly chit-chat, filler words, or general commentary.
4. STRICT CLIENT BLAST REFUSAL: You must strictly REFUSE to write a client blast, external customer email blast, marketing broadcast, or public release notification. If the user requests to write a client blast, set isRefused to true, state clearly that client blast generation is refused, and do not provide any client blast text.
5. The 'emailBody' must be an immaculate, formatted email draft with subject, greeting, crisp 1-2 sentence context, structured bullet points, TBD callouts, and sign-off.`;

      const { text: responseText, modelUsed } = await generateWithFallback({
        contents: prompt,
        systemInstruction,
        responseSchema,
      });

      const parsedData = JSON.parse(responseText);
      parsedData._meta = { modelUsed };
      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error generating action email:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to extract action items and format email.',
      });
    }
  });

  // Refine existing draft
  app.post('/api/refine-email', async (req: Request, res: Response) => {
    try {
      const { currentEmailBody, currentSubject, refinementPrompt, actionItems } = req.body;

      if (!currentEmailBody || !refinementPrompt) {
        return res.status(400).json({ error: 'currentEmailBody and refinementPrompt are required.' });
      }

      // If user asks to turn it into a client blast in refinement, refuse
      if (refinementPrompt.toLowerCase().includes('client blast')) {
        return res.status(400).json({
          error: 'Refusal: This tool strictly refuses requests to write or convert drafts into client blasts.',
        });
      }

      const prompt = `
CURRENT EMAIL DRAFT:
"""
Subject: ${currentSubject || 'Meeting Action Items'}

${currentEmailBody}
"""

EXTRACTED ACTION ITEMS REFERENCE:
${JSON.stringify(actionItems || [], null, 2)}

USER REFINEMENT INSTRUCTION:
"${refinementPrompt}"

STRICT RULES TO PRESERVE:
1. Do not invent new deadlines! If a deadline is "[TBD]", it must remain "[TBD]" unless the user refinement explicitly provides a specific date.
2. Keep tasks and owners accurate.
3. Keep the output clean, professional, and ready to send.
4. Strictly refuse any request to write a client blast or external broadcast.
`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING, description: 'Updated subject line' },
          emailBody: { type: Type.STRING, description: 'Updated formatted email body' },
        },
        required: ['subject', 'emailBody'],
      };

      const systemInstruction = `You are an executive Project Management editor. Refine the email draft according to the user's specific request while preserving all extracted action items, owners, and strictly keeping "[TBD]" deadlines without hallucinating dates. Strictly refuse any requests to create client blasts.`;

      const { text: responseText } = await generateWithFallback({
        contents: prompt,
        systemInstruction,
        responseSchema,
      });

      const data = JSON.parse(responseText);
      return res.json(data);
    } catch (error: any) {
      console.error('Error refining email:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to refine email.',
      });
    }
  });

  // In development, hook Vite middlewares dynamically (prevents production ESM issues)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ActionDraft server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
