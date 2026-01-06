import { AlertCircle } from "lucide-react"

interface RiskProgressBarProps {
  value: number
  minValue?: number
  maxValue?: number
  riskThreshold?: number
  warningThreshold?: number
}

export function RiskProgressBar({
  value,
  minValue = 0,
  maxValue = 5,
  riskThreshold = 1.5,
  warningThreshold = 4.5,
}: RiskProgressBarProps) {
  // Calculate percentage for marker position
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100
  const riskPercentage = ((riskThreshold - minValue) / (maxValue - minValue)) * 100
  const warningPercentage = ((warningThreshold - minValue) / (maxValue - minValue)) * 100

  return (
    <div className="w-full max-w-[500px] mx-auto mt-12">
      {/* Progress bar container */}
      <div className="relative">
        {/* Alert icons */}
        <div
          className="absolute -top-8 flex items-center justify-center z-20"
          style={{ left: `${riskPercentage}%`, transform: "translateX(-50%)" }}
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-white flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="h-8 w-2 bg-red-500">
            </div>
          </div>
        </div>

        <div
          className="absolute -top-8 flex items-center justify-center z-20"
          style={{ left: `${warningPercentage}%`, transform: "translateX(-50%)" }}
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8  bg-white flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="h-8 w-2 bg-orange-500">
            </div>
          </div>
        </div>

        <div className="relative h-8 rounded-md overflow-hidden bg-gray-200">
          {/* Full gradient background - always 100% */}
          <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-red-400 via-orange-400 via-yellow-300 via-lime-300 to-green-400" />

          {/* Gray overlay to hide progress beyond current value */}
          <div className="absolute top-0 right-0 bottom-0 bg-gray-200" style={{ width: `${100 - percentage}%` }} />

          {/* Black marker line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-black z-10"
            style={{ left: `${percentage}%`, transform: "translateX(-50%)" }}
          />
        </div>

        {/* Value display */}
        <div
          className="absolute -bottom-8 text-md font-bold"
          style={{ left: `${percentage}%`, transform: "translateX(-50%)" }}
        >
          {value.toFixed(2)}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-12 text-sm font-semibold">
        <span className="text-red-500">RIESGO</span>
        <span className="text-gray-400">SALUDABLE</span>
        <span className="text-green-500">SEGURO</span>
      </div>
    </div>
  )
}
