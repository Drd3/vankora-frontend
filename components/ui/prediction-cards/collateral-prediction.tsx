import { MoveRight } from "lucide-react";
import { Paper } from "../paper"
import { PredictionBar } from "../prediction-bar";
import { useMemo } from "react";
import { formatTokenBalance } from "@/lib/utils";

interface CollateralPredictionProps {
    netWorth: number;
    amountInUsd: number;
    operation?: 'add' | 'subtract';
}

const CollateralPrediction = ({ 
    netWorth, 
    amountInUsd, 
    operation = 'add' 
}: CollateralPredictionProps) => {
    const newAmount = useMemo(() => {
        return operation === 'add' 
            ? netWorth + amountInUsd 
            : netWorth - amountInUsd;
    }, [netWorth, amountInUsd, operation]);
    const isIncrease = newAmount >= netWorth;
    const operationSymbol = operation === 'add' ? '+' : '-';

    const maxValue = Math.max(netWorth, newAmount)

    return (
        <Paper elevation="sm" className="p-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold mb-2">Tu colateral</h4>
                <div className="flex items-center gap-2">
                    <div className="text-sm">
                        ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>
                    {amountInUsd !== 0 && (
                        <>
                            <MoveRight />
                            <div className={`text-sm ${isIncrease ? "text-green-500" : "text-red-500"}`}>
                                ${newAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">
                    {operation === 'add' ? 'Añadiendo' : 'Retirando'}: ${ formatTokenBalance(Math.abs(amountInUsd))} USD
                </div>
                <PredictionBar
                    showLabel={false}
                    oldValue={netWorth} 
                    newValue={newAmount} 
                    color="bg-[#F6A901]"
                    max={maxValue}
                />
            </div>
        </Paper>
    );
};

export default CollateralPrediction;