import { AmountInput } from "@/components/ui/amount-input.bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Paper } from "@/components/ui/paper"
import { PredictionBar } from "@/components/ui/prediction-bar"
import { useWizardContext } from "@/components/ui/wizard"
import { ArrowLeft, Loader2, MoveRight } from "lucide-react"
import { useState, useEffect } from "react"
import { BrowserProvider, ethers } from "ethers"
import { useAccount, useWalletClient } from "wagmi"
import { supply } from "@/services/aave-pool-contract";
import { useAave } from "@/contexts/aave-context"

const SupplyForm = () => {
    const { goToPreviousStep, data, goToNextStep } = useWizardContext();
    const { address } = useAccount();
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { data: walletClient } = useWalletClient()
    const provider = walletClient ? new BrowserProvider(walletClient.transport) : null
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const { userState } = useAave()

    useEffect(() => {
        const getSigner = async () => {
            if (provider) {
                try {
                    const signerInstance = await provider.getSigner();
                    setSigner(signerInstance);
                } catch (error) {
                    console.error("Error getting signer:", error);
                    setSigner(null);
                }
            }
        };

        getSigner();
    }, [provider]);

    const handleSupply = async () => {
        if (!address || !signer) {
            return;
        }
        
        console.log("signer", signer)
        
        if (!amount || Number(amount) <= 0) {
            return;
        }

        console.log("amount", ethers.parseUnits(amount.toString(), 18).toString(), "user", address, "network", "base")

        try {
            setIsLoading(true);
            await supply({
                signer: signer,
                asset: data.asset.underlyingToken.address,
                amount: amount.toString(),
                user: address,
                network: "base"
            });
            
            goToNextStep();
        } catch (error) {
            console.error("Error en el depósito:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <Card className="w-[1000px]">
            <CardHeader className="flex items-center">
                <Button variant="ghost" onClick={goToPreviousStep}><ArrowLeft className="text-black" /></Button>
                <CardTitle>Depositar</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
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
                        <AmountInput
                            className="max-w-[550px]"
                            value={amount}
                            maxValue={data.asset.userState.balance.amount.value}
                            onChange={(value) => setAmount(value)}
                        />
                        <Button 
                            variant="default" 
                            size="lg" 
                            className="ml-auto mt-2"
                            disabled={!amount || Number(amount) <= 0 || isLoading}
                            onClick={handleSupply}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                "Depositar"
                            )}
                        </Button>
                    </div>
                </div>
                <div className="w-full w-[700px] space-y-4">
                    <div>
                        Estos cambios se realizaran:
                    </div>
                    <Paper elevation="sm" className="p-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold mb-2">Tu colateral</h4>
                            <div className="flex items-center gap-2">
                                <div className="text-sm">
                                    ${
                                    userState && parseFloat(userState.netWorth).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                </div>
                                <MoveRight />
                                <div className="text-sm">
                                    {data.asset.userState.balance.amount.value} {data.asset.underlyingToken.symbol}
                                </div>
                            </div>
                        </div>
                        {userState && (
                            <PredictionBar 
                                oldValue={10} 
                                newValue={20} 
                                max={100}
                                showLabel={false}
                                color="bg-[#F6A901]"
                            />
                        )}
                    </Paper>
                    <Paper elevation="sm" className="p-4">
                        
                    </Paper>
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