import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMarketSupplies } from "@/subgraphs/market-supplies"
import { useEffect, useState } from "react"
import { MarketSupply } from "@/subgraphs/market-supplies" 
import SupplyCard from "@/components/ui/asset-cards/supply-card"
import { Switch } from "@/components/ui/switch"
import { useWizardContext } from "@/components/ui/wizard"
import { Skeleton } from "@/components/ui/skeleton"
import { evmAddress, chainId } from "@aave/react";


const marketSuppliesRequest = {
  request: {
    user: "0xC69A8ACfd379fadc048e40C0075eCf85E395813d",
    chainIds: 8453
  },
  reservesRequest2: {
    orderBy: {
      supplyApy: "ASC" as const,
    },
    reserveType: "SUPPLY" as const
  }
};

const AssetSelector = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [assets, setAssets] = useState<MarketSupply[]>([])
    const [showbalance0, setShowBalance0] = useState(false)
    const { goToNextStep, setData } = useWizardContext()


    useEffect(() => {
        const fetchAssetsData = async () => {
            try {
                setIsLoading(true);
                const result = await fetchMarketSupplies(marketSuppliesRequest, "https://api.v3.aave.com/graphql");
                console.log('Market supplies data:', result);
                setAssets(result)
            } catch (error) {
                console.error('Error fetching market supplies:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchAssetsData();
    }, [])

    const sortedReserves = assets
        // Sort reserves by balance
        .flatMap((asset) => asset.reserves)
        .sort((a, b) => {
            const balanceA = parseFloat(a.userState.balance.amount.value);
            const balanceB = parseFloat(b.userState.balance.amount.value);
            if (Number.isNaN(balanceA) || Number.isNaN(balanceB)) {
                return 0;
            }
            return balanceB - balanceA;
        });

    const filteredReserves = sortedReserves.filter((reserve) => {
        // Get balance
        const balance = parseFloat(reserve.userState.balance.amount.value);
        if (Number.isNaN(balance)) return false;

        // Switch apagado (por defecto) → ocultar balances 0
        if (!showbalance0) {
            return balance > 0;
        }

        // Switch encendido → mostrar todos
        return true;
    });

    const manageSelectedAsset = (reserve: any) => {
        setData({
            asset: reserve
        })
        goToNextStep()
    }

    
    
    return(
        <Card className="w-full w-[1000px]">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Selecciona un activo</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto h-[70vh]">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Activos disponibles (assets)</h3>
                        <div className="flex gap-2 items-center">
                            <label className={`text-sm ${showbalance0 ? 'text-primary' : 'text-muted-foreground'}`}>Mostrar assets con balance 0</label>
                            <Switch
                                checked={showbalance0}
                                onCheckedChange={setShowBalance0}
                            />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 max-w-[600px]">Deposita tu dinero en un activo para usarlo como respaldo o agrega más fondos a uno que ya tengas; mientras tu dinero está depositado, puede generar ganancias y te permite acceder a las funciones básicas de la plataforma DeFi.</p>
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-[178px] w-full" />
                            <Skeleton className="h-[178px] w-full" />
                            <Skeleton className="h-[178px] w-full" />
                        </>
                    ) : filteredReserves.map((reserve, index) => (
                        <SupplyCard 
                            key={index} 
                            assetName={reserve.underlyingToken.name} 
                            assetImage={reserve.underlyingToken.imageUrl} 
                            assetSymbol={reserve.underlyingToken.symbol} 
                            apy={reserve.supplyInfo.apy.formatted} 
                            balance={reserve.userState.balance.amount.value} 
                            onAssetSelected={() => manageSelectedAsset(reserve)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default AssetSelector