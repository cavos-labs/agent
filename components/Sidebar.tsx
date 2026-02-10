'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useCavos } from "@cavos/react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: '/agent', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { href: '/agent/quickstart', label: 'Quickstart', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { href: '/agent/transactions', label: 'Transactions', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
  { href: '/agent/policy', label: 'Policy', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { href: '/agent/sessions', label: 'Sessions', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { address, getAssociatedWallets, switchWallet } = useCavos();
  const [wallets, setWallets] = useState<{ address: string; name?: string }[]>([]);

  useEffect(() => {
    getAssociatedWallets().then(setWallets);
  }, [getAssociatedWallets]);

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <aside className="w-68 min-h-screen bg-bg border-r border-black/5 flex flex-col pt-2 shadow-[20px_0_40px_rgba(0,0,0,0.01)]">
      {/* Brand */}
      <div className="px-8 py-12">
        <div className="flex flex-col gap-6">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>

          {/* Wallet Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-secondary/40 uppercase font-bold tracking-widest">Active Agent Wallet</p>
              <button
                onClick={() => {
                  const name = prompt('Enter a name for the new wallet (e.g. trading, vault):');
                  if (name) {
                    switchWallet(name).then(() => {
                      getAssociatedWallets().then(setWallets);
                    });
                  }
                }}
                className="text-secondary/40 hover:text-secondary transition-colors p-1"
                title="Create New Wallet"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <select
                value={address || ''}
                onChange={(e) => {
                  const wallet = wallets.find(w => w.address === e.target.value);
                  switchWallet(wallet?.name);
                }}
                className="w-full bg-black/2 border border-black/5 rounded-xl px-3 py-2 text-[12px] font-medium text-secondary appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all hover:bg-black/5"
              >
                {wallets.length === 0 && address && (
                  <option value={address}>{shortenAddress(address)}</option>
                )}
                {wallets.map((w) => (
                  <option key={w.address} value={w.address}>
                    {w.name ? `${w.name} (${shortenAddress(w.address)})` : shortenAddress(w.address)}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary/40">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-5 pt-0">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/agent' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] mb-2 transition-all duration-300 ${isActive
                ? 'bg-black/5 text-secondary font-bold shadow-sm'
                : 'text-secondary/60 hover:text-secondary hover:bg-black/2'
                }`}
            >
              <svg className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-current/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-10 py-10 border-t border-black/5">
        <p className="text-[10px] text-secondary/40 uppercase font-bold tracking-[0.2em]">Infrastructure node v0.1</p>
      </div>
    </aside>
  );
}
