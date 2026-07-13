-- Migration 003: Timeline projection (Vol 5 §5) — denormalized read model,
-- indexed for (user, time) range queries; idempotency via (source_module,
-- source_id) uniqueness. TimescaleDB hypertables replace this at scale
-- (Vol 6 §6.5) — the schema is compatible.

CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    display_data JSONB NOT NULL DEFAULT '{}',
    source_module TEXT NOT NULL,
    source_id TEXT NOT NULL,
    linked_event_ids UUID [] NOT NULL DEFAULT '{}',
    visibility TEXT NOT NULL DEFAULT 'PRIVATE'
        CHECK (visibility IN ('PRIVATE', 'FAMILY', 'DOCTOR')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source_module, source_id)
);

CREATE INDEX IF NOT EXISTS idx_timeline_user_time ON timeline_events (user_id, timestamp DESC);
