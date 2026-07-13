-- Migration 002: Health Graph — versioned FHIR resource store (Vol 5 §6,
-- Vol 6 §6.2: JSONB storage, user-partitioned; append-only versions preserve
-- the audit trail).

CREATE TABLE IF NOT EXISTS fhir_resources (
    resource_id UUID NOT NULL,
    subject UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    version_id INT NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resource JSONB NOT NULL,
    PRIMARY KEY (resource_id, version_id)
);

-- Every query includes a subject filter (tenant isolation, Vol 6 §3.2).
CREATE INDEX IF NOT EXISTS idx_fhir_subject_type ON fhir_resources (subject, resource_type);
CREATE INDEX IF NOT EXISTS idx_fhir_subject_updated ON fhir_resources (subject, last_updated);
