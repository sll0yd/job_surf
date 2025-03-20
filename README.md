# JobSurf - Job Application Tracker

JobSurf is a comprehensive job application tracking system built with Next.js, TypeScript, and Supabase. It helps job seekers manage their entire job search process in one place.

![JobSurf Banner](https://example.com/jobsurf-banner.png)

## Features

- **Dashboard**: Overview of your job application statistics
- **Job Tracking**: Save, categorize, and monitor job applications
- **Status Management**: Track jobs through the application lifecycle
- **Note Taking**: Add notes and important details for each application
- **Analytics**: Visualize application data and success rates
- **User Authentication**: Secure user accounts via Supabase Auth

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/jobsurf.git
   cd jobsurf
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

JobSurf uses Supabase for its database. Here's how to set up the required tables:

1. Create a new Supabase project
2. Run the following SQL in the Supabase SQL editor:

```sql
-- Jobs table
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

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies to restrict access to own data
CREATE POLICY "Users can only access their own jobs"
  ON jobs
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own activities"
  ON activities
  FOR ALL
  USING (auth.uid() = user_id);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to use the function
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add the environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.