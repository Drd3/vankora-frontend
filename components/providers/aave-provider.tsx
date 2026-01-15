"use client"
import { client } from "@/client";
import { AaveProvider } from "@aave/react";

const Aave = ({children}: {children: React.ReactNode}) => {
    return(
        <AaveProvider client={client}>
            {children}
        </AaveProvider>
    )
}

export default Aave