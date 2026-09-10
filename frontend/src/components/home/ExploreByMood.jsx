import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const moods = [
  {
    id: 'adventure',
    title: 'Adventure Escapes',
    subtitle: 'Push your limits',
    emoji: '🏔',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    gradient: 'linear-gradient(135deg, #1a2a4a 0%, #0d3b6e 100%)',
    accent: '#4A90D9',
    destinations: ['Ladakh', 'Spiti Valley', 'Rishikesh', 'Auli'],
    count: '48 experiences',
  },
  {
    id: 'heritage',
    title: 'Heritage Trails',
    subtitle: 'Walk through history',
    emoji: '🏯',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da',
    gradient: 'linear-gradient(135deg, #3b1a00 0%, #6b3a00 100%)',
    accent: '#F5A623',
    destinations: ['Hampi', 'Khajuraho', 'Rajasthan Forts', 'Ajanta Caves'],
    count: '62 experiences',
  },
  {
    id: 'food',
    title: 'Food Journeys',
    subtitle: 'Taste every story',
    emoji: '🍛',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    gradient: 'linear-gradient(135deg, #2e0000 0%, #6b1010 100%)',
    accent: '#FF6B1A',
    destinations: ['Mumbai Street Food', 'Lucknow Kebabs', 'Kolkata Sweets', 'Chettinad'],
    count: '35 experiences',
  },
  {
    id: 'beach',
    title: 'Beach Getaways',
    subtitle: 'Salt, sun, silence',
    emoji: '🏖',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    gradient: 'linear-gradient(135deg, #003d4a 0%, #006b7a 100%)',
    accent: '#00B4CC',
    destinations: ['Goa', 'Andaman', 'Lakshadweep', 'Varkala'],
    count: '29 experiences',
  },
  {
    id: 'spiritual',
    title: 'Spiritual Retreats',
    subtitle: 'Find your still',
    
    image: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33',
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #3d1a5e 100%)',
    accent: '#C084FC',
    destinations: ['Varanasi', 'Rishikesh', 'Amritsar', 'Bodh Gaya'],
    count: '41 experiences',
  },
  {
    id: 'wildlife',
    title: 'Wildlife Adventures',
    subtitle: 'Into the wild',
    emoji: '🐅',
    image: 'https://plus.unsplash.com/premium_photo-1661936361131-c421746dcd0d?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8V2lsZGxpZmUlMjBBZHZlbnR1cmVzfGVufDB8fDB8fHww',
    gradient: 'linear-gradient(135deg, #0a2e00 0%, #1e5c00 100%)',
    accent: '#4CAF50',
    destinations: ['Ranthambore', 'Corbett', 'Kaziranga', 'Sundarbans'],
    count: '24 experiences',
  },
];

