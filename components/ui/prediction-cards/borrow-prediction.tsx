import { MoveRight } from "lucide-react";
import { Paper } from "../paper"
import { PredictionBar } from "../prediction-bar";

interface BorrowPredictionProps {
    totalBorrowed: number;
    newBorrowed: number;
}

const BorrowPrediction = ({ totalBorrowed, newBorrowed }: BorrowPredictionProps) => {
    
    return (
        <Paper elevation="sm" className="p-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold mb-2">Tus prestamos</h4>
                <div className="flex items-center gap-2">
                    <div className="text-sm">
                        ${totalBorrowed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>
                    {newBorrowed != 0 ? 
                        <>
                            <MoveRight />
                            <div className={"text-sm " + (totalBorrowed + newBorrowed >= totalBorrowed ? "text-green-500" : "text-red-500")}>
                                ${(totalBorrowed + newBorrowed).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                            </div>
                        </> : null
                    }
                </div>
            </div>
            {totalBorrowed && (
                <PredictionBar 
                    oldValue={totalBorrowed} 
                    newValue={totalBorrowed + newBorrowed} 
                    max={totalBorrowed + newBorrowed}
                    showLabel={false}
                    color="bg-primary"
                />
            )}
        </Paper>
    )
}

export default BorrowPrediction