import { Info } from "lucide-react"
import { InfoButton } from "./info-button"

interface LoanProgressBarsProps {
  collateralAmount: number
  collateralCurrency?: string
  loanAmount: number
  loanCurrency?: string
  liquidationThreshold?: number // Percentage where the red line appears
}

export function LoanProgressBars({
  collateralAmount,
  collateralCurrency = "USDC",
  loanAmount,
  loanCurrency = "DCOP",
  liquidationThreshold = 80,
}: LoanProgressBarsProps) {
  // Calculate loan to collateral percentage
  const loanPercentage = collateralAmount > 0 ? Math.min((loanAmount / collateralAmount) * 100, 100) : 0

    return (
        <div className="w-full space-y-2 my-6">
        {/* Collateral Section */}
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[#F6A901]">Tu colateral</h3>
            <InfoButton
                title="¿Qué es el colateral?"
                description="El colateral es el activo que depositas como garantía en un protocolo. Sirve para respaldar operaciones como préstamos y proteger el sistema. Mientras el colateral tenga suficiente valor, tu posición es segura; si su valor baja demasiado, puede ser liquidado."
            />
            </div>
            <div className="text-xl font-bold">
            ${collateralAmount.toFixed(2)} {collateralCurrency}
            </div>
        </div>

        {/* Progress Bars Container */}
        <div className="relative border-2 rounded-lg">
            {/* Orange Bar (100% - Collateral) */}
            <div className="h-6 w-full bg-[#F6A901] rounded-t-lg" />

            {/* Purple Bar (Loan Percentage) */}
            <div className="h-6 w-full bg-gray-200 rounded-b-lg  relative overflow-hidden">
            <div
                className="h-full bg-primary flex items-center justify-end mr-2 pr-2 text-white font-semibold transition-all duration-500"
                style={{ width: `${loanPercentage}%` }}
            >
                {loanPercentage > 10 && `${Math.round(loanPercentage)}%`}
            </div>

            {/* Red Marker Line (Liquidation Threshold) */}
            <div className="absolute top-0 bottom-0 w-1 bg-red-600 z-10" style={{ left: `${liquidationThreshold}%` }} />
            </div>
        </div>

        {/* Loan Section */}
        <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-purple-600">Tu préstamo</h3>
            <InfoButton
                title="¿Qué es el colateral?"
                description="El colateral es el activo que depositas como garantía en un protocolo. Sirve para respaldar operaciones como préstamos y proteger el sistema. Mientras el colateral tenga suficiente valor, tu posición es segura; si su valor baja demasiado, puede ser liquidado."
            />
            </div>
            <div className="text-xl font-bold">
            ${loanAmount.toLocaleString()} {loanCurrency}
            </div>
        </div>
        </div>
    )
    }
