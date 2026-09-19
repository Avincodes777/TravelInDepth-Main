import { useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

/**
 * About page — Travel In Depth
 * self-contained React component. All markup, styling and behaviour
 * (scroll-reveal animation, animated number counters, and drag-to-scroll
 * gallery reel) are preserved exactly as in the source page.
 */
export default function AboutPage() {
  const containerRef = useRef(null);
  const reelRef = useRef(null);

  // ──────────────────────────────────────────
  // Intersection Observer — reveal on scroll
  // ──────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const reveals = container.querySelectorAll('.ap-reveal');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ap-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => revealObserver.observe(el));

    return () => revealObserver.disconnect();
  }, []);

  // ──────────────────────────────────────────
  // Counter animation for numbers section
  // ──────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const cells = container.querySelectorAll('.ap-num-value[data-target]');
    let started = false;
    let rafIds = [];

    function animateCounters() {
      cells.forEach((el) => {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.querySelector('.ap-num-suffix');
        const duration = 1600;
        const startTime = performance.now();

        function step(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          el.childNodes[0].textContent = current.toLocaleString();
          if (progress < 1) {
            rafIds.push(requestAnimationFrame(step));
          }
        }
        rafIds.push(requestAnimationFrame(step));
        if (suffix) el.appendChild(suffix); // reattach suffix
      });
    }

    const numSection = container.querySelector('.ap-numbers-grid');
    let numberObserver;
    if (numSection) {
      numberObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !started) {
            started = true;
            animateCounters();
          }
        },
        { threshold: 0.3 }
      );
      numberObserver.observe(numSection);
    }

    return () => {
      if (numberObserver) numberObserver.disconnect();
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  // ──────────────────────────────────────────
  // Drag-to-scroll for gallery reel
  // ──────────────────────────────────────────
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return undefined;

    let isDown = false;
    let startX;
    let scrollLeft;

    const onMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - reel.offsetLeft;
      scrollLeft = reel.scrollLeft;
      reel.style.cursor = 'grabbing';
    };
    const onMouseLeave = () => {
      isDown = false;
      reel.style.cursor = 'grab';
    };
    const onMouseUp = () => {
      isDown = false;
      reel.style.cursor = 'grab';
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - reel.offsetLeft;
      reel.scrollLeft = scrollLeft - (x - startX) * 1.4;
    };

    reel.addEventListener('mousedown', onMouseDown);
    reel.addEventListener('mouseleave', onMouseLeave);
    reel.addEventListener('mouseup', onMouseUp);
    reel.addEventListener('mousemove', onMouseMove);

    return () => {
      reel.removeEventListener('mousedown', onMouseDown);
      reel.removeEventListener('mouseleave', onMouseLeave);
      reel.removeEventListener('mouseup', onMouseUp);
      reel.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');

    /* =============================================
       SCOPED STYLES — all under .about-page
    ============================================= */

    /* Tokens */
    .about-page {
      --saffron: #FF6B1A;
      --maroon: #8B1A1A;
      --cream: #FDF6EC;
      --gold: #F5A623;
      --dark-brown: #2D1B00;
      --maroon-deep: #6B1212;
      --saffron-light: #FFE4D0;
      --cream-dark: #F5E8D3;
      --shadow-warm: 0 8px 32px rgba(45,27,0,.13);
      --shadow-card: 0 4px 20px rgba(139,26,26,.10);
      --radius: 16px;
      --radius-sm: 10px;

      font-family: 'Inter', sans-serif;
      background: var(--cream);
      color: var(--dark-brown);
      overflow-x: hidden;
    }

    .about-page *, .about-page *::before, .about-page *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .about-page img { display: block; max-width: 100%; }

    /* ── Typography helpers ── */
    .about-page .ap-display {
      font-family: 'Playfair Display', serif;
      font-weight: 900;
      line-height: 1.12;
      letter-spacing: -.02em;
    }
    .about-page .ap-serif {
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      line-height: 1.25;
    }
    .about-page .ap-label {
      font-size: .7rem;
      font-weight: 600;
      letter-spacing: .18em;
      text-transform: uppercase;
    }

    /* ── Section wrapper ── */
    .about-page .ap-section {
      padding: 96px 24px;
    }
    .about-page .ap-container {
      max-width: 1160px;
      margin: 0 auto;
    }
    .about-page .ap-section-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
    }
    .about-page .ap-section-eyebrow span.ap-label {
      color: var(--saffron);
    }
    .about-page .ap-section-eyebrow::before {
      content: '';
      display: block;
      width: 32px;
      height: 2px;
      background: var(--saffron);
      border-radius: 2px;
    }
    .about-page .ap-section-title {
      font-size: clamp(2rem, 4vw, 3rem);
      margin-bottom: 18px;
    }
    .about-page .ap-section-sub {
      font-size: 1.05rem;
      color: #7A5C3A;
      line-height: 1.75;
      max-width: 620px;
    }

    /* ══════════════════════════════════════════
       1. HERO
    ══════════════════════════════════════════ */
    .about-page .ap-hero {
      position: relative;
      min-height: 92vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: var(--dark-brown);
    }

    /* Layered mandala / India pattern background */
    .about-page .ap-hero-bg {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 80% 70% at 60% 40%, rgba(139,26,26,.55) 0%, transparent 65%),
        radial-gradient(ellipse 60% 90% at 10% 80%, rgba(255,107,26,.30) 0%, transparent 60%),
        radial-gradient(ellipse 50% 50% at 85% 10%, rgba(245,166,35,.20) 0%, transparent 55%),
        linear-gradient(160deg, #2D1B00 0%, #5a1a1a 45%, #1a0d00 100%);
      z-index: 0;
    }

    /* SVG pattern overlay */
    .about-page .ap-hero-pattern {
      position: absolute; inset: 0;
      z-index: 1;
      opacity: .07;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='36' fill='none' stroke='%23FF6B1A' stroke-width='1'/%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23F5A623' stroke-width='.8'/%3E%3Ccircle cx='40' cy='40' r='6' fill='%23F5A623' opacity='.5'/%3E%3Cline x1='4' y1='40' x2='76' y2='40' stroke='%23FF6B1A' stroke-width='.5'/%3E%3Cline x1='40' y1='4' x2='40' y2='76' stroke='%23FF6B1A' stroke-width='.5'/%3E%3Cline x1='14' y1='14' x2='66' y2='66' stroke='%23FF6B1A' stroke-width='.4'/%3E%3Cline x1='66' y1='14' x2='14' y2='66' stroke='%23FF6B1A' stroke-width='.4'/%3E%3C/svg%3E");
      background-size: 80px 80px;
    }

    /* Floating image collage */
    .about-page .ap-hero-collage {
      position: absolute; inset: 0;
      z-index: 2;
      pointer-events: none;
    }
    .about-page .ap-collage-img {
      position: absolute;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 16px 48px rgba(0,0,0,.45);
      opacity: 0;
      animation: ap-float-in .9s ease forwards;
    }
    .about-page .ap-collage-img img {
      width: 100%; height: 100%;
      object-fit: cover;
    }
    .about-page .ap-collage-img:nth-child(1) { width:200px;height:260px;top:8%;left:3%;transform:rotate(-4deg);animation-delay:.2s; }
    .about-page .ap-collage-img:nth-child(2) { width:160px;height:200px;top:55%;left:6%;transform:rotate(3deg);animation-delay:.4s; }
    .about-page .ap-collage-img:nth-child(3) { width:180px;height:230px;top:5%;right:4%;transform:rotate(3.5deg);animation-delay:.3s; }
    .about-page .ap-collage-img:nth-child(4) { width:150px;height:190px;top:58%;right:5%;transform:rotate(-3deg);animation-delay:.5s; }
    .about-page .ap-collage-img:nth-child(5) { width:130px;height:160px;top:30%;right:14%;transform:rotate(5deg);animation-delay:.6s; }

    @keyframes ap-float-in {
      from { opacity:0; transform: translateY(30px) rotate(var(--r,0deg)); }
      to   { opacity:.85; transform: translateY(0) rotate(var(--r,0deg)); }
    }

    /* Gradient vignette over collage */
    .about-page .ap-hero-vignette {
      position:absolute; inset:0; z-index:3;
      background: radial-gradient(ellipse 55% 70% at 50% 50%, transparent 30%, rgba(45,27,0,.6) 100%);
    }

    .about-page .ap-hero-content {
      position: relative;
      z-index: 4;
      text-align: center;
      padding: 24px;
      max-width: 780px;
    }
    .about-page .ap-hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,107,26,.15);
      border: 1px solid rgba(255,107,26,.35);
      border-radius: 100px;
      padding: 6px 18px;
      margin-bottom: 28px;
      color: var(--gold);
      font-size: .75rem;
      letter-spacing: .15em;
      text-transform: uppercase;
      font-weight: 600;
    }
    .about-page .ap-hero-eyebrow svg { flex-shrink:0; }

    .about-page .ap-hero-title {
      font-size: clamp(3.2rem, 8vw, 6.5rem);
      color: var(--cream);
      margin-bottom: 22px;
      text-shadow: 0 4px 24px rgba(0,0,0,.4);
    }
    .about-page .ap-hero-title em {
      font-style: italic;
      color: var(--gold);
    }
    .about-page .ap-hero-sub {
      font-size: clamp(1rem, 2.2vw, 1.25rem);
      color: rgba(253,246,236,.82);
      line-height: 1.7;
      max-width: 600px;
      margin: 0 auto 40px;
      font-weight: 300;
    }
    .about-page .ap-hero-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      opacity: .5;
    }
    .about-page .ap-hero-divider span {
      width: 60px; height: 1px;
      background: var(--gold);
    }

    /* Scroll hint */
    .about-page .ap-scroll-hint {
      position: absolute;
      bottom: 32px; left: 50%;
      transform: translateX(-50%);
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: rgba(253,246,236,.5);
      font-size: .68rem;
      letter-spacing: .15em;
      text-transform: uppercase;
    }
    .about-page .ap-scroll-hint .ap-scroll-line {
      width: 1px; height: 40px;
      background: linear-gradient(to bottom, rgba(245,166,35,.8), transparent);
      animation: ap-scroll-pulse 1.8s ease infinite;
    }
    @keyframes ap-scroll-pulse {
      0%,100% { opacity:.3; transform: scaleY(1); }
      50%      { opacity:1;  transform: scaleY(1.15); }
    }

    /* ══════════════════════════════════════════
       2. OUR STORY
    ══════════════════════════════════════════ */
    .about-page .ap-story {
      background: var(--cream);
    }
    .about-page .ap-story-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 72px;
      align-items: center;
    }
    .about-page .ap-story-visual {
      position: relative;
    }
    .about-page .ap-story-img-main {
      width: 100%; height: 480px;
      object-fit: cover;
      border-radius: var(--radius);
      box-shadow: var(--shadow-warm);
    }
    .about-page .ap-story-img-accent {
      position: absolute;
      bottom: -32px; right: -28px;
      width: 210px; height: 210px;
      object-fit: cover;
      border-radius: var(--radius);
      border: 6px solid var(--cream);
      box-shadow: var(--shadow-card);
    }
    .about-page .ap-story-badge {
      position: absolute;
      top: 24px; left: -20px;
      background: var(--maroon);
      color: var(--cream);
      border-radius: var(--radius);
      padding: 18px 22px;
      font-family: 'Playfair Display', serif;
      font-size: .9rem;
      font-weight: 700;
      box-shadow: var(--shadow-card);
      line-height: 1.4;
    }
    .about-page .ap-story-badge strong {
      display: block;
      font-size: 2rem;
      color: var(--gold);
    }

    .about-page .ap-story-text p {
      font-size: 1.05rem;
      color: #5A3E20;
      line-height: 1.85;
      margin-bottom: 20px;
    }
    .about-page .ap-story-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 32px;
    }
    .about-page .ap-story-pill {
      background: var(--saffron-light);
      color: var(--maroon);
      border: 1px solid rgba(139,26,26,.15);
      border-radius: 100px;
      padding: 7px 18px;
      font-size: .82rem;
      font-weight: 600;
    }

    /* ══════════════════════════════════════════
       3. MISSION
    ══════════════════════════════════════════ */
    .about-page .ap-mission {
      background: linear-gradient(135deg, var(--maroon) 0%, var(--maroon-deep) 50%, #3d0a0a 100%);
      position: relative;
      overflow: hidden;
    }
    .about-page .ap-mission::before {
      content: '';
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='26' fill='none' stroke='%23FF6B1A' stroke-width='.6'/%3E%3Cpath d='M30 4 L30 56 M4 30 L56 30' stroke='%23FF6B1A' stroke-width='.4'/%3E%3C/svg%3E");
      background-size: 60px 60px;
      opacity: .04;
    }
    .about-page .ap-mission-inner {
      position: relative; z-index: 1;
      text-align: center;
      max-width: 860px;
      margin: 0 auto;
    }
    .about-page .ap-mission-inner .ap-section-eyebrow span.ap-label { color: var(--gold); }
    .about-page .ap-mission-inner .ap-section-eyebrow::before { background: var(--gold); }
    .about-page .ap-mission-inner .ap-section-eyebrow { margin: 0 auto 18px; }

    .about-page .ap-mission-statement {
      font-size: clamp(1.6rem, 3.5vw, 2.5rem);
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      color: var(--cream);
      line-height: 1.35;
      margin-bottom: 16px;
    }
    .about-page .ap-mission-statement em { color: var(--gold); font-style: italic; }

    .about-page .ap-mission-sub {
      color: rgba(253,246,236,.7);
      font-size: 1rem;
      line-height: 1.75;
      margin-bottom: 56px;
    }

    .about-page .ap-mission-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .about-page .ap-mission-card {
      background: rgba(253,246,236,.07);
      border: 1px solid rgba(245,166,35,.2);
      border-radius: var(--radius);
      padding: 36px 28px;
      text-align: left;
      transition: background .3s, transform .3s;
    }
    .about-page .ap-mission-card:hover {
      background: rgba(253,246,236,.12);
      transform: translateY(-4px);
    }
    .about-page .ap-mission-icon {
      width: 52px; height: 52px;
      background: rgba(255,107,26,.18);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
      font-size: 1.5rem;
    }
    .about-page .ap-mission-card h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      color: var(--cream);
      margin-bottom: 10px;
    }
    .about-page .ap-mission-card p {
      font-size: .9rem;
      color: rgba(253,246,236,.65);
      line-height: 1.7;
    }

    /* ══════════════════════════════════════════
       4. WHAT MAKES US DIFFERENT
    ══════════════════════════════════════════ */
    .about-page .ap-different {
      background: var(--cream-dark);
    }
    .about-page .ap-different-header { margin-bottom: 60px; }
    .about-page .ap-different-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .about-page .ap-diff-card {
      background: var(--cream);
      border: 1px solid rgba(139,26,26,.1);
      border-radius: var(--radius);
      padding: 36px 30px;
      transition: box-shadow .3s, transform .3s, border-color .3s;
      position: relative;
      overflow: hidden;
    }
    .about-page .ap-diff-card::after {
      content: '';
      position: absolute;
      inset: 0; top: auto;
      height: 3px;
      background: linear-gradient(90deg, var(--saffron), var(--gold));
      transform: scaleX(0);
      transform-origin: left;
      transition: transform .35s ease;
    }
    .about-page .ap-diff-card:hover {
      box-shadow: var(--shadow-warm);
      transform: translateY(-6px);
      border-color: transparent;
    }
    .about-page .ap-diff-card:hover::after { transform: scaleX(1); }

    .about-page .ap-diff-emoji {
      font-size: 2.2rem;
      margin-bottom: 18px;
      display: block;
    }
    .about-page .ap-diff-card h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.15rem;
      color: var(--maroon);
      margin-bottom: 12px;
    }
    .about-page .ap-diff-card p {
      font-size: .9rem;
      color: #7A5C3A;
      line-height: 1.7;
    }

    /* ══════════════════════════════════════════
       5. NUMBERS
    ══════════════════════════════════════════ */
    .about-page .ap-numbers {
      background: var(--cream);
      text-align: center;
    }
    .about-page .ap-numbers-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2px;
      background: rgba(139,26,26,.1);
      border-radius: var(--radius);
      overflow: hidden;
      margin-top: 64px;
    }
    .about-page .ap-num-cell {
      background: var(--cream);
      padding: 52px 24px;
      transition: background .3s;
    }
    .about-page .ap-num-cell:hover { background: var(--saffron-light); }

    .about-page .ap-num-value {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.8rem, 5vw, 4rem);
      font-weight: 900;
      color: var(--maroon);
      line-height: 1;
      margin-bottom: 8px;
    }
    .about-page .ap-num-value .ap-num-suffix {
      color: var(--saffron);
      font-size: .65em;
    }
    .about-page .ap-num-label {
      font-size: .85rem;
      color: #7A5C3A;
      font-weight: 500;
      line-height: 1.4;
    }

    /* ══════════════════════════════════════════
       6. VALUES
    ══════════════════════════════════════════ */
    .about-page .ap-values {
      background: var(--cream-dark);
      overflow: hidden;
    }
    .about-page .ap-values-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 72px;
      align-items: center;
    }
    .about-page .ap-values-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 48px;
    }
    .about-page .ap-value-item {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      padding: 24px;
      background: var(--cream);
      border-radius: var(--radius-sm);
      border-left: 4px solid transparent;
      transition: border-color .3s, box-shadow .3s;
      cursor: default;
    }
    .about-page .ap-value-item:hover {
      border-left-color: var(--saffron);
      box-shadow: var(--shadow-card);
    }
    .about-page .ap-value-icon {
      font-size: 1.8rem;
      flex-shrink: 0;
      width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
    }
    .about-page .ap-value-text h4 {
      font-family: 'Playfair Display', serif;
      font-size: 1rem;
      color: var(--maroon);
      margin-bottom: 6px;
    }
    .about-page .ap-value-text p {
      font-size: .88rem;
      color: #7A5C3A;
      line-height: 1.65;
    }

    /* Right side: mandala visual */
    .about-page .ap-values-visual {
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .about-page .ap-mandala-wrap {
      position: relative;
      width: 380px; height: 380px;
    }
    .about-page .ap-mandala-wrap svg {
      width: 100%; height: 100%;
      animation: ap-rotate-slow 40s linear infinite;
    }
    .about-page .ap-mandala-center {
      position: absolute;
      inset: 0; display: flex;
      align-items: center; justify-content: center;
      text-align: center;
    }
    .about-page .ap-mandala-center-text {
      font-family: 'Playfair Display', serif;
      font-size: 1rem;
      color: var(--maroon);
      font-style: italic;
      max-width: 140px;
      line-height: 1.5;
    }
    @keyframes ap-rotate-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* ══════════════════════════════════════════
       7. WHY CHOOSE
    ══════════════════════════════════════════ */
    .about-page .ap-why {
      background: var(--cream);
    }
    .about-page .ap-why-header { margin-bottom: 60px; }
    .about-page .ap-why-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    .about-page .ap-why-card {
      border-radius: var(--radius);
      padding: 40px 36px;
      position: relative;
      overflow: hidden;
    }
    .about-page .ap-why-card.ap-why-ours {
      background: linear-gradient(135deg, var(--maroon) 0%, #6B1212 100%);
      color: var(--cream);
    }
    .about-page .ap-why-card.ap-why-theirs {
      background: #F5EFE6;
      border: 1.5px solid rgba(139,26,26,.12);
      color: var(--dark-brown);
    }
    .about-page .ap-why-card-tag {
      display: inline-block;
      font-size: .68rem;
      font-weight: 700;
      letter-spacing: .15em;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 100px;
      margin-bottom: 28px;
    }
    .about-page .ap-why-card.ap-why-ours .ap-why-card-tag {
      background: rgba(245,166,35,.25);
      color: var(--gold);
    }
    .about-page .ap-why-card.ap-why-theirs .ap-why-card-tag {
      background: rgba(139,26,26,.1);
      color: var(--maroon);
    }
    .about-page .ap-why-card h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      margin-bottom: 28px;
    }
    .about-page .ap-why-card.ap-why-theirs h3 { color: var(--maroon); }
    .about-page .ap-why-check-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .about-page .ap-why-check-list li {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      font-size: .95rem;
      line-height: 1.55;
    }
    .about-page .ap-why-card.ap-why-ours .ap-why-check-list li { color: rgba(253,246,236,.85); }
    .about-page .ap-why-card.ap-why-theirs .ap-why-check-list li { color: #7A5C3A; }
    .about-page .ap-why-check-list li .ap-check {
      width: 22px; height: 22px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .7rem;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .about-page .ap-why-card.ap-why-ours .ap-check {
      background: rgba(245,166,35,.25);
      color: var(--gold);
    }
    .about-page .ap-why-card.ap-why-theirs .ap-check {
      background: rgba(139,26,26,.1);
      color: var(--maroon);
    }

    /* ══════════════════════════════════════════
       8. GALLERY — SIGNATURE FILM REEL
    ══════════════════════════════════════════ */
    .about-page .ap-gallery {
      background: var(--dark-brown);
      padding: 96px 0;
      overflow: hidden;
    }
    .about-page .ap-gallery-header {
      padding: 0 24px;
      max-width: 1160px;
      margin: 0 auto 52px;
    }
    .about-page .ap-gallery-header .ap-section-title { color: var(--cream); }
    .about-page .ap-gallery-header .ap-section-sub   { color: rgba(253,246,236,.6); }
    .about-page .ap-gallery-header .ap-section-eyebrow span.ap-label { color: var(--gold); }
    .about-page .ap-gallery-header .ap-section-eyebrow::before { background: var(--gold); }

    /* Scrollable reel */
    .about-page .ap-reel-track {
      display: flex;
      gap: 20px;
      padding: 0 24px 28px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: thin;
      scrollbar-color: rgba(245,166,35,.4) transparent;
      cursor: grab;
    }
    .about-page .ap-reel-track:active { cursor: grabbing; }
    .about-page .ap-reel-track::-webkit-scrollbar { height: 4px; }
    .about-page .ap-reel-track::-webkit-scrollbar-thumb { background: rgba(245,166,35,.4); border-radius: 4px; }

    .about-page .ap-reel-card {
      flex: 0 0 auto;
      width: 280px;
      height: 380px;
      border-radius: var(--radius);
      overflow: hidden;
      scroll-snap-align: start;
      position: relative;
      box-shadow: 0 12px 40px rgba(0,0,0,.4);
      transition: transform .3s;
    }
    .about-page .ap-reel-card:hover { transform: scale(1.03); }
    .about-page .ap-reel-card img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform .5s ease;
    }
    .about-page .ap-reel-card:hover img { transform: scale(1.06); }
    .about-page .ap-reel-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(45,27,0,.85) 0%, transparent 55%);
      display: flex; flex-direction: column;
      justify-content: flex-end;
      padding: 24px 20px;
    }
    .about-page .ap-reel-label {
      font-size: .7rem;
      font-weight: 600;
      letter-spacing: .15em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 6px;
    }
    .about-page .ap-reel-caption {
      font-family: 'Playfair Display', serif;
      font-size: 1.05rem;
      color: var(--cream);
      line-height: 1.35;
    }

    /* Tall card variant */
    .about-page .ap-reel-card.ap-reel-tall { height: 440px; }
    .about-page .ap-reel-card.ap-reel-wide { width: 340px; }

    /* ══════════════════════════════════════════
       9. VISION
    ══════════════════════════════════════════ */
    .about-page .ap-vision {
      background: var(--cream-dark);
    }
    .about-page .ap-vision-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 72px;
      align-items: center;
    }
    .about-page .ap-vision-text p {
      font-size: 1rem;
      color: #5A3E20;
      line-height: 1.85;
      margin-bottom: 16px;
    }
    .about-page .ap-vision-steps {
      margin-top: 40px;
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .about-page .ap-vision-step {
      display: flex;
      gap: 20px;
      padding-bottom: 28px;
      position: relative;
    }
    .about-page .ap-vision-step:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 19px; top: 40px;
      width: 1px; bottom: 0;
      background: linear-gradient(to bottom, var(--saffron), transparent);
    }
    .about-page .ap-vs-dot {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: var(--saffron-light);
      border: 2px solid var(--saffron);
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .about-page .ap-vs-body h4 {
      font-family: 'Playfair Display', serif;
      font-size: 1rem;
      color: var(--maroon);
      margin-bottom: 4px;
    }
    .about-page .ap-vs-body p {
      font-size: .88rem;
      color: #7A5C3A;
      line-height: 1.65;
      margin: 0;
    }

    /* Right: future visual */
    .about-page .ap-vision-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .about-page .ap-vis-card {
      background: var(--cream);
      border: 1px solid rgba(139,26,26,.1);
      border-radius: var(--radius-sm);
      padding: 26px 22px;
      transition: box-shadow .3s, transform .3s;
    }
    .about-page .ap-vis-card:hover {
      box-shadow: var(--shadow-card);
      transform: translateY(-4px);
    }
    .about-page .ap-vis-card:nth-child(1) { grid-column: span 2; background: var(--maroon); }
    .about-page .ap-vis-card:nth-child(1) h4 { color: var(--gold); }
    .about-page .ap-vis-card:nth-child(1) p  { color: rgba(253,246,236,.75); }
    .about-page .ap-vis-card .ap-vis-icon { font-size: 1.6rem; margin-bottom: 14px; }
    .about-page .ap-vis-card h4 {
      font-family: 'Playfair Display', serif;
      font-size: .95rem;
      color: var(--maroon);
      margin-bottom: 8px;
    }
    .about-page .ap-vis-card p {
      font-size: .82rem;
      color: #7A5C3A;
      line-height: 1.65;
    }

    /* ══════════════════════════════════════════
       10. CTA
    ══════════════════════════════════════════ */
    .about-page .ap-cta {
      background: linear-gradient(135deg, var(--dark-brown) 0%, #4a0f0f 50%, var(--maroon-deep) 100%);
      position: relative;
      overflow: hidden;
      text-align: center;
    }
    .about-page .ap-cta::before {
      content: '';
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='46' fill='none' stroke='%23FF6B1A' stroke-width='.8'/%3E%3Ccircle cx='50' cy='50' r='28' fill='none' stroke='%23F5A623' stroke-width='.5'/%3E%3Ccircle cx='50' cy='50' r='10' fill='none' stroke='%23FF6B1A' stroke-width='.5'/%3E%3C/svg%3E");
      background-size: 100px 100px;
      opacity: .04;
    }
    .about-page .ap-cta-inner {
      position: relative; z-index: 1;
      max-width: 720px; margin: 0 auto;
    }
    .about-page .ap-cta-ornament {
      font-size: 2.2rem;
      margin-bottom: 20px;
    }
    .about-page .ap-cta-title {
      font-size: clamp(2rem, 4.5vw, 3.2rem);
      color: var(--cream);
      margin-bottom: 18px;
      line-height: 1.2;
    }
    .about-page .ap-cta-title em { color: var(--gold); font-style: italic; }
    .about-page .ap-cta-sub {
      color: rgba(253,246,236,.65);
      font-size: 1.05rem;
      line-height: 1.7;
      margin-bottom: 48px;
    }
    .about-page .ap-cta-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .about-page .ap-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 16px 36px;
      border-radius: 100px;
      font-size: .95rem;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: transform .25s, box-shadow .25s, filter .25s;
      letter-spacing: .01em;
    }
    .about-page .ap-btn:hover { transform: translateY(-3px); }
    .about-page .ap-btn-primary {
      background: linear-gradient(135deg, var(--saffron), var(--gold));
      color: #1a0800;
      box-shadow: 0 8px 28px rgba(255,107,26,.4);
    }
    .about-page .ap-btn-primary:hover { box-shadow: 0 14px 36px rgba(255,107,26,.55); }
    .about-page .ap-btn-outline {
      background: transparent;
      color: var(--cream);
      border: 1.5px solid rgba(253,246,236,.35);
    }
    .about-page .ap-btn-outline:hover {
      background: rgba(253,246,236,.08);
      border-color: rgba(253,246,236,.6);
    }

    /* ══════════════════════════════════════════
       RESPONSIVE
    ══════════════════════════════════════════ */
    @media (max-width: 900px) {
      .about-page .ap-story-grid,
      .about-page .ap-values-layout,
      .about-page .ap-vision-grid { grid-template-columns: 1fr; gap: 48px; }

      .about-page .ap-story-img-accent { display: none; }
      .about-page .ap-story-badge { left: 12px; top: 12px; }

      .about-page .ap-mission-cards { grid-template-columns: 1fr; }
      .about-page .ap-different-grid { grid-template-columns: 1fr 1fr; }
      .about-page .ap-numbers-grid { grid-template-columns: 1fr 1fr; }
      .about-page .ap-why-grid { grid-template-columns: 1fr; }

      .about-page .ap-collage-img:nth-child(1),
      .about-page .ap-collage-img:nth-child(2),
      .about-page .ap-collage-img:nth-child(3),
      .about-page .ap-collage-img:nth-child(4),
      .about-page .ap-collage-img:nth-child(5) {
        width: 110px; height: 140px;
      }
      .about-page .ap-collage-img:nth-child(2) { display: none; }
      .about-page .ap-collage-img:nth-child(4) { display: none; }
      .about-page .ap-collage-img:nth-child(5) { display: none; }

      .about-page .ap-mandala-wrap { width: 280px; height: 280px; }
      .about-page .ap-values-visual { order: -1; }
    }

    @media (max-width: 600px) {
      .about-page .ap-section { padding: 64px 20px; }
      .about-page .ap-different-grid { grid-template-columns: 1fr; }
      .about-page .ap-numbers-grid { grid-template-columns: 1fr 1fr; }
      .about-page .ap-vision-cards { grid-template-columns: 1fr; }
      .about-page .ap-vis-card:nth-child(1) { grid-column: span 1; }

      .about-page .ap-reel-card { width: 240px; height: 320px; }
      .about-page .ap-reel-card.ap-reel-wide { width: 280px; }
      .about-page .ap-reel-card.ap-reel-tall { height: 360px; }
    }

    /* ══════════════════════════════════════════
       REVEAL ANIMATION
    ══════════════════════════════════════════ */
    .about-page .ap-reveal {
      opacity: 0;
      transform: translateY(36px);
      transition: opacity .7s ease, transform .7s ease;
    }
    .about-page .ap-reveal.ap-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .about-page .ap-reveal-d1 { transition-delay: .1s; }
    .about-page .ap-reveal-d2 { transition-delay: .2s; }
    .about-page .ap-reveal-d3 { transition-delay: .3s; }
    .about-page .ap-reveal-d4 { transition-delay: .4s; }
    .about-page .ap-reveal-d5 { transition-delay: .5s; }

    @media (prefers-reduced-motion: reduce) {
      .about-page .ap-reveal { opacity:1; transform:none; transition: none; }
      .about-page .ap-mandala-wrap svg { animation: none; }
    }

    /* ══════════════════════════════════════════
       DARK THEME SYSTEM (Parity with Dashboard)
    ══════════════════════════════════════════ */
    .dark .about-page,
    :root.dark .about-page,
    .about-page.dark {
      --cream: #0a0f1d;
      --cream-dark: #121a2d;
      --dark-brown: #ffffff;
      --maroon-deep: #162036;
      --saffron-light: #1e293b;
      --shadow-warm: 0 8px 32px rgba(0,0,0,.4);
      --shadow-card: 0 4px 20px rgba(0,0,0,.3);
      background: #0a0f1d !important;
      color: #cbd5e1 !important;
    }

    .dark .about-page .ap-hero {
      background: #0a0f1d !important;
    }

    .dark .about-page h1,
    .dark .about-page h2,
    .dark .about-page h3,
    .dark .about-page h4 {
      color: #ffffff !important;
    }

    .dark .about-page p {
      color: #cbd5e1 !important;
    }

    .dark .about-page .ap-mission-card,
    .dark .about-page .ap-diff-card,
    .dark .about-page .ap-num-cell,
    .dark .about-page .ap-vis-card,
    .dark .about-page .ap-story-card {
      background: #121a2d !important;
      border: 1px solid #23324d !important;
      color: #cbd5e1 !important;
      box-shadow: 0 4px 20px rgba(0,0,0,.3) !important;
    }

    .dark .about-page .ap-diff-card:hover,
    .dark .about-page .ap-num-cell:hover {
      background: #18233c !important;
      border-color: #FF6B1A !important;
    }

    .dark .about-page .ap-diff-title,
    .dark .about-page .ap-num-title,
    .dark .about-page .ap-vis-title {
      color: #ffffff !important;
    }

    .dark .about-page .ap-story-badge {
      background: rgba(18, 26, 45, 0.9) !important;
      border-color: #23324d !important;
      color: #ffffff !important;
    }

    .dark .about-page .ap-badge {
      background: rgba(255, 107, 26, 0.15) !important;
      color: #fb923c !important;
      border-color: rgba(255, 107, 26, 0.3) !important;
    }
  `}</style>
      <div className="about-page" ref={containerRef}>
        <Helmet>
          <title>About Us | Travel In Depth — Discover Incredible India</title>
          <meta
            name="description"
            content="Learn about Travel In Depth's mission to make exploring India deeply immersive, culturally rich, authentic, and eco-conscious."
          />
          <link rel="canonical" href="https://travelindepth.com/about" />
        </Helmet>


  {/* ── 1. HERO ── */}
  <section className="ap-hero">
    <div className="ap-hero-bg"></div>
    <div className="ap-hero-pattern"></div>

    {/* Floating collage photos (using Unsplash India travel images) */}
    <div className="ap-hero-collage">
      <div className="ap-collage-img" style={{'--r': '-4deg'}}>
        <img src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80" alt="Taj Mahal" loading="lazy" />
      </div>
      <div className="ap-collage-img" style={{'--r': '3deg'}}>
        <img src="https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&q=80" alt="Indian spices" loading="lazy" />
      </div>
      <div className="ap-collage-img" style={{'--r': '3.5deg'}}>
        <img src="https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=400&q=80" alt="Varanasi ghats" loading="lazy" />
      </div>
      <div className="ap-collage-img" style={{'--r': '-3deg'}}>
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" alt="Rajasthan" loading="lazy" />
      </div>
      <div className="ap-collage-img" style={{'--r': '5deg'}}>
        <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80" alt="Kerala" loading="lazy" />
      </div>
    </div>

    <div className="ap-hero-vignette"></div>

    <div className="ap-hero-content">
      <div className="ap-hero-eyebrow">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#F5A623" strokeWidth="1.2"/><circle cx="7" cy="7" r="2.5" fill="#F5A623"/></svg>
        Proudly Indian — Deeply Curious
      </div>

      <h1 className="ap-display ap-hero-title">
        Travel <em>In Depth</em>
      </h1>

      <p className="ap-hero-sub">
        Not Just Places. Stories, Culture, Experiences and Connections.
      </p>

      <div className="ap-hero-divider">
        <span></span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="#F5A623" strokeWidth=".8"/>
          <circle cx="10" cy="10" r="4" fill="#F5A623" opacity=".6"/>
        </svg>
        <span></span>
      </div>
    </div>

    <div className="ap-scroll-hint">
      <div className="ap-scroll-line"></div>
      <span>Scroll</span>
    </div>
  </section>


  {/* ── 2. OUR STORY ── */}
  <section className="ap-section ap-story">
    <div className="ap-container">
      <div className="ap-story-grid">

        <div className="ap-story-visual ap-reveal">
          <img
            className="ap-story-img-main"
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&q=85"
            alt="Taj Mahal sunrise"
            loading="lazy"
          />
          <img
            className="ap-story-img-accent"
            src="https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&q=80"
            alt="Local spices market"
            loading="lazy"
          />
          <div className="ap-story-badge">
            <strong>5+</strong>
            Years crafting<br/>deeper journeys
          </div>
        </div>

        <div className="ap-story-text ap-reveal ap-reveal-d2">
          <div className="ap-section-eyebrow">
            <span className="ap-label">Our Story</span>
          </div>
          <h2 className="ap-serif ap-section-title">India Is More Than Its Monuments</h2>

          <p>
            Travel In Depth was born from a single frustrating experience: arriving at a world-famous destination and feeling utterly disconnected from the real India pulsing just beyond the tourist trail. We knew there had to be a better way.
          </p>
          <p>
            We are a passionate team of explorers, storytellers and culture lovers who believe that the most memorable travel moments happen not at the check-in of a five-star hotel but at a roadside dhaba at dawn, in the lane of a local artisan, at a folk festival no guidebook mentions.
          </p>
          <p>
            Our platform uncovers India's hidden layers — ancient havelis, forest trails, century-old street food, living tribal traditions and sustainable eco-stays — so every traveller can experience a richer, more authentic India that stays with them long after the journey ends.
          </p>

          <div className="ap-story-pills">
            <span className="ap-story-pill">🍛 Local Food</span>
            <span className="ap-story-pill">🏺 Heritage</span>
            <span className="ap-story-pill">🌿 Sustainability</span>
            <span className="ap-story-pill">🗺️ Hidden Gems</span>
            <span className="ap-story-pill">🤝 Community</span>
            <span className="ap-story-pill">🎭 Culture</span>
          </div>
        </div>

      </div>
    </div>
  </section>


  {/* ── 3. MISSION ── */}
  <section className="ap-section ap-mission">
    <div className="ap-container">
      <div className="ap-mission-inner">
        <div className="ap-section-eyebrow ap-reveal">
          <span className="ap-label">Our Mission</span>
        </div>
        <h2 className="ap-mission-statement ap-reveal ap-reveal-d1">
          Helping travellers experience India in a<br/>
          <em>deeper and more meaningful way.</em>
        </h2>
        <p className="ap-mission-sub ap-reveal ap-reveal-d2">
          Every feature, every story, every recommendation we create is guided by one question: does this help someone truly connect with India — its people, its landscapes, its living culture?
        </p>

        <div className="ap-mission-cards">
          <div className="ap-mission-card ap-reveal ap-reveal-d1">
            <div className="ap-mission-icon">🧭</div>
            <h3>Go Beyond the Obvious</h3>
            <p>Surface the experiences that lie just off the tourist highway — places that reward curiosity over comfort.</p>
          </div>
          <div className="ap-mission-card ap-reveal ap-reveal-d2">
            <div className="ap-mission-icon">🤝</div>
            <h3>Support Local First</h3>
            <p>Every recommendation we make prioritises local businesses, artisans, guides and homestay owners over large chains.</p>
          </div>
          <div className="ap-mission-card ap-reveal ap-reveal-d3">
            <div className="ap-mission-icon">🌱</div>
            <h3>Travel Responsibly</h3>
            <p>We champion slow travel, minimal footprint and deep engagement with the communities that call these places home.</p>
          </div>
        </div>
      </div>
    </div>
  </section>


  {/* ── 4. WHAT MAKES US DIFFERENT ── */}
  <section className="ap-section ap-different">
    <div className="ap-container">
      <div className="ap-different-header">
        <div className="ap-section-eyebrow ap-reveal">
          <span className="ap-label">What Makes Us Different</span>
        </div>
        <h2 className="ap-serif ap-section-title ap-reveal ap-reveal-d1">Curated for Curious Travellers</h2>
        <p className="ap-section-sub ap-reveal ap-reveal-d2">We don't just list destinations. We decode them — their layers, their stories, their soul.</p>
      </div>

      <div className="ap-different-grid">
        <div className="ap-diff-card ap-reveal ap-reveal-d1">
          <span className="ap-diff-emoji">💎</span>
          <h3>Hidden Gems</h3>
          <p>Step-wells forgotten by time, village murals, monsoon waterfalls with no signboard. We find them so you don't have to.</p>
        </div>
        <div className="ap-diff-card ap-reveal ap-reveal-d2">
          <span className="ap-diff-emoji">🗓️</span>
          <h3>Smart Trip Planning</h3>
          <p>Intelligent itineraries that account for season, crowd cycles and your travel style — not just Google's top 10.</p>
        </div>
        <div className="ap-diff-card ap-reveal ap-reveal-d3">
          <span className="ap-diff-emoji">🍜</span>
          <h3>Local Food Discovery</h3>
          <p>From Lucknow's galawati kebabs to Chettinad's curry trails — we map India's most delicious, least-documented food stories.</p>
        </div>
        <div className="ap-diff-card ap-reveal ap-reveal-d1">
          <span className="ap-diff-emoji">🎭</span>
          <h3>Authentic Experiences</h3>
          <p>Craft workshops, temple rituals, folk performances and farm stays that put you inside the culture, not just in front of it.</p>
        </div>
        <div className="ap-diff-card ap-reveal ap-reveal-d2">
          <span className="ap-diff-emoji">🌿</span>
          <h3>Sustainable Travel</h3>
          <p>Eco-lodges, responsible tour operators and low-impact routes for travellers who care about what they leave behind.</p>
        </div>
        <div className="ap-diff-card ap-reveal ap-reveal-d3">
          <span className="ap-diff-emoji">📍</span>
          <h3>Nearby Destinations</h3>
          <p>Discover extraordinary places within a day's journey from any major city — perfect for weekend explorations.</p>
        </div>
      </div>
    </div>
  </section>


  {/* ── 5. TRAVEL IN NUMBERS ── */}
  <section className="ap-section ap-numbers">
    <div className="ap-container">
      <div style={{textAlign: 'center'}}>
        <div className="ap-section-eyebrow ap-reveal" style={{justifyContent: 'center', margin: '0 auto 16px'}}>
          <span className="ap-label">Travel In Numbers</span>
        </div>
        <h2 className="ap-serif ap-section-title ap-reveal ap-reveal-d1" style={{margin: '0 auto'}}>Growing, One Journey at a Time</h2>
      </div>

      <div className="ap-numbers-grid">
        <div className="ap-num-cell ap-reveal ap-reveal-d1">
          <div className="ap-num-value" data-target="14">0<span className="ap-num-suffix">+</span></div>
          <div className="ap-num-label">Destinations<br/>Covered</div>
        </div>
        <div className="ap-num-cell ap-reveal ap-reveal-d2">
          <div className="ap-num-value" data-target="100">0<span className="ap-num-suffix">+</span></div>
          <div className="ap-num-label">Attractions<br/>Documented</div>
        </div>
        <div className="ap-num-cell ap-reveal ap-reveal-d3">
          <div className="ap-num-value" data-target="50">0<span className="ap-num-suffix">+</span></div>
          <div className="ap-num-label">Hidden Gems<br/>Uncovered</div>
        </div>
        <div className="ap-num-cell ap-reveal ap-reveal-d4">
          <div className="ap-num-value" data-target="1000">0<span className="ap-num-suffix">+</span></div>
          <div className="ap-num-label">Future Travellers<br/>Waiting</div>
        </div>
      </div>
    </div>
  </section>


  {/* ── 6. VALUES ── */}
  <section className="ap-section ap-values">
    <div className="ap-container">
      <div className="ap-values-layout">

        <div>
          <div className="ap-section-eyebrow ap-reveal">
            <span className="ap-label">Our Values</span>
          </div>
          <h2 className="ap-serif ap-section-title ap-reveal ap-reveal-d1">What We Stand For</h2>
          <p className="ap-section-sub ap-reveal ap-reveal-d2">These aren't marketing words. They are the principles that guide every recommendation, every partnership and every word we publish.</p>

          <div className="ap-values-list">
            <div className="ap-value-item ap-reveal ap-reveal-d1">
              <div className="ap-value-icon">🌍</div>
              <div className="ap-value-text">
                <h4>Sustainable Tourism</h4>
                <p>We only promote travel practices and businesses that actively protect natural and cultural heritage for future generations.</p>
              </div>
            </div>
            <div className="ap-value-item ap-reveal ap-reveal-d2">
              <div className="ap-value-icon">🏛️</div>
              <div className="ap-value-text">
                <h4>Cultural Preservation</h4>
                <p>We document and champion living traditions, dying crafts and indigenous knowledge before they disappear from the modern map.</p>
              </div>
            </div>
            <div className="ap-value-item ap-reveal ap-reveal-d3">
              <div className="ap-value-icon">👥</div>
              <div className="ap-value-text">
                <h4>Local Communities</h4>
                <p>Tourism should benefit the people who call a place home. We connect travellers directly with local guides, cooks and artisans.</p>
              </div>
            </div>
            <div className="ap-value-item ap-reveal ap-reveal-d4">
              <div className="ap-value-icon">🧭</div>
              <div className="ap-value-text">
                <h4>Responsible Exploration</h4>
                <p>Curiosity without care causes harm. We encourage travellers to engage respectfully, tread lightly and give back meaningfully.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Animated mandala */}
        <div className="ap-values-visual ap-reveal ap-reveal-d2">
          <div className="ap-mandala-wrap">
            <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer rings */}
              <circle cx="190" cy="190" r="182" stroke="#FF6B1A" strokeWidth="1" strokeDasharray="6 6" opacity=".35"/>
              <circle cx="190" cy="190" r="160" stroke="#F5A623" strokeWidth=".8" opacity=".25"/>
              <circle cx="190" cy="190" r="140" stroke="#8B1A1A" strokeWidth=".6" strokeDasharray="4 8" opacity=".2"/>
              {/* Petals */}
              <g opacity=".18">
                <ellipse cx="190" cy="90" rx="18" ry="52" fill="#FF6B1A"/>
                <ellipse cx="190" cy="290" rx="18" ry="52" fill="#FF6B1A"/>
                <ellipse cx="90" cy="190" rx="52" ry="18" fill="#FF6B1A"/>
                <ellipse cx="290" cy="190" rx="52" ry="18" fill="#FF6B1A"/>
                <ellipse cx="119" cy="119" rx="18" ry="52" fill="#F5A623" transform="rotate(-45 119 119)"/>
                <ellipse cx="261" cy="119" rx="18" ry="52" fill="#F5A623" transform="rotate(45 261 119)"/>
                <ellipse cx="119" cy="261" rx="18" ry="52" fill="#F5A623" transform="rotate(45 119 261)"/>
                <ellipse cx="261" cy="261" rx="18" ry="52" fill="#F5A623" transform="rotate(-45 261 261)"/>
              </g>
              {/* Inner detail */}
              <circle cx="190" cy="190" r="90" stroke="#FF6B1A" strokeWidth="1" strokeDasharray="3 6" opacity=".3"/>
              <circle cx="190" cy="190" r="60" stroke="#8B1A1A" strokeWidth=".8" opacity=".2"/>
              <circle cx="190" cy="190" r="36" fill="#FDF6EC" opacity=".9"/>
              <circle cx="190" cy="190" r="36" stroke="#FF6B1A" strokeWidth="1.5" opacity=".5"/>
              {/* Spokes */}
              <g stroke="#FF6B1A" strokeWidth=".8" opacity=".2">
                <line x1="190" y1="8" x2="190" y2="372"/>
                <line x1="8" y1="190" x2="372" y2="190"/>
                <line x1="57" y1="57" x2="323" y2="323"/>
                <line x1="323" y1="57" x2="57" y2="323"/>
              </g>
              {/* Dot accents */}
              <g fill="#F5A623" opacity=".5">
                <circle cx="190" cy="30" r="4"/>
                <circle cx="190" cy="350" r="4"/>
                <circle cx="30"  cy="190" r="4"/>
                <circle cx="350" cy="190" r="4"/>
              </g>
            </svg>
            <div className="ap-mandala-center">
              <p className="ap-mandala-center-text">Travel with intention, return with stories</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>


  {/* ── 7. WHY CHOOSE ── */}
  <section className="ap-section ap-why">
    <div className="ap-container">
      <div className="ap-why-header">
        <div className="ap-section-eyebrow ap-reveal">
          <span className="ap-label">Why Choose Us</span>
        </div>
        <h2 className="ap-serif ap-section-title ap-reveal ap-reveal-d1">The Travel In Depth Difference</h2>
        <p className="ap-section-sub ap-reveal ap-reveal-d2">Not all travel guides are created equal. Here is why thousands of curious explorers choose depth over breadth.</p>
      </div>

      <div className="ap-why-grid">
        <div className="ap-why-card ap-why-ours ap-reveal ap-reveal-d1">
          <span className="ap-why-card-tag">✦ Travel In Depth</span>
          <h3>A richer, more connected India</h3>
          <ul className="ap-why-check-list">
            <li><span className="ap-check">✦</span>Handpicked hidden gems beyond tourist circuits</li>
            <li><span className="ap-check">✦</span>Deep-dive local food trails, not just restaurant lists</li>
            <li><span className="ap-check">✦</span>Context-rich cultural and historical storytelling</li>
            <li><span className="ap-check">✦</span>Sustainable, community-first recommendations</li>
            <li><span className="ap-check">✦</span>Seasonal and crowd-aware trip planning advice</li>
            <li><span className="ap-check">✦</span>Nearby hidden escapes around every major city</li>
          </ul>
        </div>
        <div className="ap-why-card ap-why-theirs ap-reveal ap-reveal-d2">
          <span className="ap-why-card-tag">Typical Travel Guides</span>
          <h3 style={{color: 'var(--maroon)'}}>The same 10 places, repackaged</h3>
          <ul className="ap-why-check-list">
            <li><span className="ap-check">✗</span>Repetitive lists of already overcrowded sights</li>
            <li><span className="ap-check">✗</span>Generic food recommendations tied to advertisers</li>
            <li><span className="ap-check">✗</span>Shallow descriptions without cultural depth</li>
            <li><span className="ap-check">✗</span>No focus on local impact or sustainability</li>
            <li><span className="ap-check">✗</span>One-size-fits-all itineraries for every traveller</li>
            <li><span className="ap-check">✗</span>No discovery beyond the headline destinations</li>
          </ul>
        </div>
      </div>
    </div>
  </section>


  {/* ── 8. GALLERY — INDIA THROUGH OUR EYES ── */}
  <section className="ap-gallery">
    <div className="ap-gallery-header ap-reveal">
      <div className="ap-section-eyebrow">
        <span className="ap-label" style={{color: 'var(--gold)'}}>India Through Our Eyes</span>
      </div>
      <h2 className="ap-serif ap-section-title" style={{color: 'var(--cream)'}}>Every Frame, a Story</h2>
      <p className="ap-section-sub" style={{color: 'rgba(253,246,236,.6)'}}>Culture, heritage, food, nature, festivals, adventure — India contains multitudes. Scroll to see a few of ours.</p>
    </div>

    <div className="ap-reel-track" id="apReel" ref={reelRef}>
      <div className="ap-reel-card ap-reel-tall">
        <img src="https://images.unsplash.com/photo-1663513844814-5f2fd51e957a?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhlcml0YWdlfGVufDB8fDB8fHww" alt="Varanasi ghats" loading="lazy"/>
        <div className="ap-reel-overlay">
          <span className="ap-reel-label">Heritage</span>
          <p className="ap-reel-caption">The eternal ghats of Varanasi</p>
        </div>
      </div>
      <div className="ap-reel-card">
        <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=781&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Spice market" loading="lazy"/>
        <div className="ap-reel-overlay">
          <span className="ap-reel-label">Food</span>
          <p className="ap-reel-caption">India's rainbow of spices</p>
        </div>
      </div>
      <div className="ap-reel-card ap-reel-wide">
        <img src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Mountain landscape" loading="lazy"/>
        <div className="ap-reel-overlay">
          <span className="ap-reel-label">Nature</span>
          <p className="ap-reel-caption">Where the Himalayas touch the sky</p>
        </div>
      </div>
      <div className="ap-reel-card">
        <img src="https://images.unsplash.com/photo-1676712754009-e62b85811f01?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Kerala backwaters" loading="lazy"/>
        <div className="ap-reel-overlay">
          <span className="ap-reel-label">Serenity</span>
          <p className="ap-reel-caption">Kerala's still backwaters</p>
        </div>
      </div>
      <div className="ap-reel-card ap-reel-tall">
        <img src="https://images.unsplash.com/photo-1690708186073-17037cd66467?q=80&w=1187&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Rajasthan fort" loading="lazy"/>
        <div className="ap-reel-overlay">
          <span className="ap-reel-label">Rajputana</span>
          <p className="ap-reel-caption">Fortresses that tell a thousand tales</p>
        </div>
      </div>
      <div className="ap-reel-card">
        <img src="https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Indian festival" loading="lazy"/>
        <div className="ap-reel-overlay">
          <span className="ap-reel-label">Festivals</span>
          <p className="ap-reel-caption">Colour, music and pure joy</p>
        </div>
      </div>
      <div className="ap-reel-card ap-reel-wide">
        <img src="https://images.unsplash.com/photo-1501761095094-94d36f57edbb?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Forest landscape" loading="lazy"/>
        <div className="ap-reel-overlay">
          <span className="ap-reel-label">Adventure</span>
          <p className="ap-reel-caption">India's wild, uncharted forests</p>
        </div>
      </div>
      <div className="ap-reel-card">
        <img src="https://media.istockphoto.com/id/1163243050/photo/famous-indian-asian-street-food-dish-i-e-panipuri-snack-in-a-clay-bowl-along-with-its.webp?a=1&b=1&s=612x612&w=0&k=20&c=L9ckP6fFWlDCfzIAhIO3aLfr0VPrvSVMVxGZFAf3bPc=" alt="Indian street food" loading="lazy"/>
        <div className="ap-reel-overlay">
          <span className="ap-reel-label">Street Food</span>
          <p className="ap-reel-caption">Flavours born in the lanes</p>
        </div>
      </div>
    </div>
  </section>


  {/* ── 9. VISION ── */}
  <section className="ap-section ap-vision">
    <div className="ap-container">
      <div className="ap-vision-grid">

        <div className="ap-vision-text">
          <div className="ap-section-eyebrow ap-reveal">
            <span className="ap-label">Vision for the Future</span>
          </div>
          <h2 className="ap-serif ap-section-title ap-reveal ap-reveal-d1">Where We Are Headed</h2>

          <p className="ap-reveal ap-reveal-d2">
            Travel In Depth is only getting started. We are building the tools, the content and the community to make deep India travel accessible to everyone — from the solo backpacker to the family of four.
          </p>

          <div className="ap-vision-steps ap-reveal ap-reveal-d3">
            <div className="ap-vision-step">
              <div className="ap-vs-dot">🤖</div>
              <div className="ap-vs-body">
                <h4>AI-Powered Personalisation</h4>
                <p>Smart itinerary builder that crafts tailored journeys based on your pace, interests and values.</p>
              </div>
            </div>
            <div className="ap-vision-step">
              <div className="ap-vs-dot">🌿</div>
              <div className="ap-vs-body">
                <h4>Eco-Travel Network</h4>
                <p>A curated network of verified sustainable stays, guides and experiences across India.</p>
              </div>
            </div>
            <div className="ap-vision-step">
              <div className="ap-vs-dot">👥</div>
              <div className="ap-vs-body">
                <h4>Travel Community</h4>
                <p>A vibrant space for curious explorers to share discoveries, tips and untold stories from across India.</p>
              </div>
            </div>
            <div className="ap-vision-step">
              <div className="ap-vs-dot">📱</div>
              <div className="ap-vs-body">
                <h4>Offline-Ready Travel App</h4>
                <p>Your complete India guide available wherever you roam — even where Wi-Fi doesn't follow.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ap-vision-cards ap-reveal ap-reveal-d2">
          <div className="ap-vis-card">
            <div className="ap-vis-icon">🌏</div>
            <h4>Our Ambition</h4>
            <p>To become India's most trusted platform for deep, meaningful and responsible travel — one story at a time.</p>
          </div>
          <div className="ap-vis-card">
            <div className="ap-vis-icon">🗺️</div>
            <h4>More Destinations</h4>
            <p>Expanding coverage across every state — from the Northeast's living root bridges to Ladakh's moonscapes.</p>
          </div>
          <div className="ap-vis-card">
            <div className="ap-vis-icon">🎯</div>
            <h4>Smart Itineraries</h4>
            <p>Context-aware, season-sensitive trip plans built around how you travel, not how everyone else does.</p>
          </div>
          <div className="ap-vis-card">
            <div className="ap-vis-icon">💬</div>
            <h4>Local Voices</h4>
            <p>Amplifying guides, chefs, artisans and storytellers who bring each destination truly alive.</p>
          </div>
          <div className="ap-vis-card">
            <div className="ap-vis-icon">📖</div>
            <h4>Stories & Journals</h4>
            <p>Long-form travel narratives that read like literature and inspire like a conversation with a local friend.</p>
          </div>
        </div>

      </div>
    </div>
  </section>


  {/* ── 10. CTA ── */}
  <section className="ap-section ap-cta">
    <div className="ap-container">
      <div className="ap-cta-inner">
        <div className="ap-cta-ornament ap-reveal">🪔</div>
        <h2 className="ap-display ap-cta-title ap-reveal ap-reveal-d1">
          Ready to Explore India<br/><em>Beyond the Guidebooks?</em>
        </h2>
        <p className="ap-cta-sub ap-reveal ap-reveal-d2">
          Whether you are planning your first solo trip or your twentieth family adventure, Travel In Depth is your companion for a richer, more connected India experience.
        </p>
        <div className="ap-cta-buttons ap-reveal ap-reveal-d3">
          <Link to="/destinations" className="ap-btn ap-btn-primary">
             <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                 <path d="M8 1L15 8L8 15M15 8H1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
               Explore Destinations
          </Link>
        </div>
      </div>
    </div>
  </section>


      </div>
    </>
  );
}
