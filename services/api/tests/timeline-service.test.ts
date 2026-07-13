/**
 * Timeline tests — projection from health events, manual entries, pagination
 * caps, and idempotency (Vol 5 §5).
 */
import { TIMELINE_MAX_PAGE_SIZE } from '@gaia/shared-types';
import { HealthGraphService } from '../src/modules/health-graph/application/health-graph-service';
import { TimelineService } from '../src/modules/timeline/application/timeline-service';
import { InProcessEventBus } from '../src/shared/event-bus';
import { createLogger } from '../src/shared/logger';
import {
  InMemoryFhirResourceRepository,
  InMemoryTimelineRepository,
} from './helpers/in-memory-adapters';

const USER = 'user-1';

function makeStack() {
  const eventBus = new InProcessEventBus(createLogger('test'));
  const timelineRepo = new InMemoryTimelineRepository();
  const timeline = new TimelineService(timelineRepo, eventBus);
  timeline.registerProjections();
  const healthGraph = new HealthGraphService(new InMemoryFhirResourceRepository(), eventBus);
  return { eventBus, timeline, timelineRepo, healthGraph };
}

const bpBody = {
  resourceType: 'Observation',
  status: 'final',
  category: 'vital-signs',
  code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure' }] },
  effectiveDateTime: '2026-07-12T07:30:00+00:00',
  valueQuantity: { value: 120, unit: 'mmHg' },
};

describe('Timeline projection', () => {
  it('materializes a TimelineEvent when the Health Graph records a vital sign', async () => {
    const { timeline, healthGraph } = makeStack();
    await healthGraph.createResource(USER, { ...bpBody });

    const events = await timeline.getTimeline({ userId: USER });
    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe('VITAL_SIGN');
    expect(events[0]?.sourceModule).toBe('health-graph');
    // The clinical timestamp is used, not arrival time (out-of-order safety).
    expect(events[0]?.timestamp).toBe('2026-07-12T07:30:00.000Z');
  });

  it('classifies laboratory observations as LAB_RESULT cards', async () => {
    const { timeline, healthGraph } = makeStack();
    await healthGraph.createResource(USER, {
      ...bpBody,
      category: 'laboratory',
      code: { coding: [{ system: 'http://loinc.org', code: '2345-7', display: 'Glucose' }] },
    });

    const events = await timeline.getTimeline({ userId: USER });
    expect(events[0]?.eventType).toBe('LAB_RESULT');
  });

  it('is idempotent: replaying the same resource version creates no duplicate', async () => {
    const { eventBus, timeline, healthGraph } = makeStack();
    const resource = await healthGraph.createResource(USER, { ...bpBody });

    // Simulate at-least-once redelivery of the same domain event (Vol 6 §8.4).
    await eventBus.publish(
      'health.data.updated',
      USER,
      { resourceId: resource.id, resourceType: resource.resourceType, resource },
      'health-graph',
    );

    const events = await timeline.getTimeline({ userId: USER });
    expect(events).toHaveLength(1);
  });
});

describe('TimelineService.addUserEvent', () => {
  it('stores a symptom log and publishes symptom.logged', async () => {
    const { eventBus, timeline } = makeStack();
    const seen: string[] = [];
    eventBus.subscribe('symptom.logged', async (e) => {
      seen.push(e.eventType);
    });

    const event = await timeline.addUserEvent(USER, 'SYMPTOM_LOG', '2026-07-13T10:00:00Z', {
      symptom: 'Headache',
      severity: 4,
    });

    expect(event.eventType).toBe('SYMPTOM_LOG');
    expect(event.visibility).toBe('PRIVATE');
    expect(seen).toEqual(['symptom.logged']);
  });

  it('rejects event types users cannot create manually', async () => {
    const { timeline } = makeStack();
    await expect(
      timeline.addUserEvent(USER, 'LAB_RESULT', '2026-07-13T10:00:00Z', {}),
    ).rejects.toThrow('notes and symptom logs');
  });

  it('rejects unparseable timestamps with a human message', async () => {
    const { timeline } = makeStack();
    await expect(timeline.addUserEvent(USER, 'NOTE', 'not-a-date', {})).rejects.toThrow(
      'That date does not look right.',
    );
  });
});

describe('Timeline pagination', () => {
  it('caps page size at the Blueprint maximum of 500', async () => {
    const { timeline, timelineRepo } = makeStack();
    const spy = jest.spyOn(timelineRepo, 'query');

    await timeline.getTimeline({ userId: USER, limit: 10_000 });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ limit: TIMELINE_MAX_PAGE_SIZE }),
    );
  });
});
