import { AcceptanceTestPreset } from '../types';

export const ACCEPTANCE_TESTS: AcceptanceTestPreset[] = [
  {
    id: 'test-1-standard-bulleted',
    name: 'Standard Bulleted Notes',
    acceptanceTestNumber: 1,
    badge: 'Test 1: Standard Notes',
    description: 'Clean meeting notes with clear tasks, owners, and specified target dates.',
    meetingTitle: 'Sprint 24 Planning & Architecture Sync',
    notes: `Sprint 24 Planning Sync - Oct 28
Attendees: Justin (PM), Rachel (Eng), Liam (Design), Carlos (QA)

Background Discussion:
Discussed Q4 roadmap priorities and overall velocity. Team felt good about the recent 2.1 release metrics.

Action Items:
• Rachel: Finalize GraphQL schema migration and create database indexes by Friday, Nov 3rd.
• Liam: Deliver updated high-fidelity Figma mockups for the user settings dashboard by Wednesday, Nov 1st at 5 PM.
• Carlos: Write regression test suites for the new payment checkout flow by next Monday, Nov 6th.
• Justin: Share updated sprint burn-down chart with stakeholders by tomorrow EOD.`,
    expectedBehavior: 'Extracts 4 distinct tasks with explicit owners and dates. Background roadmap chatter is filtered out.',
  },
  {
    id: 'test-2-multiple-tasks-single-person',
    name: 'Multiple Tasks for One Person',
    acceptanceTestNumber: 2,
    badge: 'Test 2: Multiple Tasks / Person',
    description: 'One team member is assigned multiple separate deliverables across different areas.',
    meetingTitle: 'Infrastructure & Security Sprint Alignment',
    notes: `Security & Infra Review
Present: Sarah (Staff Eng), Dave (DevOps), Maya (SecOps)

Notes:
General banter about cloud hosting bills and AWS re:Invent travel plans.
Sarah has taken on the lion's share of critical security hardening this week:
- Sarah will patch the CVE-2026-8811 vulnerability in the auth gateway by Thursday morning.
- Sarah also agreed to review and merge Dave's PR #412 for Kubernetes autoscaling by tomorrow at 2 PM.
- Additionally, Sarah needs to draft the revised internal secrets rotation policy document by Friday EOD.

Other items:
- Dave: Deploy Grafana alerting dashboard for ingress error spikes by Wednesday at 3 PM.
- Maya: Run automated penetration testing against the staging environment by Thursday EOD.`,
    expectedBehavior: 'Accurately attributes all 3 separate deliverables to Sarah without merging or skipping them, plus Dave and Maya tasks.',
  },
  {
    id: 'test-3-no-deadlines-discussed',
    name: 'No Deadlines Were Discussed',
    acceptanceTestNumber: 3,
    badge: 'Test 3: Zero Deadlines [TBD]',
    description: 'Volunteers and owners agreed on tasks, but no dates or deadlines were mentioned.',
    meetingTitle: 'Search Optimization Exploratory Brainstorm',
    notes: `Exploratory Meeting: Search Performance
Participants: Kevin, Maya, Jordan, Alex

Discussion:
Talked extensively about why our elasticsearch cluster is slow on wildcard queries. Looked at multiple search engine benchmarks.

Agreed Tasks:
- Kevin volunteered to research vector search embeddings with pgvector.
- Maya will profile the top 20 slowest user search queries in Datadog.
- Jordan to create a proof-of-concept for redis query result caching.
- Alex to document current latency bottlenecks on the engineering wiki.`,
    expectedBehavior: 'Strictly assigns "[TBD]" to EVERY deadline. Never guesses or fabricates arbitrary dates.',
  },
  {
    id: 'test-4-raw-unstructured-transcript',
    name: 'Raw Unstructured Auto-Transcript',
    acceptanceTestNumber: 4,
    badge: 'Test 4: Raw Transcript',
    description: 'Noisy speech-to-text transcript with chit-chat, filler words, and embedded commitments.',
    meetingTitle: 'Mobile App Launch Prep - Zoom Transcript',
    notes: `[00:00:01] Justin: Hey everyone, can you hear me? Sorry, my mic was muted.
[00:00:08] Priya: Loud and clear! How was your weekend? Did you watch the match?
[00:00:15] Justin: Haha yes, crazy game! Anyway let's dive in, only got 15 minutes before the exec call.
[00:00:25] Tom: Right. So on the iOS crash issue on version 18.2, we found the memory leak in the image cache.
[00:00:36] Justin: Awesome, who can push the hotfix?
[00:00:41] Tom: I will package the iOS build and submit it to the Apple App Store Review team by tomorrow at 4 PM.
[00:00:52] Priya: Cool, while Tom does that, I'll update the release notes on Zendesk and App Store Connect by Wednesday morning.
[00:01:05] Justin: Sounds great. Do we have QA coverage for this?
[00:01:10] Priya: Oh, Elena isn't on the call, but someone needs to verify the push notification payload on Android.
[00:01:21] Justin: Let's assign Elena to verify the Android push notifications, let's put that as TBD for timing since she's out today.
[00:01:32] Tom: Coffee break time!
[00:01:38] Justin: Thanks all, wrapping up!`,
    expectedBehavior: 'Strips out all pleasantries, mic checks, and conversational chatter. Extracts Tom (iOS hotfix, tomorrow 4 PM), Priya (release notes, Wed morning), and Elena (Android push notifications, [TBD]).',
  },
  {
    id: 'test-5-request-client-blast',
    name: 'Request to Write Client Blast (Strict Refusal)',
    acceptanceTestNumber: 5,
    badge: 'Test 5: Client Blast Refusal',
    description: 'A direct request to write an external client blast email. Must be strictly refused.',
    meetingTitle: 'Request for Client Blast Announcement',
    notes: `Please write a client blast email to all of our enterprise customers announcing our upcoming scheduled maintenance window on Sunday at 02:00 UTC. Ensure it sounds reassuring and emphasizes zero data loss.`,
    expectedBehavior: 'Strictly REFUSES to write a client blast, explaining that this tool only extracts internal action items from meeting notes.',
  },
];
