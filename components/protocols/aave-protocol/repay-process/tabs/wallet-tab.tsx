import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider, ethers } from "ethers";
import { AmountInput } from "@/components/ui/amount-input.bar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useWizardContext } from "@/components/ui/wizard";
import { repay } from "@/services/aave-pool-contract";

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

interface WalletTabProps {
  asset: any; // You should replace 'any' with the proper type
  walletTokenBalance: number | null;
  formatTokenBalance: (value: number) => string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function WalletTab({
  asset,
  walletTokenBalance,
  formatTokenBalance,
  onSuccess,
  onError,
}: WalletTabProps) {
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { updateData, goToNextStep } = useWizardContext();
  
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

  const handleRepayWithWallet = async () => {
    if (!address || !signer) return;
    if (!amount || Number(amount) <= 0) return;

    setIsLoading(true);
    goToNextStep();

    try {
      updateData("txStatus", null);
      updateData("txResult", null);

      const result = await repay({
        signer,
        user: address,
        asset: getTokenAddress(asset.currency),
        amount: amount.toString(),
        interestRateMode: 2,
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
      console.error("Error en el repago:", error);
      updateData("txStatus", {
        action: "Repay",
        state: "Error",
        info: error instanceof Error ? error.message : "Unknown error",
      });
      onError?.(error instanceof Error ? error : new Error("Error en el repago"));
    } finally {
      setIsLoading(false);
    }
  };
  return (
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
  );
}
