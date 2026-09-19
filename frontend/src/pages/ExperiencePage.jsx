import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getMediaUrl } from "../utils/media";
/* ====================================================================
   TRAVEL IN DEPTH — EXPERIENCE PAGE (JSX)
   Direct 1:1 conversion from the original static HTML/CSS/JS.
   No UI, layout, copy, or behavior changes — only the markup syntax
   and the vanilla-JS interactions have been adapted to React.
   Every selector remains scoped under .experience-page exactly as
   it was in the original <style> block, so this still won't leak
   into or be affected by any other site styles.

   VISUAL DISCOVERY SECTION (4) now uses real HTML5 <video> elements
   with full custom play/pause + native control behavior. See the
   `reels` data array and `handleReelToggle` handler below.
   ==================================================================== */

const EXPERIENCE_PAGE_STYLES = `
.experience-page {
  /* ---- Design tokens (scoped, won't collide with global vars) ---- */
  --exp-saffron: #FF6B1A;
  --exp-maroon: #8B1A1A;
  --exp-cream: #FDF6EC;
  --exp-gold: #F5A623;
  --exp-brown: #2D1B00;

  --exp-saffron-rgb: 255, 107, 26;
  --exp-maroon-rgb: 139, 26, 26;
  --exp-gold-rgb: 245, 166, 35;

  --exp-text: var(--exp-brown);
  --exp-text-soft: #6b5440;
  --exp-radius-sm: 10px;
  --exp-radius-md: 18px;
  --exp-radius-lg: 28px;
  --exp-shadow-sm: 0 4px 16px rgba(45, 27, 0, 0.08);
  --exp-shadow-md: 0 12px 32px rgba(45, 27, 0, 0.12);
  --exp-shadow-lg: 0 24px 56px rgba(45, 27, 0, 0.18);
  --exp-shadow-gold: 0 14px 36px rgba(245, 166, 35, 0.28);
  --exp-ease: cubic-bezier(0.22, 1, 0.36, 1);

  font-family: 'Poppins', 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: var(--exp-text);
  background: var(--exp-cream);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.experience-page * {
  box-sizing: border-box;
}

.experience-page img {
  max-width: 100%;
  display: block;
}

.experience-page h1,
.experience-page h2,
.experience-page h3 {
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  color: var(--exp-brown);
  margin: 0;
  line-height: 1.15;
}

.experience-page p {
  margin: 0;
  color: var(--exp-text-soft);
  line-height: 1.7;
}

.experience-page a {
  text-decoration: none;
}

.experience-page .exp-container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ---------------------------------------------------------------
   Reveal-on-scroll utility (JS toggles .is-visible)
   --------------------------------------------------------------- */
.experience-page [data-reveal] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s var(--exp-ease), transform 0.7s var(--exp-ease);
}

.experience-page [data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .experience-page [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* ---------------------------------------------------------------
   Shared: eyebrow label, section heads, buttons
   --------------------------------------------------------------- */
.experience-page .exp-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--exp-saffron);
  margin-bottom: 16px;
}

.experience-page .exp-eyebrow::before {
  content: "";
  width: 22px;
  height: 2px;
  background: var(--exp-gold);
  border-radius: 2px;
}

.experience-page .exp-eyebrow--light {
  color: var(--exp-gold);
}

.experience-page .exp-section__head {
  max-width: 680px;
  margin: 0 auto 56px;
  text-align: center;
}

.experience-page .exp-section__head--light .exp-eyebrow::before {
  background: var(--exp-saffron);
}

.experience-page .exp-section__title {
  font-size: clamp(28px, 4vw, 42px);
  margin-bottom: 16px;
}

.experience-page .exp-section__title--light {
  color: var(--exp-cream);
}

.experience-page .exp-section__sub {
  font-size: 17px;
  color: var(--exp-text-soft);
}

.experience-page .exp-section__sub--light {
  color: rgba(253, 246, 236, 0.78);
}

.experience-page .exp-section {
  padding: 96px 0;
}

.experience-page .exp-section--cream {
  background: linear-gradient(180deg, #FDF6EC 0%, #FBEFDC 100%);
}

.experience-page .exp-section--maroon {
  background:
    radial-gradient(ellipse at top right, rgba(255, 107, 26, 0.18), transparent 55%),
    linear-gradient(160deg, #8B1A1A 0%, #6e1414 100%);
  position: relative;
}

/* Buttons */
.experience-page .exp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 32px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.35s var(--exp-ease), box-shadow 0.35s var(--exp-ease), background 0.35s var(--exp-ease), color 0.35s var(--exp-ease);
  white-space: nowrap;
}

.experience-page .exp-btn--primary {
  background: linear-gradient(135deg, var(--exp-saffron), var(--exp-gold));
  color: #fff;
  box-shadow: var(--exp-shadow-gold);
}

.experience-page .exp-btn--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 44px rgba(255, 107, 26, 0.38);
}

.experience-page .exp-btn--ghost {
  background: rgba(253, 246, 236, 0.08);
  border-color: rgba(253, 246, 236, 0.55);
  color: var(--exp-cream);
  backdrop-filter: blur(6px);
}

.experience-page .exp-btn--ghost:hover {
  background: var(--exp-cream);
  color: var(--exp-maroon);
  transform: translateY(-3px);
}

.experience-page .exp-btn--outline-light {
  background: transparent;
  border-color: var(--exp-cream);
  color: var(--exp-cream);
}

.experience-page .exp-btn--outline-light:hover {
  background: var(--exp-cream);
  color: var(--exp-maroon);
  transform: translateY(-3px);
}

.experience-page .exp-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--exp-maroon);
  position: relative;
  transition: color 0.3s var(--exp-ease), gap 0.3s var(--exp-ease);
}

.experience-page .exp-link:hover {
  color: var(--exp-saffron);
}

/* ---------------------------------------------------------------
   1. HERO
   --------------------------------------------------------------- */
.experience-page .exp-hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.experience-page .exp-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.experience-page .exp-hero__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.05);
  animation: exp-hero-zoom 18s ease-out forwards;
}

@keyframes exp-hero-zoom {
  from { transform: scale(1.12); }
  to { transform: scale(1); }
}

.experience-page .exp-hero__overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(45, 18, 5, 0.55) 0%, rgba(45, 18, 5, 0.45) 40%, rgba(45, 18, 5, 0.85) 100%),
    linear-gradient(100deg, rgba(139, 26, 26, 0.5) 0%, rgba(45, 27, 0, 0.25) 60%);
}

.experience-page .exp-hero__inner {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
}

.experience-page .exp-hero__title {
  font-size: clamp(36px, 6vw, 64px);
  color: #fff;
  text-shadow: 0 6px 30px rgba(0, 0, 0, 0.35);
}

.experience-page .exp-hero__title-line {
  display: block;
  background: linear-gradient(135deg, var(--exp-gold), var(--exp-saffron));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.experience-page .exp-hero__desc {
  margin: 24px auto 36px;
  max-width: 580px;
  font-size: 18px;
  color: rgba(253, 246, 236, 0.9);
}

.experience-page .exp-hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.experience-page .exp-hero__scroll {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 46px;
  border: 2px solid rgba(253, 246, 236, 0.7);
  border-radius: 999px;
  z-index: 1;
}

.experience-page .exp-hero__scroll span {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 5px;
  height: 5px;
  margin-left: -2.5px;
  border-radius: 50%;
  background: var(--exp-gold);
  animation: exp-scroll-dot 1.8s infinite;
}

@keyframes exp-scroll-dot {
  0% { transform: translateY(0); opacity: 1; }
  70% { transform: translateY(16px); opacity: 0; }
  100% { transform: translateY(0); opacity: 0; }
}

/* ---------------------------------------------------------------
   2. EXPERIENCE CATEGORIES
   --------------------------------------------------------------- */
.experience-page .exp-cat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.experience-page .exp-cat-card {
  background: #fff;
  border-radius: var(--exp-radius-md);
  overflow: hidden;
  box-shadow: var(--exp-shadow-sm);
  transition: transform 0.45s var(--exp-ease), box-shadow 0.45s var(--exp-ease);
  position: relative;
}

.experience-page .exp-cat-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--exp-shadow-lg);
}

.experience-page .exp-cat-card__img {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.experience-page .exp-cat-card__img::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(45, 27, 0, 0) 40%, rgba(45, 27, 0, 0.55) 100%);
}

.experience-page .exp-cat-card__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--exp-ease);
}

.experience-page .exp-cat-card:hover .exp-cat-card__img img {
  transform: scale(1.1);
}

.experience-page .exp-cat-card__icon {
  position: absolute;
  top: -26px;
  left: 24px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: linear-gradient(135deg, var(--exp-saffron), var(--exp-gold));
  border-radius: 50%;
  box-shadow: var(--exp-shadow-gold);
  border: 3px solid #fff;
}

.experience-page .exp-cat-card__body {
  padding: 40px 24px 26px;
}

.experience-page .exp-cat-card__body h3 {
  font-size: 21px;
  margin-bottom: 10px;
}

.experience-page .exp-cat-card__body p {
  font-size: 14.5px;
}

/* ---------------------------------------------------------------
   3. FEATURED EXPERIENCES
   --------------------------------------------------------------- */
.experience-page .exp-feat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.experience-page .exp-feat-card {
  background: #fff;
  border-radius: var(--exp-radius-md);
  overflow: hidden;
  box-shadow: var(--exp-shadow-sm);
  transition: transform 0.45s var(--exp-ease), box-shadow 0.45s var(--exp-ease);
}

.experience-page .exp-feat-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--exp-shadow-lg);
}

.experience-page .exp-feat-card__img {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.experience-page .exp-feat-card__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--exp-ease);
}

.experience-page .exp-feat-card:hover .exp-feat-card__img img {
  transform: scale(1.08);
}

.experience-page .exp-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(45, 27, 0, 0.55);
  backdrop-filter: blur(6px);
  color: var(--exp-cream);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.experience-page .exp-feat-card__body {
  padding: 24px;
}

.experience-page .exp-feat-card__loc {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--exp-saffron);
  margin-bottom: 8px;
}

.experience-page .exp-feat-card__body h3 {
  font-size: 22px;
  margin-bottom: 10px;
}

.experience-page .exp-feat-card__body p {
  font-size: 14.5px;
  margin-bottom: 16px;
}

/* ---------------------------------------------------------------
   4. VISUAL DISCOVERY (reels)
   --------------------------------------------------------------- */
.experience-page .exp-reel-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 6px 6px 22px;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  scrollbar-color: var(--exp-saffron) transparent;
}

.experience-page .exp-reel-track::-webkit-scrollbar {
  height: 6px;
}

.experience-page .exp-reel-track::-webkit-scrollbar-thumb {
  background: var(--exp-saffron);
  border-radius: 999px;
}

.experience-page .exp-reel {
  position: relative;
  flex: 0 0 220px;
  height: 380px;
  border-radius: var(--exp-radius-lg);
  overflow: hidden;
  scroll-snap-align: start;
  box-shadow: var(--exp-shadow-sm);
  transition: transform 0.45s var(--exp-ease), box-shadow 0.45s var(--exp-ease);
}

.experience-page .exp-reel:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--exp-shadow-lg);
}

/* Video fills the card exactly like the old <img> did */
.experience-page .exp-reel__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
  cursor: pointer;
  transition: transform 0.6s var(--exp-ease);
}

.experience-page .exp-reel:hover .exp-reel__video {
  transform: scale(1.1);
}

.experience-page .exp-reel::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(45, 27, 0, 0.05) 0%, rgba(45, 27, 0, 0.75) 100%);
  pointer-events: none;
}

.experience-page .exp-reel__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: rgba(253, 246, 236, 0.92);
  color: var(--exp-maroon);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: transform 0.35s var(--exp-ease), background 0.35s var(--exp-ease), opacity 0.3s var(--exp-ease);
}

.experience-page .exp-reel:hover .exp-reel__play {
  transform: translate(-50%, -50%) scale(1.12);
  background: var(--exp-saffron);
  color: #fff;
}

.experience-page .exp-reel__play--pulse {
  transform: translate(-50%, -50%) scale(0.88) !important;
}

.experience-page .exp-reel__label {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 2;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

/* ---------------------------------------------------------------
   5. WHY TRAVEL IN DEPTH
   --------------------------------------------------------------- */
.experience-page .exp-why-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.experience-page .exp-why-card {
  background: rgba(253, 246, 236, 0.06);
  border: 1px solid rgba(253, 246, 236, 0.14);
  border-radius: var(--exp-radius-md);
  padding: 32px 26px;
  backdrop-filter: blur(4px);
  transition: transform 0.4s var(--exp-ease), background 0.4s var(--exp-ease), border-color 0.4s var(--exp-ease);
}

.experience-page .exp-why-card:hover {
  transform: translateY(-6px);
  background: rgba(253, 246, 236, 0.1);
  border-color: rgba(245, 166, 35, 0.5);
}

.experience-page .exp-why-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--exp-saffron), var(--exp-gold));
  margin-bottom: 18px;
  box-shadow: var(--exp-shadow-gold);
}

.experience-page .exp-why-card h3 {
  color: var(--exp-cream);
  font-size: 19px;
  margin-bottom: 10px;
}

.experience-page .exp-why-card p {
  color: rgba(253, 246, 236, 0.72);
  font-size: 14.5px;
}

/* ---------------------------------------------------------------
   6. SUSTAINABLE EXPERIENCES
   --------------------------------------------------------------- */
.experience-page .exp-sus-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.experience-page .exp-sus-card {
  background: #fff;
  border-radius: var(--exp-radius-md);
  overflow: hidden;
  box-shadow: var(--exp-shadow-sm);
  transition: transform 0.4s var(--exp-ease), box-shadow 0.4s var(--exp-ease);
}

.experience-page .exp-sus-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--exp-shadow-lg);
}

.experience-page .exp-sus-card__img {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.experience-page .exp-sus-card__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--exp-ease);
}

.experience-page .exp-sus-card:hover .exp-sus-card__img img {
  transform: scale(1.08);
}

.experience-page .exp-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(45, 27, 0, 0.75);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.experience-page .exp-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5BBE6B;
  box-shadow: 0 0 0 3px rgba(91, 190, 107, 0.25);
}

.experience-page .exp-sus-card__body {
  padding: 18px 20px 22px;
}

.experience-page .exp-sus-card__body h3 {
  font-size: 17px;
  margin-bottom: 8px;
}

.experience-page .exp-sus-card__body p {
  font-size: 13.5px;
}

/* ---------------------------------------------------------------
   7. STATS
   --------------------------------------------------------------- */
.experience-page .exp-stats {
  padding: 64px 0;
  background: linear-gradient(135deg, var(--exp-saffron), var(--exp-gold));
}

.experience-page .exp-stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  text-align: center;
}

.experience-page .exp-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.experience-page .exp-stat__num {
  display: block;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(34px, 5vw, 50px);
  font-weight: 700;
  color: #fff;
  text-shadow: 0 4px 18px rgba(45, 27, 0, 0.2);
}

.experience-page .exp-stat__label {
  display: block;
  margin-top: 8px;
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
}

/* ---------------------------------------------------------------
   8. TRAVELER STORIES
   --------------------------------------------------------------- */
.experience-page .exp-stories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.experience-page .exp-story-card {
  position: relative;
  background: #fff;
  border-radius: var(--exp-radius-md);
  padding: 36px 28px 28px;
  box-shadow: var(--exp-shadow-sm);
  transition: transform 0.4s var(--exp-ease), box-shadow 0.4s var(--exp-ease);
  border-top: 3px solid var(--exp-gold);
}

.experience-page .exp-story-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--exp-shadow-lg);
}

.experience-page .exp-story-card__quote-mark {
  position: absolute;
  top: 12px;
  right: 24px;
  font-family: 'Playfair Display', serif;
  font-size: 64px;
  color: rgba(255, 107, 26, 0.14);
  line-height: 1;
}

.experience-page .exp-story-card__text {
  font-size: 15px;
  font-style: italic;
  color: var(--exp-text);
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.experience-page .exp-story-card__person {
  display: flex;
  align-items: center;
  gap: 12px;
}

.experience-page .exp-story-card__person img {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--exp-gold);
}

.experience-page .exp-story-card__person strong {
  display: block;
  font-size: 14.5px;
  color: var(--exp-maroon);
}

.experience-page .exp-story-card__person span {
  font-size: 12.5px;
  color: var(--exp-text-soft);
}

/* ---------------------------------------------------------------
   9. FINAL CTA
   --------------------------------------------------------------- */
.experience-page .exp-final-cta {
  position: relative;
  padding: 120px 24px;
  text-align: center;
  overflow: hidden;
}

.experience-page .exp-final-cta__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.experience-page .exp-final-cta__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.experience-page .exp-final-cta__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(139, 26, 26, 0.88), rgba(45, 27, 0, 0.9));
}

.experience-page .exp-final-cta__inner {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
}

.experience-page .exp-final-cta__inner h2 {
  font-size: clamp(28px, 4.5vw, 44px);
  color: var(--exp-cream);
  margin-bottom: 16px;
}

.experience-page .exp-final-cta__inner p {
  color: rgba(253, 246, 236, 0.85);
  font-size: 17px;
  margin-bottom: 36px;
}

.experience-page .exp-final-cta__btns {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

/* =====================================================================
   RESPONSIVE
   ===================================================================== */
@media (max-width: 1080px) {
  .experience-page .exp-cat-grid,
  .experience-page .exp-feat-grid,
  .experience-page .exp-why-grid,
  .experience-page .exp-stories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .experience-page .exp-sus-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .experience-page .exp-section {
    padding: 72px 0;
  }
  .experience-page .exp-hero {
    min-height: 86vh;
  }
  .experience-page .exp-cat-grid,
  .experience-page .exp-feat-grid,
  .experience-page .exp-why-grid,
  .experience-page .exp-sus-grid,
  .experience-page .exp-stories-grid {
    grid-template-columns: 1fr;
  }
  .experience-page .exp-stats__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px 16px;
  }
  .experience-page .exp-hero__cta,
  .experience-page .exp-final-cta__btns {
    flex-direction: column;
    width: 100%;
  }
  .experience-page .exp-hero__cta .exp-btn,
  .experience-page .exp-final-cta__btns .exp-btn {
    width: 100%;
  }
  .experience-page .exp-reel {
    flex: 0 0 78vw;
    height: 320px;
  }
  .experience-page .exp-section__head {
    margin-bottom: 40px;
  }
}

/* =====================================================================
   DARK THEME SYSTEM (Parity with Dashboard Midnight Slate)
   ===================================================================== */
.dark .experience-page,
:root.dark .experience-page {
  --exp-cream: #0a0f1d;
  --exp-brown: #ffffff;
  --exp-text: #cbd5e1;
  --exp-text-soft: #94a3b8;
  background: #0a0f1d !important;
  color: #cbd5e1 !important;
}

.dark .experience-page .exp-hero {
  background: linear-gradient(180deg, #0a0f1d 0%, #121a2d 100%) !important;
}

.dark .experience-page .exp-hero::before {
  opacity: 0.05 !important;
}

.dark .experience-page h1,
.dark .experience-page h2,
.dark .experience-page h3,
.dark .experience-page h4 {
  color: #ffffff !important;
}

.dark .experience-page p {
  color: #cbd5e1 !important;
}

.dark .experience-page .exp-cat-card,
.dark .experience-page .exp-feat-card,
.dark .experience-page .exp-why-card,
.dark .experience-page .exp-sus-card,
.dark .experience-page .exp-story-card,
.dark .experience-page .exp-modal__content {
  background: #121a2d !important;
  border-color: #23324d !important;
  color: #cbd5e1 !important;
  box-shadow: 0 8px 30px rgba(0,0,0,0.3) !important;
}

.dark .experience-page .exp-filter-btn {
  background: #121a2d !important;
  border-color: #23324d !important;
  color: #cbd5e1 !important;
}

.dark .experience-page .exp-filter-btn.is-active,
.dark .experience-page .exp-filter-btn:hover {
  background: #FF6B1A !important;
  border-color: #FF6B1A !important;
  color: #ffffff !important;
}

.dark .experience-page .exp-cat-card__content,
.dark .experience-page .exp-feat-card__body,
.dark .experience-page .exp-why-card__body,
.dark .experience-page .exp-story-card__body {
  background: #121a2d !important;
}

.dark .experience-page .exp-cat-card__title,
.dark .experience-page .exp-feat-card__title,
.dark .experience-page .exp-why-card__title,
.dark .experience-page .exp-story-card__title {
  color: #ffffff !important;
}

.dark .experience-page .exp-badge {
  background: #18233c !important;
  color: #fb923c !important;
  border-color: #273754 !important;
}

.dark .experience-page .exp-stats {
  background: #0d1527 !important;
  border-color: #23324d !important;
}

.dark .experience-page .exp-reel {
  border-color: #23324d !important;
}
`;

