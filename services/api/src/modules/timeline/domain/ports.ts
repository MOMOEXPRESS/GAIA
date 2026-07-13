/**
 * Timeline — domain ports. A read-optimized projection built from the Event
 * System (Vol 5 §5).
 */
import type { TimelineEvent, TimelineQuery } from '@gaia/shared-types';

export interface TimelineEventRepository {
  /** Idempotent insert — duplicate (sourceModule, sourceId) pairs merge (Vol 5 §10 idempotency). */
  upsert(event: TimelineEvent): Promise<void>;
  query(query: TimelineQuery): Promise<TimelineEvent[]>;
}
