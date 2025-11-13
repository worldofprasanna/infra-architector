# Supabase Setup Instructions

## 1. Create a Supabase Project
Go to [https://supabase.com](https://supabase.com) and create a new project.

## 2. Create the Database Table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE evaluations (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  infrastructure_score INTEGER NOT NULL,
  tech_stack_score INTEGER NOT NULL,
  security_score INTEGER NOT NULL,
  scalability_score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX idx_evaluations_email ON evaluations(email);

-- Create an index on created_at for sorting
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at DESC);
```

## 3. Set Up Environment Variables

1. Get your Supabase URL and anon key from Project Settings > API
2. Copy them to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key

## 4. Configure Row Level Security (Optional)

If you want to enable RLS for additional security:
  
```sql
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert evaluations
CREATE POLICY "Allow public insert" ON evaluations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Optionally allow reading all evaluations (or customize as needed)
CREATE POLICY "Allow public read" ON evaluations
  FOR SELECT
  TO public
  USING (true);
```
