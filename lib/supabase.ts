import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type EvaluationResult = {
  id?: number
  email: string
  infrastructure_score: number
  tech_stack_score: number
  security_score: number
  scalability_score: number
  total_score: number
  created_at?: string
}
