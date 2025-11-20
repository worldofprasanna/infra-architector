"use client"

import { useState, useEffect, useRef } from 'react'
import { questions, type Category, categoryNames, maxScorePerCategory, maxTotalScore } from '@/data/questions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ChevronRight, ChevronLeft, Keyboard, Mail, Trophy, TrendingUp, Shield, Server, Layers, Home, Download } from 'lucide-react'
import { supabase, type EvaluationResult } from '@/lib/supabase'
import TalkToUsButton from './TalkToUsButton'
import ClientLogos from './ClientLogos'

type Phase = 'quiz' | 'email' | 'results'

const categoryIcons: Record<Category, React.ReactNode> = {
  infrastructure: <Server className="w-5 h-5" />,
  tech_stack: <Layers className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
  scalability: <TrendingUp className="w-5 h-5" />
}

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

const getGradeBadgeColor = (percentage: number) => {
  if (percentage >= 80) return 'bg-gradient-to-br from-green-500 to-emerald-600'
  if (percentage >= 60) return 'bg-gradient-to-br from-yellow-500 to-orange-600'
  return 'bg-gradient-to-br from-red-500 to-rose-600'
}

const getProgressBarColor = (percentage: number) => {
  if (percentage >= 80) return '[&>div]:bg-green-600'
  if (percentage >= 60) return '[&>div]:bg-yellow-500'
  return '[&>div]:bg-red-600'
}

