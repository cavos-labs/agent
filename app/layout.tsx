'use client'
import { Geist, Geist_Mono, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { CavosProvider } from "@cavos/react";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin"],
});

import { getTokens } from "@/lib/tokens";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sessionDuration, setSessionDuration] = useState<number | undefined>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cavos_session_duration');
      return stored ? parseInt(stored) : undefined;
    }
    return undefined;
  });

  const [policy, setPolicy] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cavos_agent_policy');
        if (stored) {
          const parsed = JSON.parse(stored);
          const network = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';
          const tokens = getTokens(network);

          return {
            allowedContracts: parsed.allowedContracts || [],
            maxCallsPerTx: parsed.maxCallsPerTx || 5,
            spendingLimits: (parsed.spendingLimits || []).map((sl: any) => {
              const token = tokens.find(t => t.address === sl.token);
              const decimals = token?.decimals || 18;
              const limitRaw = BigInt(Math.floor(parseFloat(sl.limit) * Math.pow(10, decimals)));
              return {
                token: sl.token,
                limit: limitRaw
              };
            })
          };
        }
      } catch (e) {
        console.error("Failed to load policy:", e);
      }
    }
    return undefined;
  });

  useEffect(() => {
    const handleStorage = () => {
      const storedDuration = localStorage.getItem('cavos_session_duration');
      if (storedDuration) setSessionDuration(parseInt(storedDuration));

      const storedPolicy = localStorage.getItem('cavos_agent_policy');
      if (storedPolicy) {
        try {
          const parsed = JSON.parse(storedPolicy);
          const network = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';
          const tokens = getTokens(network);
          setPolicy({
            allowedContracts: parsed.allowedContracts || [],
            maxCallsPerTx: parsed.maxCallsPerTx || 5,
            spendingLimits: (parsed.spendingLimits || []).map((sl: any) => {
              const token = tokens.find(t => t.address === sl.token);
              const decimals = token?.decimals || 18;
              const limitRaw = BigInt(Math.floor(parseFloat(sl.limit) * Math.pow(10, decimals)));
              return {
                token: sl.token,
                limit: limitRaw
              };
            })
          });
        } catch (e) { }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <CavosProvider
      config={{
        appId: process.env.NEXT_PUBLIC_CAVOS_APP_ID || "",
        network: (process.env.NEXT_PUBLIC_NETWORK as 'sepolia' | 'mainnet') || 'sepolia',
        enableLogging: false,
        session: {
          sessionDuration: sessionDuration,
          defaultPolicy: policy
        }
      }}
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${pixelifySans.variable} antialiased`}>
          {children}
        </body>
      </html>
    </CavosProvider>
  );
}
