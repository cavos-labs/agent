'use client'
import { useEffect, useState } from "react";
import { useCavos } from "@cavos/react";
import StatusBadge from "@/components/StatusBadge";
import { getProvider } from "@/lib/rpc";
import { num } from "starknet";

interface SessionInfo {
  key: string;
  registered: boolean;
  expired: boolean;
  canRenew: boolean;
  validUntil?: string;
  renewalDeadline?: string;
  isCurrent?: boolean;
}

export default function SessionsPage() {
  const { address, renewSession, revokeSession, emergencyRevokeAllSessions, cavos } = useCavos();
  const network = (process.env.NEXT_PUBLIC_NETWORK as any) || 'sepolia';

  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [result, setResult] = useState('');
  const [showConfirm, setShowConfirm] = useState<{ type: string; key?: string } | null>(null);

  const fetchSessions = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const provider = getProvider(network);
      const currentSessionPubKey = (cavos as any).oauthManager?.getSession()?.sessionPubKey;

      const SESSION_REGISTERED_KEY = '0x3b884c3fe0cee93e6453d50e9670be6fb54804e1bbbc159a845d9ab244a5ee6';
      const FROM_BLOCK = network === 'mainnet' ? 6600000 : 0;
      const eventsResponse = await provider.getEvents({
        address: address,
        from_block: { block_number: FROM_BLOCK } as any,
        to_block: 'latest',
        keys: [[SESSION_REGISTERED_KEY]],
        chunk_size: 1000,
      });

      const registeredKeys = new Set<string>();
      if (currentSessionPubKey) registeredKeys.add(num.toHex(currentSessionPubKey));

      for (const event of eventsResponse.events) {
        const key = num.toHex(event.data[0]);
        registeredKeys.add(key);
      }

      const block = await provider.getBlock('latest');
      const now = BigInt(block.timestamp);

      const sessionData = await Promise.all(
        Array.from(registeredKeys).map(async (key) => {
          const isCurrent = key === num.toHex(currentSessionPubKey || '0');
          try {
            const res = await provider.callContract({
              contractAddress: address,
              entrypoint: 'get_session',
              calldata: [key],
            });

            const nonce = BigInt(res[0]);
            const validUntil = BigInt(res[2]);
            const renewalDeadline = BigInt(res[3]);
            const registered = nonce !== BigInt(0);

            if (!registered) {
              if (isCurrent) {
                return { key, registered: false, expired: false, canRenew: false, isCurrent: true };
              }
              return null;
            }

            const expired = now >= validUntil;
            const canRenew = expired && now < renewalDeadline;

            return {
              key,
              registered: true,
              expired,
              canRenew,
              validUntil: new Date(Number(validUntil) * 1000).toISOString(),
              renewalDeadline: new Date(Number(renewalDeadline) * 1000).toISOString(),
              isCurrent,
            } as SessionInfo;
          } catch {
            if (isCurrent) return { key, registered: false, expired: false, canRenew: false, isCurrent: true };
            return null;
          }
        })
      );

      setSessions(sessionData.filter((s): s is SessionInfo => s !== null));
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [address, network, cavos]);

  const getStatus = (s: SessionInfo): 'active' | 'expired' | 'renewable' | 'not-registered' => {
    if (!s.registered) return 'not-registered';
    if (s.expired && s.canRenew) return 'renewable';
    if (s.expired) return 'expired';
    return 'active';
  };

  const handleRenew = async () => {
    setActionLoading('renew');
    setResult('');
    try {
      const txHash = await renewSession();
      setResult(`Renewed: ${txHash}`);
      await fetchSessions();
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setActionLoading('');
    }
  };

  const handleRevoke = async (key?: string) => {
    const keyToRevoke = key || (cavos as any).oauthManager?.getSession()?.sessionPubKey;
    if (!keyToRevoke) return;

    setShowConfirm(null);
    setActionLoading(`revoke-${keyToRevoke}`);
    setResult('');
    try {
      const txHash = await revokeSession(keyToRevoke);
      setResult(`Revoked: ${txHash}`);
      await fetchSessions();
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setActionLoading('');
    }
  };

  const handleEmergencyRevoke = async () => {
    setShowConfirm(null);
    setActionLoading('emergency');
    setResult('');
    try {
      const txHash = await emergencyRevokeAllSessions();
      setResult(`All sessions revoked: ${txHash}`);
      await fetchSessions();
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8 md:mb-16">
        <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-secondary">Sessions</h2>
        <p className="text-sm text-secondary/50 font-medium mt-2 md:mt-4 tracking-tight">Active cryptographic authorizations</p>
      </div>

      {loading ? (
        <div className="bg-bg border border-black/5 rounded-[2.5rem] p-6 md:p-12 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <p className="text-sm text-secondary/50 font-medium italic">Scanning on-chain session nodes...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-bg border border-black/5 rounded-[2.5rem] p-6 md:p-12 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <p className="text-sm text-secondary/60 font-medium tracking-tight">No active cryptographic session detected on-chain.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((s) => (
            <div key={s.key} className={`bg-bg border ${s.isCurrent ? 'border-primary/20 bg-primary/5' : 'border-black/5'} rounded-[2.5rem] p-6 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.01)]`}>
              <div className="flex items-center justify-between mb-8 md:mb-10">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.25em]">Session Node</h3>
                  {s.isCurrent && (
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest rounded-full">Current Node</span>
                  )}
                </div>
                <StatusBadge status={getStatus(s)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em] block mb-2">Public Key</span>
                    <p className="text-[10px] font-mono text-secondary/40 font-medium tracking-tighter truncate max-w-[200px]">{s.key}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em] block mb-2">Expirations</span>
                    <p className="text-lg font-mono text-secondary/80 font-medium tracking-tighter">{s.validUntil}</p>
                  </div>
                </div>
                <div className="flex flex-col md:justify-end md:items-end space-y-4">
                  <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.25em]">Operational Status</span>
                  <div className="flex flex-col md:items-end gap-6 w-full">
                    <p className="font-serif text-4xl font-medium text-secondary/90 tracking-tight">
                      {s.expired
                        ? s.canRenew ? 'Renewable' : 'Expired'
                        : 'Operational'}
                    </p>

                    <div className="flex flex-wrap gap-4">
                      {s.isCurrent && s.canRenew && (
                        <button
                          onClick={handleRenew}
                          disabled={!!actionLoading}
                          className="flex-1 md:flex-none px-6 py-2 text-[10px] font-bold border border-black/5 rounded-xl hover:bg-black/2 transition-all disabled:opacity-20 uppercase tracking-widest text-secondary/80"
                        >
                          {actionLoading === 'renew' ? 'Extending...' : 'Extend'}
                        </button>
                      )}
                      {s.isCurrent && (
                        <button
                          onClick={() => {
                            const session = (cavos as any).oauthManager?.getSession();
                            if (!session) {
                              alert('No active session to export');
                              return;
                            }
                            const exportToken = (cavos as any).exportSession();
                            navigator.clipboard.writeText(exportToken);
                            setResult('Session token copied to clipboard! Use: export CAVOS_TOKEN="' + exportToken + '"');
                          }}
                          disabled={!!actionLoading}
                          className="flex-1 md:flex-none px-6 py-2 text-[10px] font-bold border border-primary/20 bg-primary/5 rounded-xl hover:bg-primary/10 transition-all disabled:opacity-20 uppercase tracking-widest text-primary"
                        >
                          Export
                        </button>
                      )}
                      <button
                        onClick={() => setShowConfirm({ type: 'revoke', key: s.key })}
                        disabled={!!actionLoading}
                        className="flex-1 md:flex-none px-6 py-2 text-[10px] font-bold border border-black/5 rounded-xl hover:bg-black/2 transition-all disabled:opacity-20 uppercase tracking-widest text-secondary/80"
                      >
                        {actionLoading === `revoke-${s.key}` ? 'Revoking...' : 'Revoke'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Revoke All */}
      <div className="bg-danger/5 border border-danger/20 rounded-[2.5rem] p-12 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[10px] font-bold text-danger uppercase tracking-[0.25em] mb-2">Emergency Revocation</h3>
            <p className="text-sm text-secondary/60 font-medium tracking-tight">Revoke all active session keys immediately</p>
          </div>
          <button
            onClick={() => setShowConfirm({ type: 'emergency' })}
            disabled={!!actionLoading}
            className="px-8 py-4 text-xs font-bold bg-danger text-bg rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-black/5 disabled:opacity-20"
          >
            {actionLoading === 'emergency' ? 'Revoking All...' : 'Revoke All Sessions'}
          </button>
        </div>
        <p className="text-xs text-danger/60 italic">Irreversible action. Use only if session keys are compromised.</p>
      </div>

      {/* Result Messages */}
      {result && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mt-10">
          <p className="text-sm font-mono text-secondary/80 break-all">{result}</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg rounded-[2.5rem] p-12 max-w-md border border-black/10 shadow-2xl">
            <h3 className="text-xl font-serif font-medium text-secondary mb-6">
              {showConfirm.type === 'emergency' ? 'Confirm Emergency Revocation' : 'Confirm Session Revocation'}
            </h3>
            <p className="text-sm text-secondary/70 mb-8">
              {showConfirm.type === 'emergency'
                ? 'This will immediately revoke ALL active session keys on-chain. Continue?'
                : 'This will revoke the selected session key on-chain. Continue?'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={showConfirm.type === 'emergency' ? handleEmergencyRevoke : () => handleRevoke(showConfirm.key)}
                className="flex-1 px-6 py-3 text-sm font-bold bg-danger text-bg rounded-xl hover:opacity-90 transition-all"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-6 py-3 text-sm font-bold border border-black/10 rounded-xl hover:bg-black/2 transition-all text-secondary/80"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
