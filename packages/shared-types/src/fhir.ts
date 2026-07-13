/**
 * Health Graph resource models, aligned to FHIR R4 with Gaia extensions.
 * Blueprint: Vol 5 §6 (Health Graph — Data Model), Vol 6 §5.4 (Health Graph Service).
 *
 * Every resource has a subject (the user), a status, and meta information
 * (source, lastUpdated). Resources are versioned; updates create a new version
 * with a reference to the previous one (Vol 5 §6).
 */

/** The source of each entry is clearly tagged (Vol 5 §6 — Edge Cases). */
export type DataSource = 'self-reported' | 'ehr' | 'wearable' | 'lab' | 'device';

export interface ResourceMeta {
  versionId: number;
  /** Reference to the previous version, preserving the audit trail. */
  previousVersionId?: string;
  source: DataSource;
  lastUpdated: string;
}

export type FhirResourceType =
  | 'Patient'
  | 'Condition'
  | 'Observation'
  | 'MedicationStatement'
  | 'MedicationRequest'
  | 'AllergyIntolerance'
  | 'Immunization'
  | 'Procedure'
  | 'FamilyMemberHistory'
  | 'CarePlan'
  | 'DocumentReference';

export interface FhirResourceBase {
  resourceType: FhirResourceType;
  id: string;
  /** The user this resource belongs to (FHIR subject reference). */
  subject: string;
  meta: ResourceMeta;
}

export interface CodeableConcept {
  coding: Array<{ system: string; code: string; display?: string }>;
  text?: string;
}

export interface Quantity {
  value: number;
  unit: string;
  system?: string;
  code?: string;
}

export interface Patient extends FhirResourceBase {
  resourceType: 'Patient';
  name: { given: string[]; family?: string };
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  /** Consent directives are anchored to the Patient resource (Vol 5 §6). */
  consentDirectives?: string[];
}

export interface Condition extends FhirResourceBase {
  resourceType: 'Condition';
  code: CodeableConcept;
  clinicalStatus: 'active' | 'recurrence' | 'inactive' | 'remission' | 'resolved';
  onsetDateTime?: string;
  recordedDate: string;
}

export type ObservationCategory =
  | 'vital-signs'
  | 'laboratory'
  | 'activity'
  | 'sleep'
  | 'mental-wellness'
  | 'nutrition';

export interface Observation extends FhirResourceBase {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected';
  category: ObservationCategory;
  code: CodeableConcept;
  effectiveDateTime: string;
  valueQuantity?: Quantity;
  valueString?: string;
  /** e.g. blood pressure has systolic/diastolic components. */
  component?: Array<{ code: CodeableConcept; valueQuantity: Quantity }>;
  referenceRange?: Array<{ low?: Quantity; high?: Quantity; text?: string }>;
}

export interface MedicationStatement extends FhirResourceBase {
  resourceType: 'MedicationStatement';
  status: 'active' | 'completed' | 'entered-in-error' | 'stopped' | 'on-hold';
  medication: CodeableConcept;
  dosageText?: string;
  effectivePeriod?: { start: string; end?: string };
  /** Gaia extension: links each medication to the condition it treats ("Why am I taking this?", Vol 8 §3.5). */
  reasonReferenceConditionId?: string;
}

export interface AllergyIntolerance extends FhirResourceBase {
  resourceType: 'AllergyIntolerance';
  code: CodeableConcept;
  clinicalStatus: 'active' | 'inactive' | 'resolved';
  criticality?: 'low' | 'high' | 'unable-to-assess';
  reaction?: Array<{ manifestation: CodeableConcept[]; severity?: 'mild' | 'moderate' | 'severe' }>;
}

export interface Immunization extends FhirResourceBase {
  resourceType: 'Immunization';
  status: 'completed' | 'entered-in-error' | 'not-done';
  vaccineCode: CodeableConcept;
  occurrenceDateTime: string;
}

export type FhirResource =
  | Patient
  | Condition
  | Observation
  | MedicationStatement
  | AllergyIntolerance
  | Immunization;
