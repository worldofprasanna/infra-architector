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
              Almost There!
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              Enter your business email to view your infrastructure architecture recommendation and receive a personalized report.
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
                      Your email will be used to save your architecture recommendation. We respect your privacy and won't spam you.
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
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-green-300 via-emerald-400 to-teal-500 blur-xl animate-gradient opacity-60" />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-transparent bg-clip-padding p-6 max-h-[80vh] overflow-y-auto">
              {/* Template Name */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h3>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Description</h4>
                <p className="text-base text-gray-700 leading-relaxed">{selectedTemplate.description}</p>
              </div>

              {/* Estimated Cost Card */}
              <Card className="shadow-lg mb-6 border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Estimated Monthly Cost</p>
                      <p className="text-2xl font-bold text-green-700">{selectedTemplate.estimatedMonthlyCost}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best For Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Best For</h4>
                <ul className="space-y-2">
                  {selectedTemplate.bestFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AWS Services/Components */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">AWS Services Included</h4>
                <div className="space-y-3">
                  {selectedTemplate.components.map((component, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Server className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-blue-900 text-sm">{component.service}</h5>
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
                variant="outline"
                onClick={downloadPDF}
                disabled={isDownloadingPDF}
                className="w-full flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 bg-white hover:bg-green-600 hover:text-white transition-all duration-300"
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
                <span>Question {currentQuestion + 1} of {shuffledQuestions.length}</span>
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
