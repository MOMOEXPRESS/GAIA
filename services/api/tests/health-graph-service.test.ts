/**
 * Health Graph domain tests — validation, versioning, and event publication
 * (Vol 5 §6).
 */
import type { Observation } from '@gaia/shared-types';
import { HealthGraphService } from '../src/modules/health-graph/application/health-graph-service';
import { InProcessEventBus } from '../src/shared/event-bus';
import { createLogger } from '../src/shared/logger';
import { InMemoryFhirResourceRepository } from './helpers/in-memory-adapters';

const USER = 'user-1';

const heartRateBody = {
  resourceType: 'Observation',
  status: 'final',
  category: 'vital-signs',
  code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
  effectiveDateTime: '2026-07-13T08:00:00+00:00',
  valueQuantity: { value: 62, unit: 'beats/min' },
};

function makeService() {
  const eventBus = new InProcessEventBus(createLogger('test'));
  const repository = new InMemoryFhirResourceRepository();
  const service = new HealthGraphService(repository, eventBus);
  return { service, eventBus, repository };
}

describe('HealthGraphService.createResource', () => {
  it('stores a valid Observation as version 1, tagged self-reported by default', async () => {
    const { service } = makeService();
    const resource = await service.createResource(USER, { ...heartRateBody });

    expect(resource.meta.versionId).toBe(1);
    expect(resource.meta.source).toBe('self-reported');
    expect(resource.subject).toBe(USER);
  });

  it('publishes health.data.updated for every change', async () => {
    const { service, eventBus } = makeService();
    const seen: string[] = [];
    eventBus.subscribe('health.data.updated', async (e) => {
      seen.push(e.eventType);
    });

    await service.createResource(USER, { ...heartRateBody });
    expect(seen).toEqual(['health.data.updated']);
  });

  it('additionally publishes lab.result.available for laboratory observations', async () => {
    const { service, eventBus } = makeService();
    const seen: string[] = [];
    eventBus.subscribe('lab.result.available', async (e) => {
      seen.push(e.eventType);
    });

    await service.createResource(USER, {
      ...heartRateBody,
      category: 'laboratory',
      code: { coding: [{ system: 'http://loinc.org', code: '2345-7', display: 'Glucose' }] },
      valueQuantity: { value: 110, unit: 'mg/dL' },
    });
    expect(seen).toEqual(['lab.result.available']);
  });

  it('rejects unsupported resource types with a human message', async () => {
    const { service } = makeService();
    await expect(
      service.createResource(USER, { resourceType: 'Device' }),
    ).rejects.toThrow("We can't store that record type yet.");
  });

  it('rejects structurally invalid resources', async () => {
    const { service } = makeService();
    await expect(
      service.createResource(USER, { ...heartRateBody, effectiveDateTime: 'yesterday' }),
    ).rejects.toThrow('looks incomplete');
  });
});

describe('HealthGraphService.updateResource', () => {
  it('creates a new version referencing the previous one (audit trail)', async () => {
    const { service, repository } = makeService();
    const created = await service.createResource(USER, { ...heartRateBody });

    const updated = await service.updateResource(created.id, USER, {
      ...heartRateBody,
      valueQuantity: { value: 64, unit: 'beats/min' },
    });

    expect(updated.meta.versionId).toBe(2);
    expect(updated.meta.previousVersionId).toBe(`${created.id}:1`);
    // Both versions remain stored — updates never overwrite (Vol 5 §6).
    expect(repository.versions).toHaveLength(2);
    expect((updated as Observation).valueQuantity?.value).toBe(64);
  });

  it('refuses to update another user\'s resource', async () => {
    const { service } = makeService();
    const created = await service.createResource(USER, { ...heartRateBody });
    await expect(
      service.updateResource(created.id, 'someone-else', { ...heartRateBody }),
    ).rejects.toThrow('We could not find that health record.');
  });
});
