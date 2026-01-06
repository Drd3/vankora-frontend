// subgraphs/user-borrows.ts

import { graphqlRequest } from '@/lib/graphql';

export type UserBorrowsRequest = {
  user: string;
  markets: Array<{
    chainId: number;
    address: string;
  }>;
  orderBy: {
    debt: 'ASC' | 'DESC';
  };
};

export type UserBorrow = {
  apy: {
    decimals: number;
    raw?: string;
    value?: string;
    formatted?: string;
  };
  currency: {
    symbol: string;
    name: string;
    imageUrl: string;
    decimals: number;
    chainId: number;
    address: string;
  };
  debt: {
    amount: {
      decimals: number;
      raw: string;
      value: string;
    };
    usd?: string;
  };
  market: {
    address: string;
    icon: string;
    name: string;
  };
};

const USER_BORROWS_QUERY = `
  query UserBorrows($request: UserBorrowsRequest!) {
    userBorrows(request: $request) {
      apy {
        decimals
        raw
        value
        formatted
      }
      currency {
        symbol
        name
        imageUrl
        decimals
        chainId
        address
      }
      debt {
        amount {
          decimals
          raw
          value
        }
        usd
      }
      market {
        address
        icon
        name
      }
    }
  }
`;

export async function fetchUserBorrows(
  request: UserBorrowsRequest, 
  graphqlEndpoint: string
): Promise<UserBorrow[]> {
  try {
    const result = await graphqlRequest<{ userBorrows: UserBorrow[] }>(
      graphqlEndpoint,
      USER_BORROWS_QUERY,
      { request }
    );

    if (result.errors) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    return result.data?.userBorrows || [];
  } catch (error) {
    console.error('Error fetching user borrows:', error);
    throw error;
  }
}
