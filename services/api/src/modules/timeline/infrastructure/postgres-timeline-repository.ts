/**
 * PostgreSQL adapter for the Timeline projection — partition-ready table
 * indexed on (user_id, timestamp) for fast range queries (Vol 6 §5.4).
 */
import type { Pool } from 'pg';
import type { TimelineEvent, TimelineQuery } from '@gaia/shared-types';
import type { TimelineEventRepository } from '../domain/ports';

interface TimelineRow {
  id: string;
  user_id: string;
  event_type: TimelineEvent['eventType'];
  timestamp: Date;
  display_data: Record<string, unknown>;
  source_module: string;
  source_id: string;
  linked_event_ids: string[];
  visibility: TimelineEvent['visibility'];
}

function toEvent(row: TimelineRow): TimelineEvent {
  return {
    id: row.id,
    userId: row.user_id,
    eventType: row.event_type,
    timestamp: row.timestamp.toISOString(),
    displayData: row.display_data,
    sourceModule: row.source_module,
    sourceId: row.source_id,
    linkedEventIds: row.linked_event_ids ?? [],
    visibility: row.visibility,
  };
}

export class PostgresTimelineRepository implements TimelineEventRepository {
  constructor(private readonly pool: Pool) {}

  async upsert(event: TimelineEvent): Promise<void> {
    await this.pool.query(
      `INSERT INTO timeline_events
         (id, user_id, event_type, timestamp, display_data, source_module, source_id, linked_event_ids, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (source_module, source_id) DO NOTHING`,
      [
        event.id,
        event.userId,
        event.eventType,
        event.timestamp,
        JSON.stringify(event.displayData),
        event.sourceModule,
        event.sourceId,
        event.linkedEventIds,
        event.visibility,
      ],
    );
  }

  async query(query: TimelineQuery): Promise<TimelineEvent[]> {
    const clauses: string[] = ['user_id = $1'];
    const params: unknown[] = [query.userId];

    if (query.start) {
      params.push(query.start);
      clauses.push(`timestamp >= $${params.length}`);
    }
    if (query.end) {
      params.push(query.end);
      clauses.push(`timestamp <= $${params.length}`);
    }
    if (query.before) {
      params.push(query.before);
      clauses.push(`timestamp < $${params.length}`);
    }
    if (query.types && query.types.length > 0) {
      params.push(query.types);
      clauses.push(`event_type = ANY($${params.length})`);
    }
    params.push(query.limit ?? 50);

    const result = await this.pool.query<TimelineRow>(
      `SELECT * FROM timeline_events
       WHERE ${clauses.join(' AND ')}
       ORDER BY timestamp DESC
       LIMIT $${params.length}`,
      params,
    );
    return result.rows.map(toEvent);
  }
}
