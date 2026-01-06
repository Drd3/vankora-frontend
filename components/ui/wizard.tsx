"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "./card"

export interface WizardStep {
  id: string
  title: string
  description?: string
  content: ReactNode
  hideBackButton?: boolean
  hideTitle?: boolean
}

interface WizardProps {
  steps: WizardStep[]
  onComplete?: () => void
  onStepChange?: (stepIndex: number) => void
  showProgress?: boolean
  className?: string
}

export function Wizard({ steps, onComplete, onStepChange, showProgress = true, className }: WizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index)
      onStepChange?.(index)
    }
  }

  const goToNextStep = () => {
    if (isLastStep) {
      onComplete?.()
    } else {
      goToStep(currentStepIndex + 1)
    }
  }

  const goToPreviousStep = () => {
    goToStep(currentStepIndex - 1)
  }

  return (
    <div className={cn("w-full", className)}>
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      index < currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : index === currentStepIndex
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground hidden sm:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-colors",
                      index < currentStepIndex ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="wizard-step-content">{currentStep.content}</div>
    </div>
  )
}

export function useWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<Record<string, any>>({})

  const updateData = (key: string, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const nextStep = () => setCurrentStep((prev) => prev + 1)
  const prevStep = () => setCurrentStep((prev) => Math.max(0, prev - 1))
  const goToStep = (step: number) => setCurrentStep(step)
  const reset = () => {
    setCurrentStep(0)
    setData({})
  }

  return {
    currentStep,
    data,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    reset,
  }
}
