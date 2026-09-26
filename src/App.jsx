import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { SelectedWorksGallery } from '@/components/SelectedWorksGallery';

export default function App() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Kinetic Stream State
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);

  // 3-Row Dynamic Editorial Gallery Data
  const streamRow1 = [
    {
      id: '01',
      title: 'Solitude in Crimson',
      category: 'Fashion & Editorial Tailoring',
      image: '/assets/images/editorial_hero.jpg',
      tag: 'Look 01 // Autumn'
    },
    {
      id: '02',
      title: 'Double-Breasted Cut',
      category: 'Avant-Garde Silhouette',
      image: '/assets/images/avant_garde_fashion.jpg',
      tag: 'Look 02 // Tailoring'
    },
    {
      id: '03',
      title: 'Urban Concrete',
      category: 'Commercial Campaign Lookbook',
      image: '/assets/images/campaign_lookbook.jpg',
      tag: 'Look 03 // Commercial'
    },
    {
      id: '04',
      title: 'Model Development',
      category: 'Editorial Talent Dossier',
      image: '/assets/images/model_portrait.jpg',
      tag: 'Look 04 // Roster'
    }
  ];

  const streamRow2 = [
    {
      id: '05',
      title: 'Architectural Motion',
      category: 'High-Fashion Outerwear',
      image: '/assets/images/fashion_motion_still.jpg',
      tag: 'Look 05 // Movement'
    },
    {
      id: '06',
      title: 'Studio Process',
      category: 'BTS & 35mm Cinema Motion',
      image: '/assets/images/creative_production_bts.jpg',
      tag: 'Look 06 // 35mm Motion'
    },
    {
      id: '07',
      title: 'Burgundy & Cream',
      category: 'Color Direction & Form',
      image: '/assets/images/avant_garde_fashion.jpg',
      tag: 'Look 07 // Direction'
    },
    {
      id: '08',
      title: 'Akwa Ibom Set',
      category: 'Studio Harvs Production',
      image: '/assets/images/editorial_hero.jpg',
      tag: 'Look 08 // Set Design'
    }
  ];

  const streamRow3 = [
    {
      id: '09',
      title: 'Metropolitan Set',
      category: 'Commercial Series Lookbook',
      image: '/assets/images/campaign_lookbook.jpg',
      tag: 'Look 09 // Series'
    },
    {
      id: '10',
      title: 'Editorial Duo',
      category: 'Coat Architecture',
      image: '/assets/images/fashion_motion_still.jpg',
      tag: 'Look 10 // Dynamic'
    },
    {
      id: '11',
      title: 'Roster Cast',
      category: 'Model Development Scouting',
      image: '/assets/images/model_portrait.jpg',
      tag: 'Look 11 // Scouting'
    },
    {
      id: '12',
      title: 'Daylight Cinema',
      category: 'BTS Cinematography',
      image: '/assets/images/creative_production_bts.jpg',
      tag: 'Look 12 // Cinema'
    }
  ];

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
            <a href="#work" className="nav-item">Lookbook</a>
            <a href="#collective" className="nav-item">Collective</a>
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
              
              {/* Kinetic Infinity Editorial Marquee */}
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

            {/* Multi-Row Infinite Moving Editorial Gallery Stage */}
            <div className="hero-stream-stage">
              
              {/* Stream Control & Status Bar */}
              <div className="hero-stream-control-bar">
                <div className="stream-status">
                  <span className="stream-live-dot"></span>
                  <span>Continuous Editorial Stream // 3-Row Dynamic Canvas</span>
                </div>
                <button 
                  className="stream-toggle-btn"
                  onClick={() => setIsStreamPaused(!isStreamPaused)}
                  aria-label="Toggle stream motion"
                >
                  {isStreamPaused ? '▶ Resume Motion' : '⏸ Pause Motion'}
                </button>
              </div>

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
                        <img src={item.image} alt={item.title} className="stream-card-img" />
                        <span className="stream-card-tag">{item.tag}</span>
                        <div className="stream-card-info">
                          <span className="stream-card-title">{item.title}</span>
                          <span className="stream-card-cat">{item.category}</span>
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
                        <img src={item.image} alt={item.title} className="stream-card-img" />
                        <span className="stream-card-tag">{item.tag}</span>
                        <div className="stream-card-info">
                          <span className="stream-card-title">{item.title}</span>
                          <span className="stream-card-cat">{item.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 3: Right to Left (←) - Desktop/Tablet */}
                <div className="hero-stream-row stream-dir-left stream-speed-slow row-desktop-only">
                  <div className="hero-stream-track">
                    {[...streamRow3, ...streamRow3].map((item, idx) => (
                      <div 
                        key={`r3-${idx}`} 
                        className="hero-stream-card"
                        onClick={() => setSelectedPreviewImage(item)}
                        title="Click to inspect look"
                      >
                        <img src={item.image} alt={item.title} className="stream-card-img" />
                        <span className="stream-card-tag">{item.tag}</span>
                        <div className="stream-card-info">
                          <span className="stream-card-title">{item.title}</span>
                          <span className="stream-card-cat">{item.category}</span>
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

        {/* SECTION: SELECTED WORKS — 3D Perspective Animated Gallery */}
        <SelectedWorksGallery
          onOpenJoin={() => setIsJoinOpen(true)}
          onSelectPreview={(item) => setSelectedPreviewImage(item)}
        />

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

      {/* Modal: Selected Preview Dossier */}
      {selectedPreviewImage && (
        <div className="modal-overlay" onClick={() => setSelectedPreviewImage(null)}>
          <div className="modal-box-preview" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-rich" onClick={() => setSelectedPreviewImage(null)} aria-label="Close preview">&times;</button>
            <div className="preview-modal-frame">
              <img src={selectedPreviewImage.image} alt={selectedPreviewImage.title} />
            </div>
            <div className="preview-modal-info">
              <span className="label-burgundy">{selectedPreviewImage.tag}</span>
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
