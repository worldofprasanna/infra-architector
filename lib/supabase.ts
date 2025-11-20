import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
