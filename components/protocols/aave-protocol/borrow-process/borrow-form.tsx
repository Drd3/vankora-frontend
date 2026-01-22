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
import { supply, TxState, borrow } from "@/services/aave-pool-contract";
import { useAave } from "@/contexts/aave-context"
import { fetchUsdExchangeRates } from "@/subgraphs/aave-exchange-rates"
import { AAVE_V3_ADDRESSES } from "@/addresses/addresses"
import { convertCurrency } from "@/lib/utils"
import CollateralPrediction from "@/components/ui/prediction-cards/collateral-prediction"
import { toast } from "@/hooks/use-toast"
import BorrowPrediction from "@/components/ui/prediction-cards/borrow-prediction"

const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  base: {
    USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // Circle USDC on Base
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

const BorrowForm = () => {
    const { address } = useAccount();
    const chainId = useChainId();

    const { goToPreviousStep, data, goToNextStep, updateData, closeModal } = useWizardContext()
    const { data: walletClient } = useWalletClient()
    const { userState } = useAave()
    
    const provider = walletClient ? new BrowserProvider(walletClient.transport) : null
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

    const [amount, setAmount] = useState(0);
    const [amountInUsd, setAmountInUsd] = useState(0); 
    const [exchangeRate, setExchangeRate] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const getTokenAddress = () => {
        if (!data.asset.underlyingToken.symbol) return ""
        if (data.asset.underlyingToken.symbol === "USDC" || data.asset.underlyingToken.symbol === "EURC") return TOKEN_ADDRESSES["base"][data.asset.underlyingToken.symbol]
        return data.asset.underlyingToken.address
    }

    const handleConfirm = async () => {
        // Mover al siguiente paso cuando la transacción es exitosa
        try {
            if (!data.asset || !amount || !signer) {
                throw new Error("Missing required data for borrowing");
            }

            goToNextStep();

            // Actualizar el estado a "pendiente"
            updateData("txStatus", {
                action: "Borrow",
                state: "Pending" as TxState,
                info: "Initiating borrow transaction..."
            });
            const amountString = typeof amount === 'number' ? amount.toString() : amount;
            const tokenAddress = getTokenAddress();
            // Función para manejar la transacción
            const handleTx = async (txPromise: Promise<any>) => {
                const tx = await txPromise;
                // Actualizar con el hash de la transacción
                updateData("txResult", {
                    transactionHash: tx.hash,
                    amount: amountString,
                    symbol: data.asset.underlyingToken.symbol
                });
                return tx;
            };
            // Llamar a la función borrow directamente
            await borrow({
                signer,
                asset: tokenAddress,
                amount: amountString,
                interestRateMode: 2, // 1 para stable, 2 para variable
                network: 'base',
                onBehalfOf: await signer.getAddress(),
                handleTx,
                onStateChange: (state, error) => {
                    if (state === 'success') {
                        updateData("txStatus", {
                            ...data.txStatus,
                            state: "Finished" as TxState,
                            info: "Borrow completed successfully"
                        });
                        
                    } else if (state === 'error') {
                        throw error || new Error('Error during borrowing');
                    }
                }
            });
        } catch (error) {
            console.error("Error en el préstamo:", error);
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            
            updateData("txStatus", {
                state: "Error" as TxState,
                info: errorMessage
            });

            // Mostrar toast con el error
            toast({
                title: "Error al procesar el préstamo",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };


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
                const exchangeRate = await fetchUsdExchangeRates("https://api.v3.aave.com/graphql", {chainId: chainId.toString(), market: AAVE_V3_ADDRESSES.POOL_ADDRESSES_PROVIDER, underlyingTokens:  [getTokenAddress()]})
                console.log("exchangeRate", exchangeRate)
                setExchangeRate(exchangeRate[0].rate);
            } catch (error) {
                console.error("Error getting exchange rate:", error);
            }
        }
        getExchangeRate();
    }, [])

    const handleAmountChange = (value: number) => {
        setAmount(value);
        const amountInUsd = convertCurrency(value, exchangeRate);
        setAmountInUsd(amountInUsd);
    };

    return(
        <Card className="w-[1000px]">
            <CardHeader className="flex items-center">
                <Button variant="ghost" onClick={goToPreviousStep}><ArrowLeft className="text-black" /></Button>
                <CardTitle>Pedir prestamo</CardTitle>
                <Button variant="ghost" className="ml-auto" onClick={closeModal}><X className="text-black" /></Button>
            </CardHeader>
            <CardContent className="flex gap-4">
                <div className="space-y-4 w-full">
                    <p className="max-w-[400px] text-gray-600">Solicita la cantidad que desees pedir prestada, el monto que puedes pedir dependerá del colateral que tengas como respaldo.</p>
                    <div className="mt-4">
                        <label className="text-sm text-gray-600">Pedir prestado en:</label>
                        <div className="px-4 py-2 border rounded-md flex items-center gap-2 w-[fit-content]">
                            <img className="w-6 h-6 rounded-full" src={data.asset.underlyingToken.imageUrl} alt="" />
                            {data.asset.underlyingToken.name}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm">Selecciona la cantidad</label>

                            {/* <div className="text-sm">
                                Wallet balance: {data.asset.userState.balance.amount.value} {data.asset.underlyingToken.symbol}
                            </div> */}
                        </div>
                        <AmountInput
                            className="max-w-[550px]"
                            value={amount}
                            maxValue={Number(data.asset.borrowInfo.availableLiquidity.amount.value)}
                            onChange={(value) => handleAmountChange(value)}
                        />
                        <Button 
                            variant="default" 
                            size="lg" 
                            className="ml-auto mt-2"
                            disabled={!amount || Number(amount) <= 0 || isLoading}
                            onClick={handleConfirm}
                        >
                            Pedir prestado
                        </Button>
                    </div>
                </div>
                <div className="w-full w-[700px] space-y-4">
                    <div>
                        Estos cambios se realizaran:
                    </div>
                    {userState && (
                        <BorrowPrediction 
                            totalBorrowed={parseFloat(userState.totalDebtBase)} 
                            newBorrowed={amountInUsd} 
                            totalCollateral={parseFloat(userState.totalCollateralBase)}
                            operation="add"
                        />
                    )}
                    <Paper elevation="sm" className="p-4">
                        
                    </Paper>
                    <div className="bg-gray-100 p-4 rounded-md grid grid-cols-[7fr_3fr] gap-y-1 text-gray-600">
                        <div className="text-sm w-full">
                            Interes por año (APY)
                        </div>
                        <div className="text-sm w-full text-right">
                            {data.asset.borrowInfo.apy.formatted}%
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

export default BorrowForm