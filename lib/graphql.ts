// lib/graphql.ts
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