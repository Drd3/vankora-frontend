"use client";

import { ReactNode } from "react";
import { Web3Provider } from "@/components/providers/web3-provider";

export default function Providers({ children }: { children: ReactNode }) {
  return <Web3Provider>{children}</Web3Provider>;
}