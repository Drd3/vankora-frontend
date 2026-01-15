// lib/graphql.ts

interface Currency {
  symbol: string;
  name: string;
}

interface UsdExchangeRateResponse {
  currency: Currency;
  rate: number;
}

interface UsdExchangeRatesResponse {
  usdExchangeRates: UsdExchangeRateResponse[];
}

interface UsdExchangeRatesRequest {
  chainId: string;
  market: string;
  underlyingTokens: string[];
}

export async function graphqlRequest<T = any>(
  url: string,
  query: string,
  variables: Record<string, any> = {}
): Promise<{ data: T; errors?: any[] }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchUsdExchangeRates(
  url: string,
  request: UsdExchangeRatesRequest
): Promise<UsdExchangeRateResponse[]> {
  const query = `
    query UsdExchangeRates($request: UsdExchangeRatesRequest!) {
      usdExchangeRates(request: $request) {
        currency {
          symbol
          name
        }
        rate
      }
    }
  `;

  const { data, errors } = await graphqlRequest<{ usdExchangeRates: UsdExchangeRateResponse[] }>(
    url,
    query,
    { request }
  );

  if (errors) {
    throw new Error(`Failed to fetch USD exchange rates: ${JSON.stringify(errors)}`);
  }

  return data.usdExchangeRates;
}