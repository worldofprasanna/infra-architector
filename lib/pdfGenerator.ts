import jsPDF from 'jspdf'
import { questions, categoryNames, maxScorePerCategory, maxTotalScore, scoringFramework, type Category } from '@/data/questions'

export interface PDFGenerationData {
  email: string
  scores: Record<string, number>
  answers: Record<number, string>
}

const getScoreGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B'
  if (percentage >= 60) return 'C'
  if (percentage >= 50) return 'D'
  return 'F'
}

const getScoreColor = (percentage: number): [number, number, number] => {
  if (percentage >= 80) return [34, 197, 94] // green
  if (percentage >= 50) return [234, 179, 8] // yellow
  return [239, 68, 68] // red
}

const getPointsColor = (score: number): [number, number, number] => {
  if (score === 100) return [220, 252, 231] // light green background
  if (score >= 50) return [254, 249, 195] // light yellow background
  return [254, 226, 226] // light red background (for low scores)
}

const getPointsTextColor = (score: number): [number, number, number] => {
  if (score === 100) return [21, 128, 61] // dark green text
  if (score >= 50) return [161, 98, 7] // dark yellow text
  return [185, 28, 28] // dark red text (for low scores)
}

const getOverallMessage = (totalScore: number): string => {
  const scoreRange = scoringFramework.score_ranges.find(
    range => totalScore >= range.min && totalScore <= range.max
  )
  return scoreRange?.description || "Infrastructure evaluation completed."
}