const getCardGradient = (percentage: number) => {
  if (percentage >= 80) return 'from-green-300 via-emerald-400 to-teal-500'
  if (percentage >= 60) return 'from-yellow-300 via-amber-400 to-orange-500'
  return 'from-red-300 via-rose-400 to-pink-500'
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

export default function Quiz() {
  const [phase, setPhase] = useState<Phase>('quiz')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [transitioning, setTransitioning] = useState(false)
  const [scores, setScores] = useState<Record<Category, number> | null>(null)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const hasSaved = useRef(false)

  // Calculate progress based on answered questions, not current question
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100
  const currentQ = questions[currentQuestion]
  const selectedAnswer = answers[currentQ?.id]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const index = parseInt(e.key)

      if (!isNaN(index) && index >= 1 && index <= currentQ.options.length) {
        const option = currentQ.options[index - 1]
        handleAnswerChange(option.id)
        setTimeout(() => {
          handleNext()
        }, 800)
      }

      if (e.key === "Backspace" || e.key === "ArrowLeft") {
        handlePrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentQuestion, currentQ])

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setTransitioning(true)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setTransitioning(false)
      }, 150)
    } else {
      // Calculate scores
      const calculatedScores: Record<Category, number> = {
        infrastructure: 0,
        tech_stack: 0,
        security: 0,
        scalability: 0
      }

      Object.entries(answers).forEach(([questionId, optionId]) => {
        const question = questions.find(q => q.id === parseInt(questionId))
        const option = question?.options.find(opt => opt.id === optionId)
        if (option && question) {
          calculatedScores[question.category] += option.points
        }
      })

      setScores(calculatedScores)
      setPhase('email')
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setTransitioning(true)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1)
        setTransitioning(false)
      }, 150)
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQ.id]: value })
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')

    if (!email) {
      setEmailError('Please enter your business email')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    // Save to Supabase
    if (scores && !hasSaved.current) {
      hasSaved.current = true
      await saveToSupabase(email, scores)
    }

    setIsSubmitting(false)
    setPhase('results')
  }

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

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `infrastructure-audit-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  const resetQuiz = () => {
    setPhase('quiz')
    setCurrentQuestion(0)
    setAnswers({})
    setScores(null)
    setEmail('')
    setEmailError('')
    hasSaved.current = false
  }

  // Render Email Phase
  if (phase === 'email') {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white py-6 px-6 lg:px-12 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left info section */}
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              Almost There!
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              Enter your business email to view your infrastructure evaluation results and receive a personalized report.
            </p>
            <TalkToUsButton />
          </div>

          {/* Right - Email Card */}
          <div className="relative">
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-blue-300 via-violet-500 to-pink-700 blur-xl animate-gradient opacity-90" />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-transparent bg-clip-padding p-6">
              <Card className="shadow-2xl rounded-2xl border border-gray-100">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Get Your Results</CardTitle>
                  <CardDescription className="text-base">
                    Enter your business email to continue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                        autoFocus
                      />
                      {emailError && (
                        <p className="text-sm text-red-500 mt-1">{emailError}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full h-12 border-2 rounded-3xl border-gray-500 font-bold text-gray-700 bg-gray-50 hover:bg-gray-800 hover:border-none hover:text-white transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'View My Results'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Your email will be used to save your evaluation results. We respect your privacy and won't spam you.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <ClientLogos />
      </div>
    )
  }

  // Render Results Phase
  if (phase === 'results' && scores) {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
    const overallPercentage = Math.round((totalScore / maxTotalScore) * 100)

    return (
      <div className="calc(100vh - 4rem) bg-white py-8 px-6 lg:px-12 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left info section */}
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Evaluate Your Infrastructure in Just 2 Minutes 🚀
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">Spend a few minutes to understand your current infrastructure and receive a personalized improvement report.  </p>
            {isSaving && (
              <p className="text-sm text-blue-600">Saving your results...</p>
            )}
            {saveError && (
              <p className="text-sm text-yellow-600">{saveError}</p>
            )}
            <TalkToUsButton />
            <ClientLogos />
          </div>

          {/* Right - Results Card */}
          <div className="relative">
            <div className={`absolute inset-1 rounded-3xl bg-gradient-to-br ${getCardGradient(overallPercentage)} blur-xl animate-gradient opacity-60`} />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-transparent bg-clip-padding p-6 max-h-[80vh] overflow-y-auto">
              {/* Overall Score */}
              <Card className="shadow-2xl mb-6 border-2">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Overall Score: {overallPercentage}%
                    </CardTitle>
                    <div className={`flex items-center justify-center w-14 h-14 rounded-full ${getGradeBadgeColor(overallPercentage)} text-white text-xl font-bold`}>
                    {getScoreGrade(overallPercentage)}
                    </div>
                  </div>
                  <div className="mb-4">
                    <Progress value={overallPercentage} className={`h-3 ${getProgressBarColor(overallPercentage)}`} />
                    <p className="text-sm text-gray-600 mt-2">
                      {totalScore} out of {maxTotalScore} points
                    </p>
                  </div>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={downloadPDF}
                    disabled={isDownloadingPDF}
                    className="w-full flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 bg-white hover:bg-green-600 hover:text-white transition-all duration-300"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloadingPDF ? 'Generating...' : 'Download Report'}
                  </Button>
                </CardContent>
              </Card>

              {/* Category Scores */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {(Object.keys(scores) as Category[]).map((category) => {
                  const score = scores[category]
                  const categoryMax = maxScorePerCategory[category]
                  const percentage = Math.round((score / categoryMax) * 100)
                  const colorClass = getScoreColor(percentage)
                  const progressColor = getProgressBarColor(percentage)

                  return (
                    <Card key={category} className={`shadow-lg border-2 ${colorClass}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            {categoryIcons[category]}
                            <span className="hidden sm:inline">{categoryNames[category]}</span>
                          </CardTitle>
                          <span className="text-lg font-bold">{percentage}%</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <Progress value={percentage} className={`h-2 mb-1 ${progressColor}`} />
                        <p className="text-xs">
                          {score}/{categoryMax} pts
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Next Steps */}
              <Card className="shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <ul className="space-y-2 text-sm text-gray-700 mb-4">
                    {overallPercentage < 60 && (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">1.</span>
                          <span>Improve security measures - SSL/HTTPS and authentication</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">2.</span>
                          <span>Set up automated backups</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">3.</span>
                          <span>Consider managed cloud platform</span>
                        </li>
                      </>
                    )}
                    {overallPercentage >= 60 && overallPercentage < 80 && (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">1.</span>
                          <span>Implement CI/CD pipelines</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">2.</span>
                          <span>Add monitoring and alerting</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">3.</span>
                          <span>Plan for horizontal scaling</span>
                        </li>
                      </>
                    )}
                    {overallPercentage >= 80 && (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">1.</span>
                          <span>Monitor and optimize performance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">2.</span>
                          <span>Document your architecture</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">3.</span>
                          <span>Consider chaos engineering</span>
                        </li>
                      </>
                    )}
                  </ul>
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={resetQuiz}
                      className="relative inline-flex items-center px-6 py-4 font-semibold text-white transition-all duration-200 bg-black rounded-full overflow-hidden transform hover:scale-105 hover:bg-white hover:text-gray-900 border-black"
                    >
                      <span className="relative z-10">Take Quiz Again</span>
                      <Home className="w-6 h-6 ml-8 -mr-2 relative z-10" />
                    </button>
                    <TalkToUsButton />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Quiz Phase (default)
  return (
    <div className="h-[calc(100vh-4rem)] bg-white px-6 py-4 lg:px-12 flex flex-col justify-between">
      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center flex-1">

        {/* Left info section */}
        <div className="text-center lg:text-left space-y-4">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
            Evaluate Your Infrastructure in Just 2 Minutes 🚀
          </h1>
          <p className="text-base text-gray-600 max-w-md mx-auto lg:mx-0">
            Spend a few minutes to understand your current infrastructure and
            receive a personalized improvement report.
          </p>
          <TalkToUsButton />
        </div>

        {/* Right - Quiz Card */}
        <div className="relative">
          <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-green-500 via-yellow-200 to-green-200 blur-xl animate-gradient opacity-90" />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-transparent bg-clip-padding p-4">
            {/* Keyboard Shortcuts Help */}
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
              <Keyboard className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-0.5">Keyboard shortcuts enabled:</p>
                <p>Press <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-blue-900 font-mono text-xs">1-{currentQ.options.length}</kbd> to select • <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-blue-900 font-mono text-xs">Enter</kbd> to continue • <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-blue-900 font-mono text-xs">←</kbd> to go back</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className={`shadow-2xl rounded-2xl border border-gray-100 transition-opacity duration-150 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {currentQ.question}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Select the option that best describes your current setup
                </CardDescription>
              </CardHeader>

              <CardContent>
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  {currentQ.options.map((option, i) => (
                    <div
                      key={option.id}
                      className={`group flex items-center space-x-3 border-2 rounded-xl p-3 transition-all cursor-pointer hover:bg-gray-50 hover:border-blue-300 ${
                        selectedAnswer === option.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleAnswerChange(option.id)}
                    >
                      {/* Keyboard Shortcut Badge */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        selectedAnswer === option.id
                          ? 'bg-blue-500 border-blue-600 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-600 group-hover:bg-blue-100 group-hover:border-blue-400 group-hover:text-blue-700'
                      }`}>
                        {i + 1}
                      </div>
                      <RadioGroupItem value={option.id} id={option.id} className="flex-shrink-0" />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer text-sm font-medium">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between items-center mt-6 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="group transition-all hover:scale-105 hover:shadow-md hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                    <span className="ml-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">←</span>
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!selectedAnswer}
                    className="group transition-all hover:scale-105 hover:shadow-md"
                  >
                    {currentQuestion === questions.length - 1 ? 'Continue' : 'Next'}
                    {currentQuestion !== questions.length - 1 && (
                      <>
                        <ChevronRight className="w-4 h-4 ml-2" />
                        <span className="ml-1 text-xs opacity-70">↵</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-8 pb-4">
        <ClientLogos />
      </div>
    </div>
  )
}
