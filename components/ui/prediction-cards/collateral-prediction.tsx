import { MoveRight } from "lucide-react";
import { Paper } from "../paper"
import { PredictionBar } from "../prediction-bar";

interface CollateralPredictionProps {
    netWorth: number;
    amountInUsd: number;
}

const CollateralPrediction = ({ netWorth, amountInUsd }: CollateralPredictionProps) => {

    
    return (
        <Paper elevation="sm" className="p-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold mb-2">Tu colateral</h4>
                <div className="flex items-center gap-2">
                    <div className="text-sm">
                        ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>
                    {amountInUsd != 0 ? 
                        <>
                            <MoveRight />
                            <div className={"text-sm " + (netWorth + amountInUsd >= netWorth ? "text-green-500" : "text-red-500")}>
                                ${(netWorth + amountInUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                            </div>
                        </> : null
                    }
                </div>
            </div>
            {netWorth && (
                <PredictionBar 
                    oldValue={netWorth} 
                    newValue={netWorth + amountInUsd} 
                    max={netWorth + amountInUsd}
                    showLabel={false}
                    color="bg-[#F6A901]"
                />
            )}
        </Paper>
    )
}

export default CollateralPrediction