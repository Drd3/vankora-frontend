import { useState, useEffect } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { BrowserProvider, ethers } from "ethers";
import { AmountInput } from "@/components/ui/amount-input.bar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AssetSelector } from "../../asset-selector";
import { useWizardContext } from "@/components/ui/wizard";
import { repayWithATokens } from "@/services/aave-pool-contract";
import { fetchUsdExchangeRates } from "@/subgraphs/aave-exchange-rates";
import { AAVE_V3_ADDRESSES } from "@/addresses/addresses";

// Helper function to get token address
const getTokenAddress = (currency: any) => {
  if (!currency?.symbol) return "";
  const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
    base: {
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      EURC: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
    },
  };
  
  if (currency.symbol === "USDC" || currency.symbol === "EURC") {
    return TOKEN_ADDRESSES["base"][currency.symbol];
  }
  return currency.address;
};

interface CollateralTabProps {
  asset: any; // You should replace 'any' with the proper type
  supplyList: any[]; // You should replace 'any' with the proper type
  formatTokenBalance: (value: number) => string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function CollateralTab({
  asset,
  supplyList,
  formatTokenBalance,
  onSuccess,
  onError,
}: CollateralTabProps) {
  const [amount, setAmount] = useState(0);
  // Remove atokenAmount as we'll calculate it based on the exchange rate
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [exchangeRates, setExchangeRates] = useState<{
    debtAssetRate: number;
    collateralAssetRate: number;
    exchangeRate: number; // Exchange rate: 1 debt token = X collateral tokens
  }>({ debtAssetRate: 0, collateralAssetRate: 0, exchangeRate: 0 });
  
  // Calculate equivalent amount in the selected token
  const equivalentAmount = amount * (exchangeRates.exchangeRate || 0);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { updateData, goToNextStep } = useWizardContext();
  const chainId = useChainId();
  
  const provider = walletClient ? new BrowserProvider(walletClient.transport) : null;
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  useEffect(() => {
    const getSigner = async () => {
      if (provider) {
        try {
          const signerInstance = await provider.getSigner();
          setSigner(signerInstance);
        } catch (error) {
          console.error("Error getting signer:", error);
          onError?.(error instanceof Error ? error : new Error("Error getting signer"));
        }
      }
    };
    getSigner();
  }, [provider]);

  const handleAmountChange = (value: number) => {
    setAmount(value);
  };

  const handleAssetChange = (asset: any) => {
    setSelectedAsset(asset);
    // Update exchange rates when asset changes
    if (asset) {
      manageExchangeRates(asset.currency);
    }
  };

  const handleRepayWithCollateral = async () => {
    if (!address || !signer) return;
    if (!amount || Number(amount) <= 0 || !selectedAsset) return;

    setIsLoading(true);
    goToNextStep();

    try {
      updateData("txStatus", null);
      updateData("txResult", null);

      const selectedToken = supplyList.find(asset => asset.aToken?.address === selectedAsset);
      if (!selectedToken) {
        throw new Error('No se encontró el token seleccionado');
      }
      const result = await repayWithATokens({
        signer,
        user: address,
        asset: getTokenAddress(selectedToken.currency),
        amount: amount.toString(),
        network: "base",
        onStateChange: (action, state, info) => {
          updateData("txStatus", { action, state, info });
        },
      });

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
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Error in repay with collateral:", error);
      updateData("txStatus", {
        action: "repayWithAToken",
        state: "Error",
        info: error instanceof Error ? error.message : "Unknown error",
      });
      onError?.(error instanceof Error ? error : new Error("Error in repay with collateral"));
    } finally {
      setIsLoading(false);
    }
  };

    const manageExchangeRates = async (collateralCurrency?: any) => {
      if (amount <= 0 || !selectedAsset) {
        setExchangeRates({ 
          debtAssetRate: 0, 
          collateralAssetRate: 0, 
          exchangeRate: 0 
        });
        return;
      }

      try {
        const debtTokenAddress = getTokenAddress(asset.currency);
        const collateralTokenAddress = getTokenAddress(selectedAsset.currency);

        console.log("debtTokenAddress", debtTokenAddress);
        console.log("collateralTokenAddress", collateralTokenAddress);
        
        if (!debtTokenAddress || !collateralTokenAddress) {
          console.error("Missing token addresses");
          return;
        }

        const rates = await fetchUsdExchangeRates(
          "https://api.v3.aave.com/graphql", 
          {
            chainId: chainId.toString(), 
            market: AAVE_V3_ADDRESSES.POOL_ADDRESSES_PROVIDER, 
            underlyingTokens: [debtTokenAddress, collateralTokenAddress]
          }
        );
        console.log("rates", rates);
        
        if (rates && rates.length >= 2) {
          const debtRate = parseFloat(rates[0].rate.toString());
          const collateralRate = parseFloat(rates[1].rate.toString());
          const exchangeRate = debtRate > 0 ? collateralRate / debtRate : 0;
          
          setExchangeRates({
            debtAssetRate: debtRate,
            collateralAssetRate: collateralRate,
            exchangeRate: exchangeRate
          });
        }
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        onError?.(error instanceof Error ? error : new Error("Error fetching exchange rates"));
      }
    }

    useEffect(() => {
      manageExchangeRates();
    }, [selectedAsset])


    
  return (
    <div className="space-y-4 w-full">
      <p className="max-w-[400px] text-gray-600">
        Paga total o parcialmente la deuda de los préstamos que hayas solicitado.
      </p>
      <div className="space-y-2">
        <div>
          <label className="text-sm text-gray-600">Deuda a pagar:</label>
          <div className="px-4 py-2 border rounded-md flex items-center gap-2 w-[fit-content]">
            <img 
              className="w-6 h-6 rounded-full" 
              src={asset.currency.imageUrl} 
              alt={asset.currency.name} 
            />
            {formatTokenBalance(parseFloat(asset.debt.amount.value))} {asset.currency.symbol}
          </div>
          {exchangeRates.debtAssetRate > 0 && (
            <div className="text-sm text-gray-500 mt-1">
              1 {asset.currency.symbol} = ${exchangeRates.debtAssetRate.toFixed(6)} USD
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm">Selecciona la cantidad</label>
          <div className="text-sm">
            Tu deuda total: {formatTokenBalance(parseFloat(asset.debt.amount.value))} {asset.currency.symbol}
          </div>
        </div>
        <AmountInput
          className="max-w-[550px]"
          value={amount}
          maxValue={parseFloat(asset.debt.amount.value)}
          onChange={handleAmountChange}
        />
        <div className="space-y-2">
        {supplyList && supplyList.length > 0 && (
        <AssetSelector
          value={amount}
          selectedAsset={selectedAsset}
          onSelectedAssetChange={handleAssetChange}
          assets={supplyList}
          label="Usando"
          placeholder="Selecciona un activo"
        />
      )}
          {selectedAsset && exchangeRates.collateralAssetRate > 0 && (
            <div className="space-y-1 mt-2">
              <div className="text-sm text-gray-500">
                1 {selectedAsset.currency.symbol} = ${exchangeRates.collateralAssetRate.toFixed(6)} USD
              </div>
              <div className="text-sm text-gray-500">
                Tasa de cambio: 1 {asset.currency.symbol} = {exchangeRates.exchangeRate.toFixed(6)} {selectedAsset.currency.symbol}
              </div>
              {amount > 0 && (
                <div className="text-sm font-medium text-gray-700 mt-1">
                  {amount.toFixed(6)} {asset.currency.symbol} = {equivalentAmount.toFixed(6)} {selectedAsset.currency.symbol}
                </div>
              )}
            </div>
          )}
        </div>
        <Button 
          variant="default" 
          size="lg" 
          className="ml-auto mt-2"
          disabled={!amount || Number(amount) <= 0 || isLoading}
          onClick={handleRepayWithCollateral}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Pagar con colateral"
          )}
        </Button>
      </div>
    </div>
  );
}
