'use client'
import { useState } from "react";
import { useCavos } from "@cavos/react";
import { EmailVerificationRequiredError } from "@cavos/react";
import Image from "next/image";

export default function LoginPage() {
  const { login, register, resendVerificationEmail, isLoading } = useCavos();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleFirebaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegisterMode && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      if (isRegisterMode) {
        await register('firebase', { email, password });
      } else {
        await login('firebase', { email, password });
      }
    } catch (err: any) {
      if (
        err instanceof EmailVerificationRequiredError ||
        err.message?.includes('email_not_verified') ||
        err.message?.includes('verify your email') ||
        err.message?.includes('Verification email resent')
      ) {
        setVerificationSent(true);
        setPendingEmail(email);
        setError('');
        return;
      }
      setError(err.message || 'Authentication failed.');
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail(pendingEmail);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-lg text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-secondary leading-[1.1]">
            Check your<br /><span className="italic text-primary">email</span>
          </h1>
          <p className="text-lg text-text-muted mt-6 max-w-md mx-auto leading-relaxed">
            We sent a verification link to <span className="font-semibold text-secondary">{pendingEmail}</span>.
            Verify your email, then come back and sign in.
          </p>

          <div className="mt-10 flex flex-col gap-3 max-w-xs mx-auto">
            <button
              onClick={handleResendVerification}
              className="w-full py-3.5 text-sm font-semibold border-2 border-secondary text-secondary rounded-full hover:bg-secondary hover:text-bg transition-all duration-200"
            >
              Resend verification email
            </button>

            <button
              onClick={() => { setVerificationSent(false); setIsRegisterMode(false); }}
              className="w-full py-3 text-sm font-medium text-text-muted hover:text-secondary transition-colors"
            >
              Back to sign in
            </button>
          </div>

          {error && <p className="text-danger text-sm mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col relative">
      {/* Header */}
      <nav className="w-full px-12 py-10 flex items-center justify-between relative z-10">
        <div className="relative w-10 h-10">
          <Image
            src="/logo.png"
            alt="Cavos Logo"
            fill
            className="object-contain"
          />
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setIsRegisterMode(true); setError(''); }}
          className="px-6 py-2 text-sm font-medium border border-secondary/10 text-secondary/60 rounded-full hover:border-secondary/30 hover:text-secondary transition-all duration-300"
        >
          Create account
        </button>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
        <div className="w-full max-w-4xl text-center space-y-12">
          {/* Hero headline */}
          <div className="space-y-6">
            <h1 className="font-serif text-6xl md:text-8xl font-light tracking-tight text-secondary leading-tight">
              Your AI agent deserves<br />
              <span className="flex items-center justify-center gap-4">
                a better <span className="font-pixel text-primary">wallet</span>
              </span>
            </h1>
            <p className="text-lg text-secondary/40 font-medium">
              Cavos wallets are redefining agentic experience
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-4 text-sm font-bold bg-secondary text-bg rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/5"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-bg p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-black/5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-secondary/40 hover:text-secondary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="text-center mb-8">
              <div className="relative w-12 h-12 mx-auto mb-6">
                <Image
                  src="/logo.png"
                  alt="Cavos Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="font-serif text-3xl font-bold text-secondary mb-2">
                {isRegisterMode ? 'Join the era' : 'Welcome back'}
              </h2>
              <p className="text-sm text-secondary/40">
                {isRegisterMode ? 'Create your agentic wallet' : 'Sign in to your wallet'}
              </p>
            </div>

            {/* Social Login */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => login('google')}
                disabled={isLoading}
                className="w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-white text-black font-medium text-sm rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all border border-gray-200 shadow-sm disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => login('apple')}
                disabled={isLoading}
                className="w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-black text-white font-medium text-sm rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
              >
                <svg width="14" height="18" viewBox="0 0 14 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.6669 13.295C11.6669 13.295 11.2335 13.9213 10.8524 14.4842C10.4357 15.0934 10.0384 15.6563 9.42169 15.6563C8.78835 15.6563 8.60002 15.2656 7.15224 15.2656C5.70446 15.2656 5.48724 15.6337 4.90891 15.6563C4.29335 15.6788 3.82224 15.0033 3.33335 14.2816C2.33835 12.8398 1.05335 10.2038 2.08446 8.35829C2.59057 7.4568 3.49668 6.89384 4.54724 6.87134C5.16224 6.84884 5.75946 7.07384 6.13946 7.07384C6.50168 7.07384 7.20668 6.78134 7.94835 6.80384C8.74446 6.82634 9.57668 7.09634 10.1556 7.81717C10.0833 7.86217 8.61779 8.7405 8.65391 10.8798C8.68946 12.6369 10.4539 13.2677 10.5083 13.2902C10.4994 13.3172 10.4767 13.3938 10.4222 13.4975M8.41891 5.34033C8.76279 4.92283 8.99779 4.33728 8.94335 3.75172C8.36446 3.77422 7.64057 4.13506 7.22446 4.65256C6.88057 5.07006 6.60891 5.67839 6.69946 6.24172C7.33279 6.28672 7.98502 5.92672 8.41891 5.34033Z" />
                </svg>
                Continue with Apple
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-black/5 flex-1" />
              <span className="text-xs text-secondary/30 font-medium">or continue with email</span>
              <div className="h-px bg-black/5 flex-1" />
            </div>

            <form onSubmit={handleFirebaseAuth} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 text-sm bg-black/5 text-secondary placeholder-secondary/30 rounded-2xl outline-none focus:bg-black/10 transition-all duration-300 border border-transparent focus:border-black/5"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-5 py-4 text-sm bg-black/5 text-secondary placeholder-secondary/30 rounded-2xl outline-none focus:bg-black/10 transition-all duration-300 border border-transparent focus:border-black/5"
              />
              {isRegisterMode && (
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-5 py-4 text-sm bg-black/5 text-secondary placeholder-secondary/30 rounded-2xl outline-none focus:bg-black/10 transition-all duration-300 border border-transparent focus:border-black/5"
                />
              )}

              {error && <p className="text-danger text-xs text-center py-2">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 text-sm font-bold bg-secondary text-bg rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : isRegisterMode ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-xs text-secondary/40 mt-6 font-medium">
              {isRegisterMode ? (
                <>Already have an account?{' '}
                  <button onClick={() => { setIsRegisterMode(false); setError(''); }} className="text-primary font-bold hover:underline">
                    Sign in
                  </button>
                </>
              ) : (
                <>Don&apos;t have an account?{' '}
                  <button onClick={() => { setIsRegisterMode(true); setError(''); }} className="text-primary font-bold hover:underline">
                    Create one
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full px-12 py-10 flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-secondary/20 font-bold">
          Self-custodial infrastructure for the agentic era
        </p>
      </footer>
    </div>
  );
}
