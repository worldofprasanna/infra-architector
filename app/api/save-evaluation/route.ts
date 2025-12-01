import { NextRequest, NextResponse } from 'next/server'
import { db, type EvaluationResult } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, scores } = body

    if (!email || !scores) {
      return NextResponse.json(
        { error: 'Email and scores are required' },
        { status: 400 }
      )
    }

    // Calculate total score
    const totalScore = Object.values(scores).reduce((sum: number, score) => sum + (score as number), 0)

    // Create a flattened object with all category scores
    const categoryScores: Record<string, number> = {}
    Object.entries(scores).forEach(([category, score]) => {
      const key = category.toLowerCase().replace(/\s+/g, '_').replace(/&/g, 'and')
      categoryScores[`${key}_score`] = score as number
    })

    // Insert into database
    const query = `
      INSERT INTO evaluation_results (
        email,
        disaster_recovery_score,
        high_availability_score,
        cost_management_score,
        security_monitoring_score,
        deployment_and_rollback_score,
        scalability_score,
        access_control_score,
        compliance_and_audit_score,
        resilience_and_dependencies_score,
        documentation_and_knowledge_management_score,
        total_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, created_at
    `

    const values = [
      email,
      categoryScores['disaster_recovery_score'] || 0,
      categoryScores['high_availability_score'] || 0,
      categoryScores['cost_management_score'] || 0,
      categoryScores['security_and_monitoring_score'] || 0,
      categoryScores['deployment_and_rollback_score'] || 0,
      categoryScores['scalability_score'] || 0,
      categoryScores['access_control_score'] || 0,
      categoryScores['compliance_and_audit_score'] || 0,
      categoryScores['resilience_and_dependencies_score'] || 0,
      categoryScores['documentation_and_knowledge_management_score'] || 0,
      totalScore
    ]

    const result = await db.query(query, values)

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      created_at: result.rows[0].created_at
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to save evaluation' },
      { status: 500 }
    )
  }
}
