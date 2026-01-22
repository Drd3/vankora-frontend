import { Contract, Signer, Provider, isAddress, formatUnits } from "ethers"
import { AAVE_V3_ADDRESSES } from "@/addresses/addresses"
import POOL_ABI from "@/abi/aave3-pool-abi.json"
import { parseUnits } from "ethers"
import ERC20_ABI from "@/abi/ERC20-abi.json"
import ADDRESS_PROVIDER_ABI from "@/abi/address-provider-abi.json"

type Network = "ethereum" | "polygon" | "base"

export type TxState = "WaitingForConfirmation" | "Pending" | "Finished" | "Error"

const logError = (err: any, action: string) => {
  console.error(`Error during ${action}:`, err)
}

async function handleTx(
  txPromise: Promise<any>,
  action: string,
  onStateChange?: (action: string, state: TxState, info?: string) => void
): Promise<any> {
  try {
    onStateChange?.(action, "WaitingForConfirmation", `${action}: waiting for wallet signature...`)
    const tx = await txPromise
    onStateChange?.(action, "Pending", `${action}: transaction sent. Hash: ${tx.hash}`)
    const receipt = await tx.wait()
    if (receipt?.status !== 1) {
      throw new Error(`${action} transaction reverted on-chain`)
    }
    console.log("receipt", receipt)
    onStateChange?.(action, "Finished", `${action}: confirmed in block ${receipt.blockNumber}`)
    return tx
  } catch (err: any) {
    logError(err, action)
    onStateChange?.(action, "Error", err?.reason || err?.message || "Unknown error")
    throw (err?.reason || err?.data || err?.message || "Unknown error")
  }
}

// Token addresses by network and symbol
const TOKEN_ADDRESSES: Record<Network, Record<string, string>> = {
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

/**
 * Gets the correct token address, handling special cases like USDC and EURC
 */
const getTokenAddress = (tokenAddress: string, tokenSymbol: string, network: Network): string => {
  const symbol = tokenSymbol.toUpperCase()
  
  // Return the hardcoded address for USDC or EURC if they match
  if (symbol === 'USDC' || symbol === 'EURC') {
    return TOKEN_ADDRESSES[network]?.[symbol] || tokenAddress
  }
  
  // For other tokens, use the provided address
  return tokenAddress
}

interface SupplyResult {
  success: boolean
  transactionHash: string
  blockNumber: number
  gasUsed: string
}

// Aave V3 Pool addresses for different networks
const AAVE_V3_POOL_ADDRESSES: Record<Network, string> = {
  ethereum: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  polygon: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  base: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"
}

export const getPool = (
  providerOrSigner: Provider | Signer,
  network: Network
): Contract => {
  const poolAddress = AAVE_V3_POOL_ADDRESSES[network]
  if (!poolAddress) {
    throw new Error(`No Aave V3 pool address found for network: ${network}`)
  }
  
  return new Contract(poolAddress, POOL_ABI, providerOrSigner)
}

export const ensureApprove = async ({
  token,
  owner,
  spender,
  amount,
  signer,
  onStateChange,
}: {
  token: string
  owner: string
  spender: string
  amount: bigint
  signer: Signer
  onStateChange?: (action: string, state: TxState, info?: string) => void
}): Promise<void> => {
  const erc20 = new Contract(token, ERC20_ABI, signer)
  try {
    const allowance = await erc20.allowance(owner, spender)
    if (allowance < amount) {
      await handleTx(
        erc20.approve(spender, amount),
        "Approve",
        onStateChange
      )
    } else {
      onStateChange?.("Approve", "Finished", "Approve: already sufficient allowance")
    }
  } catch (error: any) {
    throw new Error(`Approval failed: ${error?.message || error}`)
  }
}

export const supply = async ({
  signer,
  user,
  asset,
  amount,
  network,
  onStateChange,
}: {
  signer: Signer
  user: string
  asset: string
  amount: string
  network: Network
  onStateChange?: (action: string, state: TxState, info?: string) => void
}): Promise<SupplyResult> => {
  // Validaciones
  if (!signer) throw new Error("Signer is required")
  if (!user || !isAddress(user)) throw new Error("Invalid user address")
  if (!asset || !isAddress(asset)) throw new Error("Invalid asset address")
  if (!amount || parseFloat(amount) <= 0) throw new Error("Invalid amount")

  try {
    // Obtener pool
    const pool = await getPool(signer, network)
    const poolAddress = await pool.getAddress()

    // Get the correct token address (handles USDC and EURC specifically)
    const tokenAddress = getTokenAddress(asset, '', network)
    
    // Obtener decimales del token
    const erc20 = new Contract(tokenAddress, ERC20_ABI, signer)
    const decimals = await erc20.decimals()

    console.log("decimals", decimals)

    const amountInWei = parseUnits(amount, decimals)

    // Aprobar tokens (si es necesario) usando el manejador de estados
    await ensureApprove({
      token: asset,
      owner: user,
      spender: poolAddress,
      amount: amountInWei,
      signer,
      onStateChange,
    })

    // Ejecutar supply usando el manejador de estados
    const tx = await handleTx(
      pool.supply(asset, amountInWei, user, 0),
      "Supply",
      onStateChange
    )

    const receipt = await tx.wait()

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    }
  } catch (error: any) {
    // Manejo de errores específicos
    if (error.message?.includes("HEALTH_FACTOR")) {
      throw new Error("Health factor too low")
    }
    if (error.code === 4001) {
      throw new Error("Transaction rejected by user")
    }
    if (error.code === "INSUFFICIENT_FUNDS") {
      throw new Error("Insufficient funds for gas")
    }

    throw new Error(`Supply failed: ${error.message || error}`)
  }
}

