"use client"

import { useState, useEffect, useRef } from 'react'
import { questions } from '@/data/questions'
import { selectTemplate } from '@/lib/templateSelector'
import { type AwsTemplate } from '@/lib/templates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ChevronRight, ChevronLeft, Keyboard, Mail, Home, Download, Server, CheckCircle2, DollarSign } from 'lucide-react'
import TalkToUsButton from './TalkToUsButton'
import ClientLogos from './ClientLogos'

type Phase = 'quiz' | 'email' | 'results'

// Shuffle function using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function Quiz() {
  const [phase, setPhase] = useState<Phase>('quiz')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [transitioning, setTransitioning] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AwsTemplate | null>(null)
  const [awsResources, setAwsResources] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const hasSaved = useRef(false)

  // Shuffle options once when component mounts
  const [shuffledQuestions] = useState(() =>
    questions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }))
  )

  // Calculate progress based on answered questions
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / shuffledQuestions.length) * 100
  const currentQ = shuffledQuestions[currentQuestion]
  const selectedAnswer = answers[currentQ?.id]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'quiz') return

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
  }, [currentQuestion, currentQ, phase])

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setTransitioning(true)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setTransitioning(false)
      }, 150)
    } else {
      // Quiz completed - select template
      const match = selectTemplate(answers, shuffledQuestions)
      setSelectedTemplate(match.template)
      setAwsResources(match.userResources)
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

    // Save to database
    if (selectedTemplate && !hasSaved.current) {
      hasSaved.current = true
      await saveRecommendation(email, selectedTemplate, awsResources)
    }

    setIsSubmitting(false)
    setPhase('results')
  }

  const saveRecommendation = async (
    email: string,
    template: AwsTemplate,
    resources: string[]
  ) => {
    setIsSaving(true)
    setSaveError(null)

    try {
      const response = await fetch('/api/save-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          awsResources: resources,
          selectedTemplate: template.id,
          estimatedMonthlyCost: template.estimatedMonthlyCost
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        setSaveError('Failed to save results. But you can still view them below.')
      }
    } catch (error) {
      console.error('Error saving recommendation:', error)
      setSaveError('Failed to save results. But you can still view them below.')
    } finally {
      setIsSaving(false)
    }
  }

  const downloadPDF = async () => {
    if (!selectedTemplate || !email || !answers) {
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
          template: selectedTemplate,
          awsResources,
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
      link.download = `aws-architecture-${selectedTemplate.id}-${Date.now()}.pdf`
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
    setSelectedTemplate(null)
    setAwsResources([])
    setEmail('')
    setEmailError('')
    hasSaved.current = false
  }

  // ============================================================================
  // RENDER: Email Phase
  // ============================================================================
  if (phase === 'email') {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white py-6 px-6 lg:px-12 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left info section */}
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              Almost There! 🎉
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              Enter your business email to view your infrastructure architecture recommendation and receive a personalized report.
            </p>
            <TalkToUsButton />
          </div>

          {/* Right - Email Card */}
          <div className="relative">
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-emerald-200 via-teal-300 to-cyan-300 blur-xl animate-gradient opacity-60" />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-transparent bg-clip-padding p-6">
              <Card className="shadow-2xl rounded-2xl border-2 border-gray-100">
                <CardHeader className="text-center bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <Mail className="w-8 h-8 text-emerald-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Get Your Results</CardTitle>
                  <CardDescription className="text-base text-gray-600 mt-2">
                    ✉️ Enter your business email to continue
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Business Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200"
                          autoFocus
                        />
                      </div>
                      {emailError && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <span>⚠️</span> {emailError}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span> Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          View My Results <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <p className="text-xs text-emerald-700 text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Your email will be used to save your architecture recommendation. We respect your privacy and won't spam you.</span>
                      </p>
                    </div>
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

  // ============================================================================
  // RENDER: Results Phase
  // ============================================================================
  if (phase === 'results' && selectedTemplate) {
    return (
      <div className="calc(100vh - 4rem) bg-white py-8 px-6 lg:px-12 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left info section */}
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              Get Your Infrastructure Architecture in Just 2 Minutes 🚀
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              Based on your answers, we've recommended the perfect AWS architecture for your needs.
            </p>
            {isSaving && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="animate-spin">⏳</span>
                <p className="text-sm text-emerald-600 font-medium">Saving your results...</p>
              </div>
            )}
            {saveError && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span>⚠️</span>
                <p className="text-sm text-yellow-700 font-medium">{saveError}</p>
              </div>
            )}
            <TalkToUsButton />
            <ClientLogos />
          </div>

          {/* Right - Results Card */}
          <div className="relative">
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-400 blur-xl animate-gradient opacity-70" />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-transparent bg-clip-padding p-6 max-h-[80vh] overflow-y-auto">
              {/* Template Name with gradient badge */}
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-semibold mb-3 shadow-md">
                  ✨ Your Perfect Match
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h3>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">📋 Description</h4>
                <p className="text-base text-gray-700 leading-relaxed">{selectedTemplate.description}</p>
              </div>

              {/* Estimated Cost Card */}
              <Card className="shadow-lg mb-6 border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg shadow-md">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-emerald-700">Estimated Monthly Cost</p>
                      <p className="text-2xl font-bold text-emerald-700">{selectedTemplate.estimatedMonthlyCost}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best For Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-3">✅ Best For</h4>
                <ul className="space-y-2">
                  {selectedTemplate.bestFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AWS Services/Components */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-3">☁️ AWS Services Included</h4>
                <div className="space-y-3">
                  {selectedTemplate.components.map((component, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-2">
                        <Server className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-emerald-900 text-sm">{component.service}</h5>
                          <p className="text-xs text-gray-600 mt-1">{component.purpose}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download PDF Button */}
              <Button
                size="lg"
                onClick={downloadPDF}
                disabled={isDownloadingPDF}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Download className="w-4 h-4" />
                {isDownloadingPDF ? 'Generating...' : 'Download as PDF'}
              </Button>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={resetQuiz}
                  className="relative inline-flex items-center px-6 py-4 font-semibold text-white transition-all duration-200 bg-black rounded-full overflow-hidden transform hover:scale-105 hover:bg-white hover:text-gray-900 border-2 border-black"
                >
                  <span className="relative z-10">Take Quiz Again</span>
                  <Home className="w-6 h-6 ml-8 -mr-2 relative z-10" />
                </button>
                <TalkToUsButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: Quiz Phase (ORIGINAL LEFT-RIGHT UI)
  // ============================================================================
  return (
    <div className="h-[calc(100vh-4rem)] bg-white px-6 py-4 lg:px-12 flex flex-col justify-between">
      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center flex-1">

        {/* Left info section */}
        <div className="text-center lg:text-left space-y-4">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
            Get Your Infrastructure Architecture in Just 2 Minutes 🚀
          </h1>
          <p className="text-base text-gray-600 max-w-md mx-auto lg:mx-0">
            Answer {shuffledQuestions.length} quick questions and get a personalized AWS architecture recommendation.
          </p>
          <TalkToUsButton />
        </div>

        {/* Right - Quiz Card */}
        <div className="relative">
          {/* Dynamic gradient background that changes with progress */}
          <div
            className="absolute inset-1 rounded-3xl blur-xl animate-gradient transition-all duration-1000"
            style={{
              background: progress < 33
                ? 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)'
                : progress < 66
                ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              opacity: 0.75
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-transparent bg-clip-padding p-4">
            {/* Keyboard Shortcuts - More compact */}
            <div className="mb-3 p-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-start gap-2">
              <Keyboard className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-emerald-700">
                <p className="font-semibold mb-0.5">⌨️ Keyboard shortcuts:</p>
                <p>Press <kbd className="px-1.5 py-0.5 bg-white border border-emerald-200 rounded text-emerald-700 font-mono text-xs shadow-sm">1-{currentQ.options.length}</kbd> to select • <kbd className="px-1.5 py-0.5 bg-white border border-emerald-200 rounded text-emerald-700 font-mono text-xs shadow-sm">Enter</kbd> next • <kbd className="px-1.5 py-0.5 bg-white border border-emerald-200 rounded text-emerald-700 font-mono text-xs shadow-sm">←</kbd> back</p>
              </div>
            </div>

            {/* Progress indicator - More visual */}
            <div className="mb-4">
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold">
                    {currentQuestion + 1}
                  </span>
                  <span>of {shuffledQuestions.length}</span>
                </span>
                <span className="text-emerald-600 font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: progress < 33
                      ? 'linear-gradient(90deg, #86efac 0%, #4ade80 100%)'
                      : progress < 66
                      ? 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)'
                      : 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                  }}
                />
              </div>
            </div>

            <Card className={`shadow-2xl rounded-2xl border border-gray-100 transition-all duration-300 ${transitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
                {/* Category badge */}
                {currentQ.category && (
                  <div className="mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm">
                      {currentQ.category}
                    </span>
                  </div>
                )}
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {currentQ.question}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  💡 Choose the option that best fits your situation
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
                      className={`group relative flex items-center space-x-3 border-2 rounded-xl p-3 transition-all duration-200 cursor-pointer transform ${
                        selectedAnswer === option.id
                          ? 'border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg scale-[1.02] ring-2 ring-emerald-200'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 hover:shadow-md hover:scale-[1.01]'
                      }`}
                      onClick={() => handleAnswerChange(option.id)}
                    >
                      {/* Checkmark for selected option */}
                      {selectedAnswer === option.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Keyboard Shortcut Badge */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center font-mono text-xs font-bold transition-all shadow-sm ${
                        selectedAnswer === option.id
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-500 text-white scale-110'
                          : 'bg-white border-gray-300 text-gray-700 group-hover:bg-gradient-to-br group-hover:from-emerald-300 group-hover:to-teal-400 group-hover:border-emerald-400 group-hover:text-white group-hover:scale-105'
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
                    className="group transition-all hover:scale-105 hover:shadow-md bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
                  >
                    {currentQuestion === shuffledQuestions.length - 1 ? 'Continue' : 'Next'}
                    {currentQuestion !== shuffledQuestions.length - 1 && (
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
