/**
 * Timeline application service — query API, manual user events, and the
 * event-driven projector that materializes TimelineEvents from domain events
 * (Vol 5 §5 Interaction Flows).
 */
import { randomUUID } from 'node:crypto';
import {
  TIMELINE_MAX_PAGE_SIZE,
  type EventEnvelope,
  type FhirResource,
  type TimelineEvent,
  type TimelineEventType,
  type TimelineQuery,
} from '@gaia/shared-types';
import { ValidationError } from '../../../shared/errors';
import type { EventBus } from '../../../shared/event-bus';
import { mapResourceToDisplay } from '../domain/display-data';
import type { TimelineEventRepository } from '../domain/ports';

const USER_EVENT_TYPES: TimelineEventType[] = ['SYMPTOM_LOG', 'NOTE'];

export class TimelineService {
  constructor(
    private readonly repository: TimelineEventRepository,
    private readonly eventBus: EventBus,
  ) {}

  /** Subscribes the projector to the event backbone. Called once at boot. */
  registerProjections(): void {
    this.eventBus.subscribe('health.data.updated', (event) => this.projectHealthData(event));
  }

  async getTimeline(query: TimelineQuery): Promise<TimelineEvent[]> {
    // Enforce pagination limits (Vol 5 §5 Edge Cases: max 500 events/page).
    const limit = Math.min(query.limit ?? 50, TIMELINE_MAX_PAGE_SIZE);
    return this.repository.query({ ...query, limit });
  }

  /** Manual user entries — notes and symptom logs (Vol 5 §5 "Add User Event"). */
  async addUserEvent(
    userId: string,
    eventType: TimelineEventType,
    timestamp: string,
    data: Record<string, unknown>,
  ): Promise<TimelineEvent> {
    if (!USER_EVENT_TYPES.includes(eventType)) {
      throw new ValidationError('You can add notes and symptom logs to your timeline.');
    }
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) {
      throw new ValidationError('That date does not look right. Please try again.');
    }

    const event: TimelineEvent = {
      id: randomUUID(),
      userId,
      eventType,
      timestamp: parsed.toISOString(),
      displayData: data,
      sourceModule: 'timeline',
      sourceId: randomUUID(),
      linkedEventIds: [],
      visibility: 'PRIVATE',
    };
    await this.repository.upsert(event);

    await this.eventBus.publish(
      'timeline.event.created',
      userId,
      { timelineEventId: event.id, eventType },
      'timeline',
    );
    if (eventType === 'SYMPTOM_LOG') {
      await this.eventBus.publish('symptom.logged', userId, { timelineEventId: event.id, ...data }, 'timeline');
    }
    return event;
  }

  /** Projection: Health Graph changes become timeline cards. Idempotent on (sourceModule, sourceId). */
  private async projectHealthData(envelope: EventEnvelope): Promise<void> {
    const resource = envelope.payload.resource as FhirResource | undefined;
    if (!resource) return;

    const mapping = mapResourceToDisplay(resource);
    const event: TimelineEvent = {
      id: randomUUID(),
      userId: envelope.aggregateId,
      eventType: mapping.eventType,
      // Out-of-order arrivals are fine: events are inserted chronologically by
      // their clinical timestamp, not arrival time (Vol 5 §5 Edge Cases).
      timestamp: mapping.timestamp,
      displayData: mapping.displayData,
      sourceModule: 'health-graph',
      sourceId: `${resource.id}:${resource.meta.versionId}`,
      linkedEventIds: [],
      visibility: 'PRIVATE',
    };
    await this.repository.upsert(event);
  }
}
