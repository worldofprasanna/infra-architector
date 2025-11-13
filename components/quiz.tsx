"use client"

import { useState, useEffect } from 'react'
import { questions, type Category } from '@/data/questions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ChevronRight, ChevronLeft, Keyboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from "next/image"

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const router = useRouter()

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentQ = questions[currentQuestion]
  const selectedAnswer = answers[currentQ?.id]

  // Hide shortcuts help after user interacts
  useEffect(() => {
    if (selectedAnswer) {
      setShowShortcutsHelp(false)
    }
  }, [selectedAnswer])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow number keys 1-9 to pick an answer
      const index = parseInt(e.key)
      if (!isNaN(index) && index >= 1 && index <= currentQ.options.length) {
        const option = currentQ.options[index - 1]
        handleAnswerChange(option.id)
      }

      // Enter → Next
      if (e.key === "Enter" && selectedAnswer) {
        handleNext()
      }

      // Backspace or ArrowLeft → Previous
      if (e.key === "Backspace" || e.key === "ArrowLeft") {
        handlePrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentQuestion, selectedAnswer, currentQ])

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setTransitioning(true)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setTransitioning(false)
      }, 150)
    } else {
      const scores: Record<Category, number> = {
        infrastructure: 0,
        tech_stack: 0,
        security: 0,
        scalability: 0
      }

      Object.entries(answers).forEach(([questionId, optionId]) => {
        const question = questions.find(q => q.id === parseInt(questionId))
        const option = question?.options.find(opt => opt.id === optionId)
        if (option && question) {
          scores[question.category] += option.points
        }
      })

      sessionStorage.setItem('evaluationScores', JSON.stringify(scores))
      sessionStorage.setItem('evaluationAnswers', JSON.stringify(answers))
      router.push('/email')
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 lg:px-12 flex flex-col justify-between">
      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left info section */}
        <div className="text-center lg:text-left space-y-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Evaluate Your Infrastructure in Just 2 Minutes 🚀
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
            Spend a few minutes to understand your current infrastructure and
            receive a personalized improvement report.
          </p>
          <Button
            size="lg"
            variant="default"
            className='p-7 text-lg font-bold'
          >
            Reach Our Team 
          </Button>
        </div>  

        {/* Right - Quiz Card */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400 via-violet-400 to-pink-400 blur-xl opacity-50" />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-transparent bg-clip-padding p-6">
            {/* Keyboard Shortcuts Help */}
            {showShortcutsHelp && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Keyboard className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Keyboard shortcuts enabled:</p>
                  <p>Press <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-blue-900 font-mono text-xs">1-{currentQ.options.length}</kbd> to select • <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-blue-900 font-mono text-xs">Enter</kbd> to continue • <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-blue-900 font-mono text-xs">←</kbd> to go back</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className={`shadow-2xl rounded-2xl border border-gray-100 transition-opacity duration-150 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  {currentQ.question}
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Select the option that best describes your current setup
                </CardDescription>
              </CardHeader>

              <CardContent>
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={handleAnswerChange}
                  className="space-y-4"
                >
                  {currentQ.options.map((option, i) => (
                    <div
                      key={option.id}
                      className={`group flex items-center space-x-3 border-2 rounded-xl p-4 transition-all cursor-pointer hover:bg-gray-50 hover:border-blue-300 ${
                        selectedAnswer === option.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleAnswerChange(option.id)}
                    >
                      {/* Keyboard Shortcut Badge */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center font-mono text-sm font-bold transition-all ${
                        selectedAnswer === option.id
                          ? 'bg-blue-500 border-blue-600 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-600 group-hover:bg-blue-100 group-hover:border-blue-400 group-hover:text-blue-700'
                      }`}>
                        {i + 1}
                      </div>
                      <RadioGroupItem value={option.id} id={option.id} className="flex-shrink-0" />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base font-medium">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="group"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                    <span className="ml-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">←</span>
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!selectedAnswer}
                    className="group"
                  >
                    {currentQuestion === questions.length - 1 ? 'View Results' : 'Next'}
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

      {/* Logos */}
      <div className="mt-20 flex flex-col items-center space-y-6">
        <p className="text-sm uppercase text-gray-500 tracking-wide">
          Our Esteemed Clients
        </p>

        <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
          <Image src="/dacio-logo.png" alt="CNN" width={100} height={40} className="h-8 w-auto" />
          <Image src="/finin.png" alt="TechCrunch" width={120} height={40} className="h-8 w-auto" />
          <Image src="/nd.png" alt="Vice" width={100} height={40} className="h-8 w-auto" />
          <Image src="/taxnodes.png" alt="Fashionista" width={140} height={40} className="h-8 w-auto" />
          <Image src="/merchantspring_logo.jpeg" alt="a16z" width={80} height={40} className="h-8 w-auto" />
        </div>
      </div>
    </div>
  )
}
