// subgraphs/market-supplies.ts

import { graphqlRequest } from '@/lib/graphql';

export type MarketSupply = {
  chain: {
    icon: string;
    explorerUrl: string;
    chainId: number;
  };
  reserves: Array<{
    aToken: {
      address: string;
      symbol: string;
      name: string;
      decimals: number;
    };
    supplyInfo: {
      apy: {
        decimals: number;
        formatted: string;
        value: string;
        raw: string;
      };
      canBeCollateral: boolean;
    };
    underlyingToken: {
      name: string;
      symbol: string;
      imageUrl: string;
      decimals: number;
    };
    userState: {
      balance: {
        amount: {
          raw: string;
          value: string;
          decimals: number;
        };
      };
    };
  }>;
};

type MarketsRequest = {
  user: string;
  chainIds: number;
};

type MarketReservesRequest = {
  orderBy: {
    supplyApy: 'ASC' | 'DESC';
  };
  reserveType: 'SUPPLY' | 'BORROW';
};

const MARKET_SUPPLIES_QUERY = `
  query Markets($request: MarketsRequest!, $reservesRequest: MarketReservesRequest!) {
    markets(request: $request) {
      chain {
        icon
        explorerUrl
        chainId
      }
      reserves(request: $reservesRequest) {
        aToken {
          address
          symbol
          name
          decimals
        }
        supplyInfo {
          apy {
            decimals
            formatted
            value
            raw
          }
          canBeCollateral
        }
        underlyingToken {
          name
          symbol
          imageUrl
          decimals
        }
        userState {
          balance {
            amount {
              raw
              value
              decimals
            }
          }
        }
      }
    }
  }
`;

export type UnderlyingTokenInfo = {
  address: string;
  symbol: string;
};

export type ATokenInfo = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  underlyingToken: UnderlyingTokenInfo;
};

export type ATokensResponse = {
  chainId: number;
  aTokens: ATokenInfo[];
  lastUpdated: string;
};

const ATOKENS_QUERY = `
  query ATokens($request: MarketsRequest!, $reservesRequest: MarketReservesRequest!) {
    markets(request: $request) {
      chain {
        chainId
      }
      reserves(request: $reservesRequest) {
        aToken {
          address
          symbol
          name
          decimals
        }
        underlyingToken {
          address
          symbol
        }
      }
    }
  }
`;

export async function fetchATokens(
  request: {
    request: MarketsRequest,
    reservesRequest: MarketReservesRequest
  },
  graphqlEndpoint: string
): Promise<ATokensResponse> {
  try {
    const result = await graphqlRequest<{ 
      markets: Array<{
        chain: { chainId: number };
        reserves: Array<{
          aToken: Omit<ATokenInfo, 'underlyingSymbol' | 'underlyingAddress'>;
          underlyingToken: { symbol: string; address: string };
        }>;
      }> 
    }>(
      graphqlEndpoint,
      ATOKENS_QUERY,
      { 
        request: request.request,
        reservesRequest: request.reservesRequest
      }
    );

    // Handle case where result is not in the expected format
    if (!result || !result.data) {
      console.error('Invalid response format from GraphQL endpoint:', result);
      return {
        chainId: 0,
        aTokens: [],
        lastUpdated: new Date().toISOString()
      };
    }

    // Handle GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    if (!result.data.markets?.[0]) {
      console.log('No market data available');
      return { 
        chainId: 0, 
        aTokens: [],
        lastUpdated: new Date().toISOString()
      };
    }

    const market = result.data.markets[0];
    
    // Safely map reserves to aTokens
    const aTokens: ATokenInfo[] = (market.reserves || []).map(reserve => ({
      ...reserve.aToken,
      underlyingToken: {
        address: reserve.underlyingToken?.address || '',
        symbol: reserve.underlyingToken?.symbol || ''
      }
    })).filter(token => 
      token.address && 
      token.underlyingToken.address && 
      token.underlyingToken.symbol
    );

    return {
      chainId: market.chain?.chainId || 0,
      aTokens,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in fetchATokens:', error);
    // Return a default response in case of error
    return {
      chainId: 0,
      aTokens: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

export async function fetchMarketSupplies(
  request: {
    request: MarketsRequest,
    reservesRequest2: MarketReservesRequest
  },
  graphqlEndpoint: string
): Promise<MarketSupply[]> {
  try {
    const result = await graphqlRequest<{ markets: MarketSupply[] }>(
      graphqlEndpoint,
      MARKET_SUPPLIES_QUERY,
      { 
        request: request.request,
        reservesRequest: request.reservesRequest2
      }
    );

    if (result.errors) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    return result.data?.markets || [];
  } catch (err) {
    console.error('Error fetching market supplies:', err);
    throw err;
  }
}
