import jsPDF from 'jspdf'
import { questions, categoryNames, maxScorePerCategory, maxTotalScore, type Category } from '@/data/questions'

export interface PDFGenerationData {
  email: string
  scores: Record<Category, number>
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
  if (percentage >= 60) return [234, 179, 8] // yellow
  return [239, 68, 68] // red
}

const getPointsColor = (points: number): [number, number, number] => {
  if (points === 10) return [220, 252, 231] // light green background
  if (points === 7) return [254, 249, 195] // light yellow background
  return [254, 226, 226] // light red background (for 5 and 3 points)
}

const getPointsTextColor = (points: number): [number, number, number] => {
  if (points === 10) return [21, 128, 61] // dark green text
  if (points === 7) return [161, 98, 7] // dark yellow text
  return [185, 28, 28] // dark red text (for 5 and 3 points)
}

const getOverallMessage = (percentage: number): string => {
  if (percentage >= 80) return "Excellent! Your infrastructure is well-architected and production-ready."
  if (percentage >= 60) return "Good foundation! There are some areas for improvement to reach excellence."
  if (percentage >= 40) return "Moderate setup. Consider upgrading key areas to improve reliability and scalability."
  return "Significant improvements needed. Focus on core infrastructure, security, and scalability."
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
  const messageLines = wrapText(getOverallMessage(overallPercentage), pageWidth - margin * 2 - 70)
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

  const categories: Category[] = ['infrastructure', 'tech_stack', 'security', 'scalability']
  categories.forEach(category => {
    const score = data.scores[category]
    const categoryMax = maxScorePerCategory[category]
    const percentage = Math.round((score / categoryMax) * 100)
    const color = getScoreColor(percentage)

    checkNewPage(25)

    // Category name
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(categoryNames[category], margin, yPosition)

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
  const gaps: { category: Category; percentage: number }[] = []
  categories.forEach(category => {
    const categoryMax = maxScorePerCategory[category]
    const percentage = Math.round((data.scores[category] / categoryMax) * 100)
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
      doc.text(`${index + 1}. ${categoryNames[gap.category]} (${gap.percentage}%)`, margin + 5, yPosition)
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

  // General recommendations
  checkNewPage(40)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Next Steps:', margin, yPosition)
  yPosition += 8

  const nextSteps = getNextSteps(overallPercentage)
  nextSteps.forEach((step, index) => {
    checkNewPage(12)
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    const stepLines = wrapText(`${index + 1}. ${step}`, pageWidth - margin * 2 - 5)
    stepLines.forEach(line => {
      checkNewPage()
      doc.text(line, margin + 5, yPosition)
      yPosition += 5
    })
    yPosition += 3
  })

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

    checkNewPage(50)

    // Background color based on points scored
    const bgColor = getPointsColor(selectedOption.points)
    const textColor = getPointsTextColor(selectedOption.points)

    // Draw background for the entire question block
    doc.setFillColor(...bgColor)
    doc.rect(margin - 2, yPosition - 5, pageWidth - margin * 2 + 4, 10, 'F')

    // Question with category badge inline
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...textColor)
    const questionText = `${index + 1}. ${question.question}`
    doc.text(questionText, margin, yPosition)

    // Category badge right next to question on the same line
    const questionWidth = doc.getTextWidth(questionText)
    doc.setFillColor(219, 234, 254)
    doc.setTextColor(30, 64, 175)
    doc.setFontSize(8)
    const badgeWidth = doc.getTextWidth(categoryNames[question.category]) + 4
    doc.roundedRect(margin + questionWidth + 3, yPosition - 3, badgeWidth, 5, 1, 1, 'F')
    doc.text(categoryNames[question.category], margin + questionWidth + 5, yPosition + 0.5)

    yPosition += 8

    // Selected answer
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Your Answer:', margin + 5, yPosition)
    yPosition += 5

    doc.setFont('helvetica', 'normal')
    doc.text(`${selectedOption.text} (${selectedOption.points} points)`, margin + 5, yPosition)
    yPosition += 7

    // Description
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const descLines = wrapText(selectedOption.description, pageWidth - margin * 2 - 10)
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
  doc.text('For questions or assistance, contact us at support@ezyinfra.com', pageWidth / 2, yPosition + 4, { align: 'center' })

  return doc
}

const getRecommendationForCategory = (category: Category, percentage: number): string => {
  const recommendations: Record<Category, Record<string, string>> = {
    infrastructure: {
      low: 'Consider migrating to a managed cloud platform for better reliability and scalability. Implement automated deployments and comprehensive monitoring to reduce operational overhead and improve system visibility.',
      medium: 'Enhance your infrastructure with container orchestration and implement full observability. Consider adding redundancy and automated scaling to handle traffic variations effectively.'
    },
    tech_stack: {
      low: 'Upgrade to modern frameworks and managed database services. Implement proper data backup strategies and consider using SSR/SSG frameworks for better performance and SEO.',
      medium: 'Optimize your current stack with code splitting and caching strategies. Consider moving to distributed databases for better scalability and reliability.'
    },
    security: {
      low: 'Immediately implement SSL/HTTPS and upgrade authentication mechanisms. Establish automated backup procedures and develop a disaster recovery plan to protect against data loss.',
      medium: 'Enhance security with OAuth/SSO implementation and add multi-factor authentication. Consider working towards compliance certifications and implement regular security audits.'
    },
    scalability: {
      low: 'Design an API architecture to enable better scaling. Implement horizontal scaling with load balancing to handle increased traffic without service degradation.',
      medium: 'Move towards microservices architecture and implement auto-scaling. Consider adding message queues for asynchronous processing and better resource utilization.'
    }
  }

  const level = percentage < 40 ? 'low' : 'medium'
  return recommendations[category][level]
}

const getNextSteps = (percentage: number): string[] => {
  if (percentage >= 80) {
    return [
      'Continue monitoring and optimizing performance metrics',
      'Document your architecture for team knowledge sharing',
      'Consider advanced features like chaos engineering and A/B testing',
      'Stay updated with latest security practices and infrastructure trends'
    ]
  }

  if (percentage >= 60) {
    return [
      'Implement CI/CD pipelines for automated deployments',
      'Add comprehensive monitoring and alerting systems',
      'Plan for horizontal scaling and load balancing',
      'Conduct regular security audits and penetration testing'
    ]
  }

  return [
    'Focus on improving security measures - implement SSL/HTTPS and better authentication',
    'Set up automated backups and disaster recovery procedures',
    'Consider migrating to a managed cloud platform for better reliability',
    'Implement basic monitoring and alerting to detect issues proactively',
    'Plan a roadmap for infrastructure modernization'
  ]
}
