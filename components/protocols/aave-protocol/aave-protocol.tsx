import { Paper } from "@/components/ui/paper";
import { fetchUserSupplies } from "@/subgraphs/user-supplies";
import { UserSuppliesRequest } from "@/types/aave";
import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import SupplyList from "./supply-list";
import BorrowList from "./borrow-list";
import AaveOverview from "./aave-overview";
import HealthFactor from "./health-factor";
import { fetchUserMarketState, UserMarketState, UserMarketStateRequest } from "@/subgraphs/market-user-state";
import { useAave } from "@/contexts/aave-context";

const AaveProtocol = () => {
    const { userState, isLoading, error } = useAave();

    return (
    <div className="max-w-[1000px] w-full mx-auto space-y-6 ">
        <div className="mb-8">
            
            <h1 className="text-4xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <img src="aave-logo.png" alt="" className="h-10"/>
                Protocolo Aave
            </h1>
            <p className="max-w-[600px] text-gray-600">Aave permite prestar y pedir prestado criptomonedas de forma segura y sin intermediarios, con tasas flexibles y tecnología confiable. </p>
        </div>
        <div className="grid grid-cols-[3fr_2fr] gap-6">
            <AaveOverview userState={userState}/>
            <HealthFactor/>
        </div>
        <div className="flex w-full gap-6">
            <SupplyList classname="w-full"/>
            <BorrowList classname="w-full"/>
        </div>
    </div>
    )
};

export default AaveProtocol;