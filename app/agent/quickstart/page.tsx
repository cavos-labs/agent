'use client'

export default function QuickstartPage() {
    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="mb-16">
                <h2 className="font-serif text-6xl font-medium tracking-tight text-secondary">Quickstart</h2>
                <p className="text-sm text-secondary/50 font-medium mt-4 tracking-tight">Get your agent operational in 60 seconds</p>
            </div>

            {/* Step 1 */}
            <div className="bg-bg border border-black/5 rounded-[2.5rem] p-12 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <div className="flex items-start gap-8">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">1</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-serif font-medium text-secondary/90 mb-4">Configure Policy</h3>
                        <p className="text-sm text-secondary/60 font-medium tracking-tight mb-6">
                            Navigate to <span className="px-2 py-1 bg-black/5 rounded text-xs font-mono">Policy</span> and define your agent's operational constraints:
                        </p>
                        <ul className="space-y-3 text-sm text-secondary/70 font-medium">
                            <li className="flex items-start gap-3">
                                <span className="text-primary/60 text-lg">→</span>
                                <span><strong>Target Domains</strong>: Add contract addresses your agent can interact with</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary/60 text-lg">→</span>
                                <span><strong>Resource Allocation</strong>: Set maximum spending limits per token (e.g., 100 STRK)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary/60 text-lg">→</span>
                                <span><strong>Temporal Authorization</strong>: Configure session duration (default: 24 hours)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Step 2 */}
            <div className="bg-bg border border-black/5 rounded-[2.5rem] p-12 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <div className="flex items-start gap-8">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">2</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-serif font-medium text-secondary/90 mb-4">Provision Agent Session</h3>
                        <p className="text-sm text-secondary/60 font-medium tracking-tight mb-6">
                            Once your policy is configured, click <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold">Provision Agent Session</span> at the bottom of the Policy page.
                        </p>
                        <p className="text-sm text-secondary/60 font-medium tracking-tight">
                            This generates a cryptographic session key, registers it on-chain, and provides you with a base64 token for your CLI.
                        </p>
                    </div>
                </div>
            </div>

            {/* Step 3 */}
            <div className="bg-bg border border-black/5 rounded-[2.5rem] p-12 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <div className="flex items-start gap-8">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">3</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-serif font-medium text-secondary/90 mb-4">Export & Import to CLI</h3>
                        <p className="text-sm text-secondary/60 font-medium tracking-tight mb-6">
                            After provisioning, you'll see a session token. Copy it and set it as an environment variable:
                        </p>
                        <div className="bg-black/5 rounded-xl p-6 border border-black/5 font-mono text-xs text-secondary/80">
                            <code>export CAVOS_TOKEN="eyJzZXNz..."</code>
                        </div>
                        <p className="text-sm text-secondary/50 font-medium tracking-tight mt-4 italic">
                            Or use <span className="font-mono text-xs">cavos session import &lt;token&gt;</span> to save it locally.
                        </p>
                    </div>
                </div>
            </div>

            {/* Step 4 */}
            <div className="bg-bg border border-black/5 rounded-[2.5rem] p-12 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <div className="flex items-start gap-8">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">4</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-serif font-medium text-secondary/90 mb-4">Execute Commands</h3>
                        <p className="text-sm text-secondary/60 font-medium tracking-tight mb-6">
                            Your agent is now operational. Common commands:
                        </p>
                        <div className="space-y-4">
                            <div className="bg-black/5 rounded-xl p-6 border border-black/5">
                                <code className="font-mono text-xs text-secondary/80 block mb-2">cavos whoami</code>
                                <p className="text-xs text-secondary/50">Verify session and wallet address</p>
                            </div>
                            <div className="bg-black/5 rounded-xl p-6 border border-black/5">
                                <code className="font-mono text-xs text-secondary/80 block mb-2">cavos balance</code>
                                <p className="text-xs text-secondary/50">Check token balances</p>
                            </div>
                            <div className="bg-black/5 rounded-xl p-6 border border-black/5">
                                <code className="font-mono text-xs text-secondary/80 block mb-2">cavos transfer --to 0x... --amount 1.5 --token STRK</code>
                                <p className="text-xs text-secondary/50">Transfer tokens</p>
                            </div>
                            <div className="bg-black/5 rounded-xl p-6 border border-black/5">
                                <code className="font-mono text-xs text-secondary/80 block mb-2">cavos policy show</code>
                                <p className="text-xs text-secondary/50">View spending limits and usage</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monitoring */}
            <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-12 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] mb-4">Active Monitoring</h3>
                <p className="text-sm text-secondary/70 font-medium tracking-tight mb-6">
                    All agent transactions appear in <span className="px-2 py-1 bg-primary/10 rounded text-xs font-mono text-primary">Transactions</span> in real-time.
                    You can also view all active sessions in <span className="px-2 py-1 bg-primary/10 rounded text-xs font-mono text-primary">Sessions</span> and revoke them at any time.
                </p>
                <p className="text-sm text-secondary/60 font-medium tracking-tight">
                    <strong className="text-secondary/80">Security Tip</strong>: Always set conservative spending limits and restrict allowed contracts to the minimum necessary for your agent's task.
                </p>
            </div>
        </div>
    );
}
