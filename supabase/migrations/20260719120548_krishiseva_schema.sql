/*
# KrishiSeva - Crop Disease Detection & Advisory Platform Schema

## Overview
Creates the complete database schema for KrishiSeva, a multilingual crop disease
detection and advisory web app for Indian smallholder farmers. The app integrates
6 hackathon partners (Gnani.ai, Mem0, Keploy, Outlier) across the stack.

## New Tables
1. profiles - Farmer profile data (name, language, location, crops)
2. diagnoses - Crop disease detection results with Outlier validation flags
3. memories - Mem0 persistent farmer memory across sessions
4. feedback - Farmer feedback on diagnoses (Outlier validation loop)
5. api_tests - Keploy captured API test cases from real traffic

## Security
- RLS enabled on ALL tables.
- Owner-scoped CRUD policies (select/insert/update/delete) for authenticated users.
- user_id columns default to auth.uid() so inserts work without client passing user_id.
- App requires sign-in - no anon access.
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  preferred_language text NOT NULL DEFAULT 'en',
  state text,
  district text,
  primary_crops text[] DEFAULT '{}',
  farm_size_acres numeric,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- DIAGNOSES TABLE
CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  disease_name text NOT NULL,
  confidence_score numeric NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  symptoms text,
  treatment text,
  prevention text,
  image_url text,
  language text NOT NULL DEFAULT 'en',
  outlier_warning boolean NOT NULL DEFAULT false,
  outlier_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_diagnoses" ON diagnoses;
CREATE POLICY "select_own_diagnoses" ON diagnoses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_diagnoses" ON diagnoses;
CREATE POLICY "insert_own_diagnoses" ON diagnoses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_diagnoses" ON diagnoses;
CREATE POLICY "update_own_diagnoses" ON diagnoses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_diagnoses" ON diagnoses;
CREATE POLICY "delete_own_diagnoses" ON diagnoses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses(created_at DESC);

-- MEMORIES TABLE (Mem0 integration)
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_memories" ON memories;
CREATE POLICY "select_own_memories" ON memories FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_memories" ON memories;
CREATE POLICY "insert_own_memories" ON memories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_memories" ON memories;
CREATE POLICY "update_own_memories" ON memories FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_memories" ON memories;
CREATE POLICY "delete_own_memories" ON memories FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);

-- FEEDBACK TABLE (Outlier validation loop)
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  diagnosis_id uuid REFERENCES diagnoses(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  was_helpful boolean,
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_feedback" ON feedback;
CREATE POLICY "select_own_feedback" ON feedback FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_feedback" ON feedback;
CREATE POLICY "insert_own_feedback" ON feedback FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_feedback" ON feedback;
CREATE POLICY "update_own_feedback" ON feedback FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_feedback" ON feedback;
CREATE POLICY "delete_own_feedback" ON feedback FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_diagnosis_id ON feedback(diagnosis_id);

-- API_TESTS TABLE (Keploy integration)
CREATE TABLE IF NOT EXISTS api_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint text NOT NULL,
  method text NOT NULL,
  request_body jsonb,
  response_status integer,
  response_body jsonb,
  test_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_api_tests" ON api_tests;
CREATE POLICY "select_own_api_tests" ON api_tests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_api_tests" ON api_tests;
CREATE POLICY "insert_own_api_tests" ON api_tests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_api_tests" ON api_tests;
CREATE POLICY "update_own_api_tests" ON api_tests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_api_tests" ON api_tests;
CREATE POLICY "delete_own_api_tests" ON api_tests FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_api_tests_user_id ON api_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_api_tests_endpoint ON api_tests(endpoint);

-- Trigger to update updated_at on profiles and memories
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_memories_updated_at ON memories;
CREATE TRIGGER trigger_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
