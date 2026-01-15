"use client"

import { AaveProvider, chainId, evmAddress, UserPositionsRequest } from "@aave/react";
import { client } from "@/client";
import { UserPositionsList } from "./user-positions";
import AaveProtocol from "./protocols/aave-protocol/aave-protocol";

export function AaveWrapper() {

  return (
    <AaveProvider client={client}>
      <AaveProtocol/>
    </AaveProvider>);
}