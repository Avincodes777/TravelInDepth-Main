import React, { useEffect, useRef } from 'react';

const desertSafari = "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80";
const keralaHouseboat = "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80";
const gangaAarti = "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80";
const scubaDiving = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80";
const chadarTrek = "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80";
const paragliding = "https://images.unsplash.com/photo-1521673461164-de300ebcfb17?w=800&q=80";
const experiences = [
  {
    id: 1, title: 'Desert Safari', location: 'Jaisalmer, Rajasthan',
    rating: 4.9, reviews: 2140, badge: 'Most Popular', popularity: '2.1k booked this season',
    tags: ['Camel Ride', 'Sunset', 'Camping'],
    price: '₹3,500', duration: '1 Day',
    image: desertSafari, gradient: 'linear-gradient(160deg,#1a0f00 0%,#3b1a00 45%,#6b3a00 100%)',
    
    glow: 'radial-gradient(circle at 70% 75%, rgba(245,166,35,0.55), transparent 60%)',
    feature: true,
  },
  {
    id: 2, title: 'Kerala Houseboat', location: 'Alleppey, Kerala',
    rating: 4.8, reviews: 1820, badge: "Editor's Pick", popularity: '1.8k booked this season',
    tags: ['Backwaters', 'Cuisine'],
    price: '₹8,000', duration: '2 Days',
    image: keralaHouseboat, gradient: 'linear-gradient(160deg,#04140a 0%,#0a2e00 45%,#1a5c00 100%)',
    glow: 'radial-gradient(circle at 75% 70%, rgba(245,166,35,0.4), transparent 60%)',
  },
  {
    id: 3, title: 'Ganga Aarti', location: 'Varanasi, UP',
    rating: 4.9, reviews: 3210, badge: 'Must Do', popularity: '3.2k booked this season',
    tags: ['Spiritual', 'Evening'],
    price: '₹500', duration: '2 Hours',
    image: gangaAarti, gradient: 'linear-gradient(160deg,#0d061a 0%,#1a0a2e 45%,#3d1a5e 100%)',
    glow: 'radial-gradient(circle at 75% 70%, rgba(245,166,35,0.45), transparent 60%)',
  },
  {
    id: 4, title: 'Scuba Diving', location: 'Andaman Islands',
    rating: 4.7, reviews: 980, badge: 'Hidden Gem', popularity: '980 booked this season',
    tags: ['Marine', 'Coral', 'Beginner OK'],
    price: '₹5,500', duration: '4 Hours',
    image: scubaDiving, gradient: 'linear-gradient(160deg,#00141c 0%,#002e3d 45%,#005c7a 100%)',
    glow: 'radial-gradient(circle at 70% 75%, rgba(245,166,35,0.4), transparent 60%)',
  },
  {
    id: 5, title: 'Chadar Trek', location: 'Zanskar, Ladakh',
    rating: 4.8, reviews: 640, badge: 'Extreme', popularity: '640 booked this season',
    tags: ['Frozen River', 'Winter', 'Challenge'],
    price: '₹18,000', duration: '8 Days',
    image: chadarTrek, gradient: 'linear-gradient(160deg,#040a14 0%,#0a1a2e 45%,#1a3a5e 100%)',
    glow: 'radial-gradient(circle at 70% 75%, rgba(245,166,35,0.4), transparent 60%)',
  },
  {
    id: 6, title: 'Paragliding', location: 'Bir Billing, HP',
    rating: 4.9, reviews: 1540, badge: 'Thrill Pick', popularity: '1.5k booked this season',
    tags: ['Fly', 'Himalayan Views', 'Adrenaline'],
    price: '₹2,800', duration: '2 Hours',
    image: paragliding, gradient: 'linear-gradient(160deg,#00140a 0%,#002e1a 45%,#005c34 100%)',
    glow: 'radial-gradient(circle at 70% 75%, rgba(245,166,35,0.4), transparent 60%)',
  },
];

function StarRating({ rating }) {
  return (
    <span style={{ color: '#F5A623', letterSpacing: '-1px' }}>
      {'★'.repeat(Math.floor(rating))}
      {rating % 1 !== 0 && '½'}
    </span>
  );
}

