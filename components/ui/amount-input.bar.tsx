"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"

interface MaxValueInputProps {
  value?: number
  onChange?: (value: number) => void
  maxValue?: number
  placeholder?: string
  className?: string
  error?: boolean
  errorMessage?: string
}

export function AmountInput({
  value = 0,
  onChange,
  maxValue = 100,
  placeholder = "0.0",
  className = "",
  error = false,
  errorMessage = "",
}: MaxValueInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  const [isOverMax, setIsOverMax] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    const numericValue = Number.parseFloat(newValue)
    if (!isNaN(numericValue)) {
      const exceedsMax = maxValue !== undefined && numericValue > maxValue
      setIsOverMax(exceedsMax)
      
      if (onChange) {
        onChange(numericValue)
      }
    } else {
      setIsOverMax(false)
    }
  }

  const handleUseMaxValue = () => {
    setInputValue(maxValue.toString())
    if (onChange) {
      onChange(maxValue)
    }
  }

  const handleIncrement = () => {
    const currentValue = Number.parseFloat(inputValue) || 0
    const newValue = Math.min(currentValue + 0.1, maxValue)
    setInputValue(newValue.toFixed(1))
    if (onChange) {
      onChange(newValue)
    }
  }

  const handleDecrement = () => {
    const currentValue = Number.parseFloat(inputValue) || 0
    const newValue = Math.max(currentValue - 0.1, 0)
    setInputValue(newValue.toFixed(1))
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative flex items-center border-b-2 pb-2 transition-colors ${
          error || isOverMax ? "border-red-500 focus-within:border-red-600" : "border-border focus-within:border-primary"
        }`}
      >
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`flex-1 bg-transparent text-6xl font-bold outline-none pr-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            error || isOverMax ? "text-red-500" : "text-foreground"
          }`}
          step="0.1"
        />
        <div className="absolute right-0 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            className={`h-10 w-10 rounded-full bg-transparent ${
              error ? "border-red-500 text-red-500 hover:bg-red-50" : ""
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            className={`h-10 w-10 rounded-full bg-transparent ${
              error ? "border-red-500 text-red-500 hover:bg-red-50" : ""
            }`}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleUseMaxValue}
            className={`whitespace-nowrap rounded-full px-6 bg-background ${
              error ? "border-red-500 text-red-500 hover:bg-red-50" : ""
            }`}
          >
            Usar valor máximo
          </Button>
        </div>
      </div>
      {(error || isOverMax) && (
        <p className="mt-2 text-sm text-red-500">
          {isOverMax ? `El valor no puede ser mayor a ${maxValue}` : errorMessage}
        </p>
      )}
    </div>
  )
}
