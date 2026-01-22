import { AmountInput } from "@/components/ui/amount-input.bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Paper } from "@/components/ui/paper"
import { useWizardContext } from "@/components/ui/wizard"
import { ArrowLeft, Loader2, X } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { BrowserProvider, ethers } from "ethers"
import { useAccount, useChainId, useWalletClient } from "wagmi"
import { TxState, repay, getAssetBalance, repayWithATokens } from "@/services/aave-pool-contract";
import { useAave } from "@/contexts/aave-context"
import { fetchUsdExchangeRates } from "@/subgraphs/aave-exchange-rates"
import { AAVE_V3_ADDRESSES } from "@/addresses/addresses"
import { convertCurrency, formatTokenBalance } from "@/lib/utils"
import { UserBorrow } from "@/types/aave"
import CollateralPrediction from "@/components/ui/prediction-cards/collateral-prediction"
import BorrowPrediction from "@/components/ui/prediction-cards/borrow-prediction"
import { AssetSelector } from "../asset-selector"

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

const RepayForm = ({asset}: {asset: UserBorrow}) => {
    const { address } = useAccount();
    const chainId = useChainId();
    const { supplyList, userState } = useAave();

    const { goToPreviousStep, data, goToNextStep, updateData, closeModal } = useWizardContext()
    const { data: walletClient } = useWalletClient()
    
    const provider = walletClient ? new BrowserProvider(walletClient.transport) : null
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

    const [amount, setAmount] = useState(0);
    const [amountInUsd, setAmountInUsd] = useState(0); 
    const [exchangeRate, setExchangeRate] = useState(0);
    const [walletTokenBalance, setWalletTokenBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<number>(0);
    
    const getTokenAddress = () => {
        if (!asset.currency?.symbol) return ""
        if (asset.currency.symbol === "USDC" || asset.currency.symbol === "EURC") return TOKEN_ADDRESSES["base"][asset.currency.symbol]
        return asset.currency.address
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
                const exchangeRate = await fetchUsdExchangeRates("https://api.v3.aave.com/graphql", {chainId: chainId.toString(), market: AAVE_V3_ADDRESSES.POOL_ADDRESSES_PROVIDER, underlyingTokens:  [getTokenAddress()]})
                console.log("exchangeRate", exchangeRate)
                setExchangeRate(exchangeRate[0].rate);
            } catch (error) {
                console.error("Error getting exchange rate:", error);
            }
        }
        getExchangeRate();
    }, [])

    // Obtener balance del token en la wallet del usuario
    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (!provider || !address) return
            try {
                const balanceStr = await getAssetBalance(getTokenAddress(), address, provider)
                setWalletTokenBalance(parseFloat(balanceStr))
            } catch (error) {
                console.error("Error getting wallet token balance:", error)
                setWalletTokenBalance(null)
            }
        }

        fetchWalletBalance()
    }, [provider, address])

    const handleRepayWithWallet = async () => {
        if (!address || !signer) return
        if (!amount || Number(amount) <= 0) return

        // Cambiamos al paso de confirmación ANTES de empezar la tx
        goToNextStep()

        try {
            // Limpiar cualquier estado anterior
            updateData("txStatus", null)
            updateData("txResult", null)

            const result = await repay({
                signer,
                user: address,
                asset: getTokenAddress(),
                amount: amount.toString(),
                // Asumimos tasa variable (2). Si tienes el modo en `asset`, puedes sustituirlo aquí.
                interestRateMode: 2,
                network: "base",
                onStateChange: (action, state, info) => {
                    // Actualiza el estado de la transacción
                    updateData("txStatus", { action, state, info })
                },
            })

            // 3) Cuando termina, guardamos el resultado final
            updateData("txResult", {
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber,
                gasUsed: result.gasUsed,
                amount: amount.toString(),
                symbol: asset.currency.symbol,
                selectedAmount: {
                    value: amount,
                    currency: asset.currency.symbol,
                },
            })
        } catch (error) {
            console.error("Error en el repago:", error)
            updateData("txStatus", {
                action: "Repay",
                state: "Error" as TxState,
                info: error instanceof Error ? error.message : "Unknown error",
            })
        }
    }

    const handleAmountChange = (value: number) => {
        setAmount(value);
        const amountInUsd = convertCurrency(value, exchangeRate);
        setAmountInUsd(amountInUsd);
    };
    
    if(!asset){
        return null
    }

    return(
        <Card className="w-[1000px]">
            <CardHeader className="flex items-center">
                <Button variant="ghost" onClick={goToPreviousStep}><ArrowLeft className="text-black" /></Button>
                <CardTitle>Reembolsar préstamo</CardTitle>
                <Button variant="ghost" className="ml-auto" onClick={closeModal}><X className="text-black" /></Button>
            </CardHeader>
            <CardContent className="flex gap-4">
                <div className="space-y-4 w-full">
                    <p className="max-w-[400px] text-gray-600">
                        Paga total o parcialmente la deuda de los préstamos que hayas solicitado.
                    </p>
                    <div className="mt-4">
                        <label className="text-sm text-gray-600">Tu deuda total:</label>
                        <div className="px-4 py-2 border rounded-md flex items-center gap-2 w-[fit-content]">
                            <img
                                className="w-6 h-6 rounded-full"
                                src={asset.currency.imageUrl}
                                alt={asset.currency.name}
                            />
                            ${formatTokenBalance(parseFloat(asset.debt.amount.value))} {asset.currency.symbol}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm">Selecciona la cantidad</label>
                            {walletTokenBalance !== null && walletTokenBalance <= 0 ? (
                                <div className="text-sm text-red-500">
                                    No tienes balance de este token en tu wallet
                                </div>
                            ) : (
                                <div className="text-sm">
                                    Tu balance disponible: ${formatTokenBalance(walletTokenBalance ?? 0)} {asset.currency.symbol}
                                </div>
                            )}
                        </div>
                        <AmountInput
                            className="max-w-[550px]"
                            value={amount}
                            maxValue={Math.min(
                                parseFloat(asset.debt.amount.value),
                                walletTokenBalance ?? Infinity
                            )}
                            onChange={handleAmountChange}
                        />
                        <Button
                            variant="default"
                            size="lg"
                            className="ml-auto mt-2"
                            disabled={!amount || Number(amount) <= 0 || isLoading}
                            onClick={handleRepayWithWallet}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                "Pagar deuda"
                            )}
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
                            operation="subtract"
                        />
                    )}
                    <Paper elevation="sm" className="p-4">
                        
                    </Paper>
                    {/* <div className="bg-gray-100 p-4 rounded-md grid grid-cols-[7fr_3fr] gap-y-1 text-gray-600">
                        {/* <div className="text-sm w-full">
                            Interes por año (APY)
                        </div>
                        <div className="text-sm w-full text-right">
                            {asset.supplyInfo.apy.formatted}%
                        </div> */}
                        {/* <div className="text-sm w-full">
                            Tasa de cambio ({asset.underlyingToken.symbol}/USD)
                        </div>
                        <div className="text-sm w-full text-right">
                            {exchangeRate ? parseFloat(exchangeRate.toString()).toFixed(2) : ""}%
                        </div> */}
                        {/* <div className="text-sm w-full">
                            Se depositaran:
                        </div>
                        <div className="text-sm w-full text-right">
                            ${amountInUsd} USD
                        </div> 
                    </div> */}
                </div>
            </CardContent>
        </Card>
    )
}

export default RepayForm