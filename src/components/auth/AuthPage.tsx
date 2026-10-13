import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Camera,
  Scissors,
  Palette,
  Film,
  Users
} from 'lucide-react';
import { authService, isSupabaseConfigured, type Profile } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthPageProps {
  onBackToSite: () => void;
  onAuthSuccess: (user: SupabaseUser | { id: string; email: string }, profile: Profile) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onBackToSite,
  onAuthSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [discipline, setDiscipline] = useState('Model');
  const [portfolio, setPortfolio] = useState('');
  const [phone, setPhone] = useState('');

  // Status & states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active showcase image for the editorial side
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const editorialVisuals = [
    {
      src: '/assets/images/editorial_hero.jpg',
      tag: 'Look 01 // Crimson Architecture',
      quote: '“Fashion is not merely garment; it is identity sculpted in silence and motion.”',
      author: 'Studio Harvs Editorial Dossier'
    },
    {
      src: '/assets/images/avant_garde_fashion.jpg',
      tag: 'Look 02 // Double-Breasted Tailoring',
      quote: '“Structure meets raw individuality across the West African contemporary landscape.”',
      author: 'Team Harvs Lookbook Issue 01'
    },
    {
      src: '/assets/images/campaign_lookbook.jpg',
      tag: 'Look 03 // Metropolitan Grain',
      quote: '“Connecting visionary models, stylists, and cinematographers into one collective pulse.”',
      author: 'Production Directive 2026'
    }
  ];

  const disciplines = [
    { id: 'Model', label: 'Model', icon: User },
    { id: 'Stylist', label: 'Stylist', icon: Scissors },
    { id: 'MUA', label: 'Makeup Artist', icon: Palette },
    { id: 'Videographer', label: 'Videographer', icon: Film },
    { id: 'Photographer', label: 'Photographer', icon: Camera },
    { id: 'Assistant', label: 'Assistant', icon: Users },
  ];

  // Check if active session already exists in localStorage/Supabase
  React.useEffect(() => {
    async function checkExisting() {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          const userProfile: Profile = profile || {
            id: session.user.id,
            email: session.user.email || '',
            full_name: (session.user.user_metadata?.full_name as string) || session.user.email?.split('@')[0] || '',
            role: 'member',
            status: 'active'
          };
          onAuthSuccess(session.user, userProfile);
        }
      } catch (e) {
        console.warn('Existing session check failed:', e);
      }
    }
    checkExisting();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase credentials are not configured in your .env file.');
      setLoading(false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === 'signin') {
        const { user, profile, error } = await authService.signIn(cleanEmail, password);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          // Resolved profile determines whether they access Admin or Member portal!
          const userProfile: Profile = profile || {
            id: user.id,
            email: user.email || cleanEmail,
            full_name: (user.user_metadata?.full_name as string) || cleanEmail.split('@')[0],
            role: 'member',
            status: 'active'
          };

          setSuccessMsg(`Welcome, ${userProfile.full_name || 'Creative'}. Accessing ${userProfile.role === 'admin' ? 'Studio Director Command Center' : 'Member Workspace'}...`);
          setTimeout(() => {
            onAuthSuccess(user, userProfile);
          }, 600);
        }
      } else {
        // Registering as a talent member - role is always strictly 'member'
        const { user, error } = await authService.signUp(cleanEmail, password, {
          full_name: fullName.trim(),
          discipline,
          role: 'member',
        });

        if (error) {
          setErrorMsg(error);
        } else if (user) {
          setSuccessMsg('Creative talent account created! If email confirmation is enabled on your Supabase project, please check your inbox to verify.');
          setTimeout(async () => {
            const profile = await authService.getProfile(user.id);
            const userProfile: Profile = profile || {
              id: user.id,
              email: user.email || email,
              full_name: fullName || email.split('@')[0],
              role: 'member',
              discipline,
              status: 'active'
            };
            onAuthSuccess(user, userProfile);
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0203] text-[#F8F4EF] flex flex-col lg:flex-row antialiased selection:bg-[#EFCEA5] selection:text-[#1F0205]">
      
      {/* ==============================================================
          LEFT COLUMN: Cinematic Editorial Visual & Brand Manifesto
          ============================================================== */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 min-h-screen flex-col justify-between p-12 lg:p-16 overflow-hidden border-r border-[#EFCEA5]/10">
        
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          <img 
            src={editorialVisuals[activeImageIndex].src} 
            alt="Team Harvs Editorial" 
            className="w-full h-full object-cover scale-105 transition-all duration-1000 ease-out"
          />
          {/* Multi-layered luxury gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0203] via-[#0C0203]/65 to-[#0C0203]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0C0203]/30 to-[#0C0203]" />
          <div className="absolute inset-0 bg-[#280307]/40 mix-blend-multiply" />
        </div>

        {/* Top Header & Monogram */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={onBackToSite}
            className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#170204]/70 backdrop-blur-md border border-[#EFCEA5]/20 hover:border-[#EFCEA5] text-[#EFCEA5] text-xs font-semibold uppercase tracking-wider transition-all hover:bg-[#170204]"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Portfolio</span>
          </button>

          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-[0.68rem] tracking-[0.24em] uppercase text-[#EFCEA5] font-semibold block">
                Team Harvs
              </span>
              <span className="text-[0.6rem] tracking-[0.16em] uppercase text-[#EFCEA5]/60 font-mono">
                Studio Portal // Nigeria
              </span>
            </div>
            <img 
              src="/assets/th-monogram-cream.png" 
              alt="Monogram" 
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        {/* Center Editorial Quote & Manifesto */}
        <div className="relative z-10 my-auto py-12 max-w-xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFCEA5]/15 border border-[#EFCEA5]/30 text-[#EFCEA5] text-[0.68rem] font-semibold uppercase tracking-widest mb-5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {editorialVisuals[activeImageIndex].tag}
          </span>

          <blockquote className="text-2xl xl:text-3xl font-serif text-[#F8F4EF] leading-snug tracking-wide italic">
            {editorialVisuals[activeImageIndex].quote}
          </blockquote>

          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#EFCEA5]/80 font-sans font-semibold">
            &mdash; {editorialVisuals[activeImageIndex].author}
          </p>

          {/* Visual Ticker Controls */}
          <div className="flex items-center gap-2 mt-8">
            {editorialVisuals.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  activeImageIndex === idx 
                    ? 'w-8 bg-[#EFCEA5]' 
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Coordinates & Tag */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-[#EFCEA5]/15 text-xs text-[#EFCEA5]/70">
          <span className="text-[0.68rem] font-mono tracking-widest uppercase">
            05°02′N 07°55′E &bull; Uyo, Akwa Ibom State
          </span>
          <span className="text-[0.65rem] font-mono tracking-widest uppercase text-[#EFCEA5]/50">
            Collective Production Hub
          </span>
        </div>

      </div>

      {/* ==============================================================
          RIGHT COLUMN: Minimalist, Spacious Editorial Form
          ============================================================== */}
      <div className="flex-1 min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-20 max-w-xl w-full mx-auto">
        
        {/* Mobile Header / Quick Back */}
        <div className="flex items-center justify-between lg:hidden pb-6 border-b border-[#EFCEA5]/15">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-1.5 text-xs text-[#EFCEA5] font-semibold uppercase tracking-wider hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Portfolio
          </button>
          <img src="/assets/th-monogram-cream.png" alt="TH" className="w-7 h-7 object-contain" />
        </div>

        {/* Main Form Canvas */}
        <div className="my-auto py-8">
          
          {/* Header Title */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFCEA5]/10 border border-[#EFCEA5]/20 text-[#EFCEA5] text-[0.68rem] uppercase font-semibold tracking-widest mb-3">
              <Sparkles className="w-3 h-3 text-[#EFCEA5]" /> Studio Portal Access
            </span>

            <h1 className="text-3xl sm:text-4xl font-serif text-[#F8F4EF] tracking-tight">
              {mode === 'signin' ? 'Sign In to Studio' : 'Register Creative Account'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#EFCEA5]/70 leading-relaxed font-sans">
              {mode === 'signin'
                ? 'Sign in to access your profile. Studio Directors access the CMS, while talent members access assigned call sheets and shoot briefs.'
                : 'Join the Team Harvs talent network across fashion, styling, makeup, photography, and cinematography.'}
            </p>
          </div>

          {/* Sign In vs Register Toggle */}
          <div className="flex p-1 bg-[#170204] rounded-xl border border-[#EFCEA5]/15 mb-8 text-xs font-semibold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-3 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-[#EFCEA5] text-[#1F0205] shadow-md font-bold'
                  : 'text-[#EFCEA5]/60 hover:text-[#EFCEA5]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-3 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-[#EFCEA5] text-[#1F0205] shadow-md font-bold'
                  : 'text-[#EFCEA5]/60 hover:text-[#EFCEA5]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-3 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{successMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {mode === 'signup' && (
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EFCEA5]/50" />
                  <input
                    type="text"
                    required
                    autoCapitalize="words"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Imo Ekong"
                    className="w-full bg-[#170204] border border-[#EFCEA5]/20 focus:border-[#EFCEA5] rounded-xl pl-11 pr-4 py-3.5 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/30 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EFCEA5]/50" />
                <input
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#170204] border border-[#EFCEA5]/20 focus:border-[#EFCEA5] rounded-xl pl-11 pr-4 py-3.5 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/30 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EFCEA5]/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#170204] border border-[#EFCEA5]/20 focus:border-[#EFCEA5] rounded-xl pl-11 pr-11 py-3.5 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/30 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EFCEA5]/50 hover:text-[#EFCEA5]"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                {/* Creative Discipline Selector */}
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-2">
                    Creative Discipline
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {disciplines.map((item) => {
                      const Icon = item.icon;
                      const isSelected = discipline === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDiscipline(item.id)}
                          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                            isSelected
                              ? 'bg-[#EFCEA5] text-[#1F0205] border-[#EFCEA5]'
                              : 'bg-[#170204] text-[#EFCEA5]/70 border-[#EFCEA5]/15 hover:border-[#EFCEA5]/40 hover:text-[#EFCEA5]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-1.5">
                      Instagram / Portfolio
                    </label>
                    <input
                      type="text"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      placeholder="@handle or portfolio URL"
                      className="w-full bg-[#170204] border border-[#EFCEA5]/20 focus:border-[#EFCEA5] rounded-xl px-4 py-3 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/30 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#EFCEA5] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234..."
                      className="w-full bg-[#170204] border border-[#EFCEA5]/20 focus:border-[#EFCEA5] rounded-xl px-4 py-3 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/30 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl bg-[#EFCEA5] hover:bg-[#F8F4EF] text-[#1F0205] text-xs font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-[#1F0205] border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Complete Creative Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer & Cloud Status Info */}
        <div className="pt-6 border-t border-[#EFCEA5]/15 flex items-center justify-between text-xs text-[#EFCEA5]/60">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{isSupabaseConfigured ? 'Supabase Live' : 'Offline Mode'}</span>
          </div>

          <p className="text-[0.68rem] tracking-wider uppercase text-[#EFCEA5]/40 font-mono">
            &copy; {new Date().getFullYear()} Team Harvs
          </p>
        </div>

      </div>

    </div>
  );
};
