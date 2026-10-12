import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService, isSupabaseConfigured, type Profile } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: SupabaseUser, profile: Profile | null) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [discipline, setDiscipline] = useState('Model');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not set in your .env file yet. Please configure them first.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signin') {
        const { user, profile, error } = await authService.signIn(email, password);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          setSuccessMsg('Signed in successfully.');
          setTimeout(() => {
            onAuthSuccess(user, profile);
            onClose();
          }, 600);
        }
      } else {
        const { user, error } = await authService.signUp(email, password, {
          full_name: fullName,
          role,
          discipline,
        });
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          setSuccessMsg('Account created successfully! Check your email to confirm or sign in directly.');
          setTimeout(async () => {
            const profile = await authService.getProfile(user.id);
            onAuthSuccess(user, profile);
            onClose();
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#1C0306] border border-[#EFCEA5]/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-[#F8F4EF]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#EFCEA5]/60 hover:text-[#EFCEA5] transition-colors rounded-lg hover:bg-white/5"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#EFCEA5] animate-pulse" />
            <span className="text-[0.68rem] tracking-[0.2em] uppercase font-semibold text-[#EFCEA5]">
              Studio Authentication
            </span>
          </div>
          <h2 className="text-2xl font-serif text-[#F8F4EF]">
            {mode === 'signin' ? 'Sign In to Workspace' : 'Join the Collective'}
          </h2>
          <p className="text-xs text-[#EFCEA5]/70 mt-1 leading-relaxed">
            {mode === 'signin' 
              ? 'Access Admin CMS curation or your Member creative dashboard.'
              : 'Register your talent dossier for production calls and assignment briefs.'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex p-1 bg-[#2A050A] rounded-xl border border-[#EFCEA5]/15 mb-5 text-xs font-semibold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-[#680F1B] text-[#F8F4EF] shadow-md border border-[#EFCEA5]/30'
                : 'text-[#EFCEA5]/60 hover:text-[#EFCEA5]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#680F1B] text-[#F8F4EF] shadow-md border border-[#EFCEA5]/30'
                : 'text-[#EFCEA5]/60 hover:text-[#EFCEA5]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EFCEA5]/50" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Imo Ekong"
                  className="w-full bg-[#140103] border border-[#EFCEA5]/20 focus:border-[#EFCEA5] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/30 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EFCEA5]/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@teamharvs.com"
                className="w-full bg-[#140103] border border-[#EFCEA5]/20 focus:border-[#EFCEA5] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/30 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EFCEA5]/50" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#140103] border border-[#EFCEA5]/20 focus:border-[#EFCEA5] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/30 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-1.5">
                  Discipline
                </label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full bg-[#140103] border border-[#EFCEA5]/20 focus:border-[#EFCEA5] rounded-xl px-3 py-2.5 text-xs text-[#F8F4EF] focus:outline-none"
                >
                  <option value="Model">Model</option>
                  <option value="Stylist">Stylist</option>
                  <option value="MUA">MUA</option>
                  <option value="Videographer">Videographer</option>
                  <option value="Photographer">Photographer</option>
                  <option value="Assistant">Assistant</option>
                </select>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-1.5">
                  Initial Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
                  className="w-full bg-[#140103] border border-[#EFCEA5]/20 focus:border-[#EFCEA5] rounded-xl px-3 py-2.5 text-xs text-[#F8F4EF] focus:outline-none"
                >
                  <option value="member">Talent Member</option>
                  <option value="admin">Studio Admin</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EFCEA5] hover:bg-[#F8F4EF] text-[#1F0205] text-xs font-semibold uppercase tracking-wider transition-all shadow-lg hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-[#1F0205] border-t-transparent rounded-full" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Enter Workspace' : 'Create Creative Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-5 pt-4 border-t border-[#EFCEA5]/10 text-center">
          <p className="text-[0.68rem] text-[#EFCEA5]/50">
            {isSupabaseConfigured ? (
              <span className="text-emerald-400 font-medium">&bull; Supabase Live Authentication Connected</span>
            ) : (
              <span>Note: Enter credentials in .env to enable cloud authentication.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
