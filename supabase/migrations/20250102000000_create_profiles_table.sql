-- Create profiles table for storing user pregnancy and health information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Essential Pregnancy Information
  last_period DATE,
  previous_pregnancies INTEGER DEFAULT 0,
  conception_type TEXT,
  pregnancy_type TEXT,
  number_of_babies INTEGER,

  -- Medical History
  pre_existing_conditions TEXT[], -- Array of conditions
  previous_pregnancy_complications TEXT[], -- Array of complications
  current_complications TEXT,
  medications TEXT,
  food_allergies TEXT,
  medication_allergies TEXT,
  blood_type TEXT,
  has_blood_clot_history BOOLEAN DEFAULT FALSE,

  -- Lifestyle & Demographics
  age INTEGER,
  weight_category TEXT,
  substance_use_history TEXT[], -- Array of substance use
  activity_level TEXT,
  has_exercise_restrictions BOOLEAN DEFAULT FALSE,
  exercise_restrictions_details TEXT,
  dietary_restrictions TEXT[], -- Array of dietary restrictions
  work_physical_demand TEXT,
  work_chemical_exposure BOOLEAN DEFAULT FALSE,
  work_chemical_exposure_details TEXT,
  additional_notes TEXT,

  -- Profile completion tracking
  profile_completed BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
