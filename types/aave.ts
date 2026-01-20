export interface UserSuppliesRequest {
  user: string; // Address
  markets: Array<{
    chainId: number;
    address: string;
  }>;
  collateralsOnly?: boolean;
  orderBy?: {
    balance?: 'ASC' | 'DESC';
  };
}
export interface UserSupply {
  balance: {
    usd: string;
    amount: {
      value: string;
    };
  };
  apy: {
    raw: string | undefined;
    value: string;
    decimals: number;
    formatted: string;
  };
  currency: {
    imageUrl: string;
    name: string;
    address: string;
    symbol: string;
    decimals: number;
  };
}

export interface UserBorrow {
  debt: {
    amount: {
      value: string;
    };
  };
  apy?: {
    decimals: number;
    raw?: string;
    value?: string;
    formatted?: string;
  };
  currency: {
    imageUrl: string;
    name: string;
    address: string;
    symbol: string;
    decimals: number;
  };
}