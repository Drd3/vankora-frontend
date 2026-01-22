"use client"

import AaveProtocol from "@/components/protocols/aave-protocol/aave-protocol"
import { AaveProvider } from "@/contexts/aave-context"
import { UserMarketStateRequest } from "@/subgraphs/market-user-state"
import { UserSuppliesRequest } from "@/types/aave"

const request: UserMarketStateRequest = {
    chainId: 8453,
    market: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
    user: "0xC69A8ACfd379fadc048e40C0075eCf85E395813d"
}

const suppliesRequest: UserSuppliesRequest  = {
  user: "0xC69A8ACfd379fadc048e40C0075eCf85E395813d",
  markets: [
    {
      chainId: 8453,
      address: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"
    }
  ],
  collateralsOnly: false,
  orderBy: {
    balance: "ASC"
  }
};

const AaveProtocolPage = () => {
    return (
        <AaveProvider 
            request={request} 
            graphQlEndpoint={"https://api.v3.aave.com/graphql"}
            suppliesRequest={suppliesRequest}
        >
            <AaveProtocol />
        </AaveProvider>
    )
}

export default AaveProtocolPage