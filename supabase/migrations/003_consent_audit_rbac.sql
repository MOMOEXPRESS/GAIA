-- Gaia 2.0 — Consent, audit logs, RBAC, family, clinical modules

-- Consent records
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    granted BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, consent_type)
);

-- Audit logs (immutable)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    correlation_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);

-- Family relationships
CREATE TABLE family_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    relationship_type TEXT NOT NULL,
    name TEXT,
    can_view_health BOOLEAN DEFAULT FALSE,
    can_manage BOOLEAN DEFAULT FALSE,
    emergency_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    reminder_time TEXT,
    adherence_log JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab results
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    value TEXT,
    unit TEXT,
    reference_range TEXT,
    test_date DATE,
    source TEXT DEFAULT 'user_entered',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep logs
CREATE TABLE sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sleep_date DATE NOT NULL,
    duration_hours NUMERIC(4,2),
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
    notes TEXT,
    source TEXT DEFAULT 'user_entered',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration connections
CREATE TABLE integration_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    status TEXT DEFAULT 'disconnected',
    last_sync_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Enterprise organizations
CREATE TABLE enterprise_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    org_type TEXT DEFAULT 'employer',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile auto-create on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Complete RLS for doctors, links, messages, approvals
CREATE POLICY "Doctors read own record" ON doctors
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Doctors update own record" ON doctors
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors insert own record" ON doctors
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors manage own links" ON doctor_patient_links
    FOR ALL USING (auth.uid() = doctor_id);
CREATE POLICY "Patients view own links" ON doctor_patient_links
    FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients update own link status" ON doctor_patient_links
    FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Users read own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipients mark read" ON messages
    FOR UPDATE USING (auth.uid() = recipient_id);

ALTER TABLE protocol_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors manage approvals" ON protocol_approvals
    FOR ALL USING (auth.uid() = doctor_id);
CREATE POLICY "Patients view approvals" ON protocol_approvals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM protocols p WHERE p.id = protocol_id AND p.user_id = auth.uid())
    );

CREATE POLICY "Users insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Consent, family, clinical RLS
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own consent" ON consent_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own family" ON family_relationships FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own medications" ON medications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own labs" ON lab_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own sleep" ON sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own integrations" ON integration_connections FOR ALL USING (auth.uid() = user_id);

-- Audit logs: users can read own; inserts via service role only
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);
