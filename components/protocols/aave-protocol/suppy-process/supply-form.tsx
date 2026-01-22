import { AmountInput } from "@/components/ui/amount-input.bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Paper } from "@/components/ui/paper"
import { PredictionBar } from "@/components/ui/prediction-bar"
import { useWizardContext } from "@/components/ui/wizard"
import { ArrowLeft, Loader2, MoveRight, X } from "lucide-react"
import { useState, useEffect } from "react"
import { BrowserProvider, ethers } from "ethers"
import { useAccount, useChainId, useWalletClient } from "wagmi"
import { supply, TxState } from "@/services/aave-pool-contract";
import { useAave } from "@/contexts/aave-context"
import { fetchUsdExchangeRates } from "@/subgraphs/aave-exchange-rates"
import { AAVE_V3_ADDRESSES } from "@/addresses/addresses"
import { convertCurrency } from "@/lib/utils"
import CollateralPrediction from "@/components/ui/prediction-cards/collateral-prediction"

const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Circle USDC on Base
    EURC: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42', // Circle EURC on Base
    // Add other tokens as needed
  },
  ethereum: {
    // Add Ethereum token addresses here
  },
  polygon: {
    // Add Polygon token addresses here
  }
}

const SupplyForm = () => {
    const { address } = useAccount();
    const chainId = useChainId();

    const { goToPreviousStep, data, goToNextStep, updateData, closeModal } = useWizardContext()
    const { data: walletClient } = useWalletClient()
    
    const provider = walletClient ? new BrowserProvider(walletClient.transport) : null
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

    const [amount, setAmount] = useState(0);
    const [amountInUsd, setAmountInUsd] = useState(0); 
    const [exchangeRate, setExchangeRate] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    
    const { userState } = useAave()

    const getTokenAddress = () => {
        if (!data.asset.underlyingToken.symbol) return ""
        if (data.asset.underlyingToken.symbol === "USDC" || data.asset.underlyingToken.symbol === "EURC") return TOKEN_ADDRESSES["base"][data.asset.underlyingToken.symbol]
        return data.asset.underlyingToken.address
    }

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

    useEffect(() => {
        const getExchangeRate = async () => {
            try{
                const tokenAddress = getTokenAddress();

                // Evitar llamar al subgraph si no tenemos una EVM address válida
                if (!tokenAddress || !tokenAddress.startsWith("0x")) {
                    return;
                }

                const exchangeRate = await fetchUsdExchangeRates(
                    "https://api.v3.aave.com/graphql",
                    {
                        chainId: chainId.toString(),
                        market: AAVE_V3_ADDRESSES.POOL_ADDRESSES_PROVIDER,
                        underlyingTokens: [tokenAddress],
                    }
                );
                console.log("exchangeRate", exchangeRate)
                setExchangeRate(exchangeRate[0].rate);
            } catch (error) {
                console.error("Error getting exchange rate:", error);
            }
        }
        getExchangeRate();
    }, [])

    const handleSupply = async () => {
        if (!address || !signer) return
        if (!amount || Number(amount) <= 0) return
        // 1) Cambiamos al paso de confirmación ANTES de empezar la tx
        goToNextStep()
        try {
            // Limpiar cualquier estado anterior
            updateData("txStatus", null)
            updateData("txResult", null)
            const result = await supply({
            signer,
            asset: getTokenAddress(),
            amount: amount.toString(),
            user: address,
            network: "base",
            onStateChange: (action, state, info) => {
                // 2) El onStateChange solo actualiza el data del wizard
                updateData("txStatus", { action, state, info })
            },
            })
            // 3) Cuando termina, guardamos resultado final
            updateData("txResult", {
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber,
                gasUsed: result.gasUsed,
                amount: amount.toString(),
                symbol: data.asset.underlyingToken.symbol,
                selectedAmount: {
                    value: amount,
                    currency: data.asset.underlyingToken.symbol,
                }
            })
        } catch (error) {
            console.error("Error en el depósito:", error)
            updateData("txStatus", {
            action: "Supply",
            state: "Error" as TxState,
            info: error instanceof Error ? error.message : "Unknown error",
            })
        }
        }

    const handleAmountChange = (value: number) => {
        setAmount(value);
        console.log("value", value)
        console.log("exchangeRate", exchangeRate)
        const amountInUsd = convertCurrency(value, exchangeRate);
        setAmountInUsd(amountInUsd);
    };

    return(
        <Card className="w-[1000px]">
            <CardHeader className="flex items-center">
                <Button variant="ghost" onClick={goToPreviousStep}><ArrowLeft className="text-black" /></Button>
                <CardTitle>Depositar</CardTitle>
                <Button variant="ghost" className="ml-auto" onClick={closeModal}><X className="text-black" /></Button>
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
                            onChange={(value) => handleAmountChange(value)}
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
                    {userState && (
                        <CollateralPrediction 
                            netWorth={parseFloat(userState.netWorth)} 
                            amountInUsd={amountInUsd} 
                        />
                    )}
                    <Paper elevation="sm" className="p-4">
                        
                    </Paper>
                    <div className="bg-gray-100 p-4 rounded-md grid grid-cols-[7fr_3fr] gap-y-1 text-gray-600">
                        <div className="text-sm w-full">
                            Interes por año (APY)
                        </div>
                        <div className="text-sm w-full text-right">
                            {data.asset.supplyInfo.apy.formatted}%
                        </div>
                        {/* <div className="text-sm w-full">
                            Tasa de cambio ({data.asset.underlyingToken.symbol}/USD)
                        </div>
                        <div className="text-sm w-full text-right">
                            {exchangeRate ? parseFloat(exchangeRate.toString()).toFixed(2) : ""}%
                        </div> */}
                        {/* <div className="text-sm w-full">
                            Se depositaran:
                        </div>
                        <div className="text-sm w-full text-right">
                            ${amountInUsd} USD
                        </div> */}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SupplyForm