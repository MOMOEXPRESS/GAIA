/**
 * Display-data mapping — the Timeline pre-computes card content so the UI
 * never joins across modules at read time (Vol 5 §5: "the Timeline is
 * essentially a cache with denormalized presentation state").
 */
import type { FhirResource, TimelineEventType } from '@gaia/shared-types';

export interface DisplayMapping {
  eventType: TimelineEventType;
  timestamp: string;
  displayData: Record<string, unknown>;
}

/** Maps a Health Graph resource change into timeline card content. */
export function mapResourceToDisplay(resource: FhirResource): DisplayMapping {
  switch (resource.resourceType) {
    case 'Observation': {
      const isLab = resource.category === 'laboratory';
      const value = resource.valueQuantity
        ? `${resource.valueQuantity.value} ${resource.valueQuantity.unit}`
        : resource.valueString ?? '';
      return {
        eventType: isLab ? 'LAB_RESULT' : 'VITAL_SIGN',
        timestamp: resource.effectiveDateTime,
        displayData: {
          title: resource.code.text ?? resource.code.coding[0]?.display ?? 'Observation',
          value,
          category: resource.category,
        },
      };
    }
    case 'Condition':
      return {
        eventType: 'NOTE',
        timestamp: resource.recordedDate,
        displayData: {
          title: `Condition recorded: ${resource.code.text ?? resource.code.coding[0]?.display ?? 'Condition'}`,
          clinicalStatus: resource.clinicalStatus,
        },
      };
    case 'MedicationStatement':
      return {
        eventType: 'MEDICATION_DOSE',
        timestamp: resource.meta.lastUpdated,
        displayData: {
          title: resource.medication.text ?? resource.medication.coding[0]?.display ?? 'Medication',
          dosage: resource.dosageText ?? '',
          status: resource.status,
        },
      };
    default:
      return {
        eventType: 'NOTE',
        timestamp: resource.meta.lastUpdated,
        displayData: { title: `${resource.resourceType} updated` },
      };
  }
}
