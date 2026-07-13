/**
 * AI Brain interaction models.
 * Blueprint: Vol 5 §3 (AI Brain — Data Model), Vol 7 §10.2 (Input Guard classes).
 */

export type MessageRole = 'user' | 'ai' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  attachments?: string[];
  /** Explainability: reasoning trace behind an AI message (Vol 5 §3). */
  reasoningTrace?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  startedAt: string;
  messages: ChatMessage[];
}

export interface Insight {
  id: string;
  userId: string;
  triggerEventId?: string;
  summary: string;
  detailedExplanation: string;
  /** 0..1 — presented qualitatively to users, never as a bare number (Vol 7 §11.4). */
  confidenceScore: number;
  /** Trust through transparency: sources are always cited (Vol 1 §5). */
  dataSources: string[];
  status: 'active' | 'dismissed';
  generatedAt: string;
}

/**
 * Input Guard classification of every user message (Vol 7 §10.2).
 * `emergency_*` classes trigger the Emergency Escalation Protocol immediately,
 * bypassing all agents (Vol 7 §10.4).
 */
export type InputGuardClass =
  | 'general_query'
  | 'symptom_report'
  | 'emergency_self_harm'
  | 'emergency_medical'
  | 'unsafe_request';
