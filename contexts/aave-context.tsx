import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserMarketState, UserMarketStateRequest, fetchUserMarketState } from '@/subgraphs/market-user-state';

interface AaveContextType {
  userState: UserMarketState | null;
  isLoading: boolean;
  error: Error | null;
  refreshUserState: () => Promise<void>;
}

const AaveContext = createContext<AaveContextType | undefined>(undefined);

export const AaveProvider: React.FC<{ 
  children: React.ReactNode;
  request: UserMarketStateRequest;
  graphQlEndpoint: string;
}> = ({ children, request, graphQlEndpoint }) => {
  const [userState, setUserState] = useState<UserMarketState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchUserMarketState(request, graphQlEndpoint);
      setUserState(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
      console.error('Error fetching Aave user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [request.chainId, request.user, request.market]);

  return (
    <AaveContext.Provider 
      value={{ 
        userState, 
        isLoading, 
        error,
        refreshUserState: fetchUserData 
      }}
    >
      {children}
    </AaveContext.Provider>
  );
};

export const useAave = (): AaveContextType => {
  const context = useContext(AaveContext);
  if (context === undefined) {
    throw new Error('useAave must be used within an AaveProvider');
  }
  return context;
};
