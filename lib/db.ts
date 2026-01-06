import { Pool } from 'pg'

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10 seconds timeout
})

export const db = pool

// Architecture Recommendation Type
export type ArchitectureRecommendation = {
  id?: number
  email: string
  aws_resources: string[]
  selected_template: string
  estimated_monthly_cost?: string
  created_at?: string
}
