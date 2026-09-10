import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --saffron: #FF6B1A;
    --maroon: #8B1A1A;
    --cream: #FDF6EC;
    --gold: #F5A623;
    --dark-brown: #2D1B00;
    --light-gold: #FFF4E0;
    --soft-maroon: #C0392B;
    --text-muted: #6B4E2A;
    --card-shadow: 0 4px 32px rgba(45,27,0,0.10);
    --card-shadow-hover: 0 16px 56px rgba(45,27,0,0.18);
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--cream);
    color: var(--dark-brown);
    overflow-x: hidden;
  }

  .trending-section {
    position: relative;
    padding: 100px 0 120px;
    background: var(--cream);
    overflow: hidden;
  }

  .trending-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 80% 20%, rgba(245,166,35,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 50% 50% at 10% 80%, rgba(255,107,26,0.06) 0%, transparent 60%);
    pointer-events: none;
  }

  .texture-overlay {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F5A623' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.5;
  }

  .section-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 40px;
    position: relative;
    z-index: 2;
  }

  .section-eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
  }

  .eyebrow-line {
    width: 32px;
    height: 2px;
    background: var(--saffron);
    border-radius: 2px;
  }

  .eyebrow-text {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--saffron);
  }

  .eyebrow-dot {
    width: 5px;
    height: 5px;
    background: var(--gold);
    border-radius: 50%;
  }

  .section-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 700;
    line-height: 1.1;
    color: var(--dark-brown);
    margin-bottom: 16px;
  }

  .section-headline em {
    font-style: italic;
    color: var(--saffron);
  }

  .section-sub {
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 300;
    color: var(--text-muted);
    line-height: 1.7;
    max-width: 440px;
    margin-bottom: 56px;
  }

  .section-header-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 56px;
    flex-wrap: wrap;
    gap: 24px;
  }

  .view-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    border: 1.5px solid var(--saffron);
    border-radius: 50px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--saffron);
    text-decoration: none;
    letter-spacing: 0.04em;
    transition: all 0.3s ease;
    white-space: nowrap;
    background: transparent;
    cursor: pointer;
  }

  .view-all-btn:hover {
    background: var(--saffron);
    color: #fff;
  }

  .view-all-btn svg {
    transition: transform 0.3s ease;
  }

  .view-all-btn:hover svg {
    transform: translateX(4px);
  }

  .editorial-grid {
    display: grid;
    grid-template-columns: 1.6fr 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 20px;
  }

  .exp-card {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    background: #1a0a00;
    box-shadow: var(--card-shadow);
    transition: box-shadow 0.4s ease, transform 0.4s ease;
  }

  .exp-card:hover {
    box-shadow: var(--card-shadow-hover);
    transform: translateY(-4px);
  }

  .exp-card--hero {
    grid-column: 1;
    grid-row: 1 / 3;
    min-height: 560px;
  }

  .exp-card--mid {
    min-height: 260px;
  }

  .exp-card--wide {
    grid-column: 2 / 4;
    min-height: 260px;
  }

  .exp-card__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .exp-card:hover .exp-card__img {
    transform: scale(1.07);
  }

  .exp-card__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(20,6,0,0.88) 0%,
      rgba(20,6,0,0.4) 45%,
      rgba(20,6,0,0.08) 100%
    );
    z-index: 1;
  }

  .exp-card__badge {
    position: absolute;
    top: 18px;
    left: 18px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 50px;
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.28);
    color: #fff;
  }

  .exp-card__badge--popular { background: rgba(255,107,26,0.7); border-color: rgba(255,107,26,0.4); }
  .exp-card__badge--editor  { background: rgba(245,166,35,0.75); border-color: rgba(245,166,35,0.4); }
  .exp-card__badge--must    { background: rgba(139,26,26,0.75); border-color: rgba(139,26,26,0.4); }
  .exp-card__badge--hidden  { background: rgba(28,120,60,0.75); border-color: rgba(28,120,60,0.4); }
  .exp-card__badge--extreme { background: rgba(60,60,180,0.7); border-color: rgba(60,60,180,0.4); }
  .exp-card__badge--thrill  { background: rgba(130,40,180,0.7); border-color: rgba(130,40,180,0.4); }

  .exp-card__rating {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 11px;
    border-radius: 50px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.15);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
  }

  .rating-star {
    color: var(--gold);
    font-size: 11px;
  }

  .exp-card__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    padding: 28px;
  }

  .exp-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }

  .exp-tag {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.3);
    color: rgba(255,255,255,0.85);
    backdrop-filter: blur(6px);
    background: rgba(255,255,255,0.1);
  }

  .exp-card__title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(18px, 2.5vw, 26px);
    font-weight: 600;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .exp-card__location {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.6);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .exp-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
  }

  .exp-card__price {
    font-family: 'Inter', sans-serif;
  }

  .exp-card__price span {
    display: block;
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    margin-bottom: 1px;
  }

  .exp-card__price strong {
    font-size: 18px;
    font-weight: 600;
    color: var(--gold);
  }

  .discover-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 50px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    border: 1.5px solid rgba(255,255,255,0.5);
    backdrop-filter: blur(10px);
    background: rgba(255,255,255,0.12);
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .discover-btn:hover {
    background: var(--saffron);
    border-color: var(--saffron);
    transform: translateY(-1px);
  }

  .exp-card__duration {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 3;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    color: rgba(255,255,255,0.7);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .deco-float {
    position: absolute;
    pointer-events: none;
    opacity: 0.12;
    z-index: 1;
  }

  .deco-compass {
    top: 60px; right: 60px;
    width: 120px; height: 120px;
    animation: float-slow 8s ease-in-out infinite;
  }

  .deco-feather {
    bottom: 120px; left: 20px;
    width: 80px;
    animation: float-slow 10s ease-in-out infinite reverse;
  }

  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(4deg); }
  }

  .section-divider {
    width: 100%;
    overflow: hidden;
    line-height: 0;
    position: relative;
    z-index: 2;
  }

  .section-divider svg {
    display: block;
    width: 100%;
  }

  .gems-section {
    position: relative;
    padding: 100px 0 120px;
    background: #F5EDD8;
    overflow: hidden;
  }

  .gems-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 20% 30%, rgba(139,26,26,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 60% 60% at 85% 70%, rgba(45,27,0,0.05) 0%, transparent 60%);
    pointer-events: none;
  }

  .gems-section::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B1A1A' fill-opacity='0.025'%3E%3Cpath d='M14 16H9v-2h5V9h2v5h5v2h-5v5h-2v-5zM64 66h-5v-2h5v-5h2v5h5v2h-5v5h-2v-5z'/%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  .masonry-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 60px;
    gap: 18px;
  }

  .gem-card {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    background: #1a0a00;
    box-shadow: var(--card-shadow);
    transition: box-shadow 0.4s ease, transform 0.4s ease;
  }

  .gem-card:hover {
    box-shadow: var(--card-shadow-hover);
    transform: translateY(-5px);
  }

  .gem-card:hover .gem-card__img {
    transform: scale(1.07);
  }

  .gem-card__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s ease;
  }

  .gem-card__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      rgba(15,5,0,0.12) 0%,
      rgba(15,5,0,0.55) 60%,
      rgba(15,5,0,0.92) 100%
    );
    z-index: 1;
  }

  .gem-card--1 { grid-column: 1 / 5; grid-row: 1 / 8; }
  .gem-card--2 { grid-column: 5 / 9; grid-row: 1 / 6; }
  .gem-card--3 { grid-column: 9 / 13; grid-row: 1 / 7; }
  .gem-card--4 { grid-column: 1 / 5; grid-row: 8 / 14; }
  .gem-card--5 { grid-column: 5 / 9; grid-row: 6 / 14; }
  .gem-card--6 { grid-column: 9 / 13; grid-row: 7 / 14; }

  .gem-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 4px;
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #fff;
    backdrop-filter: blur(8px);
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
  }

  .gem-badge--northeast   { background: rgba(28,120,60,0.8); }
  .gem-badge--himalayas   { background: rgba(60,60,180,0.75); }
  .gem-badge--coastal     { background: rgba(20,90,160,0.75); }
  .gem-badge--uttarakhand { background: rgba(100,60,160,0.75); }

  .gem-card__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    padding: 22px;
  }

  .gem-card__region {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .gem-card__name {
    font-family: 'Playfair Display', serif;
    font-size: clamp(18px, 2vw, 26px);
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 8px;
  }

  .gem-card__tagline {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-style: italic;
    color: rgba(255,255,255,0.65);
    line-height: 1.5;
    margin-bottom: 14px;
  }

  .gem-meta {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 14px;
  }

  .gem-meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    color: rgba(255,255,255,0.6);
  }

  .gem-meta-row strong {
    color: rgba(255,255,255,0.9);
    font-weight: 500;
  }

  .gem-meta-label {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 3px;
    padding: 1px 6px;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .gem-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 18px;
    border-radius: 50px;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: var(--dark-brown);
    background: var(--gold);
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .gem-cta:hover {
    background: var(--saffron);
    color: #fff;
    transform: translateY(-1px);
  }

  .gem-hidden-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 50px;
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    background: rgba(20,10,0,0.6);
    border: 1px solid rgba(245,166,35,0.4);
    backdrop-filter: blur(8px);
  }

  .deco-compass-gems {
    position: absolute;
    top: 50px;
    right: 80px;
    opacity: 0.07;
    width: 180px;
    pointer-events: none;
    animation: float-slow 12s ease-in-out infinite;
  }

  .deco-tagline {
    position: absolute;
    top: 80px;
    right: 260px;
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: 13px;
    color: var(--text-muted);
    opacity: 0.45;
    pointer-events: none;
    line-height: 1.6;
    text-align: right;
  }

  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }

  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }
  .reveal-delay-5 { transition-delay: 0.5s; }
  .reveal-delay-6 { transition-delay: 0.6s; }

  .trust-bar {
    background: var(--dark-brown);
    padding: 28px 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 60px;
    flex-wrap: wrap;
  }

  .trust-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(255,255,255,0.6);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 400;
  }

  .trust-item svg {
    color: var(--gold);
    flex-shrink: 0;
  }

  .trust-item strong {
    color: #fff;
    font-weight: 500;
    display: block;
    font-size: 13px;
  }

  @media (max-width: 1024px) {
    .editorial-grid {
      grid-template-columns: 1fr 1fr;
    }
    .exp-card--hero {
      grid-column: 1 / 3;
      grid-row: 1;
      min-height: 380px;
    }
    .exp-card--wide {
      grid-column: 1 / 3;
    }
    .masonry-grid {
      grid-template-columns: repeat(6, 1fr);
      grid-auto-rows: 50px;
    }
    .gem-card--1 { grid-column: 1 / 4; grid-row: 1 / 8; }
    .gem-card--2 { grid-column: 4 / 7; grid-row: 1 / 6; }
    .gem-card--3 { grid-column: 4 / 7; grid-row: 6 / 11; }
    .gem-card--4 { grid-column: 1 / 4; grid-row: 8 / 14; }
    .gem-card--5 { grid-column: 4 / 7; grid-row: 11 / 17; }
    .gem-card--6 { grid-column: 1 / 4; grid-row: 14 / 19; }
  }

  @media (max-width: 768px) {
    .section-inner { padding: 0 20px; }
    .editorial-grid {
      grid-template-columns: 1fr;
    }
    .exp-card--hero { grid-row: 1; min-height: 340px; }
    .exp-card--wide { grid-column: 1; }
    .masonry-grid {
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: 180px;
    }
    .gem-card--1, .gem-card--2, .gem-card--3,
    .gem-card--4, .gem-card--5, .gem-card--6 {
      grid-column: auto;
      grid-row: auto;
    }
    .gem-card--1 { grid-column: 1 / 3; }
    .gem-card--4 { grid-column: 1 / 3; }
    .trust-bar { gap: 28px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .deco-compass, .deco-feather, .deco-compass-gems { animation: none; }
    .reveal { opacity: 1; transform: none; transition: none; }
    .exp-card, .gem-card, .exp-card__img, .gem-card__img { transition: none; }
  }

  .img-desert    { background: linear-gradient(135deg, #C4834A 0%, #8B4513 30%, #D4A853 60%, #8B2500 100%); }
  .img-kerala    { background: linear-gradient(135deg, #1a5c1a 0%, #2d8c2d 30%, #1a7a4a 60%, #0d4a1e 100%); }
  .img-ganga     { background: linear-gradient(135deg, #1a1a4a 0%, #3a1a0a 40%, #FF8C00 70%, #FF4500 100%); }
  .img-scuba     { background: linear-gradient(135deg, #003366 0%, #0066aa 40%, #00aacc 70%, #004488 100%); }
  .img-chadar    { background: linear-gradient(135deg, #8ab4cc 0%, #c8dde8 30%, #5a8aaa 60%, #2a5a7a 100%); }
  .img-paraglide { background: linear-gradient(135deg, #3a6a1a 0%, #5a9a3a 30%, #8aaa5a 60%, #1a4a0a 100%); }

  .img-ziro    { background: linear-gradient(135deg, #1a4a1a 0%, #2a7a2a 35%, #3a9a3a 60%, #0a3a0a 100%); }
  .img-majuli  { background: linear-gradient(135deg, #1a3a5a 0%, #2a6a8a 40%, #F4A460 70%, #8B4513 100%); }
  .img-chopta  { background: linear-gradient(135deg, #4a7a4a 0%, #7aaa5a 35%, #aacca0 60%, #2a5a2a 100%); }
  .img-tirthan { background: linear-gradient(135deg, #2a5a2a 0%, #4a8a5a 40%, #6aaa7a 60%, #1a4a1a 100%); }
  .img-gokarna { background: linear-gradient(135deg, #1a4a7a 0%, #2a7aaa 40%, #5aaad4 70%, #0a3a6a 100%); }
  .img-mawlynn { background: linear-gradient(135deg, #1a5a1a 0%, #3a8a3a 35%, #6aaa6a 60%, #0a4a0a 100%); }

  .img-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.18;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 4px,
      rgba(255,255,255,0.06) 4px,
      rgba(255,255,255,0.06) 8px
    );
  }
`;

// ── SVG icons ──────────────────────────────────────────────────────────────

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowSmIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PinIcon = ({ size = 10, opacity = "0.5" }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <path
      d={`M5 1C3.34 1 2 2.34 2 4C2 6.5 5 9 5 9C5 9 8 6.5 8 4C8 2.34 6.66 1 5 1ZM5 5C4.45 5 4 4.55 4 4C4 3.45 4.45 3 5 3C5.55 3 6 3.45 6 4C6 4.55 5.55 5 5 5Z`}
      fill={`rgba(255,255,255,${opacity})`}
    />
  </svg>
);

const PinSmIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path
      d="M4.5 1C3.12 1 2 2.12 2 3.5C2 5.5 4.5 8 4.5 8C4.5 8 7 5.5 7 3.5C7 2.12 5.88 1 4.5 1ZM4.5 4.25C4.09 4.25 3.75 3.91 3.75 3.5C3.75 3.09 4.09 2.75 4.5 2.75C4.91 2.75 5.25 3.09 5.25 3.5C5.25 3.91 4.91 4.25 4.5 4.25Z"
      fill="rgba(255,255,255,0.5)"
    />
  </svg>
);

const StarIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
    <path d="M4 0L5.1 2.6L8 2.9L5.9 4.9L6.5 7.8L4 6.3L1.5 7.8L2.1 4.9L0 2.9L2.9 2.6L4 0Z" />
  </svg>
);

// ── Shared sub-components ───────────────────────────────────────────────────

const SectionEyebrow = ({ text }) => (
  <div className="section-eyebrow">
    <div className="eyebrow-line" />
    <span className="eyebrow-text">{text}</span>
    <div className="eyebrow-dot" />
  </div>
);

const ViewAllBtn = ({ children }) => (
  <Link to="/experience" className="view-all-btn">
    {children}
    <ArrowIcon />
  </Link>
);

// ── SECTION 1: Trending Experiences ────────────────────────────────────────

const TrendingSection = () => (
  <section className="trending-section" id="trending">
    <div className="texture-overlay" />

    {/* Floating decorative compass */}
    <svg className="deco-float deco-compass" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="60" r="56" stroke="#F5A623" strokeWidth="2" />
      <circle cx="60" cy="60" r="44" stroke="#F5A623" strokeWidth="1" />
      <path d="M60 10L65 55H55L60 10Z" fill="#FF6B1A" />
      <path d="M60 110L55 65H65L60 110Z" fill="#8B1A1A" />
      <path d="M10 60L55 55V65L10 60Z" fill="#2D1B00" />
      <path d="M110 60L65 65V55L110 60Z" fill="#2D1B00" />
      <circle cx="60" cy="60" r="6" fill="#F5A623" />
      <text x="60" y="28" textAnchor="middle" fontSize="10" fill="#F5A623" fontFamily="serif">N</text>
      <text x="60" y="100" textAnchor="middle" fontSize="10" fill="#8B1A1A" fontFamily="serif">S</text>
      <text x="22" y="64" textAnchor="middle" fontSize="10" fill="#2D1B00" fontFamily="serif">W</text>
      <text x="98" y="64" textAnchor="middle" fontSize="10" fill="#2D1B00" fontFamily="serif">E</text>
    </svg>

    {/* Floating feather */}
    <svg className="deco-float deco-feather" viewBox="0 0 60 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M30 0C30 0 60 40 50 90C40 140 30 160 30 160C30 160 20 140 10 90C0 40 30 0 30 0Z" fill="#F5A623" />
      <path d="M30 0L30 160" stroke="#8B1A1A" strokeWidth="1.5" />
      <path d="M30 30C30 30 45 40 50 55" stroke="#2D1B00" strokeWidth="0.8" />
      <path d="M30 50C30 50 42 60 44 75" stroke="#2D1B00" strokeWidth="0.8" />
      <path d="M30 70C30 70 40 80 40 95" stroke="#2D1B00" strokeWidth="0.8" />
      <path d="M30 30C30 30 15 40 10 55" stroke="#2D1B00" strokeWidth="0.8" />
      <path d="M30 50C30 50 18 60 16 75" stroke="#2D1B00" strokeWidth="0.8" />
      <path d="M30 70C30 70 20 80 20 95" stroke="#2D1B00" strokeWidth="0.8" />
    </svg>

    <div className="section-inner">
      {/* Section header */}
      <div className="section-header-row reveal">
        <div>
          <SectionEyebrow text="Trending Now" />
          <h2 className="section-headline">
            Trending <em>Experiences</em><br />Loved by Explorers
          </h2>
          <p className="section-sub">
            Handpicked adventures and activities that travellers are loving right now. Book unforgettable moments.
          </p>
        </div>
        <ViewAllBtn>View All Experiences</ViewAllBtn>
      </div>

      {/* Editorial grid */}
      <div className="editorial-grid">

        {/* HERO: Desert Safari */}
        <div className="exp-card exp-card--hero reveal reveal-delay-1">
          <div className="exp-card__img img-desert">
            <div className="img-pattern" />
          </div>
          <div className="exp-card__overlay" />
          <div className="exp-card__badge exp-card__badge--popular">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4" /></svg>
            Most Popular
          </div>
          <div className="exp-card__rating">
            <span className="rating-star">★</span> 4.9 <span style={{ opacity: 0.5 }}>(2.1k)</span>
          </div>
          <div className="exp-card__content">
            <div className="exp-card__tags">
              <span className="exp-tag">Camel Ride</span>
              <span className="exp-tag">Sunset</span>
              <span className="exp-tag">Camping</span>
            </div>
            <h3 className="exp-card__title">Desert Safari<br />Adventure</h3>
            <p className="exp-card__location">
              <PinIcon />
              Jaisalmer, Rajasthan
            </p>
            <div className="exp-card__footer">
              <div className="exp-card__price">
                <span>from</span>
                <strong>₹3,500</strong>
              </div>
              <Link to="/coming-soon" state={{ featureName: "Desert Safari Adventure", category: "Trending Experience", description: "Camel caravans, golden dunes, and private luxury tents under the starlit desert sky." }} className="discover-btn">
                Discover Experience
                <ArrowSmIcon />
              </Link>
            </div>
          </div>
        </div>

        {/* Kerala Houseboat */}
        <div className="exp-card exp-card--mid reveal reveal-delay-2">
          <div className="exp-card__img img-kerala">
            <div className="img-pattern" />
          </div>
          <div className="exp-card__overlay" />
          <div className="exp-card__badge exp-card__badge--editor">Editor's Pick</div>
          <div className="exp-card__rating"><span className="rating-star">★</span> 4.8</div>
          <div className="exp-card__content">
            <div className="exp-card__tags">
              <span className="exp-tag">Backwaters</span>
              <span className="exp-tag">Cuisine</span>
            </div>
            <h3 className="exp-card__title">Kerala Houseboat Stay</h3>
            <p className="exp-card__location">
              <PinIcon />
              Alleppey, Kerala · 2 Days
            </p>
            <div className="exp-card__footer">
              <div className="exp-card__price"><span>from</span><strong>₹8,000</strong></div>
              <Link to="/coming-soon" state={{ featureName: "Kerala Houseboat Stay", category: "Trending Experience", description: "Private eco-friendly houseboats traversing the tranquil backwaters with authentic gourmet meals." }} className="discover-btn">Discover</Link>
            </div>
          </div>
        </div>

        {/* Ganga Aarti */}
        <div className="exp-card exp-card--mid reveal reveal-delay-3">
          <div className="exp-card__img img-ganga">
            <div className="img-pattern" />
          </div>
          <div className="exp-card__overlay" />
          <div className="exp-card__badge exp-card__badge--must">Must Do</div>
          <div className="exp-card__rating"><span className="rating-star">★</span> 4.9</div>
          <div className="exp-card__content">
            <div className="exp-card__tags">
              <span className="exp-tag">Spiritual</span>
              <span className="exp-tag">Evening</span>
            </div>
            <h3 className="exp-card__title">Ganga Aarti Experience</h3>
            <p className="exp-card__location">
              <PinIcon />
              Varanasi, Uttar Pradesh
            </p>
            <div className="exp-card__footer">
              <div className="exp-card__price"><span>from</span><strong>₹500</strong></div>
              <Link to="/coming-soon" state={{ featureName: "Ganga Aarti Experience", category: "Spiritual Experience", description: "VIP boat vantage point for the divine evening Ganga Aarti ceremony along the historic ghats." }} className="discover-btn">Discover</Link>
            </div>
          </div>
        </div>

        {/* Scuba Diving */}
        <div className="exp-card exp-card--mid reveal reveal-delay-4">
          <div className="exp-card__img img-scuba">
            <div className="img-pattern" />
          </div>
          <div className="exp-card__overlay" />
          <div className="exp-card__badge exp-card__badge--hidden">Hidden Gem</div>
          <div className="exp-card__rating"><span className="rating-star">★</span> 4.7</div>
          <div className="exp-card__content">
            <div className="exp-card__tags">
              <span className="exp-tag">Marine</span>
              <span className="exp-tag">Coral</span>
            </div>
            <h3 className="exp-card__title">Scuba Diving in Andaman</h3>
            <p className="exp-card__location">
              <PinIcon />
              Andaman Islands · 4 Hours
            </p>
            <div className="exp-card__footer">
              <div className="exp-card__price"><span>from</span><strong>₹5,500</strong></div>
              <Link to="/coming-soon" state={{ featureName: "Scuba Diving in Andaman", category: "Adventure Diving", description: "Certified PADI instructor guided reef exploration of pristine coral formations and marine life." }} className="discover-btn">Discover</Link>
            </div>
          </div>
        </div>

        {/* Chadar Trek */}
        <div className="exp-card exp-card--mid reveal reveal-delay-5">
          <div className="exp-card__img img-chadar">
            <div className="img-pattern" />
          </div>
          <div className="exp-card__overlay" />
          <div className="exp-card__badge exp-card__badge--extreme">Extreme</div>
          <div className="exp-card__rating"><span className="rating-star">★</span> 4.8</div>
          <div className="exp-card__content">
            <div className="exp-card__tags">
              <span className="exp-tag">Frozen River</span>
              <span className="exp-tag">Winter</span>
            </div>
            <h3 className="exp-card__title">Chadar Trek Expedition</h3>
            <p className="exp-card__location">
              <PinIcon />
              Zanskar, Ladakh · 8 Days
            </p>
            <div className="exp-card__footer">
              <div className="exp-card__price"><span>from</span><strong>₹18,000</strong></div>
              <Link to="/coming-soon" state={{ featureName: "Chadar Trek Expedition", category: "Extreme Treks", description: "Walk the legendary frozen Zanskar river gorge with seasoned mountain guides and winter camps." }} className="discover-btn">Discover</Link>
            </div>
          </div>
        </div>

        {/* Paragliding */}
        <div className="exp-card exp-card--mid reveal reveal-delay-6">
          <div className="exp-card__img img-paraglide">
            <div className="img-pattern" />
          </div>
          <div className="exp-card__overlay" />
          <div className="exp-card__badge exp-card__badge--thrill">Thrill Pick</div>
          <div className="exp-card__rating"><span className="rating-star">★</span> 4.9</div>
          <div className="exp-card__content">
            <div className="exp-card__tags">
              <span className="exp-tag">Fly</span>
              <span className="exp-tag">Himalayan Views</span>
            </div>
            <h3 className="exp-card__title">Paragliding in Bir Billing</h3>
            <p className="exp-card__location">
              <PinIcon />
              Himachal Pradesh · 2 Hours
            </p>
            <div className="exp-card__footer">
              <div className="exp-card__price"><span>from</span><strong>₹2,800</strong></div>
              <Link to="/coming-soon" state={{ featureName: "Paragliding in Bir Billing", category: "Aero Adventure", description: "Tandem paragliding flight over the Dhauladhar range with GoPro 4K recording included." }} className="discover-btn">Discover</Link>
            </div>
          </div>
        </div>

      </div>{/* /editorial-grid */}
    </div>
  </section>
);

// ── SECTION 2: Hidden Gems ──────────────────────────────────────────────────

const GemCard = ({ cardClass, imgClass, badgeClass, badgeText, showHiddenBadge, region, name, tagline, meta, delayClass }) => (
  <div className={`gem-card ${cardClass} reveal ${delayClass}`}>
    <div className={`gem-card__img ${imgClass}`}><div className="img-pattern" /></div>
    <div className="gem-card__overlay" />
    <div className={`gem-badge ${badgeClass}`}>{badgeText}</div>
    {showHiddenBadge && (
      <div className="gem-hidden-badge">
        <StarIcon />
        Hidden Gem
      </div>
    )}
    <div className="gem-card__content">
      <p className="gem-card__region">
        <PinSmIcon />
        {region}
      </p>
      <h3 className="gem-card__name">{name}</h3>
      <p className="gem-card__tagline">{tagline}</p>
      <div className="gem-meta">
        {meta.map((row, i) => (
          <div className="gem-meta-row" key={i}>
            <span className="gem-meta-label">{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
      <Link to="/coming-soon" state={{ featureName: `${name} — ${region}`, category: "Hidden Gem Expedition", description: tagline }} className="gem-cta">
        Explore Destination
        <ArrowSmIcon />
      </Link>
    </div>
  </div>
);

const gemsData = [
  {
    cardClass: "gem-card--1",
    imgClass: "img-ziro",
    badgeClass: "gem-badge--northeast",
    badgeText: "Northeast",
    showHiddenBadge: true,
    region: "Arunachal Pradesh",
    name: "Ziro Valley",
    tagline: "Lush green valleys, ancient tribes and serene landscapes untouched by time.",
    meta: [
      { label: "Best Time", value: "March – June · Sep – Nov" },
      { label: "Why Special", value: "Apatani tribe, rice paddies, UNESCO site" },
    ],
    delayClass: "reveal-delay-1",
  },
  {
    cardClass: "gem-card--2",
    imgClass: "img-majuli",
    badgeClass: "gem-badge--northeast",
    badgeText: "Northeast",
    showHiddenBadge: false,
    region: "Assam",
    name: "Majuli Island",
    tagline: "The world's largest river island, rich in culture and serenity.",
    meta: [{ label: "Best Time", value: "Oct – Mar" }],
    delayClass: "reveal-delay-2",
  },
  {
    cardClass: "gem-card--3",
    imgClass: "img-chopta",
    badgeClass: "gem-badge--uttarakhand",
    badgeText: "Uttarakhand",
    showHiddenBadge: false,
    region: "Rudraprayag",
    name: "Chopta",
    tagline: "The mini Switzerland of India, with breathtaking treks and alpine meadows.",
    meta: [{ label: "Best Time", value: "Mar – Jun · Sep – Nov" }],
    delayClass: "reveal-delay-3",
  },
  {
    cardClass: "gem-card--4",
    imgClass: "img-tirthan",
    badgeClass: "gem-badge--himalayas",
    badgeText: "Himalayas",
    showHiddenBadge: true,
    region: "Himachal Pradesh",
    name: "Tirthan Valley",
    tagline: "A peaceful paradise for nature lovers and soul seekers, beside crystal trout streams.",
    meta: [
      { label: "Best Time", value: "Apr – Jun · Sep – Nov" },
      { label: "Why Special", value: "Great Himalayan National Park, trout fishing" },
    ],
    delayClass: "reveal-delay-4",
  },
  {
    cardClass: "gem-card--5",
    imgClass: "img-gokarna",
    badgeClass: "gem-badge--coastal",
    badgeText: "Coastal",
    showHiddenBadge: false,
    region: "Karnataka",
    name: "Gokarna",
    tagline: "Tranquil beaches, spiritual vibes and stunning sunsets where the sacred meets the sea.",
    meta: [
      { label: "Best Time", value: "Oct – Mar" },
      { label: "Why Special", value: "Om Beach, Mahabaleshwar temple" },
    ],
    delayClass: "reveal-delay-5",
  },
  {
    cardClass: "gem-card--6",
    imgClass: "img-mawlynn",
    badgeClass: "gem-badge--northeast",
    badgeText: "Northeast",
    showHiddenBadge: false,
    region: "Meghalaya",
    name: "Mawlynnong",
    tagline: "Asia's cleanest village, surrounded by living root bridges and emerald forest.",
    meta: [
      { label: "Best Time", value: "Sep – Feb" },
      { label: "Why Special", value: "Living root bridges, sky walk, cleanest village" },
    ],
    delayClass: "reveal-delay-6",
  },
];

const HiddenGemsSection = () => (
  <section className="gems-section" id="hidden-gems">

    {/* Floating compass */}
    <svg className="deco-compass-gems" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="90" cy="90" r="85" stroke="#8B1A1A" strokeWidth="2" strokeDasharray="8 6" />
      <circle cx="90" cy="90" r="68" stroke="#8B1A1A" strokeWidth="1" />
      <path d="M90 15L97 82H83L90 15Z" fill="#FF6B1A" />
      <path d="M90 165L83 98H97L90 165Z" fill="#8B1A1A" />
      <path d="M15 90L82 83V97L15 90Z" fill="#2D1B00" />
      <path d="M165 90L98 97V83L165 90Z" fill="#2D1B00" />
      <circle cx="90" cy="90" r="10" fill="#F5A623" stroke="#8B1A1A" strokeWidth="1" />
      <circle cx="90" cy="90" r="4" fill="#2D1B00" />
    </svg>

    <div className="deco-tagline" aria-hidden="true">
      Unexplored. Untouched.<br />Unforgettable.
    </div>

    <div className="section-inner">
      {/* Section header */}
      <div className="section-header-row reveal">
        <div>
          <SectionEyebrow text="Off the Beaten Path" />
          <h2 className="section-headline">
            Hidden <em>Gems</em> of India
          </h2>
          <p className="section-sub">
            Discover magical places that remain untouched by crowds and full of raw, natural beauty.
          </p>
        </div>
        <ViewAllBtn>View All Hidden Gems</ViewAllBtn>
      </div>

      {/* Masonry grid */}
      <div className="masonry-grid">
        {gemsData.map((gem) => (
          <GemCard key={gem.cardClass} {...gem} />
        ))}
      </div>
    </div>
  </section>
);

// ── Trust Bar ───────────────────────────────────────────────────────────────

const TrustBar = () => (
  <div className="trust-bar">
    <div className="trust-item">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 2L13.5 7.5L19.5 8.3L15 12.5L16.2 18.5L11 15.6L5.8 18.5L7 12.5L2.5 8.3L8.5 7.5L11 2Z" stroke="#F5A623" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <div>
        <strong>Sustainable Travel</strong>
        Support local communities and responsible tourism.
      </div>
    </div>
    <div className="trust-item">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#F5A623" strokeWidth="1.5" />
        <path d="M8 11l2 2 4-4" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <strong>Authentic Experiences</strong>
        Real places, real people, real stories.
      </div>
    </div>
    <div className="trust-item">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="13" rx="2" stroke="#F5A623" strokeWidth="1.5" />
        <path d="M7 9h8M7 13h5" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div>
        <strong>Hidden &amp; Untouched</strong>
        Explore destinations away from the tourist trail.
      </div>
    </div>
    <div className="trust-item">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 4C11 4 4 7.5 4 12.5C4 15.5 7 18 11 18C15 18 18 15.5 18 12.5C18 7.5 11 4 11 4Z" stroke="#F5A623" strokeWidth="1.5" />
        <path d="M11 10v4M9 12h4" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div>
        <strong>Create Memories</strong>
        Collect moments that stay with you forever.
      </div>
    </div>
  </div>
);

// ── Root Component ──────────────────────────────────────────────────────────

export default function TravelSections() {
  const styleRef = useRef(null);

  // Inject global styles once
  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style");
      el.textContent = styles;
      document.head.appendChild(el);
      styleRef.current = el;
    }
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

  // Scroll-reveal observer
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <TrendingSection />

      {/* Curved divider between sections */}
      <div className="section-divider" style={{ background: "var(--cream)", marginBottom: "-2px" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="#F5EDD8" />
        </svg>
      </div>

      <HiddenGemsSection />

      {/* Bottom curved divider into trust bar */}
      <div className="section-divider" style={{ background: "#F5EDD8", marginBottom: "-2px" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="#2D1B00" />
        </svg>
      </div>

      <TrustBar />
    </>
  );
}
