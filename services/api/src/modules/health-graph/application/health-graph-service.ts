/**
 * Health Graph application service — versioned CRUD over FHIR resources and
 * publication of domain events on every change (Vol 5 §6 Interaction Flows:
 * upserts publish `health.data.updated`; lab Observations additionally publish
 * `lab.result.available`).
 */
import { randomUUID } from 'node:crypto';
import type { DataSource, FhirResource } from '@gaia/shared-types';
import { NotFoundError } from '../../../shared/errors';
import type { EventBus } from '../../../shared/event-bus';
import { assertValidResourceBody } from '../domain/validation';
import type { FhirResourceRepository, ResourceSearchQuery } from '../domain/ports';

export class HealthGraphService {
  constructor(
    private readonly resources: FhirResourceRepository,
    private readonly eventBus: EventBus,
  ) {}

  async createResource(
    subject: string,
    body: Record<string, unknown>,
    source: DataSource = 'self-reported',
  ): Promise<FhirResource> {
    assertValidResourceBody(body);

    const resource = {
      ...body,
      id: randomUUID(),
      subject,
      meta: {
        versionId: 1,
        source,
        lastUpdated: new Date().toISOString(),
      },
    } as FhirResource;

    await this.resources.saveVersion(resource);
    await this.publishChangeEvents(resource);
    return resource;
  }

  /** Updates create a new version referencing the previous one (Vol 5 §6). */
  async updateResource(
    id: string,
    subject: string,
    body: Record<string, unknown>,
  ): Promise<FhirResource> {
    const current = await this.resources.findById(id, subject);
    if (!current) {
      throw new NotFoundError('We could not find that health record.');
    }
    assertValidResourceBody({ ...body, resourceType: current.resourceType });

    const updated = {
      ...body,
      resourceType: current.resourceType,
      id: current.id,
      subject,
      meta: {
        versionId: current.meta.versionId + 1,
        previousVersionId: `${current.id}:${current.meta.versionId}`,
        source: current.meta.source,
        lastUpdated: new Date().toISOString(),
      },
    } as FhirResource;

    await this.resources.saveVersion(updated);
    await this.publishChangeEvents(updated);
    return updated;
  }

  async getResource(id: string, subject: string): Promise<FhirResource> {
    const resource = await this.resources.findById(id, subject);
    if (!resource) {
      throw new NotFoundError('We could not find that health record.');
    }
    return resource;
  }

  search(query: ResourceSearchQuery): Promise<FhirResource[]> {
    return this.resources.search(query);
  }

  private async publishChangeEvents(resource: FhirResource): Promise<void> {
    await this.eventBus.publish(
      'health.data.updated',
      resource.subject,
      { resourceId: resource.id, resourceType: resource.resourceType, resource },
      'health-graph',
    );
    if (resource.resourceType === 'Observation' && resource.category === 'laboratory') {
      await this.eventBus.publish(
        'lab.result.available',
        resource.subject,
        { resourceId: resource.id, resource },
        'health-graph',
      );
    }
  }
}
