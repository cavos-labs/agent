'use client'
import { useCavos } from "@cavos/react";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useCavos();

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen bg-bg relative">
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-bg/80 backdrop-blur-md border-b border-black/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-secondary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-sm">Agent Dashboard</span>
        </div>
      </div>

      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 bg-bg p-4 pt-20 md:p-10 overflow-auto w-full md:w-auto">
        {children}
      </main>
    </div>
  );
}
