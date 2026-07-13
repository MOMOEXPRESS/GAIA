/**
 * Event bus tests — per-aggregate ordering and isolation of failing handlers
 * (Vol 5 §10 Edge Cases & Ordering).
 */
import { InProcessEventBus } from '../src/shared/event-bus';
import { createLogger } from '../src/shared/logger';

describe('InProcessEventBus', () => {
  it('delivers events for one aggregate in publish order', async () => {
    const bus = new InProcessEventBus(createLogger('test'));
    const order: number[] = [];

    bus.subscribe('health.data.updated', async (event) => {
      // Vary handler latency to prove ordering is enforced, not incidental.
      const n = event.payload.n as number;
      await new Promise((resolve) => setTimeout(resolve, n === 1 ? 20 : 1));
      order.push(n);
    });

    await Promise.all([
      bus.publish('health.data.updated', 'user-1', { n: 1 }, 'test'),
      bus.publish('health.data.updated', 'user-1', { n: 2 }, 'test'),
      bus.publish('health.data.updated', 'user-1', { n: 3 }, 'test'),
    ]);

    expect(order).toEqual([1, 2, 3]);
  });

  it('a failing consumer does not block other consumers', async () => {
    const bus = new InProcessEventBus(createLogger('test'));
    const delivered: string[] = [];

    bus.subscribe('symptom.logged', async () => {
      throw new Error('consumer exploded');
    });
    bus.subscribe('symptom.logged', async (event) => {
      delivered.push(event.eventId);
    });

    const envelope = await bus.publish('symptom.logged', 'user-1', {}, 'test');
    expect(delivered).toEqual([envelope.eventId]);
  });

  it('stamps a complete envelope', async () => {
    const bus = new InProcessEventBus(createLogger('test'));
    const envelope = await bus.publish('user.registered', 'user-9', { hello: true }, 'identity-auth');

    expect(envelope.eventId).toMatch(/[0-9a-f-]{36}/);
    expect(envelope.aggregateId).toBe('user-9');
    expect(envelope.eventType).toBe('user.registered');
    expect(envelope.source).toBe('identity-auth');
    expect(new Date(envelope.timestamp).getTime()).not.toBeNaN();
  });
});
