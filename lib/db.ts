import { Pool } from 'pg'

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Required for RDS
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10 seconds timeout
})

export const db = pool

export type EvaluationResult = {
  id?: number
  email: string
  disaster_recovery_score: number
  high_availability_score: number
  cost_management_score: number
  security_monitoring_score: number
  deployment_and_rollback_score: number
  scalability_score: number
  access_control_score: number
  compliance_and_audit_score: number
  resilience_and_dependencies_score: number
  documentation_and_knowledge_management_score: number
  total_score: number
  created_at?: string
}
