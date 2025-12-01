-- Create evaluation_results table
CREATE TABLE IF NOT EXISTS evaluation_results (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  disaster_recovery_score INTEGER NOT NULL,
  high_availability_score INTEGER NOT NULL,
  cost_management_score INTEGER NOT NULL,
  security_monitoring_score INTEGER NOT NULL,
  deployment_and_rollback_score INTEGER NOT NULL,
  scalability_score INTEGER NOT NULL,
  access_control_score INTEGER NOT NULL,
  compliance_and_audit_score INTEGER NOT NULL,
  resilience_and_dependencies_score INTEGER NOT NULL,
  documentation_and_knowledge_management_score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_evaluation_results_email ON evaluation_results(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_evaluation_results_created_at ON evaluation_results(created_at);
