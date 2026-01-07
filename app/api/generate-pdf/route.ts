import { NextRequest, NextResponse } from 'next/server'
import { generateArchitecturePDF, type PDFGenerationData } from '@/lib/pdfGenerator'
import { generateDiagram } from '@/lib/diagramGenerator'

export async function POST(request: NextRequest) {
  let diagramPath: string | undefined

  try {
    const body = await request.json()

    const { email, template, awsResources, answers } = body as PDFGenerationData

    // Validate input
    if (!email || !template || !awsResources || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: email, template, awsResources, or answers' },
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

    // Get static architecture diagram path
    console.log(`Getting static diagram for template: ${template.id}`)
    const diagramResult = await generateDiagram(template.id)

    if (!diagramResult.success || !diagramResult.diagramPath) {
      console.error('Failed to get diagram path:', diagramResult.error)
      return NextResponse.json(
        { error: `Failed to get diagram: ${diagramResult.error}` },
        { status: 500 }
      )
    }

    diagramPath = diagramResult.diagramPath
    console.log(`Using static diagram at: ${diagramPath}`)

    // Generate PDF with diagram
    const pdf = await generateArchitecturePDF({
      email,
      template,
      awsResources,
      answers,
      diagramPath
    })

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // No cleanup needed - using static images

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="aws-architecture-${template.id}-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)

    // No cleanup needed - using static images

    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
