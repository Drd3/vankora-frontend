// subgraphs/user-supplies.ts

import { graphqlRequest } from '@/lib/graphql';
import type { UserSuppliesRequest, UserSupply } from '@/types/aave';

const USER_SUPPLIES_QUERY = `
  query UserSupplies($request: UserSuppliesRequest!) {
    userSupplies(request: $request) {
      balance {
        usd
        amount {
          value
        }
      }
      apy {
        raw
        value
        decimals
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
      isCollateral
      canBeCollateral
    }
  }
`;

export async function fetchUserSupplies(
  request: UserSuppliesRequest, 
  graphqlEndpoint: string
): Promise<UserSupply[]> {
  try {
    const result = await graphqlRequest<{ userSupplies: UserSupply[] }>(
      graphqlEndpoint,
      USER_SUPPLIES_QUERY,
      { request }
    );

    if (result.errors) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    return result.data?.userSupplies || [];
  } catch (err) {
    console.error('Error fetching user supplies:', err);
    throw err;
  }
}