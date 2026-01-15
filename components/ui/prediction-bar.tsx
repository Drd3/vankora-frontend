"use client"

import { cn } from "@/lib/utils"

interface PredictionBarProps {
  oldValue: number // Valor anterior (0-100)
  newValue: number // Valor nuevo (0-100)
  max?: number
  color?: string // Color base para el valor anterior
  newColor?: string // Color para el incremento/disminución
  backgroundColor?: string // Color de fondo
  showLabel?: boolean
  height?: string
  className?: string
}

export function PredictionBar({
  oldValue,
  newValue,
  max = 100,
  color = "bg-orange-500",
  newColor = "bg-blue-500",
  backgroundColor = "bg-gray-200",
  showLabel = true,
  className,
}: PredictionBarProps) {
  // Asegurar que los valores estén dentro del rango [0, max]
  const safeOldValue = Math.min(Math.max(oldValue, 0), max)
  const safeNewValue = Math.min(Math.max(newValue, 0), max)

  // Calcular porcentajes
  const oldPercentage = (safeOldValue / max) * 100
  const newPercentage = (safeNewValue / max) * 100
  const difference = newValue - oldValue
  const differencePercentage = Math.abs(difference) / max * 100

  // Determinar si hay incremento o decremento
  const hasIncreased = difference > 0
  const hasDecreased = difference < 0
  const isEqual = difference === 0

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("relative w-full rounded-full overflow-hidden h-4", backgroundColor)}>
        {/* Barra del valor anterior */}
        <div
          className={cn("absolute top-0 left-0 h-full transition-all duration-500 ease-in-out", color)}
          style={{ width: `${oldPercentage}%` }}
        />

        {/* Barra de cambio (incremento o decremento) */}
        {!isEqual && (
          <div
            className={cn(
              "absolute top-0 h-full transition-all duration-500 ease-in-out",
              hasIncreased ? "bg-green-300" : "bg-red-300"
            )}
            style={{
              left: hasIncreased ? `${oldPercentage}%` : `${newPercentage}%`,
              width: `${differencePercentage}%`,
            }}
          />
        )}
      </div>

      {/* Etiquetas opcionales */}
      {showLabel && (
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">Antes:</span>
            <span>{oldValue.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Ahora:</span>
            <span className={cn(
              "font-medium",
              hasIncreased ? "text-green-500" : hasDecreased ? "text-red-500" : ""
            )}>
              {newValue.toFixed(2)}
              {!isEqual && (
                <span className={cn("ml-1 text-xs", hasIncreased ? "text-green-500" : "text-red-500")}>
                  ({hasIncreased ? '+' : ''}{difference.toFixed(2)})
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
