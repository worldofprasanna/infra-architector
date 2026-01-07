import jsPDF from 'jspdf'
import { type AwsTemplate } from './templates'
import * as fs from 'fs'

export interface PDFGenerationData {
  email: string
  template: AwsTemplate
  awsResources: string[]
  answers: Record<number, string>
  diagramPath?: string
}

/**
 * Generate Architecture Recommendation PDF
 */
export const generateArchitecturePDF = async (data: PDFGenerationData): Promise<jsPDF> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Helper: Check if new page needed
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper: Wrap text
  const wrapText = (text: string, maxWidth: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const textWidth = doc.getTextWidth(testLine)

      if (textWidth > maxWidth) {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          lines.push(word)
          currentLine = ''
        }
      } else {
        currentLine = testLine
      }
    })

    if (currentLine) lines.push(currentLine)
    return lines
  }

  // ============================================================================
  // HEADER SECTION
  // ============================================================================
  doc.setFillColor(37, 99, 235) // Blue
  doc.rect(0, 0, pageWidth, 50, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('AWS Architecture Recommendation', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated for: ${data.email}`, pageWidth / 2, 32, { align: 'center' })
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 40, { align: 'center' })

  yPosition = 65

  // ============================================================================
  // RECOMMENDED ARCHITECTURE SECTION
  // ============================================================================
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Recommended Architecture', margin, yPosition)
  yPosition += 10

  // Template Name Box
  doc.setFillColor(219, 234, 254) // Light blue
  doc.setDrawColor(59, 130, 246)
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 3, 3, 'FD')

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 58, 138) // Dark blue
  doc.text(data.template.name, pageWidth / 2, yPosition + 13, { align: 'center' })
  yPosition += 30

  // Description
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(55, 65, 81) // Gray
  const descLines = wrapText(data.template.description, pageWidth - 2 * margin)
  descLines.forEach(line => {
    checkNewPage()
    doc.text(line, margin, yPosition)
    yPosition += 6
  })
  yPosition += 5

  // ============================================================================
  // ARCHITECTURE DIAGRAM - FULL PAGE
  // Note: Uses static images from public/architectures directory
  // ============================================================================
  if (data.diagramPath) {
    try {
      console.log('Embedding static diagram from path:', data.diagramPath)

      // Verify file exists and has content
      const stats = fs.statSync(data.diagramPath)
      console.log('Diagram file size:', stats.size, 'bytes')

      if (stats.size === 0) {
        throw new Error('Diagram file is empty')
      }

      // Add new page for diagram
      doc.addPage()
      yPosition = margin

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Architecture Diagram', margin, yPosition)
      yPosition += 15

      // Read diagram image
      const imageData = fs.readFileSync(data.diagramPath)
      console.log('Image data read, size:', imageData.length, 'bytes')

      const imageBase64 = `data:image/png;base64,${imageData.toString('base64')}`
      console.log('Base64 encoded, length:', imageBase64.length)

      // Get actual image properties using jsPDF's built-in method
      const imgProps = doc.getImageProperties(imageBase64)
      console.log('Image properties:', imgProps.width, 'x', imgProps.height)

      const imgWidth = imgProps.width
      const imgHeight = imgProps.height
      const aspectRatio = imgWidth / imgHeight

      // Calculate available space on page
      const maxWidth = pageWidth - 2 * margin  // ~170mm
      const maxHeight = pageHeight - yPosition - margin - 10  // ~220mm

      // Calculate final dimensions maintaining aspect ratio
      let finalWidth = maxWidth
      let finalHeight = finalWidth / aspectRatio

      // If height exceeds available space, scale by height instead
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight
        finalWidth = finalHeight * aspectRatio
      }

      // Center horizontally if not using full width
      const xPosition = margin + (maxWidth - finalWidth) / 2

      console.log('Final dimensions in PDF:', finalWidth, 'x', finalHeight, 'at position', xPosition, ',', yPosition)

      // Add diagram image with proper aspect ratio
      doc.addImage(imageBase64, 'PNG', xPosition, yPosition, finalWidth, finalHeight, undefined, 'FAST')
      console.log('✅ Diagram embedded successfully')

      // Move to next page for remaining content
      doc.addPage()
      yPosition = margin
    } catch (error) {
      console.error('❌ Error embedding diagram in PDF:', error)
      // Add error message to PDF
      doc.addPage()
      yPosition = margin
      doc.setFontSize(12)
      doc.setTextColor(255, 0, 0)
      doc.text('Error: Could not load architecture diagram', margin, yPosition)
      doc.setTextColor(0, 0, 0)
      yPosition += 20
    }
  }

  // ============================================================================
  // ESTIMATED COST
  // ============================================================================
  checkNewPage(25)
  doc.setFillColor(220, 252, 231) // Light green
  doc.setDrawColor(34, 197, 94)
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 18, 3, 3, 'FD')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(21, 128, 61) // Dark green
  doc.text('Estimated Monthly Cost:', margin + 5, yPosition + 7)

  doc.setFontSize(14)
  doc.text(data.template.estimatedMonthlyCost, margin + 5, yPosition + 14)
  yPosition += 25

  // ============================================================================
  // BEST FOR SECTION
  // ============================================================================
  checkNewPage(30)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Best For:', margin, yPosition)
  yPosition += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(55, 65, 81)

  data.template.bestFor.forEach((item, idx) => {
    checkNewPage(8)
    // Bullet point
    doc.setFillColor(59, 130, 246)
    doc.circle(margin + 2, yPosition - 2, 1.5, 'F')

    const itemLines = wrapText(item, pageWidth - 2 * margin - 10)
    itemLines.forEach((line, lineIdx) => {
      if (lineIdx > 0) checkNewPage(6)
      doc.text(line, margin + 7, yPosition)
      yPosition += 6
    })
  })
  yPosition += 5

  // ============================================================================
  // AWS SERVICES INCLUDED
  // ============================================================================
  checkNewPage(40)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('AWS Services Included', margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  data.template.components.forEach((component, idx) => {
    checkNewPage(20)

    // Service name box
    doc.setFillColor(239, 246, 255) // Very light blue
    doc.setDrawColor(191, 219, 254)
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 16, 2, 2, 'FD')

    // Service name
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 64, 175)
    doc.text(component.service, margin + 3, yPosition + 6)

    // Purpose
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    const purposeLines = wrapText(component.purpose, pageWidth - 2 * margin - 6)
    purposeLines.forEach((line, lineIdx) => {
      doc.text(line, margin + 3, yPosition + 11 + (lineIdx * 5))
    })

    yPosition += 20
  })

  // ============================================================================
  // NEXT STEPS
  // ============================================================================
  checkNewPage(50)
  yPosition += 10
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Next Steps', margin, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(55, 65, 81)

  const nextSteps = [
    'Review the architecture diagram and components',
    'Discuss requirements with your development team',
    'Schedule a consultation with EzyInfra to refine the architecture',
    'Begin implementation with proper security and compliance measures'
  ]

  nextSteps.forEach((step, idx) => {
    checkNewPage(8)
    doc.setFillColor(59, 130, 246)
    doc.circle(margin + 2, yPosition - 2, 1.5, 'F')
    doc.text(`${idx + 1}. ${step}`, margin + 7, yPosition)
    yPosition += 7
  })

  // ============================================================================
  // FOOTER / CTA
  // ============================================================================
  checkNewPage(40)
  yPosition += 10

  doc.setFillColor(249, 250, 251) // Light gray
  doc.setDrawColor(209, 213, 219)
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'FD')

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('Ready to Build Your Infrastructure?', pageWidth / 2, yPosition + 10, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.text('Contact EzyInfra for a personalized consultation', pageWidth / 2, yPosition + 18, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(59, 130, 246)
  doc.text('https://calendly.com/worldofprasanna/ezyinfra', pageWidth / 2, yPosition + 25, { align: 'center' })

  // ============================================================================
  // FINAL PAGE FOOTER
  // ============================================================================
  const finalY = pageHeight - 15
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.setFont('helvetica', 'normal')
  doc.text('Generated by EzyInfra Architecture Recommender', pageWidth / 2, finalY, { align: 'center' })
  doc.text('https://ezyinfra.dev', pageWidth / 2, finalY + 4, { align: 'center' })

  return doc
}
