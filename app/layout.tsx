
import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import "./globals.css";
import { ExpandableSidebar } from "@/components/ui/sidebar";
import { Web3Provider } from "@/components/providers/web3-provider";
import Navbar from "@/components/ui/navbar";
import { client } from "@/client";
import Aave from "@/components/providers/aave-provider";


const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  weight: "500",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vankora",
  description: "Vankora",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
          className={`${albertSans.variable} ${albertSans.className} font-albert-sans antialiased w-full`}
        >
            <Aave>
              <Web3Provider>
                <div className="w-full">
                  <Navbar />
                  <ExpandableSidebar/>
                  <div className="pl-20 w-full">
                    {children}
                  </div>
                </div>
              </Web3Provider>
            </Aave>
        </body>
    </html>
  );
}
