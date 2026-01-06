"use client"

import { useState, type ReactNode, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface WizardContextValue {
  data: Record<string, any>
  updateData: (key: string, value: any) => void
  setData: (data: Record<string, any>) => void
  currentStepIndex: number
  goToNextStep: () => void
  goToPreviousStep: () => void
  goToStep: (index: number) => void
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined)

export function useWizardContext() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error("useWizardContext must be used within a Wizard component")
  }
  return context
}

export interface WizardStep {
  id: string
  title: string
  description?: string
  content: ReactNode
  hideBackButton?: boolean
  hideTitle?: boolean
  validate?: (data: Record<string, any>) => boolean | Promise<boolean>
}

interface WizardProps {
  steps: WizardStep[]
  onComplete?: (data: Record<string, any>) => void
  onStepChange?: (stepIndex: number, data: Record<string, any>) => void
  showProgress?: boolean
  className?: string
  initialData?: Record<string, any>
  // Si es true, no envuelve el contenido en un Card (fondo transparente)
  withoutCard?: boolean
  // Si es true, oculta el título/barra superior para todos los pasos
  hideTitle?: boolean
}

export function Wizard({
  steps,
  onComplete,
  onStepChange,
  showProgress = true,
  className,
  initialData = {},
  withoutCard = false,
  hideTitle = false,
}: WizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [data, setData] = useState<Record<string, any>>(initialData)

  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const updateData = (key: string, value: any) => {
    setData((prev) => {
      const newData = { ...prev, [key]: value }
      return newData
    })
  }

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index)
      onStepChange?.(index, data)
    }
  }

  const goToNextStep = async () => {
    // Validate current step if validation function exists
    if (currentStep.validate) {
      const isValid = await currentStep.validate(data)
      if (!isValid) {
        return
      }
    }

    if (isLastStep) {
      onComplete?.(data)
    } else {
      goToStep(currentStepIndex + 1)
    }
  }

  const goToPreviousStep = () => {
    goToStep(currentStepIndex - 1)
  }

  const contextValue: WizardContextValue = {
    data,
    updateData,
    setData,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  }

  return (
    <WizardContext.Provider value={contextValue}>
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

        {withoutCard ? (
          <div className="wizard-container">
            {!hideTitle && !currentStep.hideTitle && (
              <div className="flex items-center gap-3 mb-6">
                {!isFirstStep && !currentStep.hideBackButton && (
                  <Button variant="ghost" size="icon" onClick={goToPreviousStep}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                <div>
                  <h1 className="text-xl font-semibold">{currentStep.title}</h1>
                  {currentStep.description && (
                    <p className="text-sm text-muted-foreground mt-1">{currentStep.description}</p>
                  )}
                </div>
              </div>
            )}

            <div className="wizard-step-content">{currentStep.content}</div>
          </div>
        ) : (
          <Card className="p-6">
            {!hideTitle && !currentStep.hideTitle && (
            <div className="flex items-center gap-3 mb-6">
              {!isFirstStep && !currentStep.hideBackButton && (
                <Button variant="ghost" size="icon" onClick={goToPreviousStep}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold">{currentStep.title}</h1>
                {currentStep.description && (
                  <p className="text-sm text-muted-foreground mt-1">{currentStep.description}</p>
                )}
              </div>
            </div>
            )}

            <div className="wizard-step-content">{currentStep.content}</div>
          </Card>
        )}
      </div>
    </WizardContext.Provider>
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
