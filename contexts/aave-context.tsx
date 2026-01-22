import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UserMarketState, UserMarketStateRequest, fetchUserMarketState } from '@/subgraphs/market-user-state';
import { UserSuppliesRequest, UserSupply } from '@/types/aave';
import { fetchUserSupplies } from '@/subgraphs/user-supplies';
import { fetchATokens } from '@/subgraphs/market-supplies';

interface AaveContextType {
  userState: UserMarketState | null;
  isLoading: boolean;
  error: Error | null;
  refreshUserState: () => Promise<void>;
  refreshSupplyList: () => Promise<void>;
  isSupplyListLoading: boolean;
  supplyList: UserSupply[] | null;
}

const AaveContext = createContext<AaveContextType | undefined>(undefined);

export const AaveProvider: React.FC<{ 
  children: React.ReactNode;
  request: UserMarketStateRequest;
  graphQlEndpoint: string;
  suppliesRequest: UserSuppliesRequest;
}> = ({ children, request, graphQlEndpoint, suppliesRequest }) => {
  const [userState, setUserState] = useState<UserMarketState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supplyList, setSupplyList] = useState<UserSupply[] | null>(null);
  const [isSupplyListLoading, setIsSupplyListLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSupplyList = async () => {
    setIsSupplyListLoading(true);
    try {
      // Fetch supply list
      const supplies = await fetchUserSupplies(suppliesRequest, graphQlEndpoint);
      
      // Fetch aTokens
      const aTokensResponse = await fetchATokens(
        {
          request: { user: request.user, chainIds: request.chainId },
          reservesRequest: { orderBy: { supplyApy: 'DESC' }, reserveType: 'SUPPLY' }
        },
        graphQlEndpoint
      );

      // Create a map of underlying token address to aToken
      const aTokenMap = new Map<string, any>();
      aTokensResponse.aTokens.forEach(aToken => {
        aTokenMap.set(aToken.underlyingToken.address.toLowerCase(), aToken);
      });

      // Combine supply data with aToken data
      const enhancedSupplies = supplies.map(supply => {
        const underlyingAddress = supply.currency?.address.toLowerCase();
        const aToken = underlyingAddress ? aTokenMap.get(underlyingAddress) : null;
        
        return {
          ...supply,
          aToken: aToken ? {
            address: aToken.address,
            symbol: aToken.symbol,
            name: aToken.name,
            decimals: aToken.decimals
          } : undefined
        };
      });

      setSupplyList(enhancedSupplies);
    } catch (err) {
      console.error('Error fetching supply list:', err);
      setSupplyList(null);
    } finally {
      setIsSupplyListLoading(false);
    }
  };

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
        supplyList,
        isLoading, 
        isSupplyListLoading,
        error,
        refreshUserState: fetchUserData,
        refreshSupplyList: fetchSupplyList
        
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
