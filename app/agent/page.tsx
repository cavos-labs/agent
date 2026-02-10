'use client'
import { useEffect, useState, useCallback } from "react";
import { useCavos } from "@cavos/react";
import StatusBadge from "@/components/StatusBadge";
import { getProvider, getERC20Balance, formatBalance } from "@/lib/rpc";
import { getTokens, TokenInfo } from "@/lib/tokens";

export default function DashboardOverview() {
  const { address, user, isAccountDeployed, deployAccount, walletStatus, logout, execute, registerCurrentSession, exportSession, cavos } = useCavos();
  const network = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';
  const tokens = getTokens(network);

  const [deployed, setDeployed] = useState<boolean | null>(null);
  const [balances, setBalances] = useState<Record<string, bigint>>({});
  const [isDeploying, setIsDeploying] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedSession, setExportedSession] = useState('');
  const [exportCopied, setExportCopied] = useState(false);

  // Transfer state
  const [transferToken, setTransferToken] = useState('STRK');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState('');

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    const provider = getProvider(network);
    const results: Record<string, bigint> = {};
    for (const token of tokens) {
      try {
        results[token.symbol] = await getERC20Balance(provider, token.address, address);
      } catch {
        results[token.symbol] = BigInt(0);
      }
    }
    setBalances(results);
  }, [address, network, tokens]);

  useEffect(() => {
    const checkDeployment = async () => {
      try {
        const result = await isAccountDeployed();
        setDeployed(result);
      } catch {
        setDeployed(false);
      }
    };
    checkDeployment();
    fetchBalances();

    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [isAccountDeployed, fetchBalances]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await deployAccount();
      setDeployed(true);
    } catch (err: any) {
      console.error('Deploy failed:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await registerCurrentSession();
    } catch (err: any) {
      console.error('Activation failed:', err);
    } finally {
      setIsActivating(false);
    }
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferring(true);
    setTransferResult('');
    try {
      const token = tokens.find(t => t.symbol === transferToken);
      if (!token) throw new Error('Token not found');

      const amountWei = BigInt(Math.floor(parseFloat(transferAmount) * 1e18));
      const mask128 = (BigInt(1) << BigInt(128)) - BigInt(1);
      const u256Low = (amountWei & mask128).toString();
      const u256High = (amountWei >> BigInt(128)).toString();

      const txHash = await execute({
        contractAddress: token.address,
        entrypoint: 'transfer',
        calldata: [transferTo, u256Low, u256High],
      });
      setTransferResult(`Success: ${txHash}`);
      setTransferTo('');
      setTransferAmount('');
      fetchBalances();
    } catch (err: any) {
      setTransferResult(`Error: ${err.message}`);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-16 gap-4">
        <div>
          <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-secondary">Overview</h2>
          <p className="text-sm text-secondary/50 font-medium mt-2 md:mt-4 tracking-tight">Advanced agentic wallet infrastructure</p>
        </div>
        <button
          onClick={logout}
          className="self-start md:self-auto px-6 py-2 text-[10px] font-bold text-secondary/60 uppercase tracking-[0.2em] border border-black/5 rounded-full hover:border-black/10 hover:text-secondary/80 transition-all duration-300"
        >
          Sign out
        </button>
      </div>

      {/* Wallet Card */}
      <div className="bg-bg border border-black/5 rounded-[2.5rem] p-6 md:p-12 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-6 w-full">
            <div>
              <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em] mb-4">Wallet Identity</p>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <p className="text-xl md:text-2xl font-mono font-medium text-secondary/80 tracking-tighter break-all">
                  {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : '—'}
                </p>
                <button
                  onClick={handleCopy}
                  className="self-start px-5 py-2 text-[10px] font-bold bg-black/3 text-secondary/60 rounded-full hover:bg-black/6 transition-all duration-300"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            {user?.email && (
              <div className="flex items-center gap-2.5 text-sm text-secondary/50 font-medium tracking-tight">
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {user.email}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={deployed ? 'deployed' : 'not-deployed'} />
            {walletStatus.isReady && <StatusBadge status="active" />}
          </div>
        </div>

        {deployed === false && (
          <button
            onClick={handleDeploy}
            disabled={isDeploying || walletStatus.isDeploying}
            className="mt-10 px-10 py-4 text-sm font-bold bg-secondary text-bg rounded-2xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 shadow-xl shadow-black/5 active:scale-[0.98]"
          >
            {isDeploying || walletStatus.isDeploying ? 'Deploying...' : 'Initialize Agent'}
          </button>
        )}

        {/* Export Session - Always Available */}
        {deployed === true && (
          <div className="mt-6">
            <div className="bg-black/3 border border-black/5 rounded-xl p-4 mb-4">
              <p className="text-sm text-secondary/60 font-medium">
                <strong className="text-secondary/80">One Session Per Login:</strong> Your login creates a single session key. You can export it for CLI use or register it on-chain for gasless transactions.
              </p>
            </div>
            <button
              onClick={() => {
                try {
                  const token = exportSession();
                  setExportedSession(token);
                  setShowExportModal(true);
                } catch (err: any) {
                  console.error('Export failed:', err);
                }
              }}
              className="px-8 py-4 text-sm font-bold bg-black/5 text-secondary/80 border border-black/10 rounded-2xl hover:bg-black/10 transition-all duration-300 shadow-lg shadow-black/5 active:scale-[0.98]"
            >
              Export Session for CLI
            </button>
          </div>
        )}

        {/* Activation - Only When Not Active */}
        {deployed === true && !walletStatus.isSessionActive && (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isActivating}
            className="mt-4 px-10 py-4 text-sm font-bold bg-primary text-bg rounded-2xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 shadow-xl shadow-black/5 active:scale-[0.98]"
          >
            {isActivating ? 'Activating...' : 'Activate Session'}
          </button>
        )}
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        {tokens.map((token) => (
          <div key={token.symbol} className="bg-bg border border-black/5 rounded-[2.5rem] p-10 group hover:border-black/10 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.25em] mb-8">{token.name}</p>
            <div className="flex items-baseline gap-4">
              <p className="font-serif text-6xl font-medium tracking-tight text-secondary/90">
                {balances[token.symbol] !== undefined
                  ? formatBalance(balances[token.symbol])
                  : '—'}
              </p>
              <p className="text-xs font-bold text-secondary/40 uppercase tracking-[0.2em]">{token.symbol}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Dispatch section */}
      <div className="bg-bg border border-black/5 rounded-[2.5rem] overflow-hidden">
        <div className="px-6 py-6 md:px-12 md:py-8 border-b border-black/5">
          <h3 className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em]">Asset Dispatch</h3>
        </div>
        <div className="p-6 md:p-12">
          <form onSubmit={handleTransfer} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em] px-1">Token</label>
                <select
                  value={transferToken}
                  onChange={e => setTransferToken(e.target.value)}
                  className="w-full px-6 py-4.5 text-sm bg-black/3 text-secondary/80 rounded-2xl outline-none focus:bg-black/5 transition-all duration-300 border border-transparent appearance-none"
                >
                  {tokens.map(t => (
                    <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="block text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em] px-1">Amount</label>
                <input
                  type="text"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  required
                  className="w-full px-6 py-4.5 text-sm bg-black/3 text-secondary/80 rounded-2xl outline-none focus:bg-black/5 transition-all duration-300 border border-transparent font-mono placeholder:text-secondary/10"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em] px-1">Destination Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={transferTo}
                onChange={e => setTransferTo(e.target.value)}
                required
                className="w-full px-6 py-4.5 text-sm bg-black/3 text-secondary/80 rounded-2xl outline-none focus:bg-black/5 transition-all duration-300 border border-transparent font-mono placeholder:text-secondary/10"
              />
            </div>
            <button
              type="submit"
              disabled={isTransferring}
              className="px-12 py-4.5 text-sm font-bold bg-secondary text-bg rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/5 disabled:opacity-50"
            >
              {isTransferring ? 'Processing...' : 'Execute Transfer'}
            </button>
          </form>
          {transferResult && (
            <div className={`mt-10 p-5 rounded-2xl text-xs font-mono break-all ${transferResult.startsWith('Error') ? 'bg-danger/5 text-danger/80' : 'bg-success/5 text-success/80'}`}>
              {transferResult}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-bg rounded-3xl p-10 max-w-md shadow-2xl border border-black/5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-serif mb-4 text-secondary">Confirm Session Registration</h3>
            <div className="bg-black/3 border border-black/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-secondary/70">
                <strong className="text-secondary/90">Important:</strong> Make sure your session policy is correct before registering.
              </p>
              <p className="text-sm text-secondary/60 mt-2">
                Review your allowed contracts, spending limits, and session duration in the{' '}
                <a href="/agent/policy" className="text-primary underline font-semibold">Policy page</a>.
              </p>
            </div>
            <p className="text-sm text-secondary/60 mb-6">
              This will register your session key on-chain, enabling gasless transactions within your policy limits.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-3 text-sm font-bold bg-black/5 text-secondary/70 rounded-xl hover:bg-black/10 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  await handleActivate();
                }}
                className="px-8 py-3 text-sm font-bold bg-primary text-bg rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg"
              >
                Confirm & Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Session Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowExportModal(false)}>
          <div className="bg-bg rounded-3xl p-10 max-w-2xl shadow-2xl border border-black/5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-serif mb-4 text-secondary">Export Session for CLI</h3>
            <p className="text-sm text-secondary/60 mb-4">
              Copy this token to use with the Cavos CLI:
            </p>
            <div className="bg-black/3 rounded-xl p-4 mb-6 font-mono text-xs break-all text-secondary/80 max-h-40 overflow-y-auto">
              {exportedSession}
            </div>
            <p className="text-sm text-secondary/50 mb-6">
              Usage: <code className="bg-black/5 px-2 py-1 rounded font-mono text-xs">cavos session import {'<token>'}</code>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportCopied(false);
                }}
                className="px-6 py-3 text-sm font-bold bg-black/5 text-secondary/70 rounded-xl hover:bg-black/10 transition-all duration-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportedSession);
                  setExportCopied(true);
                  setTimeout(() => setExportCopied(false), 2000);
                }}
                className="px-8 py-3 text-sm font-bold bg-secondary text-bg rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg"
              >
                {exportCopied ? '✓ Copied!' : 'Copy Token'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
