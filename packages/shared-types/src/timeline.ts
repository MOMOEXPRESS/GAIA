/**
 * Timeline models — the unified, chronological story of health.
 * Blueprint: Vol 5 §5 (Timeline — Data Model). The TimelineEvent shape below
 * mirrors the JSON specification in that section exactly.
 */

export type TimelineEventType =
  | 'LAB_RESULT'
  | 'DOCTOR_VISIT'
  | 'SYMPTOM_LOG'
  | 'MEDICATION_DOSE'
  | 'ACTIVITY'
  | 'AI_INSIGHT'
  | 'NOTE'
  | 'VITAL_SIGN'
  | 'MILESTONE';

export type TimelineVisibility = 'PRIVATE' | 'FAMILY' | 'DOCTOR';

export interface TimelineEvent {
  id: string;
  userId: string;
  eventType: TimelineEventType;
  timestamp: string;
  /** Pre-computed card content — the Timeline is a denormalized read projection (Vol 5 §5). */
  displayData: Record<string, unknown>;
  sourceModule: string;
  /** Original event/entity id in the source module. */
  sourceId: string;
  /** Semantic links between events (e.g. "headache linked to poor sleep"). */
  linkedEventIds: string[];
  visibility: TimelineVisibility;
}

/** Massive date range queries must enforce pagination — max 500 events per page (Vol 5 §5 Edge Cases). */
export const TIMELINE_MAX_PAGE_SIZE = 500;

export interface TimelineQuery {
  userId: string;
  start?: string;
  end?: string;
  types?: TimelineEventType[];
  limit?: number;
  /** Cursor: timestamp of the last event of the previous page. */
  before?: string;
}
