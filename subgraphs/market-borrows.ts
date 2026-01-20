// subgraphs/market-borrows.ts

import { graphqlRequest } from '@/lib/graphql';

export type MarketBorrow = {
  chain: {
    icon: string;
    explorerUrl: string;
    chainId: number;
  };
  reserves: Array<{
    underlyingToken: {
      name: string;
      symbol: string;
      imageUrl: string;
      decimals: number;
      address: string;
    };
    market: {
      chain: {
        chainId: number;
      };
    };
    isPaused: boolean;
    isFrozen: boolean;
    permitSupported: boolean;
    borrowInfo: {
      apy: {
        decimals: number;
        formatted: string;
        raw: string;
        value: string;
      };
      availableLiquidity: {
        amount: {
          raw: string;
          value: string;
          decimals: number;
        };
        usd: string;
        usdPerToken: string;
      };
      borrowCap: {
        amount: {
          decimals: number;
          raw: string;
          value: string;
        };
        usd: string;
        usdPerToken: string;
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

const MARKET_BORROWS_QUERY = `
  query Markets($request: MarketsRequest!, $reservesRequest2: MarketReservesRequest!) {
    markets(request: $request) {
      chain {
        icon
        explorerUrl
        chainId
      }
      reserves(request: $reservesRequest2) {
        underlyingToken {
          name
          symbol
          imageUrl
          decimals
          address
        }
        market {
          chain {
            chainId
          }
        }
        isPaused
        isFrozen
        permitSupported
        borrowInfo {
          apy {
            decimals
            formatted
            raw
            value
          }
          availableLiquidity {
            amount {
              raw
              value
              decimals
            }
            usd
            usdPerToken
          }
          borrowCap {
            amount {
              decimals
              raw
              value
            }
            usd
            usdPerToken
          }
        }
      }
    }
  }
`;

export async function fetchMarketBorrows(
  request: {
    request: MarketsRequest;
    reservesRequest2: MarketReservesRequest;
  },
  graphqlEndpoint: string
): Promise<MarketBorrow[]> {
  try {
    const result = await graphqlRequest<{ markets: MarketBorrow[] }>(
      graphqlEndpoint,
      MARKET_BORROWS_QUERY,
      request
    );
    return result.data.markets;
  } catch (error) {
    console.error('Error fetching market borrows:', error);
    throw error;
  }
}
