"use client"

import type React from "react"

import { useState, useEffect, useCallback, type ReactNode, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface WizardContextValue {
  data: Record<string, any>
  updateData: (key: string, value: any) => void
  setData: (data: Record<string, any>) => void
  currentStepIndex: number
  goToNextStep: () => void
  goToPreviousStep: () => void
  goToStep: (index: number) => void
  closeModal: () => void
  isModal: boolean
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
  withoutCard?: boolean
  hideTitle?: boolean
  asModal?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modalClassName?: string
  overlayClassName?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  unstyledModal?: boolean
  resetOnClose?: boolean
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
  asModal = false,
  open,
  onOpenChange,
  modalClassName,
  overlayClassName,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  unstyledModal = false,
  resetOnClose = true,
}: WizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [data, setData] = useState<Record<string, any>>(initialData)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (asModal && !open && resetOnClose) {
      const timer = setTimeout(() => {
        setCurrentStepIndex(0)
        setData(initialData)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [asModal, open, resetOnClose, initialData])

  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape && open) {
        onOpenChange?.(false)
      }
    },
    [closeOnEscape, open, onOpenChange],
  )

  useEffect(() => {
    if (asModal && open) {
      document.addEventListener("keydown", handleEscapeKey)
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("keydown", handleEscapeKey)
        document.body.style.overflow = ""
      }
    }
  }, [asModal, open, handleEscapeKey])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onOpenChange?.(false)
    }
  }

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

  const closeModal = useCallback(() => {
    if (asModal) {
      onOpenChange?.(false)
    }
  }, [asModal, onOpenChange])

  const contextValue: WizardContextValue = {
    data,
    updateData,
    setData,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    closeModal,
    isModal: asModal,
  }

  const wizardContent = (
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
  )

  if (asModal) {
    if (!shouldRender) return null

    if (unstyledModal) {
      return (
        <WizardContext.Provider value={contextValue}>
          <div
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200",
              isAnimating ? "bg-black/50" : "bg-black/0",
              overlayClassName,
            )}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wizard-modal-title"
          >
            <div
              className={cn(
                "transition-all duration-200",
                isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95",
                modalClassName,
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="wizard-modal-title" className="sr-only">
                {currentStep.title}
              </h2>
              {wizardContent}
            </div>
          </div>
        </WizardContext.Provider>
      )
    }

    return (
      <WizardContext.Provider value={contextValue}>
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200",
            isAnimating ? "bg-black/50 backdrop-blur-sm" : "bg-black/0",
            overlayClassName,
          )}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wizard-modal-title"
        >
          <div
            className={cn(
              "relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border bg-card text-card-foreground shadow-xl transition-all duration-200",
              isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4",
              modalClassName,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton && (
              <button
                onClick={() => onOpenChange?.(false)}
                className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="p-6">
              <h2 id="wizard-modal-title" className="sr-only">
                {currentStep.title}
              </h2>
              {wizardContent}
            </div>
          </div>
        </div>
      </WizardContext.Provider>
    )
  }

  return <WizardContext.Provider value={contextValue}>{wizardContent}</WizardContext.Provider>
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
