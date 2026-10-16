import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { WorkspacePortal } from '@/components/dashboard/WorkspacePortal';
import { AuthPage } from '@/components/auth/AuthPage';
import { SelectedWorksGallery } from '@/components/SelectedWorksGallery';
import { workspaceStore, isVideoMedia } from '@/lib/workspaceStore';
import { authService } from '@/lib/supabase';

export default function App() {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('workspace') === 'true' || window.location.hash === '#workspace' || window.location.hash === '#portal') {
        return true;
      }
      return localStorage.getItem('teamharvs_workspace_active') === 'true';
    }
    return false;
  });
  const [isAuthPageOpen, setIsAuthPageOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState('overview');
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Join form state
  const [joinForm, setJoinForm] = useState({
    fullName: '',
    contact: '',
    discipline: '',
    portfolio: ''
  });
  
  // Kinetic Stream State
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);

  // Sync workspace active state to localStorage so refresh keeps user in dashboard
  useEffect(() => {
    if (isWorkspaceOpen) {
      try {
        localStorage.setItem('teamharvs_workspace_active', 'true');
      } catch {}
    } else {
      try {
        localStorage.removeItem('teamharvs_workspace_active');
      } catch {}
    }
  }, [isWorkspaceOpen]);

  // Sync Supabase Auth session on app boot and listen for state changes
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          const profile = await authService.getProfile(session.user.id);
          setCurrentProfile(profile);
        }
      } catch (e) {
        console.warn('Session check failed in App:', e);
      }
    }
    checkSession();

    const { data } = authService.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const profile = await authService.getProfile(session.user.id);
        setCurrentProfile(profile);
      } else {
        setCurrentUser(null);
        setCurrentProfile(null);
        try {
          localStorage.removeItem('teamharvs_workspace_active');
        } catch {}
        setIsWorkspaceOpen(false);
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  // 2-Row Dynamic Editorial Gallery Data synced live from workspaceStore (Hero Stream CMS)
  const [streamRow1, setStreamRow1] = useState(() => workspaceStore.getHeroStreamRow(1));
  const [streamRow2, setStreamRow2] = useState(() => workspaceStore.getHeroStreamRow(2));
  const [lookbookWorks, setLookbookWorks] = useState(() => workspaceStore.getLookbook());
  const [portfolioFilter, setPortfolioFilter] = useState('All');

  useEffect(() => {
    const updateStreams = () => {
      setStreamRow1(workspaceStore.getHeroStreamRow(1));
      setStreamRow2(workspaceStore.getHeroStreamRow(2));
      setLookbookWorks(workspaceStore.getLookbook());
    };
    updateStreams();
    return workspaceStore.subscribe(updateStreams);
  }, [isWorkspaceOpen]);

  const mapDisciplineToFilter = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('model')) return 'Models';
    if (t.includes('fashion') || t.includes('style')) return 'Stylists';
    if (t.includes('makeup') || t.includes('mua')) return 'Makeup Artists';
    if (t.includes('motion') || t.includes('bts') || t.includes('video') || t.includes('35mm')) return 'Videographers / BTS Creators';
    if (t.includes('assist') || t.includes('collab')) return 'Creative Assistants';
    if (t.includes('photo') || t.includes('editorial') || t.includes('commercial') || t.includes('campaign')) return 'Photographers';
    return 'All';
  };

  const handleDisciplineClick = (title) => {
    const filter = mapDisciplineToFilter(title);
    setPortfolioFilter(filter);
    const target = document.getElementById('portfolio');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // GSAP Animation Refs
  const heroRef = useRef(null);
  const spotlightRef = useRef(null);
  const watermarkRef = useRef(null);

  // GSAP Hero Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // 1. Coordinates & top info
      tl.fromTo('.hero-top-info',
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 1.1 }
      );

      // 2. Split masked title reveal
      tl.fromTo('.hero-title-word',
        { yPercent: 120, rotate: 1.5 },
        { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.16 },
        '-=0.7'
      );

      // 3. Marquee ticker strip
      tl.fromTo('.hero-marquee-wrapper',
        { opacity: 0, scaleY: 0 },
        { opacity: 1, scaleY: 1, duration: 0.8, transformOrigin: 'top' },
        '-=0.8'
      );

      // 4. Kinetic Multi-Row Stream Stage
      tl.fromTo('.hero-stream-stage',
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2 },
        '-=0.6'
      );

      // 5. Bottom actions & cues
      tl.fromTo('.hero-bottom-actions',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.7'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // GSAP Interactive Mouse Parallax & Ambient Spotlight
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Ambient spotlight tracking
    if (spotlightRef.current) {
      gsap.to(spotlightRef.current, {
        x: x,
        y: y,
        duration: 0.5,
        ease: 'power2.out'
      });
    }

    // Watermark Monogram Parallax
    if (watermarkRef.current) {
      gsap.to(watermarkRef.current, {
        x: ((x - centerX) / centerX) * -24,
        y: ((y - centerY) / centerY) * -18,
        duration: 1.2,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseLeave = () => {
    if (watermarkRef.current) {
      gsap.to(watermarkRef.current, {
        x: 0,
        y: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
    }
  };

  // Initialize Lenis Smooth Scroll (Homepage only - deactivated when in workspace to give dashboard 100% native, responsive scrolling)
  useEffect(() => {
    if (isWorkspaceOpen || isAuthPageOpen) {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
      }
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Smooth anchor navigation
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target) {
        const id = target.getAttribute('href');
        if (id && id !== '#') {
          const el = document.querySelector(id);
          if (el) {
            e.preventDefault();
            setIsMobileNavOpen(false);
            lenis.scrollTo(el, { offset: -80, duration: 1.2 });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
      }
    };
  }, [isWorkspaceOpen, isAuthPageOpen]);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    workspaceStore.addApplication({
      fullName: joinForm.fullName,
      contact: joinForm.contact,
      discipline: joinForm.discipline || 'Creative Collaborator',
      portfolio: joinForm.portfolio,
      notes: 'Direct application submitted from public open call modal.'
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsJoinOpen(false);
      setJoinForm({ fullName: '', contact: '', discipline: '', portfolio: '' });
    }, 2000);
  };

  const disciplines = [
    { num: '01', title: 'Fashion' },
    { num: '02', title: 'Editorials' },
    { num: '03', title: 'Commercial projects' },
    { num: '04', title: 'Campaigns' },
    { num: '05', title: 'Model development' },
    { num: '06', title: 'Creative productions' },
    { num: '07', title: 'Creative collaborations' },
  ];

  if (isAuthPageOpen) {
    return (
      <AuthPage
        onBackToSite={() => setIsAuthPageOpen(false)}
        onAuthSuccess={() => {
          setIsAuthPageOpen(false);
          setIsWorkspaceOpen(true);
        }}
      />
    );
  }

  if (isWorkspaceOpen) {
    return (
      <WorkspacePortal
        onBackToSite={() => {
          try {
            localStorage.removeItem('teamharvs_workspace_active');
          } catch {}
          setIsWorkspaceOpen(false);
        }}
        initialTab={workspaceInitialTab}
      />
    );
  }

  return (
    <div className="site-wrapper">
      
      {/* Header */}
      <header className="site-header">
        <div className="container header-inner">
          <a href="#" className="brand-link" aria-label="Team Harvs Home">
            <img src="/assets/th-monogram-cream.png" alt="TH Monogram" className="brand-icon" />
            <span className="brand-title">Team Harvs</span>
          </a>

          <nav className="nav-links" aria-label="Desktop Navigation">
            <a href="#about" className="nav-item">About</a>
            <a href="#what-we-do" className="nav-item">What We Do</a>
            <a href="#portfolio" className="nav-item">Portfolio</a>
            <a href="#collective" className="nav-item">Collective</a>
            <button 
              className="nav-item"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sand)' }}
              onClick={() => {
                setWorkspaceInitialTab('overview');
                setIsWorkspaceOpen(true);
              }}
            >
              Workspace CMS &rarr;
            </button>
            {currentUser ? (
              <button 
                className="nav-item"
                style={{ 
                  background: 'rgba(239, 206, 165, 0.15)', 
                  border: '1px solid rgba(239, 206, 165, 0.4)', 
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  cursor: 'pointer', 
                  color: 'var(--sand)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 700
                }}
                onClick={() => setIsWorkspaceOpen(true)}
              >
                Dashboard ({currentProfile?.full_name?.split(' ')[0] || 'Studio'}) &rarr;
              </button>
            ) : (
              <button 
                className="nav-item"
                style={{ 
                  background: 'rgba(239, 206, 165, 0.1)', 
                  border: '1px solid rgba(239, 206, 165, 0.25)', 
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  cursor: 'pointer', 
                  color: 'var(--sand)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}
                onClick={() => setIsAuthPageOpen(true)}
              >
                Sign In
              </button>
            )}
          </nav>

          <div className="header-right">
            <button 
              className="header-cta-btn"
              onClick={() => setIsJoinOpen(true)}
            >
              Join
            </button>
            
            {/* Hamburger Button for Mobile */}
            <button 
              className={`hamburger-btn ${isMobileNavOpen ? 'active' : ''}`}
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileNavOpen}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`mobile-drawer ${isMobileNavOpen ? 'open' : ''}`}
        aria-hidden={!isMobileNavOpen}
      >
        <div className="mobile-drawer-header">
          <span className="mobile-drawer-tag">Navigation</span>
          <button 
            className="mobile-drawer-close"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="mobile-nav-list">
          <a href="#about" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
            About <span>01</span>
          </a>
          <a href="#what-we-do" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
            What We Do <span>02</span>
          </a>
          <a href="#portfolio" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
            Portfolio Lookbook <span>03</span>
          </a>
          <a href="#collective" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
            Collective <span>04</span>
          </a>
          <button 
            className="mobile-nav-link" 
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => {
              setIsMobileNavOpen(false);
              setWorkspaceInitialTab('overview');
              setIsWorkspaceOpen(true);
            }}
          >
            Workspace CMS <span>05</span>
          </button>
          <button 
            className="mobile-nav-link" 
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sand)' }}
            onClick={() => {
              setIsMobileNavOpen(false);
              if (currentUser) {
                setIsWorkspaceOpen(true);
              } else {
                setIsAuthPageOpen(true);
              }
            }}
          >
            {currentUser ? (currentProfile?.role === 'admin' ? 'Studio Director Portal' : 'My Workspace Dashboard') : 'Studio Sign In'} <span>06</span>
          </button>
        </nav>

        <div className="mobile-drawer-bottom">
          <button 
            className="btn-pill btn-pill-sand"
            style={{ width: '100%', padding: '0.85rem' }}
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsJoinOpen(true);
            }}
          >
            Apply to Join Collective
          </button>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sand)', textAlign: 'center', marginTop: '0.75rem' }}>
            Rooted in Uyo, Akwa Ibom State
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main>
        
        {/* =================================================================
            MASTER HIGH-FASHION EDITORIAL HERO SECTION WITH GSAP
            ================================================================= */}
        <section 
          className="hero-editorial" 
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* GSAP Ambient Glow Spotlight */}
          <div className="hero-spotlight" ref={spotlightRef} aria-hidden="true"></div>

          {/* GSAP Architectural Watermark Monogram */}
          <div className="hero-watermark" ref={watermarkRef} aria-hidden="true">
            <img src="/assets/th-monogram-cream.png" alt="" />
          </div>

          <div className="container hero-container-relative">
            
            {/* Top Coordinates Bar with Live Production Ticker */}

            {/* Monumental Headline Block with GSAP Split Masks */}
            <div className="hero-brand-block">
              <h1 className="hero-display-title">
                <span className="hero-title-mask">
                  <span className="hero-title-word word-team">Team</span>
                </span>
                <span className="hero-title-mask">
                  <span className="hero-title-word word-team">Harvs</span>
                </span>
              </h1>
            </div>

            {/* Multi-Row Infinite Moving Editorial Gallery Stage */}
            <div className="hero-stream-stage" id="work">
              
              {/* Edge Gradient Mask Container */}
              <div className={`hero-stream-viewport ${isStreamPaused ? 'paused' : ''}`}>
                
                {/* Row 1: Right to Left (←) */}
                <div className="hero-stream-row stream-dir-left stream-speed-fast">
                  <div className="hero-stream-track">
                    {[...streamRow1, ...streamRow1].map((item, idx) => (
                      <div 
                        key={`r1-${idx}`} 
                        className="hero-stream-card"
                        onClick={() => setSelectedPreviewImage(item)}
                        title="Click to inspect look"
                      >
                        <img 
                          src={item.image || '/assets/images/editorial_hero.jpg'} 
                          alt={item.title} 
                          className="stream-card-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/images/editorial_hero.jpg';
                          }}
                        />
                        <div className="stream-card-info">
                          <span className="stream-card-title">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 2: Left to Right (→) */}
                <div className="hero-stream-row stream-dir-right stream-speed-medium">
                  <div className="hero-stream-track">
                    {[...streamRow2, ...streamRow2].map((item, idx) => (
                      <div 
                        key={`r2-${idx}`} 
                        className="hero-stream-card"
                        onClick={() => setSelectedPreviewImage(item)}
                        title="Click to inspect look"
                      >
                        <img 
                          src={item.image || '/assets/images/editorial_hero.jpg'} 
                          alt={item.title} 
                          className="stream-card-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/images/editorial_hero.jpg';
                          }}
                        />
                        <div className="stream-card-info">
                          <span className="stream-card-title">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="hero-bottom-actions">
              <div className="hero-cta-group">
                <button 
                  className="btn-pill btn-pill-sand"
                  onClick={() => setIsJoinOpen(true)}
                >
                  Join the Collective &rarr;
                </button>
                <a href="#about" className="btn-pill btn-pill-outline-cream">
                  Read Manifesto
                </a>
              </div>

              <div className="scroll-cue">
                <span>Explore Works</span>
                <span className="scroll-line"></span>
                <span className="scroll-arrow">↓</span>
              </div>
            </div>

            {/* Kinetic Infinity Editorial Marquee (Last Element of Hero Section) */}
            <div className="hero-marquee-wrapper">
              <div className="hero-marquee-track">
                <span>THINK</span> <span className="star">✦</span>
                <span>CREATE</span> <span className="star">✦</span>
                <span>LEARN</span> <span className="star">✦</span>
                <span>EXECUTE</span> <span className="star">✦</span>
                <span>GROW</span> <span className="star">✦</span>
                <span>FASHION EDITORIALS</span> <span className="star">✦</span>
                <span>COMMERCIAL CAMPAIGNS</span> <span className="star">✦</span>
                <span>MODEL DEVELOPMENT</span> <span className="star">✦</span>
                <span>35MM MOTION</span> <span className="star">✦</span>
                <span>UYO / AKWA IBOM</span> <span className="star">✦</span>
                <span>THINK</span> <span className="star">✦</span>
                <span>CREATE</span> <span className="star">✦</span>
                <span>LEARN</span> <span className="star">✦</span>
                <span>EXECUTE</span> <span className="star">✦</span>
                <span>GROW</span> <span className="star">✦</span>
                <span>FASHION EDITORIALS</span> <span className="star">✦</span>
                <span>COMMERCIAL CAMPAIGNS</span> <span className="star">✦</span>
                <span>MODEL DEVELOPMENT</span> <span className="star">✦</span>
                <span>35MM MOTION</span> <span className="star">✦</span>
                <span>UYO / AKWA IBOM</span> <span className="star">✦</span>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: ABOUT — Warm Parchment Cream Canvas */}
        <section className="section-cream" id="about">
          <div className="container">
            <span className="label-burgundy">01 / About the Brand</span>
            <h2 className="statement-burgundy">
              Team Harvs is a creative team built around collaboration, experimentation, learning and intentional creative production.
            </h2>
            <p className="body-dark">
              It brings together creatives across fashion, editorial and commercial production to work on projects, develop their skills, build portfolios and create meaningful visual work.
            </p>
            
            <div className="vision-block">
              <div>
                <span className="label-burgundy">Vision</span>
                <p className="vision-quote">
                  "To build a strong creative community where young creatives can step outside their comfort zones, develop their abilities, collaborate and gain real-world creative experience."
                </p>
              </div>
              <div>
                <div className="origin-tag">
                  <strong>Origin & Reach:</strong><br />
                  Primarily starting in Uyo / Akwa Ibom, with room to expand through collaborations.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: WHAT WE DO — Rich Burgundy with Sand Accents */}
        <section className="section-disciplines" id="what-we-do">
          <div className="container">
            <span className="label-sand">02 / What We Do</span>
            <ul className="disciplines-table">
              {disciplines.map((item) => (
                <li 
                  key={item.num} 
                  className="discipline-item cursor-pointer hover:bg-white/5 transition-all group"
                  onClick={() => handleDisciplineClick(item.title)}
                  title={`Click to view ${item.title} portfolio looks`}
                >
                  <span className="discipline-item-title group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                    {item.title} <span className="opacity-0 group-hover:opacity-100 text-[var(--sand)] text-xs transition-opacity">&rarr; View Works</span>
                  </span>
                  <span className="discipline-item-number">{item.num}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SECTION: SELECTED WORKS / PORTFOLIO ARCHIVE (Filtered dynamically by discipline) */}
        <SelectedWorksGallery
          items={lookbookWorks}
          activeFilter={portfolioFilter}
          onSelectFilter={(f) => setPortfolioFilter(f)}
          onOpenJoin={() => setIsJoinOpen(true)}
          onSelectPreview={(item) => setSelectedPreviewImage(item)}
        />

        {/* SECTION: THE COLLECTIVE — Burgundy & Sand */}
        <section className="section-collective" id="collective">
          <div className="container">
            <span className="label-sand">04 / The Collective</span>
            <h2 className="statement-burgundy" style={{ color: 'var(--cream)' }}>
              Young and emerging creatives ready to step outside their comfort zones.
            </h2>
            <div className="collective-pills">
              {['Models', 'Stylists', 'Makeup Artists', 'Videographers / BTS Creators', 'Creative Assistants', 'Photographers'].map((pill) => (
                <button
                  key={pill}
                  onClick={() => handleDisciplineClick(pill)}
                  className="collective-pill-item cursor-pointer hover:bg-[var(--sand)] hover:text-[#1F0205] transition-all"
                  title={`View ${pill} portfolio works`}
                >
                  {pill} &rarr;
                </button>
              ))}
            </div>

            {/* Workspace Banner */}
            <div className="workspace-card-rich" id="workspace">
              <div>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--sand)' }}>
                  Website Purpose
                </span>
                <h3>The Creative Workspace</h3>
                <p>
                  Where members can receive assignments, access creative resources, submit work and receive feedback, while the admin can monitor participation and manage the team's workflow.
                </p>
              </div>
              <div>
                <button 
                  className="btn-pill btn-pill-sand"
                  style={{ padding: '0.9rem 2.2rem', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    setWorkspaceInitialTab('overview');
                    setIsWorkspaceOpen(true);
                  }}
                >
                  Enter Workspace &rarr;
                </button>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="site-footer-rich">
        <div className="container footer-inner-rich">
          <div>
            <div className="footer-brand-title">Team Harvs</div>
            <p className="footer-philosophy-text">Think. Create. Learn. Execute. Grow.</p>
          </div>
          <div className="footer-meta-block">
            <p style={{ fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--sand)' }}>
              Uyo / Akwa Ibom State, Nigeria
            </p>
            <p style={{ marginTop: '6px', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(248, 244, 239, 0.5)' }}>
              &copy; {new Date().getFullYear()} Team Harvs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal: Join Team Harvs */}
      {isJoinOpen && (
        <div className="modal-overlay" onClick={() => setIsJoinOpen(false)}>
          <div className="modal-box-rich" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-rich" onClick={() => setIsJoinOpen(false)} aria-label="Close modal">&times;</button>
            
            <span className="label-burgundy" style={{ marginBottom: '0.6rem' }}>Open Call</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--burgundy-deep)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
              Join Team Harvs
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#574F50', marginBottom: '2rem', lineHeight: 1.6 }}>
              We bring together young and emerging creatives in Uyo and beyond across fashion, styling, makeup, videography, and modeling.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--burgundy)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase' }}>Application Received</p>
                <p style={{ fontSize: '0.88rem', color: '#574F50', marginTop: '0.6rem' }}>We will review your submission and connect with you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit}>
                <div className="form-group-rich">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Your name" 
                    required 
                    value={joinForm.fullName}
                    onChange={(e) => setJoinForm({ ...joinForm, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group-rich">
                  <label>Email & WhatsApp Phone</label>
                  <input 
                    type="text" 
                    placeholder="Contact number / email" 
                    required 
                    value={joinForm.contact}
                    onChange={(e) => setJoinForm({ ...joinForm, contact: e.target.value })}
                  />
                </div>

                <div className="form-group-rich">
                  <label>Creative Discipline</label>
                  <select 
                    required 
                    value={joinForm.discipline}
                    onChange={(e) => setJoinForm({ ...joinForm, discipline: e.target.value })}
                  >
                    <option value="" disabled>Select discipline...</option>
                    <option value="Model">Fashion / Commercial Model</option>
                    <option value="Stylist">Wardrobe / Editorial Stylist</option>
                    <option value="MUA">Makeup Artist (MUA)</option>
                    <option value="Videographer">Videographer / BTS Creator</option>
                    <option value="Assistant">Creative Assistant</option>
                    <option value="Photographer">Photographer</option>
                  </select>
                </div>

                <div className="form-group-rich">
                  <label>Instagram Handle / Portfolio</label>
                  <input 
                    type="text" 
                    placeholder="@yourhandle or URL" 
                    required 
                    value={joinForm.portfolio}
                    onChange={(e) => setJoinForm({ ...joinForm, portfolio: e.target.value })}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-pill btn-pill-sand"
                  style={{ width: '100%', marginTop: '1.2rem', padding: '0.95rem', background: 'var(--burgundy)', color: 'var(--cream)', borderColor: 'var(--burgundy)' }}
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Selected Preview Dossier */}
      {selectedPreviewImage && (
        <div className="modal-overlay" onClick={() => setSelectedPreviewImage(null)}>
          <div className="modal-box-preview" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-rich" onClick={() => setSelectedPreviewImage(null)} aria-label="Close preview">&times;</button>
            <div className="preview-modal-frame">
              {isVideoMedia(selectedPreviewImage.videoUrl || selectedPreviewImage.image, selectedPreviewImage.mediaType) ? (
                <video
                  src={selectedPreviewImage.videoUrl || selectedPreviewImage.image}
                  controls
                  autoPlay
                  playsInline
                  loop
                  style={{ width: '100%', maxHeight: '72vh', borderRadius: '12px', background: '#000', objectFit: 'contain' }}
                />
              ) : (
                <img 
                  src={selectedPreviewImage.image || '/assets/images/editorial_hero.jpg'} 
                  alt={selectedPreviewImage.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/assets/images/editorial_hero.jpg';
                  }}
                />
              )}
            </div>
            <div className="preview-modal-info">
              <span className="label-burgundy">{selectedPreviewImage.discipline || 'EDITORIAL ARCHIVE'}</span>
              <h3>{selectedPreviewImage.title}</h3>
              <p>{selectedPreviewImage.category} · Team Harvs Creative Production</p>
              <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn-pill btn-pill-sand"
                  style={{ background: 'var(--burgundy)', color: 'var(--cream)', borderColor: 'var(--burgundy)' }}
                  onClick={() => {
                    setSelectedPreviewImage(null);
                    setIsJoinOpen(true);
                  }}
                >
                  Join / Collaborate on Looks &rarr;
                </button>
                <button 
                  className="btn-pill btn-pill-outline-cream"
                  style={{ color: 'var(--burgundy)', borderColor: 'rgba(88, 13, 22, 0.3)' }}
                  onClick={() => setSelectedPreviewImage(null)}
                >
                  Back to Stream
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
