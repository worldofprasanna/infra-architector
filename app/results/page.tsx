"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { supabase, type EvaluationResult } from '@/lib/supabase'
import { categoryNames, maxScorePerCategory, maxTotalScore, type Category } from '@/data/questions'
import { Trophy, TrendingUp, Shield, Server, Layers, Home, Download } from 'lucide-react'

const categoryIcons: Record<Category, React.ReactNode> = {
  infrastructure: <Server className="w-5 h-5" />,
  tech_stack: <Layers className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
  scalability: <TrendingUp className="w-5 h-5" />
}

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (percentage >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (percentage >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

const getScoreGrade = (percentage: number) => {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B'
  if (percentage >= 60) return 'C'
  if (percentage >= 50) return 'D'
  return 'F'
}

const getOverallMessage = (percentage: number) => {
  if (percentage >= 80) return "Excellent! Your infrastructure is well-architected and production-ready."
  if (percentage >= 60) return "Good foundation! There are some areas for improvement to reach excellence."
  if (percentage >= 40) return "Moderate setup. Consider upgrading key areas to improve reliability and scalability."
  return "Significant improvements needed. Focus on core infrastructure, security, and scalability."
}

export default function ResultsPage() {
  const [scores, setScores] = useState<Record<Category, number> | null>(null)
  const [email, setEmail] = useState<string>('')
  const [answers, setAnswers] = useState<Record<number, string> | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const hasSaved = useRef(false)
  const router = useRouter()

  useEffect(() => {
    // Get scores, answers, and email from sessionStorage
    const scoresJson = sessionStorage.getItem('evaluationScores')
    const answersJson = sessionStorage.getItem('evaluationAnswers')
    const userEmail = sessionStorage.getItem('userEmail')

    if (!scoresJson || !userEmail || !answersJson) {
      // Redirect back to quiz if no data
      router.push('/')
      return
    }

    const parsedScores = JSON.parse(scoresJson)
    const parsedAnswers = JSON.parse(answersJson)
    setScores(parsedScores)
    setAnswers(parsedAnswers)
    setEmail(userEmail)

    // Save to Supabase only once
    if (!hasSaved.current) {
      hasSaved.current = true
      saveToSupabase(userEmail, parsedScores)
    }
  }, [router])

  const saveToSupabase = async (email: string, scores: Record<Category, number>) => {
    setIsSaving(true)
    setSaveError(null)

    try {
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)

      const evaluation: EvaluationResult = {
        email,
        infrastructure_score: scores.infrastructure,
        tech_stack_score: scores.tech_stack,
        security_score: scores.security,
        scalability_score: scores.scalability,
        total_score: totalScore
      }

      const { error } = await supabase
        .from('evaluations')
        .insert([evaluation])

      if (error) {
        console.error('Supabase error:', error)
        setSaveError('Failed to save results. But you can still view them below.')
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error)
      setSaveError('Failed to save results. But you can still view them below.')
    } finally {
      setIsSaving(false)
    }
  }

  const downloadPDF = async () => {
    if (!scores || !email || !answers) {
      return
    }

    setIsDownloadingPDF(true)

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          scores,
          answers
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Get the PDF blob
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `infrastructure-audit-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  if (!scores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const overallPercentage = Math.round((totalScore / maxTotalScore) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Infrastructure Evaluation
          </h1>
          <p className="text-gray-600">
            Results sent to: <span className="font-medium">{email}</span>
          </p>
          {isSaving && (
            <p className="text-sm text-blue-600 mt-2">Saving your results...</p>
          )}
          {saveError && (
            <p className="text-sm text-yellow-600 mt-2">{saveError}</p>
          )}
        </div>

        {/* Overall Score */}
        <Card className="shadow-xl mb-8 border-2">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl mb-2">
              Overall Score: {overallPercentage}%
            </CardTitle>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold mb-4">
              {getScoreGrade(overallPercentage)}
            </div>
            <CardDescription className="text-base">
              {getOverallMessage(overallPercentage)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={overallPercentage} className="h-3" />
            <p className="text-center text-sm text-gray-600 mt-2">
              {totalScore} out of {maxTotalScore} points
            </p>
          </CardContent>
        </Card>

        {/* Category Scores */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {(Object.keys(scores) as Category[]).map((category) => {
            const score = scores[category]
            const categoryMax = maxScorePerCategory[category]
            const percentage = Math.round((score / categoryMax) * 100)
            const colorClass = getScoreColor(percentage)

            return (
              <Card key={category} className={`shadow-lg border-2 ${colorClass}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {categoryIcons[category]}
                      {categoryNames[category]}
                    </CardTitle>
                    <span className="text-2xl font-bold">{percentage}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={percentage} className="h-2 mb-2" />
                  <p className="text-sm">
                    {score} out of {categoryMax} points
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Action Buttons */}
        <Card className="shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={downloadPDF}
                disabled={isDownloadingPDF}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                {isDownloadingPDF ? 'Generating PDF...' : 'Download Audit Report (PDF)'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  sessionStorage.clear()
                  router.push('/')
                }}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Take Quiz Again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="shadow-xl mt-8">
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-700">
              {overallPercentage < 60 && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Focus on improving security measures - implement SSL/HTTPS and better authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Set up automated backups and disaster recovery procedures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Consider migrating to a managed cloud platform for better reliability</span>
                  </li>
                </>
              )}
              {overallPercentage >= 60 && overallPercentage < 80 && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Implement CI/CD pipelines for automated deployments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Add comprehensive monitoring and alerting systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Plan for horizontal scaling and load balancing</span>
                  </li>
                </>
              )}
              {overallPercentage >= 80 && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Continue monitoring and optimizing performance metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Document your architecture for team knowledge sharing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Consider advanced features like chaos engineering and A/B testing</span>
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
