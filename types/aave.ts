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
    raw: string;
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