/* ---------------------------------------------------------------
   Fonts: Playfair Display (headings) + Poppins (body), matching
   the <link> tags loaded in the original document <head>.
   --------------------------------------------------------------- */
function ExperienceFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </>
  );
}

/* ---------------------------------------------------------------
   Visual Discovery reel data — label + video src + poster.
   Poster keeps the card looking identical to the old static
   image design until the visitor presses play.
   --------------------------------------------------------------- */
const REELS = [
  {
    id: "mathura",
    label: "Prem Mandir in Mathura",
    src: getMediaUrl("videos/Krishna Janmabhoomi, Mathura.mp4"),
    poster: "https://images.unsplash.com/photo-1662376107358-21296a9234f1?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJlbSUyMG1hbmRpcnxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: "varanasi",
    label: "Ganga Aarti in Varanasi",
    src: getMediaUrl("videos/varanasi-ganga-aarti.mp4"),
    poster: "https://images.unsplash.com/photo-1612779774202-68e4305b849b?w=700&auto=format&fit=crop&q=60",
  },
  {
    id: "goa",
    label: "Beaches of Goa",
    src: getMediaUrl("videos/Hidden-Coves-Gokarna.mp4"),
    poster: "https://plus.unsplash.com/premium_photo-1697729701846-e34563b06d47?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "jaipur",
    label: "Hawa Mahal, Jaipur",
    src: getMediaUrl("videos/CamelTrails.mp4"),
    poster: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=700&auto=format&fit=crop",
  },
  {
    id: "jammu-kashmir",
    label: "Dal Lake, Jammu & Kashmir",
    src: getMediaUrl("videos/PangongLake.mp4"),
    poster: "https://images.unsplash.com/photo-1566837497312-7be4ebb33b54?q=80&w=700&auto=format&fit=crop",
  },
  {
    id: "manali",
    label: "Snow Valleys of Manali",
    src: getMediaUrl("videos/SpitiValley.mp4"),
    poster: "https://images.unsplash.com/photo-1715457573748-8e8a70b2c1be?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGFsJTIwbGFrZXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: "agra",
    label: "Taj Mahal, Agra",
    src: getMediaUrl("videos/agra-taj-mahal.mp4"),
    poster: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=700&auto=format&fit=crop",
  },
];
export default function ExperiencePage() {
  const rootRef = useRef(null);

  /* -----------------------------------------------------------
     Visual Discovery video state
     - playingIndex: index of the currently playing reel, or null
     - videoRefs: array of refs to each <video> element, so we can
       imperatively play/pause them and enforce "only one at a time"
     ----------------------------------------------------------- */
  const [playingIndex, setPlayingIndex] = useState(null);
  const videoRefs = useRef([]);

  function handleReelToggle(index) {
    const videos = videoRefs.current;
    const clicked = videos[index];
    if (!clicked) return;

    if (playingIndex === index) {
      // Same video clicked again -> pause it.
      clicked.pause();
      setPlayingIndex(null);
    } else {
      // A different (or no) video was playing -> pause it first.
      if (playingIndex !== null && videos[playingIndex]) {
        videos[playingIndex].pause();
      }
      clicked.play().catch(() => {
        // Autoplay/playback was blocked (e.g. no user gesture) — ignore.
      });
      setPlayingIndex(index);
    }
  }

  // Keeps React state in sync if a video is paused/ended through its
  // own native controls (rather than via our custom button/click).
  function handleNativePause(index) {
    if (playingIndex === index) {
      setPlayingIndex(null);
    }
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /* -----------------------------------------------------------
       1. Scroll-reveal animation for [data-reveal] elements
       ----------------------------------------------------------- */
    const revealEls = root.querySelectorAll("[data-reveal]");
    let revealObserver;

    if ("IntersectionObserver" in window && revealEls.length) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );

      revealEls.forEach((el, i) => {
        // Small stagger so grids feel choreographed, not jittery.
        el.style.transitionDelay = (i % 6) * 70 + "ms";
        revealObserver.observe(el);
      });
    } else {
      // No IntersectionObserver support: just show everything.
      revealEls.forEach((el) => {
        el.classList.add("is-visible");
      });
    }

    /* -----------------------------------------------------------
       2. Animated stat counters (count up once when in view)
       ----------------------------------------------------------- */
    const statNums = root.querySelectorAll(".exp-stat__num[data-count]");

    function animateCount(el) {
      const target = parseInt(el.getAttribute("data-count"), 10) || 0;
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1400;
      let start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      }
      window.requestAnimationFrame(step);
    }

    let statObserver;
    if ("IntersectionObserver" in window && statNums.length) {
      statObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              statObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      statNums.forEach((el) => {
        statObserver.observe(el);
      });
    } else {
      statNums.forEach((el) => {
        const target = parseInt(el.getAttribute("data-count"), 10) || 0;
        const suffix = el.getAttribute("data-suffix") || "";
        el.textContent = target + suffix;
      });
    }

    /* -----------------------------------------------------------
       3. Smooth-scroll for in-page anchor links (hero / final CTA)
       (Visual Discovery play-button clicks are now handled by React
       state via handleReelToggle, so the old vanilla-JS button
       listener has been removed.)
       ----------------------------------------------------------- */
    const anchorLinks = root.querySelectorAll('a[href^="#"]');
    function handleAnchorClick(e) {
      const link = e.currentTarget;
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const targetEl = document.querySelector(href);
      if (!targetEl) return;
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    anchorLinks.forEach((link) => {
      link.addEventListener("click", handleAnchorClick);
    });

    // Cleanup: mirrors the original script's lifecycle when this
    // component unmounts (observers disconnect, listeners detach).
    return () => {
      if (revealObserver) revealObserver.disconnect();
      if (statObserver) statObserver.disconnect();
      anchorLinks.forEach((link) => {
        link.removeEventListener("click", handleAnchorClick);
      });
    };
  }, []);

  return (
    <>
      <ExperienceFonts />
      <style>{EXPERIENCE_PAGE_STYLES}</style>

      {/* ============================================================
          TRAVEL IN DEPTH — EXPERIENCE PAGE
          ============================================================ */}
      <section className="experience-page" ref={rootRef}>

        {/* ============== 1. HERO SECTION ============== */}
        <header className="exp-hero">
          <div className="exp-hero__bg">
            <img
              src="https://plus.unsplash.com/premium_photo-1661964146949-a35b9ae06f89?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Hot air balloons over Jaipur at sunrise"
              loading="eager"
            />
            <div className="exp-hero__overlay"></div>
          </div>
          <div className="exp-hero__inner">
            <span className="exp-eyebrow exp-eyebrow--light">Travel In Depth Experiences</span>
            <h1 className="exp-hero__title">
              Experience India
              <span className="exp-hero__title-line">Beyond Sightseeing</span>
            </h1>
            <p className="exp-hero__desc">
              Go past the monuments and the checklists. Sit with a sadhu at dawn, ride the dunes at dusk, or learn a 200-year-old recipe from someone's grandmother — these are the stories you'll actually tell.
            </p>
            <div className="exp-hero__cta">
              <a href="#exp-categories" className="exp-btn exp-btn--primary">Explore Experiences</a>
              <a href="#exp-final-cta" className="exp-btn exp-btn--ghost">Plan My Journey</a>
            </div>
          </div>
          <a href="#exp-categories" className="exp-hero__scroll" aria-label="Scroll to explore">
            <span></span>
          </a>
        </header>

        {/* ============== 2. EXPERIENCE CATEGORIES ============== */}
        <section className="exp-section" id="exp-categories">
          <div className="exp-container">
            <div className="exp-section__head">
              <span className="exp-eyebrow">What Moves You</span>
              <h2 className="exp-section__title">Choose Your Kind of Wonder</h2>
              <p className="exp-section__sub">Six ways to fall in love with India — pick the one that calls to you, or collect them all.</p>
            </div>

            <div className="exp-cat-grid">
              <article className="exp-cat-card" data-reveal="true">
                <div className="exp-cat-card__img">
                  <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=900&auto=format&fit=crop" alt="Adventure trekking in the Himalayas" loading="lazy" />
                </div>
                <div className="exp-cat-card__body">
                  
                  <h3>Adventure</h3>
                  <p>Treks, rapids, dunes and cliffs — for travelers who feel India through their pulse.</p>
                </div>
              </article>

              <article className="exp-cat-card" data-reveal="true">
                <div className="exp-cat-card__img">
                  <img src="https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=900&auto=format&fit=crop" alt="Heritage architecture of an Indian fort" loading="lazy" />
                </div>
                <div className="exp-cat-card__body">
                  
                  <h3>Heritage</h3>
                  <p>Forts, stepwells and living havelis — 2,000 years of empires, told in stone.</p>
                </div>
              </article>

              <article className="exp-cat-card" data-reveal="true">
                <div className="exp-cat-card__img">
                  <img src="https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=900&auto=format&fit=crop" alt="Spiritual temple ritual in India" loading="lazy" />
                </div>
                <div className="exp-cat-card__body">
                  
                  <h3>Spiritual</h3>
                  <p>Aartis, ashrams and ancient temples — moments that quiet the mind.</p>
                </div>
              </article>

              <article className="exp-cat-card" data-reveal="true">
                <div className="exp-cat-card__img">
                  <img src="https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop" alt="Indian street food stall" loading="lazy" />
                </div>
                <div className="exp-cat-card__body">
                  
                  <h3>Food Trails</h3>
                  <p>From street-cart chaat to royal kitchens — taste your way across a subcontinent.</p>
                </div>
              </article>

              <article className="exp-cat-card" data-reveal="true">
                <div className="exp-cat-card__img">
                  <img src="https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Tiger in an Indian wildlife reserve" loading="lazy" />
                </div>
                <div className="exp-cat-card__body">
                  
                  <h3>Wildlife</h3>
                  <p>Tigers, elephants and untamed forests — India's wild heart, up close.</p>
                </div>
              </article>

              <article className="exp-cat-card" data-reveal="true">
                <div className="exp-cat-card__img">
                  <img src="https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=900&auto=format&fit=crop" alt="Colorful Indian festival celebration" loading="lazy" />
                </div>
                <div className="exp-cat-card__body">
                  
                  <h3>Festivals</h3>
                  <p>Holi's color, Diwali's light, Pushkar's chaos — celebrate like a local.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ============== 3. FEATURED EXPERIENCES ============== */}
        <section className="exp-section exp-section--cream" id="exp-featured">
          <div className="exp-container">
            <div className="exp-section__head">
              <span className="exp-eyebrow">Hand-Picked</span>
              <h2 className="exp-section__title">Featured Experiences</h2>
              <p className="exp-section__sub">Six signature moments our travelers come back talking about.</p>
            </div>

            <div className="exp-feat-grid">
              <article className="exp-feat-card" data-reveal="true">
                <div className="exp-feat-card__img">
                  <img src="https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=900&auto=format&fit=crop" alt="Desert safari in Jaipur" loading="lazy" />
                  <span className="exp-tag">Adventure</span>
                </div>
                <div className="exp-feat-card__body">
                  <span className="exp-feat-card__loc">Jaipur, Rajasthan</span>
                  <h3>Desert Safari</h3>
                  <p>Camel caravans, golden dunes and a sky full of stars over a Rajasthani campfire.</p>
                  <Link to="/destinations/jaipur" className="exp-link">
                   Discover the experience →
                   </Link>
                </div>
              </article>

              <article className="exp-feat-card" data-reveal="true">
                <div className="exp-feat-card__img">
                  <img src="https://images.unsplash.com/photo-1612779774202-68e4305b849b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGdhbmdhJTIwYWFydGl8ZW58MHx8MHx8fDA%3D" alt="Ganga Aarti in Varanasi" loading="lazy" />
                  <span className="exp-tag">Spiritual</span>
                </div>
                <div className="exp-feat-card__body">
                  <span className="exp-feat-card__loc">Varanasi, Uttar Pradesh</span>
                  <h3>Ganga Aarti</h3>
                  <p>Witness the river ghats come alive with fire, chants and centuries of devotion.</p>
                  <Link to="/destinations/varanasi" className="exp-link">
                  Discover the experience →
                  </Link>
                </div>
              </article>

              <article className="exp-feat-card" data-reveal="true">
                <div className="exp-feat-card__img">
                  <img src="https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=900&auto=format&fit=crop" alt="Houseboat stay in Kerala" loading="lazy" />
                  <span className="exp-tag">Heritage</span>
                </div>
                <div className="exp-feat-card__body">
                  <span className="exp-feat-card__loc">Alleppey, Kerala</span>
                  <h3>Houseboat Stay</h3>
                  <p>Drift through palm-lined backwaters on a converted rice barge, dinner included.</p>
                  <Link to="/destinations/kerala" className="exp-link">
                   Discover the experience →
                   </Link>
                </div>
              </article>

              <article className="exp-feat-card" data-reveal="true">
                <div className="exp-feat-card__img">
                  <img src="https://images.unsplash.com/photo-1701422337837-b4dc8548b1d9?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Chadar Trek in Leh" loading="lazy" />
                  <span className="exp-tag">Adventure</span>
                </div>
                <div className="exp-feat-card__body">
                  <span className="exp-feat-card__loc">Leh, Ladakh</span>
                  <h3>Chadar Trek</h3>
                  <p>Walk on a frozen river through Himalayan gorges — one of the world's rarest treks.</p>
                  <Link to="/destinations/leh" className="exp-link">
                    Discover the experience →
                    </Link>
                </div>
              </article>

              <article className="exp-feat-card" data-reveal="true">
                <div className="exp-feat-card__img">
                  <img src="https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=900&auto=format&fit=crop" alt="Scuba diving in Goa" loading="lazy" />
                  <span className="exp-tag">Adventure</span>
                </div>
                <div className="exp-feat-card__body">
                  <span className="exp-feat-card__loc">Goa</span>
                  <h3>Scuba Diving</h3>
                  <p>Explore shipwrecks and coral reefs beneath the Arabian Sea's turquoise surface.</p>
                  <Link to="/destinations/goa" className="exp-link">
                    Discover the experience →
                    </Link>
                </div>
              </article>

              <article className="exp-feat-card" data-reveal="true">
                <div className="exp-feat-card__img">
                  <img src="https://plus.unsplash.com/premium_photo-1697730396642-7a338ffc2852?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGdvbGRlbiUyMHRlbXBsZSUyMGFtcml0c2FyfGVufDB8fDB8fHww" alt="Golden Temple Seva in Amritsar" loading="lazy" />
                  <span className="exp-tag">Spiritual</span>
                </div>
                <div className="exp-feat-card__body">
                  <span className="exp-feat-card__loc">Amritsar, Punjab</span>
                  <h3>Golden Temple Seva</h3>
                  <p>Join the world's largest community kitchen — cook, serve and share a meal with strangers.</p>
                  <Link to="/destinations/amritsar" className="exp-link">
                    Discover the experience →
                    </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ============== 4. VISUAL DISCOVERY ============== */}
        <section className="exp-section" id="exp-visual">
          <div className="exp-container">
            <div className="exp-section__head">
              <span className="exp-eyebrow">Visual Discovery</span>
              <h2 className="exp-section__title">See It Before You Go</h2>
              <p className="exp-section__sub">Real moments, real travelers — swipe through the reel.</p>
            </div>

            <div className="exp-reel-track" tabIndex={0} aria-label="Scrollable experience reels">
              {REELS.map((reel, index) => {
                const isPlaying = playingIndex === index;
                return (
                  <article className="exp-reel" key={reel.id}>
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      className="exp-reel__video"
                      poster={reel.poster}
                      controls={isPlaying}
                      controlsList="nodownload"
                      playsInline
                      preload="metadata"
                      onClick={() => handleReelToggle(index)}
                      onPause={() => handleNativePause(index)}
                      onEnded={() => setPlayingIndex(null)}
                    >
                      <source src={reel.src} type="video/mp4" />
                    </video>

                    {!isPlaying && (
                      <button
                        type="button"
                        className="exp-reel__play"
                        aria-label={`Play ${reel.label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReelToggle(index);
                        }}
                      >
                        ▶
                      </button>
                    )}

                    <span className="exp-reel__label">{reel.label}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============== 5. WHY TRAVEL IN DEPTH ============== */}
        <section className="exp-section exp-section--maroon" id="exp-why">
          <div className="exp-container">
            <div className="exp-section__head exp-section__head--light">
              <span className="exp-eyebrow exp-eyebrow--light">Our Difference</span>
              <h2 className="exp-section__title exp-section__title--light">Why Travel In Depth Experiences</h2>
              <p className="exp-section__sub exp-section__sub--light">We don't just book activities. We curate the India that doesn't make it to brochures.</p>
            </div>

            <div className="exp-why-grid">
              <div className="exp-why-card" data-reveal="true">
                <span className="exp-why-card__icon">💎</span>
                <h3>Hidden Gems</h3>
                <p>Off-the-map places curated by locals — far from the tour-bus crowds.</p>
              </div>
              <div className="exp-why-card" data-reveal="true">
                <span className="exp-why-card__icon">🤝</span>
                <h3>Authentic Experiences</h3>
                <p>Real interactions with real people, not staged photo-ops.</p>
              </div>
              <div className="exp-why-card" data-reveal="true">
                <span className="exp-why-card__icon">🌱</span>
                <h3>Sustainable Travel</h3>
                <p>Low-impact journeys that protect the places and people you visit.</p>
              </div>
              <div className="exp-why-card" data-reveal="true">
                <span className="exp-why-card__icon">🎭</span>
                <h3>Local Culture</h3>
                <p>Learn from artisans, cooks and storytellers who call these places home.</p>
              </div>
              <div className="exp-why-card" data-reveal="true">
                <span className="exp-why-card__icon">🧭</span>
                <h3>Smart Planning</h3>
                <p>Routes and timing built around weather, crowds and festival calendars.</p>
              </div>
              <div className="exp-why-card" data-reveal="true">
                <span className="exp-why-card__icon">✨</span>
                <h3>Personalized Recommendations</h3>
                <p>Every itinerary shaped around how you actually like to travel.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============== 6. SUSTAINABLE EXPERIENCES ============== */}
        <section className="exp-section exp-section--cream" id="exp-sustainable">
          <div className="exp-container">
            <div className="exp-section__head">
              <span className="exp-eyebrow">Travel That Gives Back</span>
              <h2 className="exp-section__title">Sustainable Experiences</h2>
              <p className="exp-section__sub">Every one of these is chosen for its light footprint and real community benefit.</p>
            </div>

            <div className="exp-sus-grid">
              <article className="exp-sus-card" data-reveal="true">
                <div className="exp-sus-card__img">
                  <img src="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b3JnYW5pYyUyMGZhcm18ZW58MHx8MHx8fDA%3D" alt="Community-run organic farm stay" loading="lazy" />
                  <span className="exp-badge"><span className="exp-badge__dot"></span>Carbon-Light</span>
                </div>
                <div className="exp-sus-card__body">
                  <h3>Organic Farm Stays</h3>
                  <p>Live with farming families practicing centuries-old, chemical-free agriculture.</p>
                </div>
              </article>

              <article className="exp-sus-card" data-reveal="true">
                <div className="exp-sus-card__img">
                  <img src="https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=800&auto=format&fit=crop" alt="Cycling tour through rural India" loading="lazy" />
                  <span className="exp-badge"><span className="exp-badge__dot"></span>Zero-Emission</span>
                </div>
                <div className="exp-sus-card__body">
                  <h3>Village Cycling Trails</h3>
                  <p>Pedal through paddy fields and quiet hamlets rarely seen by motor traffic.</p>
                </div>
              </article>

              <article className="exp-sus-card" data-reveal="true">
                <div className="exp-sus-card__img">
                  <img src="https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=800&auto=format&fit=crop" alt="Community-led handicraft workshop" loading="lazy" />
                  <span className="exp-badge"><span className="exp-badge__dot"></span>Community-Funded</span>
                </div>
                <div className="exp-sus-card__body">
                  <h3>Artisan Craft Workshops</h3>
                  <p>Your fee goes directly to the weavers and potters keeping these crafts alive.</p>
                </div>
              </article>

              <article className="exp-sus-card" data-reveal="true">
                <div className="exp-sus-card__img">
                  <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop" alt="Forest conservation walk" loading="lazy" />
                  <span className="exp-badge"><span className="exp-badge__dot"></span>Conservation-Backed</span>
                </div>
                <div className="exp-sus-card__body">
                  <h3>Guided Forest Walks</h3>
                  <p>Led by community rangers; proceeds fund reforestation and anti-poaching efforts.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ============== 7. STATS SECTION ============== */}
        <section className="exp-stats">
          <div className="exp-container">
            <div className="exp-stats__grid">
              <div className="exp-stat" data-reveal="true">
                <span className="exp-stat__num" data-count="100" data-suffix="+">0</span>
                <span className="exp-stat__label">Experiences</span>
              </div>
              <div className="exp-stat" data-reveal="true">
                <span className="exp-stat__num" data-count="14" data-suffix="+">0</span>
                <span className="exp-stat__label">Cities</span>
              </div>
              <div className="exp-stat" data-reveal="true">
                <span className="exp-stat__num" data-count="50" data-suffix="+">0</span>
                <span className="exp-stat__label">Hidden Gems</span>
              </div>
              
            </div>
          </div>
        </section>

        {/* ============== 8. TRAVELER STORIES ============== */}
        <section className="exp-section" id="exp-stories">
          <div className="exp-container">
            <div className="exp-section__head">
              <span className="exp-eyebrow">In Their Words</span>
              <h2 className="exp-section__title">Traveler Stories</h2>
              <p className="exp-section__sub">A few of the moments travelers told us they'll never forget.</p>
            </div>

            <div className="exp-stories-grid">
              <article className="exp-story-card" data-reveal="true">
                <div className="exp-story-card__quote-mark">"</div>
                <p className="exp-story-card__text">The Chadar Trek wasn't a checkbox for me — it was the hardest, most beautiful thing I've done. Our guide knew every bend of that frozen river by heart.</p>
                <div className="exp-story-card__person">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" alt="Traveler portrait" loading="lazy" />
                  <div>
                    <strong>Aditi Rao</strong>
                    <span>Mumbai → Leh, Ladakh</span>
                  </div>
                </div>
              </article>

              <article className="exp-story-card" data-reveal="true">
                <div className="exp-story-card__quote-mark">"</div>
                <p className="exp-story-card__text">Sitting on the ghats during Ganga Aarti, surrounded by chanting and fire — I've traveled a lot, and nothing has felt as ancient or as alive as that evening.</p>
                <div className="exp-story-card__person">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" alt="Traveler portrait" loading="lazy" />
                  <div>
                    <strong>James Carter</strong>
                    <span>London → Varanasi, UP</span>
                  </div>
                </div>
              </article>

              <article className="exp-story-card" data-reveal="true">
                <div className="exp-story-card__quote-mark">"</div>
                <p className="exp-story-card__text">We almost skipped the houseboat for a "bigger" itinerary. So glad we didn't — two days of pure quiet on the backwaters reset the whole trip for us.</p>
                <div className="exp-story-card__person">
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" alt="Traveler portrait" loading="lazy" />
                  <div>
                    <strong>Priya & Karthik</strong>
                    <span>Bangalore → Alleppey, Kerala</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ============== 9. FINAL CTA ============== */}
        <section className="exp-final-cta" id="exp-final-cta">
          <div className="exp-final-cta__bg">
            <img src="https://images.unsplash.com/photo-1587135304628-c937a4e72c19?q=80&w=2000&auto=format&fit=crop" alt="Traveler overlooking an Indian landscape at sunset" loading="lazy" />
            <div className="exp-final-cta__overlay"></div>
          </div>
          <div className="exp-final-cta__inner">
            <h2>Ready to Experience India in Depth?</h2>
            <p>Your next favorite story is still unwritten. Let's go find it.</p>
            <div className="exp-final-cta__btns">
              <Link to="/destinations" className="exp-btn exp-btn--primary">Explore Destinations</Link>
              <Link to="/coming-soon" state={{ featureName: "Custom Experience Concierge & Booking", category: "Bespoke Trips", description: "Direct VIP booking for authentic homestays, curated local trails, and personalized artisan masterclasses." }} className="exp-btn exp-btn--outline-light">Book My Trip</Link>
            </div>
          </div>
        </section>

      </section>
    </>
  );
}