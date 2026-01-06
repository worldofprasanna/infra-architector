import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      awsResources,
      selectedTemplate,
      estimatedMonthlyCost
    } = body

    // Validate required fields
    if (!email || !awsResources || !selectedTemplate) {
      return NextResponse.json(
        { error: 'Missing required fields: email, awsResources, selectedTemplate' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Insert architecture recommendation into database
    const query = `
      INSERT INTO architecture_recommendations (
        email,
        aws_resources,
        selected_template,
        estimated_monthly_cost
      ) VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `

    const values = [
      email,
      awsResources,                       // TEXT[]
      selectedTemplate,                   // VARCHAR
      estimatedMonthlyCost || null        // VARCHAR (nullable)
    ]

    const result = await db.query(query, values)

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      created_at: result.rows[0].created_at,
      selectedTemplate,
      estimatedMonthlyCost
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to save architecture recommendation' },
      { status: 500 }
    )
  }
}
