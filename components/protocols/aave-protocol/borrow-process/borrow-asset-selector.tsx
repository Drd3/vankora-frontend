import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMarketBorrows } from "@/subgraphs/market-borrows"
import { useEffect, useState } from "react"
import { MarketBorrow } from "@/subgraphs/market-borrows" 
import { Switch } from "@/components/ui/switch"
import { useWizardContext } from "@/components/ui/wizard"
import { Skeleton } from "@/components/ui/skeleton"
import { X } from "lucide-react"
import BorrowCard from "@/components/ui/asset-cards/borrow-card"


const marketBorrowsRequest = {
  request: {
    user: "0xC69A8ACfd379fadc048e40C0075eCf85E395813d",
    chainIds: 8453
  },
  reservesRequest2: {
    orderBy: {
      supplyApy: "DESC" as const,
    },
    reserveType: "BORROW" as const
  }
};

const BorrowAssetSelector = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [assets, setAssets] = useState<MarketBorrow[]>([])
    const { goToNextStep, setData, closeModal } = useWizardContext()


    useEffect(() => {
        const fetchAssetsData = async () => {
            try {
                setIsLoading(true);
                const result = await fetchMarketBorrows(marketBorrowsRequest, "https://api.v3.aave.com/graphql");
                console.log('Market borrows data:', result);
                setAssets(result)
            } catch (error) {
                console.error('Error fetching market borrows:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchAssetsData();
    }, [])

    const reserves = assets.flatMap((asset) => asset.reserves);

    const filteredReserves = reserves.filter((reserve) => {
        // Show all available borrow assets regardless of balance
        // since we're showing available borrow options, not user's current borrows
        return true;
    });

    const manageSelectedAsset = (reserve: any) => {
        if(reserve.borrowInfo.availableLiquidity.amount.value === "0") return
        setData({
            asset: reserve
        })
        goToNextStep()
    }

    return(
        <Card className="w-full w-[1000px]">
            <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Pedir préstamo</CardTitle>
                <Button variant="ghost" onClick={closeModal}><X className="text-black" /></Button>
            </CardHeader>
            <CardContent className="overflow-y-auto h-[70vh]">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Activos disponibles para préstamo</h3>
                    </div>
                    <p className="text-sm text-gray-600 max-w-[600px]">Selecciona uno de los activos disponibles para solicitar un préstamo, el monto que puedes pedir dependerá del colateral que tengas como respaldo.</p>
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-[178px] w-full" />
                            <Skeleton className="h-[178px] w-full" />
                            <Skeleton className="h-[178px] w-full" />
                        </>
                    ) : filteredReserves.map((reserve, index) => (
                        reserve.borrowInfo && (
                            <BorrowCard 
                                key={index} 
                                assetName={reserve.underlyingToken.name} 
                                assetImage={reserve.underlyingToken.imageUrl} 
                                assetSymbol={reserve.underlyingToken.symbol} 
                                apy={reserve.borrowInfo?.apy?.formatted || '0.00%'} 
                                available={reserve.borrowInfo?.availableLiquidity?.amount?.value || '0'} 
                                onAssetSelected={() => manageSelectedAsset(reserve)}
                            />
                        )
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default BorrowAssetSelector