// subgraphs/market-supplies.ts

import { graphqlRequest } from '@/lib/graphql';

export type MarketSupply = {
  chain: {
    icon: string;
    explorerUrl: string;
    chainId: number;
  };
  reserves: Array<{
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
      }
    }
  }
`;

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
