'use client'
import { useEffect, useState } from "react";
import { useCavos } from "@cavos/react";
import { getProvider } from "@/lib/rpc";

interface Transaction {
  hash: string;
  type: string;
  status: string;
  timestamp: string;
  details?: string;
}

export default function TransactionsPage() {
  const { address } = useCavos();
  const network = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address) return;
      setLoading(true);

      const allTxs = new Map<string, Transaction>();
      const provider = getProvider(network);

      // 1. Try fetching from Backend API (Legacy/Indexer)
      try {
        const appId = process.env.NEXT_PUBLIC_CAVOS_APP_ID || '';
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cavos.xyz';
        const response = await fetch(
          `${backendUrl}/api/apps/${appId}/wallets/${address}/transactions?network=${network}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.transactions) {
            data.transactions.forEach((tx: Transaction) => allTxs.set(tx.hash, tx));
          }
        }
      } catch {
        // Backend failure is expected if no indexer
      }

      // 2. Fetch from RPC via getEvents (Fallback/Enhancement)
      try {
        const eventsParams = {
          address: address, // Events emitted BY the account
          chunk_size: 50, // Last 50 events
          // Keys: we want ALL events from this address to catch any execution
        };

        const eventsRes = await provider.getEvents(eventsParams as any);

        for (const event of eventsRes.events) {
          if (!allTxs.has(event.transaction_hash)) {
            // We found a tx hash, but we don't have details.
            // We can show it as "Confirmed" with the hash.
            // To get timestamp, we'd need getBlock, but that's expensive for many txs.
            // For now, we just list it.
            allTxs.set(event.transaction_hash, {
              hash: event.transaction_hash,
              type: 'INVOKE', // Assumed
              status: 'SUCCEEDED', // If it emitted an event, it likely succeeded
              timestamp: 'RPC Discovered',
              details: 'Event emitted'
            });
          }
        }
      } catch (err) {
        console.error("RPC fetch failed", err);
      }

      setTransactions(Array.from(allTxs.values()).sort((a, b) => b.timestamp.localeCompare(a.timestamp))); // Rough sort
      setLoading(false);
    };
    fetchTransactions();
  }, [address, network]);

  const explorerUrl = network === 'mainnet'
    ? 'https://voyager.online/tx/'
    : 'https://sepolia.voyager.online/tx/';

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8 md:mb-16">
        <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-secondary">Transactions</h2>
        <p className="text-sm text-secondary/50 font-medium mt-2 md:mt-4 tracking-tight">Financial activity history</p>
      </div>

      <div className="bg-bg border border-black/5 rounded-[2.5rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] overflow-x-auto">
        {loading ? (
          <div className="p-10 md:p-20 text-center text-secondary/50 text-sm font-medium">Synchronizing with network...</div>
        ) : transactions.length === 0 ? (
          <div className="p-10 md:p-20 text-center">
            <p className="text-secondary/60 text-sm font-medium">No activity recorded.</p>
            <p className="text-secondary/40 text-[10px] uppercase font-bold tracking-[0.2em] mt-4">Transactions will appear here after execution</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5 bg-black/1">
                <th className="text-left text-[10px] text-secondary/40 font-bold uppercase tracking-[0.25em] px-10 py-6">Reference</th>
                <th className="text-left text-[10px] text-secondary/40 font-bold uppercase tracking-[0.25em] px-10 py-6">Operation</th>
                <th className="text-left text-[10px] text-secondary/40 font-bold uppercase tracking-[0.25em] px-10 py-6">Condition</th>
                <th className="text-left text-[10px] text-secondary/40 font-bold uppercase tracking-[0.25em] px-10 py-6">Internal Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.hash} className="border-b border-black/3 hover:bg-black/1 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <a
                      href={`${explorerUrl}${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-secondary/80 hover:text-primary transition-colors"
                    >
                      {tx.hash.slice(0, 12)}...{tx.hash.slice(-8)}
                    </a>
                  </td>
                  <td className="px-10 py-6 text-sm text-secondary/60 font-medium tracking-tight">{tx.type}</td>
                  <td className="px-10 py-6">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${tx.status === 'ACCEPTED_ON_L2' || tx.status === 'SUCCEEDED'
                      ? 'bg-primary/10 text-primary'
                      : tx.status === 'REVERTED'
                        ? 'bg-danger/10 text-danger'
                        : 'bg-black/3 text-secondary/50'
                      }`}>
                      {tx.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-[11px] text-secondary/40 font-mono">{tx.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
