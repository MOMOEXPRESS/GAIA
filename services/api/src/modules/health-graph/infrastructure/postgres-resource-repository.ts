/**
 * PostgreSQL JSONB adapter for the Health Graph (Vol 6 §6.2: "FHIR resource
 * storage can use PostgreSQL JSONB, sharded by user ID"). Every version is an
 * append-only row; reads return the latest version.
 */
import type { Pool } from 'pg';
import type { FhirResource } from '@gaia/shared-types';
import type { FhirResourceRepository, ResourceSearchQuery } from '../domain/ports';

interface ResourceRow {
  resource: FhirResource;
}

export class PostgresFhirResourceRepository implements FhirResourceRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string, subject: string): Promise<FhirResource | null> {
    const result = await this.pool.query<ResourceRow>(
      `SELECT resource FROM fhir_resources
       WHERE resource_id = $1 AND subject = $2
       ORDER BY version_id DESC LIMIT 1`,
      [id, subject],
    );
    return result.rows[0]?.resource ?? null;
  }

  async search(query: ResourceSearchQuery): Promise<FhirResource[]> {
    const clauses: string[] = ['subject = $1'];
    const params: unknown[] = [query.subject];

    if (query.resourceType) {
      params.push(query.resourceType);
      clauses.push(`resource_type = $${params.length}`);
    }
    if (query.category) {
      params.push(query.category);
      clauses.push(`resource->>'category' = $${params.length}`);
    }
    if (query.since) {
      params.push(query.since);
      clauses.push(`last_updated >= $${params.length}`);
    }
    params.push(Math.min(query.limit ?? 100, 500));

    const result = await this.pool.query<ResourceRow>(
      `SELECT DISTINCT ON (resource_id) resource
       FROM fhir_resources
       WHERE ${clauses.join(' AND ')}
       ORDER BY resource_id, version_id DESC
       LIMIT $${params.length}`,
      params,
    );
    return result.rows.map((row) => row.resource);
  }

  async saveVersion(resource: FhirResource): Promise<void> {
    await this.pool.query(
      `INSERT INTO fhir_resources (resource_id, subject, resource_type, version_id, last_updated, resource)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        resource.id,
        resource.subject,
        resource.resourceType,
        resource.meta.versionId,
        resource.meta.lastUpdated,
        JSON.stringify(resource),
      ],
    );
  }
}
