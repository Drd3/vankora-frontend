import { Card, CardContent, CardHeader, CardTitle } from "../card"
import { Button } from "../button"

interface SupplyCardProps {
    assetName: string
    assetImage: string
    assetSymbol: string
    apy: string
    balance: string
    onAssetSelected: () => void
}

const SupplyCard = ({ assetName, assetImage, assetSymbol, apy, balance, onAssetSelected }: SupplyCardProps) => {
    
    return(
        <Card className="w-full max-w-[500px] py-4 gap-4">
            <CardHeader className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-2">
                    <img className="w-8 h-8 rounded-full" src={assetImage} alt="" />
                    <div className="">
                        <div className="text-xs text-muted-foreground truncate max-w-[140px] whitespace-nowrap">
                            {assetName}
                        </div>
                        <CardTitle className="text-sm">{assetSymbol}</CardTitle>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-muted-foreground">APY</div>
                    <div className="text-sm font-semibold">{apy}%</div>
                </div>
            </CardHeader>
            <CardContent className="px-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="text-sm">Tu balance {assetSymbol}: </div>
                    <div className="text-sm font-semibold">{balance}</div>
                </div>
                <Button 
                    variant="default" 
                    className="w-full" 
                    disabled={balance === "0"}
                    onClick={() => onAssetSelected()}
                >
                    Depositar
                </Button>
            </CardContent>
        </Card>
    )
}

export default SupplyCard