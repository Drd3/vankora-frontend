import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMarketSupplies } from "@/subgraphs/market-supplies"
import { useEffect, useState } from "react"
import { MarketSupply } from "@/subgraphs/market-supplies" 

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
    const [assets, setAssets] = useState<MarketSupply[]>([])
    useEffect(() => {
        const fetchAssetsData = async () => {
            try {
                const result = await fetchMarketSupplies(marketSuppliesRequest, "https://api.v3.aave.com/graphql");
                console.log('Market supplies data:', result);
                setAssets(result)
            } catch (error) {
                console.error('Error fetching market supplies:', error);
            }
        };
        
        fetchAssetsData();
    }, [])
    return(
        <Card className="w-full w-[1000px]">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Selecciona un activo</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Activos disponibles (assets)</h3>
                        <div>Mostrar assets con balance 0</div>
                    </div>
                    <p className="text-sm text-gray-600 max-w-[600px]">Deposita tu dinero en un activo para usarlo como respaldo o agrega más fondos a uno que ya tengas; mientras tu dinero está depositado, puede generar ganancias y te permite acceder a las funciones básicas de la plataforma DeFi.</p>
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
                    <Card className="w-full max-w-[500px] py-4 gap-4">
                        <CardHeader className="flex items-center justify-between px-4 pb-4">
                            <div className="flex items-center gap-2">
                                <img className="w-8 h-8 " src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUVHhAAAAA" alt="" />
                                <div className="">
                                    <div className="text-xs text-muted-foreground">USDC</div>
                                    <CardTitle className="text-sm">USDC Coin</CardTitle>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">APY</div>
                                <div className="text-sm font-semibold">5.0%</div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="text-sm">Tu balance USDC: </div>
                                <div className="text-sm font-semibold">$100</div>
                            </div>
                            <Button variant="default" className="w-full">Depositar</Button>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}

export default AssetSelector