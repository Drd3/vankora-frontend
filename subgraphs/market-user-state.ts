// subgraphs/market-user-state.ts

import { graphqlRequest } from '@/lib/graphql';

const USER_MARKET_STATE_QUERY = `
  query UserMarketState($request: UserMarketStateRequest!) {
    userMarketState(request: $request) {
      healthFactor
      netAPY {
        decimals
        formatted
        raw
        value
      }
      currentLiquidationThreshold {
        decimals
        formatted
        raw
        value
      }
      netWorth
      totalCollateralBase
      totalDebtBase
      userDebtAPY {
        decimals
        formatted
        raw
        value
      }
      availableBorrowsBase
      ltv {
        raw
        decimals
        value
        formatted
      }
    }
  }
`;

export interface UserMarketState {
  healthFactor: number;
  netAPY: {
    decimals: number;
    formatted: string;
    raw: string;
    value: number;
  };
  currentLiquidationThreshold: {
    decimals: number;
    formatted: string;
    raw: string;
    value: number;
  };
  netWorth: string;
  totalCollateralBase: string;
  totalDebtBase: string;
  userDebtAPY: {
    decimals: number;
    formatted: string;
    raw: string;
    value: number;
  };
  availableBorrowsBase: string;
  ltv: {
    raw: string;
    decimals: number;
    value: number;
    formatted: string;
  };
}

export interface UserMarketStateRequest {
  chainId: number;
  market: string;
  user: string;
}

export async function fetchUserMarketState(
  request: UserMarketStateRequest,
  graphqlEndpoint: string
): Promise<UserMarketState | null> {
  try {
    const result = await graphqlRequest<{ userMarketState: UserMarketState }>(
      graphqlEndpoint,
      USER_MARKET_STATE_QUERY,
      { request }
    );

    if (result.errors) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    return result.data?.userMarketState || null;
  } catch (err) {
    console.error('Error fetching user market state:', err);
    throw err;
  }
}
