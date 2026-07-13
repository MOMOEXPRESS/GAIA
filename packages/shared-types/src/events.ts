/**
 * Event System models — the asynchronous communication backbone.
 * Blueprint: Vol 5 §10 (Event System — Data Model). Events are immutable and
 * appended to a stream; event types are namespaced.
 */

/** Namespaced domain event types (Vol 5 §10, Vol 6 §8.1). */
export type DomainEventType =
  | 'health.data.updated'
  | 'lab.result.available'
  | 'symptom.logged'
  | 'medication.scheduled'
  | 'timeline.event.created'
  | 'insight.generated'
  | 'risk.level.changed'
  | 'digitaltwin.deviation'
  | 'user.registered'
  | 'user.goal.updated';

export interface EventEnvelope<TPayload = Record<string, unknown>> {
  eventId: string;
  /** The user aggregate — partitioning key guaranteeing per-user ordering (Vol 5 §10). */
  aggregateId: string;
  eventType: DomainEventType;
  timestamp: string;
  payload: TPayload;
  source: string;
}
