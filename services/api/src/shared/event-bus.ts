/**
 * In-process Event Bus — the monolith's local event backbone. The interface
 * mirrors the Kafka-based Event System (Vol 5 §10) so that swapping the
 * transport later requires no changes to publishers or consumers (Vol 6 §5.1:
 * "in-process EventEmitter that later publishes to Kafka").
 *
 * Guarantees mirrored from the Blueprint:
 * - Per-aggregate ordering: handlers for one user's events run sequentially.
 * - At-least-once semantics with idempotent consumers (consumers dedupe on eventId).
 */
import { randomUUID } from 'node:crypto';
import type { DomainEventType, EventEnvelope } from '@gaia/shared-types';
import type { Logger } from './logger';

export type EventHandler = (event: EventEnvelope) => Promise<void>;

export interface EventBus {
  publish(
    eventType: DomainEventType,
    aggregateId: string,
    payload: Record<string, unknown>,
    source: string,
  ): Promise<EventEnvelope>;
  subscribe(eventType: DomainEventType, handler: EventHandler): void;
}

export class InProcessEventBus implements EventBus {
  private readonly handlers = new Map<DomainEventType, EventHandler[]>();
  /** Serialized processing per aggregate to preserve per-user ordering (Vol 5 §10). */
  private readonly aggregateQueues = new Map<string, Promise<void>>();

  constructor(private readonly logger: Logger) {}

  subscribe(eventType: DomainEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler]);
  }

  async publish(
    eventType: DomainEventType,
    aggregateId: string,
    payload: Record<string, unknown>,
    source: string,
  ): Promise<EventEnvelope> {
    const envelope: EventEnvelope = {
      eventId: randomUUID(),
      aggregateId,
      eventType,
      timestamp: new Date().toISOString(),
      payload,
      source,
    };

    const handlers = this.handlers.get(eventType) ?? [];
    const previous = this.aggregateQueues.get(aggregateId) ?? Promise.resolve();

    const next = previous.then(async () => {
      for (const handler of handlers) {
        try {
          await handler(envelope);
        } catch (error) {
          // Failed events would be routed to a DLQ in the Kafka deployment
          // (Vol 6 §8.4); in-process we log and continue so one consumer
          // cannot poison the stream for others.
          this.logger.error('event handler failed', {
            eventType,
            eventId: envelope.eventId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    });

    this.aggregateQueues.set(aggregateId, next);
    await next;
    return envelope;
  }
}