export const generateAuditPDF = (data: PDFGenerationData): jsPDF => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to wrap text
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

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  // Calculate scores
  const totalScore = Object.values(data.scores).reduce((sum, score) => sum + score, 0)
  const overallPercentage = Math.round((totalScore / maxTotalScore) * 100)

  // Title Section
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 0, pageWidth, 50, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Infrastructure Audit Report', pageWidth / 2, 25, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated for: ${data.email}`, pageWidth / 2, 35, { align: 'center' })
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 42, { align: 'center' })

  yPosition = 60

  // Overall Score Section
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Overall Assessment', margin, yPosition)
  yPosition += 10

  const grade = getScoreGrade(overallPercentage)
  const gradeColor = getScoreColor(overallPercentage)

  // Score box
  doc.setFillColor(...gradeColor)
  doc.roundedRect(margin, yPosition, 60, 25, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`Score: ${overallPercentage}%`, margin + 30, yPosition + 12, { align: 'center' })
  doc.text(`Grade: ${grade}`, margin + 30, yPosition + 20, { align: 'center' })

  // Overall message
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const messageLines = wrapText(getOverallMessage(totalScore), pageWidth - margin * 2 - 70)
  messageLines.forEach((line, index) => {
    doc.text(line, margin + 70, yPosition + 8 + (index * 5))
  })

  yPosition += 35

  // Category Scores Section
  checkNewPage(80)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Category Breakdown', margin, yPosition)
  yPosition += 10

  const categories = Object.keys(data.scores)
  categories.forEach(category => {
    const score = data.scores[category] || 0
    const categoryMax = maxScorePerCategory[category] || 100
    const percentage = Math.round((score / categoryMax) * 100)
    const color = getScoreColor(percentage)

    checkNewPage(25)

    // Category name
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(categoryNames[category] || category, margin, yPosition)

    // Score
    doc.setFontSize(10)
    doc.text(`${percentage}% (${score}/${categoryMax} points)`, pageWidth - margin - 40, yPosition, { align: 'right' })

    yPosition += 5

    // Progress bar
    doc.setFillColor(220, 220, 220)
    doc.rect(margin, yPosition, pageWidth - margin * 2, 6, 'F')
    doc.setFillColor(...color)
    doc.rect(margin, yPosition, (pageWidth - margin * 2) * (percentage / 100), 6, 'F')

    yPosition += 15
  })

  // Recommendations Section (moved before Detailed Analysis)
  doc.addPage()
  yPosition = margin

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Recommendations', margin, yPosition)
  yPosition += 12

  // Find areas with low scores (potential gaps)
  const gaps: { category: string; percentage: number }[] = []
  categories.forEach(category => {
    const score = data.scores[category] || 0
    const categoryMax = maxScorePerCategory[category] || 100
    const percentage = Math.round((score / categoryMax) * 100)
    if (percentage < 70) {
      gaps.push({ category, percentage })
    }
  })

  if (gaps.length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Priority Areas for Improvement:', margin, yPosition)
    yPosition += 8

    gaps.sort((a, b) => a.percentage - b.percentage).forEach((gap, index) => {
      checkNewPage(15)
      doc.setFontSize(10)
      doc.setTextColor(185, 28, 28)
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}. ${categoryNames[gap.category] || gap.category} (${gap.percentage}%)`, margin + 5, yPosition)
      yPosition += 5

      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

      const recommendation = getRecommendationForCategory(gap.category, gap.percentage)
      const recLines = wrapText(recommendation, pageWidth - margin * 2 - 10)
      recLines.forEach(line => {
        checkNewPage()
        doc.text(line, margin + 10, yPosition)
        yPosition += 4
      })
      yPosition += 6
    })
  } else {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Excellent work! Your infrastructure is well-optimized across all categories.', margin, yPosition)
    yPosition += 6
    doc.text('Continue monitoring and maintaining your current standards.', margin, yPosition)
  }

  yPosition += 10

  // Score range category and recommendations
  const scoreRangeInfo = scoringFramework.score_ranges.find(
    range => totalScore >= range.min && totalScore <= range.max
  )

  if (scoreRangeInfo) {
    checkNewPage(50)

    // Category and description
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(`Assessment: ${scoreRangeInfo.category}`, margin, yPosition)
    yPosition += 8

    // Description
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    const descLines = wrapText(scoreRangeInfo.description, pageWidth - margin * 2)
    descLines.forEach(line => {
      checkNewPage()
      doc.text(line, margin, yPosition)
      yPosition += 5
    })
    yPosition += 8

    // Recommendations heading
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Recommended Actions:', margin, yPosition)
    yPosition += 8

    scoreRangeInfo.recommendations.forEach((recommendation, index) => {
      checkNewPage(12)
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      const recLines = wrapText(`${index + 1}. ${recommendation}`, pageWidth - margin * 2 - 5)
      recLines.forEach(line => {
        checkNewPage()
        doc.text(line, margin + 5, yPosition)
        yPosition += 5
      })
      yPosition += 3
    })
  }

  // Detailed Analysis Section (moved to the end)
  doc.addPage()
  yPosition = margin

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Detailed Analysis', margin, yPosition)
  yPosition += 10

  questions.forEach((question, index) => {
    const selectedOptionId = data.answers[question.id]
    const selectedOption = question.options.find(opt => opt.id === selectedOptionId)

    if (!selectedOption) return

    checkNewPage(60)

    // Background color based on score
    const bgColor = getPointsColor(selectedOption.score)
    const textColor = getPointsTextColor(selectedOption.score)

    // Question text with wrapping
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...textColor)
    const questionText = `${index + 1}. ${question.question}`
    const questionLines = wrapText(questionText, pageWidth - margin * 2 - 40) // Leave space for badge

    // Calculate background height based on wrapped lines
    const bgHeight = questionLines.length * 5 + 5

    // Draw background for the question
    doc.setFillColor(...bgColor)
    doc.rect(margin - 2, yPosition - 5, pageWidth - margin * 2 + 4, bgHeight, 'F')

    // Render wrapped question text
    questionLines.forEach((line, lineIndex) => {
      doc.setTextColor(...textColor)
      doc.text(line, margin, yPosition + (lineIndex * 5))
    })

    // Category badge on the right side
    const badgeYPosition = yPosition - 3
    doc.setFillColor(219, 234, 254)
    doc.setTextColor(30, 64, 175)
    doc.setFontSize(8)
    const categoryName = categoryNames[question.category] || question.category
    const badgeWidth = doc.getTextWidth(categoryName) + 4
    doc.roundedRect(pageWidth - margin - badgeWidth - 2, badgeYPosition, badgeWidth, 5, 1, 1, 'F')
    doc.text(categoryName, pageWidth - margin - badgeWidth, badgeYPosition + 3.5)

    yPosition += bgHeight + 3

    // Selected answer
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Your Answer:', margin + 5, yPosition)
    yPosition += 5

    doc.setFont('helvetica', 'normal')
    doc.text(`${selectedOption.text} (${selectedOption.score} points)`, margin + 5, yPosition)
    yPosition += 7

    // Analysis
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const descLines = wrapText(selectedOption.analysis, pageWidth - margin * 2 - 10)
    descLines.forEach(line => {
      checkNewPage()
      doc.text(line, margin + 5, yPosition)
      yPosition += 4
    })

    yPosition += 8
  })

  // Footer on last page
  yPosition = pageHeight - 20
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.setFont('helvetica', 'italic')
  doc.text('This report was generated by EzyInfra Infrastructure Evaluator', pageWidth / 2, yPosition, { align: 'center' })
  doc.text('For questions or assistance, contact us at prasanna@ezyinfra.dev', pageWidth / 2, yPosition + 4, { align: 'center' })

  return doc
}

const getRecommendationForCategory = (category: string, percentage: number): string => {
  // Use scoring framework recommendations if available
  const scoreRange = scoringFramework.score_ranges.find(range => {
    // This is simplified - in reality we'd need the actual score, not percentage
    return percentage >= 0 // placeholder logic
  })

  // Default recommendations based on category
  const defaultRecommendations: Record<string, string> = {
    'Disaster Recovery': 'Implement robust backup and recovery procedures. Consider point-in-time recovery and regular disaster recovery testing.',
    'High Availability': 'Set up redundant systems with automatic failover. Implement load balancing and health checks for zero-downtime operations.',
    'Cost Management': 'Implement cost tracking with resource tagging. Use dashboards for real-time cost visibility and optimization opportunities.',
    'Security Monitoring': 'Deploy automated security monitoring with real-time alerts. Implement comprehensive logging and access tracking.',
    'Deployment & Rollback': 'Establish automated CI/CD pipelines with one-click rollback capabilities. Implement blue-green or canary deployments.',
    'Scalability': 'Design for auto-scaling infrastructure. Implement horizontal scaling with appropriate load distribution.',
    'Access Control': 'Implement centralized identity management with SSO. Automate access provisioning and deprovisioning.',
    'Compliance & Audit': 'Set up centralized audit logging. Implement automated compliance reporting and data access tracking.',
    'Resilience & Dependencies': 'Implement circuit breakers and graceful degradation. Use caching and fallback mechanisms for third-party dependencies.',
    'Documentation & Knowledge Management': 'Maintain infrastructure-as-code for all resources. Keep comprehensive documentation and runbooks updated.'
  }

  return defaultRecommendations[category] || 'Review and improve current practices in this area. Consider consulting with infrastructure experts for specific recommendations.'
}

// Removed getNextSteps - now using scoring framework recommendations
