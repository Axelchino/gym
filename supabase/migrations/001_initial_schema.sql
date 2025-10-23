-- ============================================
-- GYM TRACKER PRO - INITIAL DATABASE SCHEMA
-- ============================================
-- This migration creates all tables for the gym tracker app
-- Run this in Supabase SQL Editor: Database → SQL Editor → New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  age INTEGER,
  height NUMERIC, -- in cm
  weight NUMERIC, -- in kg (current weight)
  starting_weight NUMERIC, -- in kg
  goal TEXT CHECK (goal IN ('strength', 'hypertrophy', 'endurance', 'general')),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  unit_preference TEXT DEFAULT 'metric' CHECK (unit_preference IN ('metric', 'imperial')),
  actual_1rm JSONB DEFAULT '{}', -- Stores actual tested 1RMs { "Squat": { value: 100, date: "2024-01-01" }, ... }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CUSTOM EXERCISES TABLE (User-created only)
-- ============================================
-- Built-in exercises stay local (1,146 exercises)
-- This table only stores user's custom exercises
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  equipment TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  primary_muscles TEXT[] NOT NULL, -- Array of muscle names
  secondary_muscles TEXT[],
  muscle_map JSONB, -- { "chest": "primary", "triceps": "secondary", ... }
  movement_type TEXT CHECK (movement_type IN ('compound', 'isolation', 'stretch', 'cardio', 'mobility')),
  instructions TEXT,
  video_url TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. WORKOUT TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL, -- Array of { exerciseId, orderIndex, targetSets, targetReps, targetWeight, targetRIR, warmupSets, restSeconds, notes }
  is_active BOOLEAN DEFAULT true,
  schedule JSONB, -- { daysOfWeek: [1, 3, 5], weekNumber: 1 }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. WORKOUT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.workout_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- minutes
  total_volume NUMERIC NOT NULL DEFAULT 0, -- kg
  exercises JSONB NOT NULL, -- Array of { exerciseId, exerciseName, equipment, orderIndex, sets: [{ weight, reps, rir, rpe, isWarmup, isDropSet, isFailure, completed, notes }], totalVolume, notes }
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PERSONAL RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT NOT NULL, -- Can be UUID (custom) or string (built-in exercise name)
  exercise_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weight', 'reps', 'volume', '1rm')),
  value NUMERIC NOT NULL,
  reps INTEGER, -- for weight PRs
  date TIMESTAMPTZ NOT NULL,
  workout_log_id UUID REFERENCES public.workout_logs(id) ON DELETE CASCADE NOT NULL,
  previous_record NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. PROGRAMS TABLE (Multi-week training programs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- weeks
  days_per_week INTEGER NOT NULL,
  weeks JSONB NOT NULL, -- Array of { weekNumber, name, workouts: [{ dayOfWeek, templateId, templateName }], notes }
  goal TEXT CHECK (goal IN ('strength', 'hypertrophy', 'endurance', 'general')),
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. BODY MEASUREMENTS TABLE (Phase 6)
-- ============================================
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  weight NUMERIC, -- kg
  body_fat_percentage NUMERIC,
  measurements JSONB, -- { neck, chest, leftArm, rightArm, waist, hips, leftThigh, rightThigh, leftCalf, rightCalf }
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. ACHIEVEMENTS TABLE (Phase 6)
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL, -- References achievement definition (stored in app)
  category TEXT NOT NULL, -- 'workout_milestone', 'volume_milestone', 'streak', 'pr', 'strength'
  name TEXT NOT NULL,
  description TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Exercises
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON public.exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);

-- Workout Templates
CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id ON public.workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_active ON public.workout_templates(user_id, is_active);

-- Workout Logs
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON public.workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON public.workout_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_template_id ON public.workout_logs(user_id, template_id);

-- Personal Records
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON public.personal_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_date ON public.personal_records(user_id, date DESC);

-- Programs
CREATE INDEX IF NOT EXISTS idx_programs_user_id ON public.programs(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_active ON public.programs(user_id, is_active);

-- Body Measurements
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON public.body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON public.body_measurements(user_id, date DESC);

-- Achievements
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Exercises: Users can only see/edit their own custom exercises
CREATE POLICY "Users can view own exercises" ON public.exercises
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exercises" ON public.exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises" ON public.exercises
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises" ON public.exercises
  FOR DELETE USING (auth.uid() = user_id);

-- Workout Templates: Users can only see/edit their own templates
CREATE POLICY "Users can view own templates" ON public.workout_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates" ON public.workout_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.workout_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.workout_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Workout Logs: Users can only see/edit their own logs
CREATE POLICY "Users can view own workout logs" ON public.workout_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout logs" ON public.workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" ON public.workout_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs" ON public.workout_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Personal Records: Users can only see/edit their own PRs
CREATE POLICY "Users can view own PRs" ON public.personal_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own PRs" ON public.personal_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own PRs" ON public.personal_records
  FOR DELETE USING (auth.uid() = user_id);

-- Programs: Users can only see/edit their own programs
CREATE POLICY "Users can view own programs" ON public.programs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own programs" ON public.programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programs" ON public.programs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own programs" ON public.programs
  FOR DELETE USING (auth.uid() = user_id);

-- Body Measurements: Users can only see/edit their own measurements
CREATE POLICY "Users can view own measurements" ON public.body_measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own measurements" ON public.body_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements" ON public.body_measurements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements" ON public.body_measurements
  FOR DELETE USING (auth.uid() = user_id);

-- Achievements: Users can only see/edit their own achievements
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements" ON public.achievements
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON public.workout_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION TO CREATE PROFILE ON SIGNUP
-- ============================================

-- This function automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DONE! 🎉
-- ============================================
-- All tables, indexes, RLS policies, and triggers are now set up
-- Your database is ready for the gym tracker app
