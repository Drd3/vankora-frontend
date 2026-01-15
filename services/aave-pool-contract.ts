import { Contract, Signer, Provider, isAddress, formatUnits } from "ethers"
import { AAVE_V3_ADDRESSES } from "@/addresses/addresses"
import POOL_ABI from "@/abi/aave3-pool-abi.json"
import { parseUnits } from "ethers"
import ERC20_ABI from "@/abi/ERC20-abi.json"
import ADDRESS_PROVIDER_ABI from "@/abi/address-provider-abi.json"

type Network = "ethereum" | "polygon" | "base"

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
}: {
  token: string
  owner: string
  spender: string
  amount: bigint
  signer: Signer
}): Promise<void> => {
  const erc20 = new Contract(token, ERC20_ABI, signer)
  try {
    const allowance = await erc20.allowance(owner, spender)
    if (allowance < amount) {
      const tx = await erc20.approve(spender, amount)
      await tx.wait()
    }
  } catch (error) {
    throw new Error(`Approval failed: ${error}`)
  }
}

export const supply = async ({
  signer,
  user,
  asset,
  amount,
  network,
  onApproving,
  onApproved,
  onSupplying,
}: {
  signer: Signer
  user: string
  asset: string
  amount: string
  network: Network
  onApproving?: () => void
  onApproved?: () => void
  onSupplying?: (txHash: string) => void
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

    // Aprobar tokens
    onApproving?.()
    await ensureApprove({
      token: asset,
      owner: user,
      spender: poolAddress,
      amount: amountInWei,
      signer,
    })
    onApproved?.()

    // Ejecutar supply
    const tx = await pool.supply(asset, amountInWei, user, 0)
    onSupplying?.(tx.hash)

    // Esperar confirmación
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