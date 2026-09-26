/**
 * TEAM HARVS — INTERACTIVE APPLICATION SCRIPT
 * Features: Lenis Smooth Scroll, Editorial Lightbox, Join Modal, Mobile Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scroll
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Provide globally so other scripts can access
    window.lenis = lenis;

    // Smooth Anchor Navigation via Lenis
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: -90, duration: 1.3 });
            // Close mobile menu if open
            closeMobileNav();
          }
        }
      });
    });
  }

  // 2. Sticky Header Scroll Reaction
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // 3. Mobile Navigation Drawer
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileClose = document.getElementById('mobileNavClose');

  function openMobileNav() {
    mobileDrawer?.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeMobileNav() {
    mobileDrawer?.classList.remove('active');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  mobileToggle?.addEventListener('click', openMobileNav);
  mobileClose?.addEventListener('click', closeMobileNav);

  // 4. Project Lightbox Modal
  const lightbox = document.getElementById('lookbookLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCredits = document.getElementById('lightboxCredits');
  const lightboxClose = document.getElementById('lightboxClose');

  // Lookbook Data
  const lookbookData = {
    '1': {
      title: 'Issue 01: Solitude in Crimson',
      category: 'Fashion & Editorial Production',
      image: 'assets/images/editorial_hero.jpg',
      desc: 'An exploration of architectural tailoring and deep crimson wool silhouetted against raw brutalist stone. Captured in natural midday sunlight to emphasize sharp silhouette cuts and bold proportions.',
      credits: {
        'Creative Director': 'Harvs',
        'Styling & Wardrobe': 'Team Harvs Styling Lab',
        'Model': 'Chioma N.',
        'BTS Cinematography': 'Emeka V.',
        'Location': 'Studio Harvs / Akwa Ibom'
      }
    },
    '2': {
      title: 'Issue 02: Sculptural Poise',
      category: 'Model Development Dossier',
      image: 'assets/images/model_portrait.jpg',
      desc: 'Focusing on skin texture, bone structure, and silent intensity. Developed for international agency casting portfolios, combining deep velvet textures with luminous, dewy lighting.',
      credits: {
        'Creative Director': 'Harvs',
        'Hair & MUA': 'Amara K.',
        'Model': 'Kufre E.',
        'Lighting': 'Team Harvs Tech',
        'Agency Board': 'Development Roster 2026'
      }
    },
    '3': {
      title: 'Issue 03: The Studio Process',
      category: 'BTS & Production Film',
      image: 'assets/images/creative_production_bts.jpg',
      desc: 'Behind every finished frame is an intentional collective of young minds collaborating in real-time. Unscripted 35mm motion capture of styling adjustments, camera positioning, and creative camaraderie.',
      credits: {
        'Lead Videographer': 'Iniobong B.',
        'Lead Stylist': 'Precious D.',
        'Key Grip / BTS': 'David O.',
        'Sound / Reel': 'Harvs Sound Lab'
      }
    },
    '4': {
      title: 'Issue 04: Urban Concrete',
      category: 'Commercial Campaign Lookbook',
      image: 'assets/images/campaign_lookbook.jpg',
      desc: 'Contemporary everyday luxury tailored for modern African youth. Earthy oatmeal knits, tailored burgundy coats, and minimalist leather goods set against the city skyline.',
      credits: {
        'Creative Direction': 'Team Harvs',
        'Wardrobe Curation': 'Harvs Studio Archive',
        'Models': 'Idara U. & Bassey M.',
        'Production Assistant': 'Samuel E.',
        'Campaign Series': 'Autumn/Pre-Harmattan'
      }
    }
  };

  document.querySelectorAll('.lookbook-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-project-id');
      const data = lookbookData[id];
      if (data && lightbox) {
        lightboxImg.src = data.image;
        lightboxTitle.textContent = data.title;
        lightboxCategory.textContent = data.category;
        lightboxDesc.textContent = data.desc;

        // Render credits
        lightboxCredits.innerHTML = '';
        for (const [role, name] of Object.entries(data.credits)) {
          const li = document.createElement('li');
          li.innerHTML = `<span class="credit-role">${role}</span><span class="credit-name">${name}</span>`;
          lightboxCredits.appendChild(li);
        }

        lightbox.classList.add('active');
        if (lenis) lenis.stop();
      }
    });
  });

  function closeLightbox() {
    lightbox?.classList.remove('active');
    if (lenis) lenis.start();
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // 5. Join / Application Drawer Modal
  const joinModal = document.getElementById('joinModal');
  const openJoinBtns = document.querySelectorAll('.open-join-modal');
  const closeJoinBtn = document.getElementById('closeJoinModal');
  const joinForm = document.getElementById('joinForm');
  const joinSuccessMessage = document.getElementById('joinSuccessMessage');

  function openJoin() {
    joinModal?.classList.add('active');
    closeMobileNav();
    if (lenis) lenis.stop();
  }

  function closeJoin() {
    joinModal?.classList.remove('active');
    if (lenis) lenis.start();
  }

  openJoinBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openJoin();
  }));

  closeJoinBtn?.addEventListener('click', closeJoin);
  joinModal?.addEventListener('click', (e) => {
    if (e.target === joinModal) closeJoin();
  });

  // Handle Form Submission
  joinForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = joinForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing Application...';
    submitBtn.disabled = true;

    // Simulate instant secure submission
    setTimeout(() => {
      joinForm.style.display = 'none';
      joinSuccessMessage.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 900);
  });

  // Keyboard accessibility
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeJoin();
      closeMobileNav();
    }
  });

  console.log('Team Harvs Editorial Application Initialized. Lenis active.');
});