// Funciones adicionales útiles
export const getAssetBalance = async (
  asset: string,
  user: string,
  provider: Provider
): Promise<string> => {
  const erc20 = new Contract(asset, ERC20_ABI, provider)
  const balance = await erc20.balanceOf(user)
  const decimals = await erc20.decimals()
  return formatUnits(balance, decimals)
}

export const getATokenBalance = async (
  asset: string,
  user: string,
  network: Network,
  provider: Provider
): Promise<string> => {
  const pool = await getPool(provider, network)
  const reserveData = await pool.getReserveData(asset)
  
  const aToken = new Contract(reserveData.aTokenAddress, ERC20_ABI, provider)
  const balance = await aToken.balanceOf(user)
  const decimals = await aToken.decimals()
  
  return formatUnits(balance, decimals)
}



type BorrowParams = {
  signer: any;
  asset: string;
  amount: string; // en unidades humanas ("100")
  interestRateMode: 1 | 2; // 1 = Stable, 2 = Variable
  network: Network;
  onBehalfOf?: string;
  referralCode?: number;
  handleTx: (txPromise: Promise<any>) => Promise<any>;
  onStateChange?: (state: "idle" | "loading" | "success" | "error", error?: unknown) => void;
};

export async function borrow({
  signer,
  asset,
  amount,
  interestRateMode,
  onBehalfOf,
  referralCode = 0,
  network= "base",
  handleTx,
  onStateChange
}: BorrowParams) {
  try {
    onStateChange?.("loading");

    /* ---------------- VALIDACIONES ---------------- */

    if (!signer) throw new Error("Signer no disponible");

    if (!isAddress(asset)) {
      throw new Error("Asset address inválido");
    }

    console.log("asset", asset, "amount", amount, "interestRateMode", interestRateMode, "onBehalfOf", onBehalfOf, "referralCode", referralCode, "network", network)

    const userAddress = onBehalfOf ?? (await signer.getAddress());

    if (!isAddress(userAddress)) {
      throw new Error("onBehalfOf inválido");
    }

    if (!amount || Number(amount) <= 0) {
      throw new Error("Amount inválido");
    }

    if (![1, 2].includes(interestRateMode)) {
      throw new Error("interestRateMode inválido");
    }

    /* ---------------- PARSEO SEGURO ---------------- */

    const erc20 = new Contract(asset, ERC20_ABI, signer)
    const decimals = await erc20.decimals()

    const parsedAmount = parseUnits(amount, decimals);
    
    console.log("decimals", decimals)

    if (parsedAmount <= 0n) {
      throw new Error("Amount parseado inválido");
    }

    /* ---------------- CONTRATO ---------------- */

    const pool = new Contract(
      AAVE_V3_POOL_ADDRESSES[network],
      POOL_ABI,
      signer
    );

    /* ---------------- EJECUCIÓN ---------------- */

    const tx = await handleTx(
      pool.borrow(
        asset,
        parsedAmount,
        interestRateMode,
        referralCode,
        userAddress
      )
    );

    onStateChange?.("success");
    return tx;

  } catch (error: any) {
    console.error("Borrow error:", error);

    /* --------- MENSAJES DE ERROR COMUNES AAVE -------- */

    if (error?.data === "0xf58f733a") {
      // generic revert sin mensaje
      error.message = "Borrow revertido: revisa collateral, health factor o liquidity";
    }

    onStateChange?.("error", error);
    throw error;
  }
}



