# Supabase Setup Instructions

## 1. Create a Supabase Project
Go to [https://supabase.com](https://supabase.com) and create a new project.

## 2. Create the Database Table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE evaluations (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  disaster_recovery_score INTEGER NOT NULL DEFAULT 0,
  high_availability_score INTEGER NOT NULL DEFAULT 0,
  cost_management_score INTEGER NOT NULL DEFAULT 0,
  security_monitoring_score INTEGER NOT NULL DEFAULT 0,
  deployment_and_rollback_score INTEGER NOT NULL DEFAULT 0,
  scalability_score INTEGER NOT NULL DEFAULT 0,
  access_control_score INTEGER NOT NULL DEFAULT 0,
  compliance_and_audit_score INTEGER NOT NULL DEFAULT 0,
  resilience_and_dependencies_score INTEGER NOT NULL DEFAULT 0,
  documentation_and_knowledge_management_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_evaluations_email ON evaluations(email);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at);
CREATE INDEX idx_evaluations_total_score ON evaluations(total_score);
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

## Category Score Fields

The evaluation tracks 10 infrastructure categories:

1. **Disaster Recovery** - Backup and data recovery capabilities
2. **High Availability** - System redundancy and uptime
3. **Cost Management** - Infrastructure cost tracking and optimization
4. **Security Monitoring** - Security alerting and access logging
5. **Deployment & Rollback** - CI/CD and deployment strategies
6. **Scalability** - Auto-scaling and load handling
7. **Access Control** - Identity management and access policies
8. **Compliance & Audit** - Regulatory compliance and audit trails
9. **Resilience & Dependencies** - Third-party dependency management
10. **Documentation & Knowledge Management** - Infrastructure documentation

Each category can score 0-100 points per question, with a total maximum score of 1000 points (10 questions × 100 max points each).