export default function TrendingExperiences() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('te-visible');
        });
      },
      { threshold: 0.12 }
    );
    const targets = sectionRef.current?.querySelectorAll('.te-card, .te-head');
    targets?.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .te-section {
          background: #FDF6EC;
          padding: 110px 0 0;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .te-noise {
          position: absolute; inset: 0;
          opacity: 0.035; pointer-events: none; mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .te-deco {
          position: absolute; pointer-events: none; opacity: 0.13; z-index: 0;
          animation: te-float 9s ease-in-out infinite;
        }
        .te-deco-compass { top: 60px; right: 6%; width: 110px; height: 110px; color: #8B1A1A; animation-delay: 0s; }
        .te-deco-path { top: 280px; left: 2%; width: 220px; height: 90px; color: #2D1B00; animation-delay: 1.2s; }
        .te-deco-plane { top: 40px; left: 14%; width: 46px; height: 46px; color: #FF6B1A; animation-delay: 0.6s; }
        @keyframes te-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(4deg); }
        }
        .te-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px 120px;
          position: relative; z-index: 1;
        }
        .te-head {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 56px; gap: 20px; flex-wrap: wrap;
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .te-head.te-visible { opacity: 1; transform: translateY(0); }
        .te-eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: #FF6B1A; margin-bottom: 10px;
        }
        .te-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          color: #2D1B00; line-height: 1.15;
        }
        .te-title em { font-style: italic; color: #8B1A1A; }
        .te-view-all {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 50px;
          border: 1.5px solid rgba(45,27,0,0.2);
          color: #2D1B00; font-size: 0.85rem; font-weight: 600;
          text-decoration: none; cursor: pointer;
          transition: all 0.2s; background: transparent;
          white-space: nowrap;
        }
        .te-view-all:hover {
          background: #FF6B1A; border-color: #FF6B1A;
          color: #fff; transform: translateY(-2px);
        }

        /* ---- Editorial asymmetric grid ---- */
        .te-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: 220px 220px 360px;
          gap: 24px;
        }
        .te-card {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(45,27,0,0.12);
          transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94),
                      box-shadow 0.45s;
          opacity: 0; transform: translateY(36px);
        }
        .te-card.te-visible { opacity: 1; transform: translateY(0); }
        .te-card:nth-child(2) { transition-delay: 0.06s; }
        .te-card:nth-child(3) { transition-delay: 0.1s; }
        .te-card:nth-child(4) { transition-delay: 0.14s; }
        .te-card:nth-child(5) { transition-delay: 0.18s; }
        .te-card:nth-child(6) { transition-delay: 0.22s; }
        .te-card:hover {
          box-shadow: 0 28px 60px rgba(45,27,0,0.22);
        }

        .te-card-1 { grid-column: 1 / 9;  grid-row: 1 / 3; }
        .te-card-2 { grid-column: 9 / 13; grid-row: 1; }
        .te-card-3 { grid-column: 9 / 13; grid-row: 2; }
        .te-card-4 { grid-column: 1 / 5;  grid-row: 3; }
        .te-card-5 { grid-column: 5 / 9;  grid-row: 3; }
        .te-card-6 { grid-column: 9 / 13; grid-row: 3; }

        .te-art {
          position: absolute; inset: 0;
          transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .te-card:hover .te-art { transform: scale(1.08); }
        .te-glow {
          position: absolute; inset: 0;
        }
        .te-scrim {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.15) 55%, transparent 100%);
        }
        .te-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.te-card:hover .te-image {
  transform: scale(1.08);
}

        .te-badge {
          position: absolute; top: 16px; left: 16px; z-index: 2;
          padding: 5px 13px; border-radius: 50px;
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(245,166,35,0.4);
          color: #F5A623; font-size: 0.68rem;
          font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .te-glass {
          position: absolute; top: 16px; right: 16px; z-index: 2;
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 50px;
          background: rgba(255,255,255,0.16);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.25);
          color: #fff; font-size: 0.78rem; font-weight: 700;
        }

        .te-info {
          position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;
          padding: 20px;
        }
        .te-card-1 .te-info { padding: 28px; }
        .te-loc {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; color: #F5A623; margin-bottom: 6px;
        }
        .te-name {
          font-family: 'Playfair Display', serif;
          color: #fff; line-height: 1.15; margin-bottom: 8px;
          font-size: clamp(1.05rem, 2vw, 1.3rem);
        }
        .te-card-1 .te-name { font-size: clamp(1.6rem, 3vw, 2.3rem); }
        .te-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .te-card-2 .te-tags, .te-card-3 .te-tags { display: none; }
        .te-tag {
          padding: 3px 10px; border-radius: 50px;
          background: rgba(255,255,255,0.12);
          color: #fff; font-size: 0.7rem;
          border: 1px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(6px);
        }
        .te-foot {
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 10px;
        }
        .te-rating { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #fff; }
        .te-reviews { color: rgba(255,255,255,0.6); font-size: 0.75rem; }
        .te-popularity {
          font-size: 0.68rem; color: rgba(255,255,255,0.55);
          display: flex; align-items: center; gap: 4px; margin-top: 4px;
        }
        .te-price-block { text-align: right; }
        .te-from { font-size: 0.65rem; color: rgba(255,255,255,0.55); display: block; }
        .te-price {
          font-size: 1.1rem; font-weight: 700; color: #F5A623;
          font-family: 'Playfair Display', serif;
        }
        .te-dur { font-size: 0.7rem; color: rgba(255,255,255,0.55); }

        .te-cta {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          height: 0; overflow: hidden;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(14px);
          border-top: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.85rem;
          letter-spacing: 0.04em; transition: height 0.35s;
          gap: 8px;
        }
        .te-card:hover .te-cta { height: 50px; }
        .te-cta svg { width: 16px; height: 16px; transition: transform 0.3s; }
        .te-card:hover .te-cta svg { transform: translateX(4px); }

        /* ---- Divider into Hidden Gems ---- */
        .te-divider { position: relative; height: 130px; }
        .te-divider svg { position: absolute; bottom: 0; width: 100%; height: 100%; }
        .te-divider-emblem {
          position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
          width: 46px; height: 46px;
          border: 1.5px solid rgba(139,26,26,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: #FDF6EC; color: #8B1A1A; z-index: 2;
        }

        @media (max-width: 1024px) {
          .te-grid {
            grid-template-columns: repeat(6, 1fr);
            grid-template-rows: 300px 200px 200px 280px;
          }
          .te-card-1 { grid-column: 1 / 7; grid-row: 1; }
          .te-card-2 { grid-column: 1 / 4; grid-row: 2; }
          .te-card-3 { grid-column: 4 / 7; grid-row: 2; }
          .te-card-4 { grid-column: 1 / 4; grid-row: 3; }
          .te-card-5 { grid-column: 4 / 7; grid-row: 3; }
          .te-card-6 { grid-column: 1 / 7; grid-row: 4; }
          .te-head { flex-direction: column; align-items: flex-start; }
          .te-deco { display: none; }
        }
        @media (max-width: 640px) {
          .te-section { padding-top: 80px; }
          .te-inner { padding: 0 20px 90px; }
          .te-grid {
            grid-template-columns: 1fr;
            grid-template-rows: none;
            gap: 18px;
          }
          .te-card-1, .te-card-2, .te-card-3, .te-card-4, .te-card-5, .te-card-6 {
            grid-column: 1 !important; grid-row: auto !important;
          }
          .te-card { height: 280px; }
          .te-card-1 { height: 380px; }
          .te-card-1 .te-emoji { font-size: 6rem; }
        }
      `}</style>

      <section className="te-section" ref={sectionRef}>
        <div className="te-noise" />

        <svg className="te-deco te-deco-compass" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="3" fill="currentColor" />
          <path d="M50 12 L56 46 L50 50 L44 46 Z" fill="currentColor" />
          <path d="M50 88 L44 54 L50 50 L56 54 Z" fill="currentColor" opacity="0.4" />
        </svg>
        <svg className="te-deco te-deco-path" viewBox="0 0 220 90" fill="none">
          <path d="M2 80 Q60 10 110 50 T218 12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 7" />
        </svg>
        <svg className="te-deco te-deco-plane" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V18l-2.5 2v1.5l4-1 4 1V20l-2.5-2v-4.5z" />
        </svg>

        <div className="te-inner">
          <div className="te-head">
            <div>
              <p className="te-eyebrow">✦ Trending Now</p>
              <h2 className="te-title">Experiences That <em>Leave a Mark</em></h2>
            </div>
            <a href="/experience" className="te-view-all">View All Experiences →</a>
          </div>

          <div className="te-grid">
            {experiences.map((exp, i) => (
              <a
                href={`/coming-soon?feature=${encodeURIComponent(exp.title)}&category=${encodeURIComponent('Trending Experience')}&desc=${encodeURIComponent(`Immerse in ${exp.title} in ${exp.location}. Duration: ${exp.duration} starting at ${exp.price}.`)}`}
                key={exp.id}
                className={`te-card te-card-${i + 1} text-decoration-none`}
              >
                <div className="te-art" style={{ background: exp.gradient }}>
                  <div className="te-glow" style={{ background: exp.glow }} />
                </div>
                <div className="te-scrim" />
                <img
                  src={exp.image}
                  alt={exp.title}
                  loading="lazy"
                  className="te-image"
                />

                <div className="te-badge">{exp.badge}</div>
                <div className="te-glass">
                  <StarRating rating={exp.rating} />
                  <span>{exp.rating}</span>
                </div>

                <div className="te-info">
                  <p className="te-loc">📍 {exp.location}</p>
                  <h3 className="te-name">{exp.title}</h3>
                  <div className="te-tags">
                    {exp.tags.map((t) => <span key={t} className="te-tag">{t}</span>)}
                  </div>
                  <div className="te-foot">
                    <div>
                      <div className="te-rating">
                        <span className="te-reviews">({exp.reviews.toLocaleString()} reviews)</span>
                      </div>
                      <div className="te-popularity">🔥 {exp.popularity}</div>
                    </div>
                    <div className="te-price-block">
                      <span className="te-from">from</span>
                      <span className="te-price">{exp.price}</span>
                      <div className="te-dur">{exp.duration}</div>
                    </div>
                  </div>
                </div>

                <div className="te-cta">
                  Discover Experience
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="te-divider">
          <svg viewBox="0 0 1440 130" preserveAspectRatio="none">
            <path d="M0,40 C360,110 1080,-10 1440,60 L1440,130 L0,130 Z" fill="#FDF6EC" />
            <path d="M0,40 C360,110 1080,-10 1440,60" fill="none" stroke="rgba(139,26,26,0.15)" strokeWidth="1.5" />
          </svg>
          <div className="te-divider-emblem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}