interface WithdrawResult {
  success: boolean
  transactionHash: string
  blockNumber: number
  gasUsed: string
}

export const withdraw = async ({
  signer,
  user,
  asset,
  amount, // cantidad en formato humano ("100") o "max"
  network,
  onStateChange,
}: {
  signer: Signer
  user: string
  asset: string
  amount: string // "max" o número en unidades humanas
  network: Network
  onStateChange?: (action: string, state: TxState, info?: string) => void
}): Promise<WithdrawResult> => {
  /* ---------------- VALIDACIONES ---------------- */

  if (!signer) throw new Error("Signer is required")
  if (!user || !isAddress(user)) throw new Error("Invalid user address")
  if (!asset || !isAddress(asset)) throw new Error("Invalid asset address")
  if (!amount) throw new Error("Amount is required")

  try {
    const pool = getPool(signer, network)

    /* ---------------- MONTO ---------------- */

    let amountInWei: bigint

    if (amount === "max") {
      // Aave usa uint256.max para retirar todo
      amountInWei = BigInt(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
    } else {
      if (parseFloat(amount) <= 0) {
        throw new Error("Invalid withdraw amount")
      }

      const erc20 = new Contract(asset, ERC20_ABI, signer)
      const decimals = await erc20.decimals()

      amountInWei = parseUnits(amount, decimals)
    }

    /* ---------------- EJECUCIÓN ---------------- */

    const tx = await handleTx(
      pool.withdraw(asset, amountInWei, user),
      "Withdraw",
      onStateChange
    )

    const receipt = await tx.wait()

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    }
  } catch (error: any) {
    /* ---------------- ERRORES COMUNES ---------------- */

    if (error.message?.includes("HEALTH_FACTOR")) {
      throw new Error("Withdraw blocked: health factor too low")
    }

    if (error.code === 4001) {
      throw new Error("Transaction rejected by user")
    }

    if (error.code === "INSUFFICIENT_FUNDS") {
      throw new Error("Insufficient funds for gas")
    }

    throw new Error(`Withdraw failed: ${error.message || error}`)
  }
}

interface RepayResult {
  success: boolean
  transactionHash: string
  blockNumber: number
  gasUsed: string
}

