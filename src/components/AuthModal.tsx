'use client';

import React, { useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Database,
  ExternalLink
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { id: string; email: string; name: string }) => void;
  onOpenSupabaseConfig: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onOpenSupabaseConfig,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const supabase = getSupabase();

    // If Supabase is not configured yet, support instant local account creation
    if (!supabase) {
      setTimeout(() => {
        setIsLoading(false);
        if (mode === 'signup' && !name) {
          setErrorMsg('Please enter your name');
          return;
        }
        const fallbackName = name || email.split('@')[0] || 'Competitive Coder';
        onAuthSuccess({
          id: `usr_${Date.now()}`,
          email: email.trim(),
          name: fallbackName,
        });
        onClose();
      }, 400);
      return;
    }

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        if (data.user) {
          const displayName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Coder';
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email || email,
            name: displayName,
          });
          onClose();
        }
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          if (data.session) {
            onAuthSuccess({
              id: data.user.id,
              email: data.user.email || email,
              name: name.trim() || 'Coder',
            });
            onClose();
          } else {
            setSuccessMsg('Account created! Please check your email inbox to verify your account.');
          }
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) throw error;
        setSuccessMsg('Password reset instructions dispatched to your email.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-dark-700 p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'signin' && 'Sign In to DSA Flow'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {configured ? (
              <span className="text-emerald-400 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync enabled via Supabase PostgreSQL
              </span>
            ) : (
              <span className="text-amber-400 flex items-center justify-center gap-1 cursor-pointer hover:underline" onClick={onOpenSupabaseConfig}>
                <Database className="w-3.5 h-3.5" />
                Local Mode active. Click to connect Supabase project
              </span>
            )}
          </p>
        </div>

        {/* Mode Switcher */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-dark-900 border border-dark-800 mb-5 text-xs font-semibold">
            <button
              onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error / Success alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karthik"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {mode === 'forgot' && (
          <div className="text-center mt-4">
            <button
              onClick={() => setMode('signin')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
