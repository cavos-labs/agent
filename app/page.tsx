'use client'
import { useCavos } from "@cavos/react";
import { useEffect } from "react";
import LoginPage from "./login/page";

export default function Home() {
  const { isAuthenticated, isLoading } = useCavos();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Redirect to dashboard
  if (typeof window !== 'undefined') {
    window.location.href = '/agent';
  }

  return null;
}
