import { graphqlRequest, UsdExchangeRateResponse, UsdExchangeRatesRequest } from "@/lib/graphql";

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