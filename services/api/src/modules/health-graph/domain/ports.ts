/**
 * Health Graph — domain ports. The authoritative, structured repository of
 * clinical and biometric data, FHIR R4-aligned and versioned (Vol 5 §6).
 */
import type { FhirResource, FhirResourceType } from '@gaia/shared-types';

export interface ResourceSearchQuery {
  subject: string;
  resourceType?: FhirResourceType;
  /** Observation category filter, e.g. vital-signs, laboratory. */
  category?: string;
  /** ISO date lower bound on lastUpdated. */
  since?: string;
  limit?: number;
}

export interface FhirResourceRepository {
  /** Returns the latest version of a resource. */
  findById(id: string, subject: string): Promise<FhirResource | null>;
  search(query: ResourceSearchQuery): Promise<FhirResource[]>;
  /** Inserts a new resource version (updates never overwrite — Vol 5 §6). */
  saveVersion(resource: FhirResource): Promise<void>;
}
