import { InfoButton } from "@/components/ui/info-button"
import { Paper } from "@/components/ui/paper"
import { RiskProgressBar } from "@/components/ui/risk-bar"
import { HeartPulse } from "lucide-react"

const healthFactorDesc = {
    title: "¿Qué es el factor de salud?",
    desc: `El Health Factor (HF) es un indicador de seguridad que te muestra qué tan saludable está tu préstamo dentro de un protocolo DeFi.

Piensa en él como un semáforo:

HF > 1 → 🟢 Seguro
Tu colateral es suficiente para respaldar tu deuda.

HF = 1 → 🟡 Punto de riesgo máximo
Si baja un poquito más, puedes ser liquidado.

HF < 1 → 🔴 Liquidad@
El protocolo liquida parte de tu colateral para pagar tu deuda.
Mientras más alto sea tu Health Factor, más lejos estás de la liquidación.
`
}

interface props {
    healthFactor: number;
    collateralValue: number;
    debtValue: number;
    ltv: number;
    liquidationThreshold: number;
    liquidationPrice: number;
}

const HealthFactor = ({healthFactor, collateralValue, debtValue, ltv, liquidationThreshold, liquidationPrice}: props) => {
    return (
        <Paper elevation="md" className="max-w-[600px] p-0 flex flex-col justify-between">
            <div className="p-8 h-full">
                <div className="flex items-center gap-2">
                    <HeartPulse/>
                    <h3 className="font-semibold">Posición de salud </h3>
                    <InfoButton title={healthFactorDesc.title} description={healthFactorDesc.desc}/>
                </div>
                <div className="my-auto">
                <RiskProgressBar value={3} />
            </div>
            </div>
            <div className="bg-gray-100 text-gray-600 px-8 py-8 text-sm space-y-2 rounded-b-[20px]">
                <div className="flex justify-between">
                    <div>
                        Riesgo de redencion por debajo de: 
                    </div>
                    <div>
                        1.5
                    </div>
                </div>
                <div className="flex justify-between">
                    <div>
                        Riesgo de liquidacion por debajo de: 
                    </div>
                    <div>
                        1.5
                    </div>
                </div>
                <div className="flex justify-between">
                    <div>
                        Precio de liquidacion 
                    </div>
                    <div>
                        1.5
                    </div>
                </div>
            </div>

        </Paper>
    )
}

export default HealthFactor