export default function ExploreByMood() {
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .ebm-section {
          background: #FDF6EC;
          padding: 100px 0 120px;
          font-family: 'DM Sans', sans-serif;
        }
        .ebm-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .ebm-eyebrow {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: #F5A623; margin-bottom: 10px;
        }
        .ebm-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          color: #0f0d0f; line-height: 1.15;
          margin-bottom: 12px;
        }
        .ebm-title em { font-style: italic; color: #FF6B1A; }
        .ebm-sub {
          color: rgba(253,246,236,0.5);
          font-size: 1rem; margin-bottom: 60px;
          max-width: 500px;
        }
        .ebm-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: auto;
          gap: 16px;
        }
        .ebm-card {
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94),
                      box-shadow 0.4s;
          min-height: 260px;
          display: flex; flex-direction: column; justify-content: flex-end;
        }
        .ebm-card:nth-child(1) { grid-row: span 2; min-height: 540px; }
        .ebm-card:nth-child(4) { grid-row: span 2; min-height: 540px; }
        .ebm-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
          z-index: 2;
        }
        .ebm-bg {
          position: absolute; inset: 0;
          transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .ebm-card:hover .ebm-bg { transform: scale(1.05); }
        .ebm-bg-inner {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .ebm-bg-emoji {
          font-size: 8rem;
          opacity: 0.12;
          filter: blur(2px);
          transform: rotate(-10deg);
          transition: opacity 0.4s, transform 0.4s;
        }
        .ebm-card:hover .ebm-bg-emoji {
          opacity: 0.2; transform: rotate(-5deg) scale(1.1);
        }
        .ebm-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
        }
        .ebm-content {
          position: relative; z-index: 2;
          padding: 28px;
        }
        .ebm-tag {
          display: inline-block;
          padding: 4px 12px; border-radius: 50px;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 10px;
          border: 1px solid currentColor;
        }
        .ebm-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: #fff; line-height: 1.2;
          margin-bottom: 4px;
        }
        .ebm-card:nth-child(1) .ebm-card-title,
        .ebm-card:nth-child(4) .ebm-card-title {
          font-size: 1.8rem;
        }
        .ebm-card-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.6);
          margin-bottom: 12px;
        }
        .ebm-dests {
          display: flex; flex-wrap: wrap; gap: 6px;
          max-height: 0; overflow: hidden;
          transition: max-height 0.4s;
        }
        .ebm-card:hover .ebm-dests { max-height: 80px; }
        .ebm-dest-chip {
          padding: 3px 10px; border-radius: 50px;
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8);
          font-size: 0.72rem; backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .ebm-count {
          font-size: 0.78rem; color: rgba(255,255,255,0.45);
          margin-top: 10px; letter-spacing: 0.05em;
        }
        .ebm-arrow {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          color: #fff; font-size: 0.85rem;
          position: absolute; right: 20px; bottom: 24px;
          transition: background 0.2s, transform 0.2s;
          z-index: 3;
        }
        .ebm-card:hover .ebm-arrow {
          background: #FF6B1A; transform: translate(2px, -2px);
        }
        @media (max-width: 900px) {
          .ebm-grid { grid-template-columns: repeat(2, 1fr); }
          .ebm-card:nth-child(1) { grid-row: span 1; min-height: 260px; }
          .ebm-card:nth-child(4) { grid-row: span 1; min-height: 260px; }
        }
        @media (max-width: 580px) {
          .ebm-grid { grid-template-columns: 1fr; }
          .ebm-card { min-height: 220px !important; }
        }
      `}</style>

      <section className="ebm-section">
        <div className="ebm-inner">
          <p className="ebm-eyebrow">✦ Curated Collections</p>
          <h2 className="ebm-title">Explore India <em>by Mood</em></h2>
          <p className="ebm-sub">Every journey begins with a feeling. Which one calls to you today?</p>

          <div className="ebm-grid">
            {moods.map((m) => (
              <div key={m.id} className="ebm-card"
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate('/coming-soon', {
                  state: {
                    featureName: `${m.title} Collection`,
                    category: "Mood-Based Curation",
                    description: `Experience tailored routes, boutique stays, and curated trails for ${m.title} across ${m.destinations.join(', ')}.`
                  }
                })}
              >
                <div
  className="ebm-bg"
  style={{
    backgroundImage: `
      linear-gradient(
        to top,
        rgba(0,0,0,0.75),
        rgba(0,0,0,0.3)
      ),
      url(${m.image})
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
>
                  
                </div>
                <div className="ebm-overlay" />
                <div className="ebm-content">
                  <span className="ebm-tag" style={{ color: m.accent, borderColor: m.accent + '60' }}>
                    {m.emoji} {m.id}
                  </span>
                  <div className="ebm-card-title">{m.title}</div>
                  <div className="ebm-card-sub">{m.subtitle}</div>
                  <div className="ebm-dests">
                    {m.destinations.map(d => (
                      <span key={d} className="ebm-dest-chip">{d}</span>
                    ))}
                  </div>
                  <div className="ebm-count">{m.count}</div>
                </div>
                <div className="ebm-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
