-- Gaia Health — Supabase PostgreSQL schema
-- Run in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE user_role AS ENUM ('user', 'doctor', 'admin');
CREATE TYPE protocol_status AS ENUM ('draft', 'recommended', 'approved_by_doc');
CREATE TYPE link_status AS ENUM ('pending', 'active', 'revoked');
CREATE TYPE access_level AS ENUM ('view', 'edit');

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    -- Demographics
    age INTEGER,
    sex_at_birth TEXT,
    gender_identity TEXT,
    ethnicity TEXT,
    blood_type TEXT,
    height_cm NUMERIC(5,1),
    weight_kg NUMERIC(5,1),
    -- Location
    country TEXT,
    city TEXT,
    climate_zone TEXT,
    altitude INTEGER,
    -- Occupation
    occupation_type TEXT,
    sedentary_hours NUMERIC(4,1),
    shift_work BOOLEAN DEFAULT FALSE,
    -- Social
    marital_status TEXT,
    household_size INTEGER,
    financial_stress INTEGER CHECK (financial_stress BETWEEN 1 AND 10),
    social_support_index INTEGER,
    -- Spiritual
    meditation_minutes INTEGER DEFAULT 0,
    prayer BOOLEAN DEFAULT FALSE,
    time_in_nature_minutes INTEGER DEFAULT 0,
    sense_of_purpose_score INTEGER,
    -- Meta
    share_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health events timeline
CREATE TABLE health_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_date DATE,
    event_type TEXT NOT NULL,
    description TEXT,
    severity INTEGER CHECK (severity BETWEEN 1 AND 10),
    duration_days INTEGER,
    medication_used JSONB DEFAULT '[]',
    natural_remedies_used JSONB DEFAULT '[]',
    outcome TEXT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Biomarkers & lab data
CREATE TABLE user_biomarkers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    genotype_raw_data_id TEXT,
    key_snps JSONB DEFAULT '{}',
    lab_results JSONB DEFAULT '[]',
    wearable_data_summary JSONB DEFAULT '{}',
    microbiome_summary JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protocols
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id),
    status protocol_status NOT NULL DEFAULT 'draft',
    based_on_imbalance TEXT NOT NULL,
    match_score NUMERIC(4,3),
    herbs JSONB DEFAULT '[]',
    nutrition JSONB DEFAULT '[]',
    lifestyle JSONB DEFAULT '[]',
    exercise JSONB DEFAULT '[]',
    mind_body JSONB DEFAULT '{}',
    affordability_overlay JSONB DEFAULT '{}',
    printable_plan_url TEXT,
    doctor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor profiles extension
CREATE TABLE doctors (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL,
    specialty TEXT,
    years_experience INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor-patient links
CREATE TABLE doctor_patient_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    access_level access_level NOT NULL DEFAULT 'view',
    status link_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(doctor_id, patient_id)
);

-- Secure messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protocol approvals
CREATE TABLE protocol_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL,
    comment TEXT,
    modified_protocol JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_biomarkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patient_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read/update own profile
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Users manage own health events
CREATE POLICY "Users manage own health events" ON health_events
    FOR ALL USING (auth.uid() = user_id);

-- Users manage own biomarkers
CREATE POLICY "Users manage own biomarkers" ON user_biomarkers
    FOR ALL USING (auth.uid() = user_id);

-- Users manage own protocols; doctors can view linked patients
CREATE POLICY "Users manage own protocols" ON protocols
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Doctors view linked patient protocols" ON protocols
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM doctor_patient_links
            WHERE doctor_id = auth.uid()
            AND patient_id = protocols.user_id
            AND status = 'active'
        )
    );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER protocols_updated_at BEFORE UPDATE ON protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
