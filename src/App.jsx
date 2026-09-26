import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';

export default function App() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Interactive Hero Production Switcher
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const heroProductions = [
    {
      id: '01',
      title: 'Solitude in Crimson',
      category: 'Fashion & Editorial Tailoring',
      image: '/assets/images/editorial_hero.jpg',
      tag: 'Issue 01 // Autumn 2026',
      location: 'Studio Harvs / Akwa Ibom',
      credits: 'Tailoring & Direction by Harvs'
    },
    {
      id: '02',
      title: 'Urban Concrete',
      category: 'Commercial Campaign Lookbook',
      image: '/assets/images/campaign_lookbook.jpg',
      tag: 'Issue 02 // Commercial',
      location: 'Metropolitan Set',
      credits: 'Wardrobe & Art Direction by Team Harvs'
    },
    {
      id: '03',
      title: 'The Studio Process',
      category: 'BTS & Cinema Motion',
      image: '/assets/images/creative_production_bts.jpg',
      tag: 'Issue 03 // 35mm Motion',
      location: 'Daylight Studio',
      credits: 'Lead Cinematographer & BTS Crew'
    }
  ];

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

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
      lenis.destroy();
    };
  }, []);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsJoinOpen(false);
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

  const currentHero = heroProductions[activeHeroIndex];

  return (
    <div className="site-wrapper">
      
      {/* Top Utility Ticker */}
      <div className="top-ticker">
        <div className="container top-ticker-inner">
          <div>
            <span className="ticker-pulse"></span>
            <span>Creative Team · Uyo / Akwa Ibom</span>
          </div>
          <div className="top-ticker-sub">
            <span>Production Cycle 01 · Open Call Active</span>
          </div>
        </div>
      </div>

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
            <a href="#work" className="nav-item">Lookbook</a>
            <a href="#collective" className="nav-item">Collective</a>
          </nav>

          <div className="header-right">
            <a href="#workspace" className="btn-pill btn-pill-outline-cream header-btn-workspace">Workspace</a>
            <button 
              className="btn-pill btn-pill-sand"
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
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-drawer ${isMobileNavOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-list">
          <a href="#about" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
            About <span>01</span>
          </a>
          <a href="#what-we-do" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
            What We Do <span>02</span>
          </a>
          <a href="#work" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
            Lookbook <span>03</span>
          </a>
          <a href="#collective" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
            Collective <span>04</span>
          </a>
          <a href="#workspace" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
            Workspace <span>05</span>
          </a>
        </nav>

        <div className="mobile-drawer-bottom">
          <button 
            className="btn-pill btn-pill-sand"
            style={{ width: '100%', padding: '0.9rem' }}
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsJoinOpen(true);
            }}
          >
            Apply to Join Collective
          </button>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sand)', textAlign: 'center' }}>
            Rooted in Uyo, Akwa Ibom State
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main>
        
        {/* =================================================================
            MASTER HIGH-FASHION EDITORIAL HERO SECTION
            ================================================================= */}
        <section className="hero-editorial">
          <div className="container">
            
            {/* Top Coordinates Bar */}
            <div className="hero-top-info">
              <div className="hero-coordinates">
                <span>[ 05°02'N · 07°55'E ]</span>
                <span>UYO, AKWA IBOM</span>
              </div>
              <div>
                <span>EST. 2026 // CREATIVE COLLECTIVE</span>
              </div>
            </div>

            {/* Monumental Headline Block */}
            <div className="hero-brand-block">
              <h1 className="hero-display-title">
                <span>Team</span>
                <span>Harvs</span>
              </h1>
              <div className="hero-philosophy-ribbon">
                <span>Think</span>
                <span className="dot">·</span>
                <span>Create</span>
                <span className="dot">·</span>
                <span>Learn</span>
                <span className="dot">·</span>
                <span>Execute</span>
                <span className="dot">·</span>
                <span>Grow</span>
              </div>
            </div>

            {/* Asymmetric Magazine Stage */}
            <div className="hero-showcase-stage">
              
              {/* Main Cinematic Feature Frame */}
              <div className="hero-main-frame">
                <span className="hero-frame-tag">{currentHero.tag}</span>
                <img 
                  key={currentHero.id}
                  src={currentHero.image} 
                  alt={currentHero.title} 
                  className="hero-main-img" 
                />
                <div className="hero-frame-caption">
                  <div>
                    <div className="hero-caption-title">{currentHero.title}</div>
                    <div className="hero-caption-sub">{currentHero.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sand)' }}>
                      {currentHero.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Column: Interactive Switcher & Talent Spot */}
              <div className="hero-side-editorial">
                
                {/* Production Switcher Box */}
                <div className="hero-production-switcher">
                  <div className="switcher-heading">
                    <span>Featured Productions</span>
                    <span>{currentHero.id} / 03</span>
                  </div>
                  
                  <div className="switcher-list">
                    {heroProductions.map((item, idx) => (
                      <button
                        key={item.id}
                        className={`switcher-btn ${activeHeroIndex === idx ? 'active' : ''}`}
                        onClick={() => setActiveHeroIndex(idx)}
                      >
                        <div>
                          <div className="switcher-btn-title">{item.title}</div>
                          <div className="switcher-btn-cat">{item.category}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', color: 'var(--sand)' }}>
                          {item.id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Talent Spotlight Secondary Card (Desktop/Tablet) */}
                <div className="hero-thumb-card">
                  <img 
                    src="/assets/images/model_portrait.jpg" 
                    alt="Talent Roster Portrait" 
                    className="hero-thumb-img" 
                  />
                  <span className="hero-thumb-tag">Model Development Dossier</span>
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
                <span>↓</span>
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
                <li key={item.num} className="discipline-item">
                  <span className="discipline-item-title">{item.title}</span>
                  <span className="discipline-item-number">{item.num}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SECTION: LOOKBOOK — Warm Sand Canvas */}
        <section className="section-lookbook" id="work">
          <div className="container">
            <span className="label-burgundy">03 / Selected Works</span>
            
            <div className="lookbook-grid-editorial">
              <div className="editorial-card">
                <div className="editorial-frame">
                  <img src="/assets/images/campaign_lookbook.jpg" alt="Commercial Campaign" />
                </div>
                <div className="editorial-card-info">
                  <span>Commercial Projects & Campaigns</span>
                  <span>Issue 01</span>
                </div>
              </div>

              <div className="editorial-card">
                <div className="editorial-frame editorial-frame-tall">
                  <img src="/assets/images/model_portrait.jpg" alt="Model Development" />
                </div>
                <div className="editorial-card-info">
                  <span>Model Development</span>
                  <span>Dossier</span>
                </div>
              </div>
            </div>

            <div className="editorial-card editorial-bts-wide">
              <div className="editorial-frame">
                <img src="/assets/images/creative_production_bts.jpg" alt="Creative Production BTS" />
              </div>
              <div className="editorial-card-info">
                <span>Creative Productions & BTS Cinematography</span>
                <span>On Set / Akwa Ibom</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: THE COLLECTIVE — Burgundy & Sand */}
        <section className="section-collective" id="collective">
          <div className="container">
            <span className="label-sand">04 / Target Audience</span>
            <h2 className="statement-burgundy" style={{ color: 'var(--cream)' }}>
              Young and emerging creatives ready to step outside their comfort zones.
            </h2>
            <div className="collective-pills">
              <span className="collective-pill-item">Models</span>
              <span className="collective-pill-item">Stylists</span>
              <span className="collective-pill-item">Makeup Artists</span>
              <span className="collective-pill-item">Videographers / BTS Creators</span>
              <span className="collective-pill-item">Creative Assistants</span>
              <span className="collective-pill-item">Creative Collaborators</span>
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
                  onClick={() => alert("The Creative Workspace & Admin CMS module is ready to connect!")}
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
                  <input type="text" placeholder="Your name" required />
                </div>

                <div className="form-group-rich">
                  <label>Email & WhatsApp Phone</label>
                  <input type="text" placeholder="Contact number" required />
                </div>

                <div className="form-group-rich">
                  <label>Creative Discipline</label>
                  <select required defaultValue="">
                    <option value="" disabled>Select discipline...</option>
                    <option value="model">Fashion / Commercial Model</option>
                    <option value="stylist">Wardrobe / Editorial Stylist</option>
                    <option value="mua">Makeup Artist (MUA)</option>
                    <option value="videographer">Videographer / BTS Creator</option>
                    <option value="assistant">Creative Assistant</option>
                    <option value="collaborator">Other Collaborator</option>
                  </select>
                </div>

                <div className="form-group-rich">
                  <label>Instagram Handle / Portfolio</label>
                  <input type="text" placeholder="@yourhandle or URL" required />
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

    </div>
  );
}
