import { NextRequest, NextResponse } from 'next/server'
import { generateArchitecturePDF, type PDFGenerationData } from '@/lib/pdfGenerator'
import { generateDiagram, cleanupDiagram } from '@/lib/diagramGenerator'

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

    // Generate architecture diagram
    console.log(`Generating diagram for template: ${template.id}`)
    const diagramResult = await generateDiagram(template.id)

    if (!diagramResult.success || !diagramResult.diagramPath) {
      console.error('Diagram generation failed:', diagramResult.error)
      return NextResponse.json(
        { error: `Failed to generate diagram: ${diagramResult.error}` },
        { status: 500 }
      )
    }

    diagramPath = diagramResult.diagramPath
    console.log(`Diagram generated at: ${diagramPath}`)

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

    // Clean up diagram after PDF is generated
    await cleanupDiagram(diagramPath)

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

    // Clean up diagram on error
    if (diagramPath) {
      await cleanupDiagram(diagramPath)
    }

    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
