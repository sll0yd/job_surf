import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create and export a typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/*
  Supabase Setup Instructions:

  1. Create a new Supabase project at https://app.supabase.io
  2. Get your project URL and anon key from Settings > API
  3. Add them to your .env.local file:
     
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

  4. Create the 'jobs' table with the following SQL:

  CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT,
    url TEXT,
    description TEXT,
    salary TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'saved',
    applied_date TIMESTAMP WITH TIME ZONE,
    interview_date TIMESTAMP WITH TIME ZONE,
    offer_date TIMESTAMP WITH TIME ZONE,
    rejected_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  5. Enable Row Level Security (RLS) for the jobs table:
  
  ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

  6. Create a policy that allows users to only access their own jobs:
  
  CREATE POLICY "Users can only access their own jobs"
    ON jobs
    FOR ALL
    USING (auth.uid() = user_id);

  7. Create an activities table to track user activities:

  CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  8. Enable RLS for the activities table:
  
  ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
  
  9. Create a policy for the activities table:
  
  CREATE POLICY "Users can only access their own activities"
    ON activities
    FOR ALL
    USING (auth.uid() = user_id);

  10. Create function to automatically update the updated_at field:
  
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  11. Create a trigger to use the function:
  
  CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
*/