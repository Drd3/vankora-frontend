import { LoanProgressBars } from "@/components/ui/collateral-borrow-bar"
import { InfoButton } from "@/components/ui/info-button"
import { Paper } from "@/components/ui/paper"
import { UserMarketState } from "@/subgraphs/market-user-state"
import { LayoutDashboard } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const APYDesc= {
    title: "¿Qué es el Interes anual (APY)?",
    desc: "El APY (Annual Percentage Yield) es el rendimiento anual que puedes obtener por tus fondos, considerando el interés compuesto. En DeFi, indica cuánto podrías ganar al ahorrar, prestar o hacer staking durante un año. El APY es una estimación y puede variar según las condiciones del protocolo y del mercado."
}

interface Props {
    userState: UserMarketState | null;
}

const AaveOverview = ({ userState }: Props) => {
    const isLoading = !userState;

    return (
        <Paper elevation="md">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">
                        Overview
                    </h3>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance */}
                    <div className="space-y-1">
                        <div className="text-sm text-gray-600">
                            Balance
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-7 w-32" />
                        ) : (
                            <div className="text-2xl font-bold">
                                ${parseFloat(userState.netWorth).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        )}
                    </div>

                    {/* APY */}
                    <div className="space-y-1 md:border-l md:border-gray-200 md:pl-6">
                        <div className="text-sm text-gray-600 flex items-center">
                            APY
                            <InfoButton
                                classname="ml-2"
                                size="sm"
                                title={APYDesc.title}
                                description={APYDesc.desc}
                            />
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-7 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">
                                {userState.netAPY?.formatted || '0.00'}%
                            </div>
                        )}
                    </div>

                    {/* Projected Earnings */}
                    <div className="space-y-1 md:text-right">
                        <div className="text-sm text-gray-600">
                            Ganancia proyectada
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-7 w-32 ml-auto" />
                        ) : (
                            <div className="text-2xl font-bold">
                                ${(parseFloat(userState.netWorth) * (parseFloat(userState.netAPY?.value?.toString() || '0') / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Collateral and borrows bar */}
                <div className="space-y-2">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-full rounded-full" />
                            <div className="flex justify-between text-sm text-gray-500">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <LoanProgressBars
                                collateralAmount={parseFloat(userState.totalCollateralBase) || 0}
                                collateralCurrency="USD"
                                loanCurrency="USD"
                                loanAmount={parseFloat(userState.totalDebtBase) || 0}
                            />
                        </>
                    )}
                </div>

                {/* Health Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="space-y-1">
                        <div className="text-sm text-gray-600">Limite de prestamo</div>
                        {isLoading ? (
                            <Skeleton className="h-6 w-20" />
                        ) : (
                            <div className="font-medium">
                                {userState.ltv?.formatted || '0.00'}%
                            </div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="text-sm text-gray-600">Uso de préstamo</div>
                        {isLoading ? (
                            <Skeleton className="h-6 w-20" />
                        ) : (
                            <div className="font-medium">
                                {userState.totalDebtBase && userState.totalCollateralBase
                                    ? `${((parseFloat(userState.totalDebtBase) / parseFloat(userState.totalCollateralBase)) * 100).toFixed(2)}%`
                                    : '0.00%'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Paper>
    )
}

export default AaveOverview