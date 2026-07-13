/**
 * FHIR resource validation — heavy data validation per Vol 6 §5.4 ("Health
 * Graph Service: heavy data validation, JSON Schema based on FHIR profiles").
 * Month 1 validates the structural essentials with zod; full FHIR profile
 * validation follows with the ingestion pipeline.
 */
import { z } from 'zod';
import { ValidationError } from '../../../shared/errors';

const codeableConcept = z.object({
  coding: z.array(
    z.object({ system: z.string(), code: z.string(), display: z.string().optional() }),
  ),
  text: z.string().optional(),
});

const quantity = z.object({
  value: z.number(),
  unit: z.string(),
  system: z.string().optional(),
  code: z.string().optional(),
});

const observationSchema = z.object({
  resourceType: z.literal('Observation'),
  status: z.enum(['registered', 'preliminary', 'final', 'amended', 'corrected']),
  category: z.enum(['vital-signs', 'laboratory', 'activity', 'sleep', 'mental-wellness', 'nutrition']),
  code: codeableConcept,
  effectiveDateTime: z.string().datetime({ offset: true }),
  valueQuantity: quantity.optional(),
  valueString: z.string().optional(),
  component: z.array(z.object({ code: codeableConcept, valueQuantity: quantity })).optional(),
});

const conditionSchema = z.object({
  resourceType: z.literal('Condition'),
  code: codeableConcept,
  clinicalStatus: z.enum(['active', 'recurrence', 'inactive', 'remission', 'resolved']),
  onsetDateTime: z.string().datetime({ offset: true }).optional(),
  recordedDate: z.string().datetime({ offset: true }),
});

const medicationStatementSchema = z.object({
  resourceType: z.literal('MedicationStatement'),
  status: z.enum(['active', 'completed', 'entered-in-error', 'stopped', 'on-hold']),
  medication: codeableConcept,
  dosageText: z.string().optional(),
});

const allergySchema = z.object({
  resourceType: z.literal('AllergyIntolerance'),
  code: codeableConcept,
  clinicalStatus: z.enum(['active', 'inactive', 'resolved']),
});

const immunizationSchema = z.object({
  resourceType: z.literal('Immunization'),
  status: z.enum(['completed', 'entered-in-error', 'not-done']),
  vaccineCode: codeableConcept,
  occurrenceDateTime: z.string().datetime({ offset: true }),
});

const schemasByType: Record<string, z.ZodTypeAny> = {
  Observation: observationSchema,
  Condition: conditionSchema,
  MedicationStatement: medicationStatementSchema,
  AllergyIntolerance: allergySchema,
  Immunization: immunizationSchema,
};

export const SUPPORTED_RESOURCE_TYPES = Object.keys(schemasByType);

/** Validates the clinical body of a resource; throws a human-readable error. */
export function assertValidResourceBody(body: Record<string, unknown>): void {
  const resourceType = body.resourceType;
  if (typeof resourceType !== 'string' || !(resourceType in schemasByType)) {
    throw new ValidationError(
      `We can't store that record type yet. Supported types: ${SUPPORTED_RESOURCE_TYPES.join(', ')}.`,
    );
  }
  const schema = schemasByType[resourceType];
  const result = schema!.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new ValidationError(
      `That ${resourceType} record looks incomplete: ${first?.path.join('.') ?? 'field'} — ${first?.message ?? 'invalid'}.`,
    );
  }
}
