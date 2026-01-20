import { Card, CardContent, CardHeader, CardTitle } from "../card"
import { Button } from "../button"

interface BorrowCardProps {
    assetName: string
    assetImage: string
    assetSymbol: string
    apy: string
    available: string
    onAssetSelected: () => void
}

const BorrowCard = ({ assetName, assetImage, assetSymbol, apy, available, onAssetSelected }: BorrowCardProps) => {
    
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
                    <div className="text-sm">Disponible: </div>
                    <div className="text-sm font-semibold">${Number(available).toFixed(2)}</div>
                </div>
                <Button 
                    variant="default" 
                    className="w-full" 
                    disabled={available === "0"}
                    onClick={() => onAssetSelected()}
                >
                    Seleccionar
                </Button>
            </CardContent>
        </Card>
    )
}

export default BorrowCard