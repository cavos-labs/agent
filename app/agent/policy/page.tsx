'use client'
import { useState, useEffect } from "react";
import { getTokens } from "@/lib/tokens";
import { useCavos } from "@cavos/react";

interface SpendingLimit {
  token: string;
  limit: string;
}

interface PolicyConfig {
  allowedContracts: string[];
  spendingLimits: SpendingLimit[];
  maxCallsPerTx: number;
  sessionDuration: number; // in seconds
}

const STORAGE_KEY = 'cavos_agent_policy';

function loadPolicy(): PolicyConfig {
  if (typeof window === 'undefined') return getDefaultPolicy();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration: ensure sessionDuration exists
      if (!parsed.sessionDuration) parsed.sessionDuration = 86400;
      return parsed;
    }
  } catch { }
  return getDefaultPolicy();
}

function savePolicy(policy: PolicyConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(policy));
}

function getDefaultPolicy(): PolicyConfig {
  return {
    allowedContracts: [],
    spendingLimits: [],
    maxCallsPerTx: 5,
    sessionDuration: 86400, // 24 hours
  };
}

export default function PolicyPage() {
  const network = (process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'sepolia' | undefined) || 'sepolia';
  const tokens = getTokens(network);

  const [policy, setPolicy] = useState<PolicyConfig>(getDefaultPolicy());
  const [newContract, setNewContract] = useState('');
  const [newLimitToken, setNewLimitToken] = useState('');
  const [newLimitAmount, setNewLimitAmount] = useState('');
  const [saved, setSaved] = useState(false);

  const { address } = useCavos();


  useEffect(() => {
    setPolicy(loadPolicy());
  }, []);

  const addContract = () => {
    if (!newContract.startsWith('0x') || newContract.length < 10) return;
    if (policy.allowedContracts.includes(newContract)) return;
    setPolicy({ ...policy, allowedContracts: [...policy.allowedContracts, newContract] });
    setNewContract('');
  };

  const removeContract = (addr: string) => {
    setPolicy({ ...policy, allowedContracts: policy.allowedContracts.filter(c => c !== addr) });
  };

  const addSpendingLimit = () => {
    if (!newLimitToken || !newLimitAmount) return;

    // Validate address format (basic check for 0x + hex)
    const isValidAddress = /^0x[0-9a-fA-F]+$/.test(newLimitToken) && newLimitToken.length > 50;
    if (!isValidAddress) {
      alert('Invalid token address format. Must be a valid Starknet address (0x...).');
      return;
    }

    if (policy.spendingLimits.some(s => s.token === newLimitToken)) return;
    setPolicy({
      ...policy,
      spendingLimits: [...policy.spendingLimits, { token: newLimitToken, limit: newLimitAmount }],
    });
    setNewLimitToken('');
    setNewLimitAmount('');
  };

  const removeSpendingLimit = (token: string) => {
    setPolicy({ ...policy, spendingLimits: policy.spendingLimits.filter(s => s.token !== token) });
  };

  const handleSave = () => {
    savePolicy(policy);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8 md:mb-16">
        <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-secondary">Policy</h2>
        <p className="text-sm text-secondary/50 font-medium mt-2 md:mt-4 tracking-tight">Configure autonomous session constraints</p>
      </div>

      {/* Allowed Contracts */}
      <div className="bg-bg border border-black/5 rounded-[2.5rem] p-6 md:p-12 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.25em] mb-2">Target Domains</h3>
            <p className="text-sm text-secondary/60 font-medium tracking-tight"> Restrict agent interaction to specific contract addresses</p>
          </div>
        </div>

        {policy.allowedContracts.length > 0 && (
          <div className="space-y-3 mb-8">
            {policy.allowedContracts.map(addr => (
              <div key={addr} className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 bg-black/2 rounded-2xl px-6 py-4 border border-black/2">
                <span className="text-sm font-mono text-secondary/80 tracking-tight break-all">{addr}</span>
                <button
                  onClick={() => removeContract(addr)}
                  className="self-end md:self-auto text-[10px] font-bold text-danger/60 uppercase tracking-widest hover:text-danger/80 transition-all"
                >
                  Terminate
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Contract address (0x...)"
            value={newContract}
            onChange={e => setNewContract(e.target.value)}
            className="flex-1 px-6 py-4 text-sm bg-black/3 text-secondary/80 rounded-2xl outline-none focus:bg-black/5 transition-all duration-300 border border-transparent font-mono placeholder:text-secondary/10"
          />
          <button
            onClick={addContract}
            className="px-8 py-4 text-xs font-bold bg-secondary text-bg rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-black/5"
          >
            Authorize
          </button>
        </div>
      </div>

      {/* Spending Limits */}
      <div className="bg-bg border border-black/5 rounded-[2.5rem] p-12 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="mb-8">
          <h3 className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.25em] mb-2">Resource Allocation</h3>
          <p className="text-sm text-secondary/60 font-medium tracking-tight">Define maximum asset outflow per session</p>
        </div>

        {policy.spendingLimits.length > 0 && (
          <div className="space-y-3 mb-8">
            {policy.spendingLimits.map((sl) => {
              const tokenInfo = tokens.find(t => t.address === sl.token);
              const displayName = tokenInfo ? tokenInfo.symbol : `${sl.token.slice(0, 6)}...${sl.token.slice(-4)}`;

              return (
                <div key={sl.token} className="flex items-center justify-between p-4 bg-black/3 rounded-xl border border-transparent hover:border-black/5 transition-all">
                  <div className="flex items-center">
                    <span className="text-sm font-mono text-secondary/70">{displayName}</span>
                    <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest ml-4">{sl.limit} units</span>
                  </div>
                  <button
                    onClick={() => removeSpendingLimit(sl.token)}
                    className="text-[10px] font-bold text-danger/60 uppercase tracking-widest hover:text-danger/80 transition-all"
                  >
                    Terminate
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 md:max-w-xs">
            <input
              type="text"
              placeholder="0x... (Token Address)"
              value={newLimitToken}
              onChange={e => setNewLimitToken(e.target.value)}
              className="w-full px-6 py-4 text-sm bg-black/3 text-secondary/80 rounded-2xl outline-none focus:bg-black/5 transition-all duration-300 border border-transparent font-mono placeholder:text-secondary/10 pr-12"
            />
            <div className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center">
              <select
                onChange={e => {
                  if (e.target.value) setNewLimitToken(e.target.value);
                }}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                value=""
              >
                <option value="">Select Asset</option>
                {tokens.map(t => (
                  <option key={t.address} value={t.address}>{t.symbol}</option>
                ))}
              </select>
              <span className="text-secondary/20 pointer-events-none">▼</span>
            </div>
          </div>
          <input
            type="number"
            placeholder="Max capacity"
            value={newLimitAmount}
            onChange={e => setNewLimitAmount(e.target.value)}
            className="flex-1 px-6 py-4 text-sm bg-black/3 text-secondary/80 rounded-2xl outline-none focus:bg-black/5 transition-all duration-300 border border-transparent placeholder:text-secondary/10"
          />
          <button
            onClick={addSpendingLimit}
            className="px-8 py-4 text-xs font-bold bg-secondary text-bg rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-black/5 whitespace-nowrap"
          >
            Authorize
          </button>
        </div>
      </div>

      {/* Session Duration */}
      <div className="bg-bg border border-black/5 rounded-[2.5rem] p-12 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="mb-8">
          <h3 className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.25em] mb-2">Temporal Authorization</h3>
          <p className="text-sm text-secondary/60 font-medium tracking-tight">Session key validity duration for agent operations</p>
        </div>

        <div className="flex items-center gap-6">
          <input
            type="number"
            value={policy.sessionDuration / 3600}
            onChange={e => {
              const hours = Math.max(1, parseInt(e.target.value) || 1);
              setPolicy({ ...policy, sessionDuration: hours * 3600 });
            }}
            className="w-32 px-6 py-4 text-lg font-bold bg-black/3 text-secondary/80 rounded-2xl outline-none focus:bg-black/5 transition-all duration-300 border border-transparent text-center"
          />
          <div>
            <span className="text-sm text-secondary/80 font-medium tracking-tight">hours</span>
            <p className="text-xs text-secondary/40 mt-1">~{Math.floor(policy.sessionDuration / 86400)} days</p>
          </div>
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Max Calls per Tx */}
        <div className="bg-bg border border-black/5 rounded-[2.5rem] p-12 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <h3 className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.25em] mb-2">Complexity Gate</h3>
          <p className="text-sm text-secondary/60 font-medium tracking-tight mb-8">Maximum operations per broadcast</p>
          <input
            type="number"
            min={1}
            max={20}
            value={policy.maxCallsPerTx}
            onChange={e => setPolicy({ ...policy, maxCallsPerTx: parseInt(e.target.value) || 5 })}
            className="w-full px-6 py-4 text-sm bg-black/3 text-secondary/80 rounded-2xl outline-none focus:bg-black/5 transition-all duration-300 border border-transparent font-mono"
          />
        </div>

        {/* Action */}
        <div className="bg-bg border border-black/5 rounded-[2.5rem] p-12 flex flex-col justify-center shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <button
            onClick={handleSave}
            className="w-full py-5 text-sm font-bold bg-secondary text-bg rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-black/5 mb-4"
          >
            Commit Changes
          </button>
          {saved && (
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] text-center">
              State Synchronized.
            </p>
          )}

          {/* Persistence Controls */}
          <div className="mt-8 pt-8 border-t border-black/5 flex gap-4">
            <button
              onClick={() => {
                const data = JSON.stringify(policy, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'cavos-policy.json';
                a.click();
              }}
              className="flex-1 py-3 text-xs font-bold bg-black/5 text-secondary/60 rounded-xl hover:bg-black/10 transition-all"
            >
              Export Config
            </button>
            <label className="flex-1 py-3 text-xs font-bold bg-black/5 text-secondary/60 rounded-xl hover:bg-black/10 transition-all text-center cursor-pointer">
              Import Config
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const content = ev.target?.result as string;
                      const parsed = JSON.parse(content);
                      if (parsed.allowedContracts && parsed.spendingLimits) {
                        setPolicy(parsed);
                        savePolicy(parsed);
                        setSaved(true);
                        setTimeout(() => setSaved(false), 2000);
                      } else {
                        alert('Invalid policy file format');
                      }
                    } catch (err) {
                      alert('Error parsing policy file');
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = ''; // Reset input
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div >
  );
}
