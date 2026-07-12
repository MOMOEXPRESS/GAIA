-- Gaia 2.0 — Unified health events, AI memory, recommendations, goals, risk

CREATE TYPE memory_tier AS ENUM ('semantic', 'episodic', 'procedural');
CREATE TYPE event_source AS ENUM ('user_entered', 'questionnaire', 'wearable', 'clinician', 'system');
CREATE TYPE recommendation_status AS ENUM ('pending', 'accepted', 'dismissed', 'completed');

-- Unified health timeline events
CREATE TABLE health_timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    category TEXT NOT NULL,
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    source event_source NOT NULL DEFAULT 'user_entered',
    title TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    importance INTEGER DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_user_occurred ON health_timeline_events(user_id, occurred_at DESC);
CREATE INDEX idx_timeline_category ON health_timeline_events(user_id, category);

-- AI memory (semantic, episodic, procedural)
CREATE TABLE ai_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tier memory_tier NOT NULL,
    content TEXT NOT NULL,
    source TEXT DEFAULT 'system',
    timeline_event_id UUID REFERENCES health_timeline_events(id) ON DELETE SET NULL,
    confidence NUMERIC(3,2) DEFAULT 1.0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memories_user_tier ON ai_memories(user_id, tier) WHERE active = TRUE;

-- Recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    reason TEXT,
    priority INTEGER DEFAULT 5,
    category TEXT DEFAULT 'wellness',
    source TEXT DEFAULT 'system',
    status recommendation_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'wellness',
    target_value TEXT,
    current_value TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk scores
CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    score NUMERIC(4,2) NOT NULL,
    level TEXT DEFAULT 'low',
    factors JSONB DEFAULT '[]',
    message TEXT,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Persisted symptoms and protocols (replacing in-memory stores)
CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    symptom_name TEXT NOT NULL,
    severity INTEGER,
    duration TEXT,
    context TEXT,
    accompanying_symptoms JSONB DEFAULT '[]',
    modifiers_worse TEXT,
    modifiers_better TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend protocols table with user-scoped symptom link if not exists
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS symptom_ids JSONB DEFAULT '[]';

-- RLS
ALTER TABLE health_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own timeline" ON health_timeline_events
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own memories" ON ai_memories
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recommendations" ON recommendations
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own risk scores" ON risk_scores
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own symptoms" ON symptoms
    FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER ai_memories_updated_at BEFORE UPDATE ON ai_memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER recommendations_updated_at BEFORE UPDATE ON recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
