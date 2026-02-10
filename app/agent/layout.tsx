'use client'
import { useCavos } from "@cavos/react";
import Sidebar from "@/components/Sidebar";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useCavos();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-bg p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
