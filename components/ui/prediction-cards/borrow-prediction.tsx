import { useMemo } from "react";
import { MoveRight } from "lucide-react";
import { Paper } from "../paper"
import { PredictionBar } from "../prediction-bar";

interface BorrowPredictionProps {
    totalBorrowed: number;
    newBorrowed: number;
    totalCollateral: number;
    operation?: "add" | "subtract";
}

const BorrowPrediction = ({ totalBorrowed, newBorrowed, totalCollateral, operation = "add" }: BorrowPredictionProps) => {
    const delta = Math.abs(newBorrowed);
    const newAmount = useMemo(() => {
        return operation === "add"
            ? totalBorrowed + delta
            : totalBorrowed - delta;
    }, [totalBorrowed, delta, operation]);

    const isIncrease = newAmount >= totalBorrowed;

    return (
        <Paper elevation="sm" className="p-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold mb-2">Tus prestamos</h4>
                <div className="flex items-center gap-2">
                    <div className="text-sm">
                        ${totalBorrowed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>
                    {delta !== 0 ? 
                        <>
                            <MoveRight />
                            <div className={"text-sm " + (isIncrease ? "text-green-500" : "text-red-500")}>
                                ${newAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                            </div>
                        </> : null
                    }
                </div>
            </div>
            {totalCollateral > 0 && (
                <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">
                        {operation === "add" ? "Aumentando deuda" : "Pagando deuda"}: ${delta.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>
                    <PredictionBar 
                        oldValue={totalBorrowed} 
                        newValue={Math.min(newAmount, totalCollateral)} 
                        max={totalCollateral}
                        showLabel={false}
                        color="bg-primary"
                    />
                </div>
            )}
        </Paper>
    )
}

export default BorrowPrediction