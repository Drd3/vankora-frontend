"use client"

import { AaveProvider, chainId, evmAddress, UserPositionsRequest } from "@aave/react";
import { client } from "@/client";
import { UserPositionsList } from "./user-positions";
import AaveProtocol from "./protocols/aave-protocol/aave-protocol";

export function AaveWrapper() {
    const request: UserPositionsRequest = {
  user: evmAddress("0xC69A8ACfd379fadc048e40C0075eCf85E395813d"),
  filter: {
    chainIds: [chainId(1)],
  },
};
  return (
    <AaveProvider client={client}>
      <AaveProtocol/>
    </AaveProvider>);
}