export const repay = async ({
  signer,
  user,
  asset,
  amount, // "max" o monto humano ("100")
  interestRateMode, // 1 = Stable, 2 = Variable
  network,
  onStateChange,
}: {
  signer: Signer
  user: string
  asset: string
  amount: string
  interestRateMode: 1 | 2
  network: Network
  onStateChange?: (action: string, state: TxState, info?: string) => void
}): Promise<RepayResult> => {
  /* ---------------- VALIDACIONES ---------------- */

  if (!signer) throw new Error("Signer is required")
  if (!user || !isAddress(user)) throw new Error("Invalid user address")
  if (!asset || !isAddress(asset)) throw new Error("Invalid asset address")
  if (!amount) throw new Error("Amount is required")
  if (![1, 2].includes(interestRateMode)) {
    throw new Error("Invalid interestRateMode")
  }

  try {
    const pool = getPool(signer, network)
    const poolAddress = await pool.getAddress()

    console.log("asset", asset)
    console.log("amount", amount)
    console.log("interestRateMode", interestRateMode)

    /* ---------------- MONTO ---------------- */

    let amountInWei: bigint

    if (amount === "max") {
      // uint256.max = pagar toda la deuda
      amountInWei = BigInt(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
    } else {
      if (parseFloat(amount) <= 0) {
        throw new Error("Invalid repay amount")
      }

      const erc20 = new Contract(asset, ERC20_ABI, signer)
      const decimals = await erc20.decimals()

      amountInWei = parseUnits(amount, decimals)

      console.log("amountInWei", amountInWei)
    }

    /* ---------------- APPROVE ---------------- */

    // Para repay SIEMPRE se requiere approve
    await ensureApprove({
      token: asset,
      owner: user,
      spender: poolAddress,
      amount: amountInWei,
      signer,
      onStateChange,
    })

    /* ---------------- EJECUCIÓN ---------------- */

    const tx = await handleTx(
      pool.repay(
        asset,
        amountInWei,
        interestRateMode,
        user
      ),
      "Repay",
      onStateChange
    )

    const receipt = await tx.wait()

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    }
  } catch (error: any) {
    /* ---------------- ERRORES COMUNES ---------------- */

    if (error.message?.includes("NO_DEBT")) {
      throw new Error("No outstanding debt to repay")
    }

    if (error.code === 4001) {
      throw new Error("Transaction rejected by user")
    }

    if (error.code === "INSUFFICIENT_FUNDS") {
      throw new Error("Insufficient funds for gas or repay amount")
    }

    throw new Error(`Repay failed: ${error.message || error}`)
  }
}

export const repayWithATokens = async ({
  signer,
  user,
  asset,
  amount,
  network,
  onStateChange,
}: {
  signer: Signer
  user: string
  asset: string
  amount: string
  network: Network
  onStateChange?: (action: string, state: TxState, info?: string) => void
}): Promise<SupplyResult> => {
  // Validaciones
  if (!signer) throw new Error("Signer is required")
  if (!user || !isAddress(user)) throw new Error("Invalid user address")
  if (!asset || !isAddress(asset)) throw new Error("Invalid asset address")
  if (!amount || parseFloat(amount) <= 0) throw new Error("Invalid amount")

  try {
    // Obtener pool
    const pool = await getPool(signer, network)

    // Obtener decimales del token
    const erc20 = new Contract(asset, ERC20_ABI, signer)
    const decimals = await erc20.decimals()
    const amountInWei = parseUnits(amount, decimals)

    // Ejecutar repayWithATokens usando handleTx
    const tx = await handleTx(
      pool.repayWithATokens(asset, amountInWei, 2), // 2 = variable
      "RepayWithATokens",
      onStateChange
    )

    const receipt = await tx.wait()

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    }
  } catch (error: any) {
    // Manejo de errores específicos
    if (error.code === 4001) {
      throw new Error("Transaction rejected by user")
    }

    if (
      error.message?.includes("NO_DEBT_OF_SELECTED_TYPE") ||
      error.message?.includes("NO_DEBT")
    ) {
      throw new Error("User has no debt of selected type")
    }

    if (
      error.message?.includes("NOT_ENOUGH_AVAILABLE_USER_BALANCE") ||
      error.message?.includes("INSUFFICIENT_ATOKEN_BALANCE")
    ) {
      throw new Error("Insufficient aToken balance to repay")
    }

    throw new Error(`RepayWithATokens failed: ${error.message || error}`)
  }
}
