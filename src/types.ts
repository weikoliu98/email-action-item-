export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  deadline: string;
  hasTbdDeadline: boolean;
  category?: string;
}

export interface Statistics {
  totalActions: number;
  tbdDeadlinesCount: number;
  uniqueOwnersCount: number;
}

export interface ExtractionResult {
  subject: string;
  executiveSummary: string;
  emailBody: string;
  actionItems: ActionItem[];
  isRefused?: boolean;
  refusalMessage?: string;
  tbdWarnings?: string[];
  statistics: Statistics;
}

export type GroupingOption = 'by_owner' | 'bulleted_list' | 'by_priority';
export type ToneOption = 'professional' | 'concise' | 'executive';

export interface AcceptanceTestPreset {
  id: string;
  name: string;
  acceptanceTestNumber: number;
  badge: string;
  description: string;
  meetingTitle: string;
  notes: string;
  expectedBehavior: string;
}
