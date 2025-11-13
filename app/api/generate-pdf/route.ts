import { NextRequest, NextResponse } from 'next/server'
import { generateAuditPDF, type PDFGenerationData } from '@/lib/pdfGenerator'
import { type Category } from '@/data/questions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { email, scores, answers } = body as PDFGenerationData

    // Validate input
    if (!email || !scores || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: email, scores, or answers' },
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

    // Validate scores structure
    const requiredCategories: Category[] = ['infrastructure', 'tech_stack', 'security', 'scalability']
    const hasAllCategories = requiredCategories.every(cat => typeof scores[cat] === 'number')

    if (!hasAllCategories) {
      return NextResponse.json(
        { error: 'Invalid scores structure' },
        { status: 400 }
      )
    }

    // Generate PDF
    const pdf = generateAuditPDF({ email, scores, answers })

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="infrastructure-audit-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
