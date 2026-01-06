import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomInput } from "@/components/ui/input"
import { Paper } from "@/components/ui/paper"
import { useWizardContext } from "@/components/ui/wizard"

const SupplyForm = () => {
    const { data } = useWizardContext()

    return(
        <Card className="w-[1000px]">
            <CardHeader>
                <CardTitle>Depositar</CardTitle>
            </CardHeader>
            <CardContent className="flex">
                <div className="space-y-4 w-full">
                    <p className="max-w-[400px] text-gray-600">Deposita más activos como garantía para fortalecer tu posición y reducir el riesgo de liquidación.</p>
                    <div className="mt-4">
                        <label className="text-sm text-gray-600">Depositaras en:</label>
                        <div className="px-4 py-2 border rounded-md flex items-center gap-2 w-[fit-content]">
                            <img className="w-6 h-6 rounded-full" src={data.asset.underlyingToken.imageUrl} alt="" />
                            {data.asset.underlyingToken.name}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm">Selecciona la cantidad</label>

                            <div className="text-sm">
                                Wallet balance: {data.asset.userState.balance.amount.value} {data.asset.underlyingToken.symbol}
                            </div>
                        </div>
                        <CustomInput
                            type="number"
                            variant="underlined"
                            placeholder="0.00"
                            className="mt-2"
                            inputSize="lg"
                            value={data.amount}
                            onChange={(e) => console.log(e.target.value)}
                        />
                        <Button variant="default" size="lg" className="ml-auto">Depositar</Button>
                    </div>
                </div>
                <div className="w-full w-[700px]">
                    <div>
                        Estos cambios se realizaran:
                    </div>
                    <div>
                        <Paper elevation="sm" className="p-4">
                            Hola
                        </Paper>
                        <Paper elevation="sm" className="p-4">
                            Hola
                        </Paper>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md grid grid-cols-[1fr_2fr]">
                        <div className="text-sm w-full">
                            Interes por año (APY)
                        </div>
                        <div className="text-sm w-full text-right">
                            {data.asset.supplyInfo.apy.formatted}%
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SupplyForm