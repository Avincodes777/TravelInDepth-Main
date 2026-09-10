import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const gems = [
  {
    id: 1,
    name: "Ziro Valley",
    state: "Arunachal Pradesh",
    tag: "UNESCO Heritage",
    description:
      "Ancient Apatani villages nestle among pine-draped hills and terraced rice fields in this timeless highland haven.",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    size: "large",
    season: "Oct – Apr",
  },
  {
    id: 2,
    name: "Majuli",
    state: "Assam",
    tag: "River Island",
    description:
      "The world's largest river island, home to neo-Vaishnavite monasteries and a culture that floats between earth and sky.",
    image:
      "https://images.unsplash.com/photo-1759738103476-9abb3b59458e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    size: "small",
    season: "Nov – Mar",
  },
  {
    id: 3,
    name: "Chopta",
    state: "Uttarakhand",
    tag: "Mini Switzerland",
    description:
      "A pristine alpine meadow above the clouds, where rhododendrons blaze and Tungnath temple stands as the highest Shiva shrine on earth.",
    image:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80",
    size: "small",
    season: "May – Nov",
  },
  {
    id: 4,
    name: "Tirthan Valley",
    state: "Himachal Pradesh",
    tag: "Untouched",
    description:
      "Crystal rivers, trout fishing, and dense forests buffer the Great Himalayan National Park in glorious solitude.",
    image:
      "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=800&q=80",
    size: "medium",
    season: "Apr – Jun",
  },
  {
    id: 5,
    name: "Gokarna",
    state: "Karnataka",
    tag: "Sacred Coast",
    description:
      "Where ancient temple bells mingle with the sound of waves on crescent beaches the crowds haven't yet found.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    size: "medium",
    season: "Oct – Mar",
  },
  {
    id: 6,
    name: "Mawlynnong",
    state: "Meghalaya",
    tag: "Asia's Cleanest",
    description:
      "Asia's cleanest village, wrapped in living root bridges and waterfall mist, where every path feels like a secret.",
    image:
      "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800&q=80",
    size: "large",
    season: "Sep – May",
  },
];

export default function HiddenGems() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("hg-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = sectionRef.current?.querySelectorAll(".hg-card");
    cards?.forEach((card) => observer.observe(card));

    const header = sectionRef.current?.querySelector(".hg-header");
    if (header) observer.observe(header);

    return () => observer.disconnect();
  }, []);

  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .hg-section {
          background: #FDF6EC;
          padding: 100px 0 120px;
          position: relative;
          overflow: hidden;
        }

        .hg-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #8B1A1A, #FF6B1A, #F5A623, #FF6B1A, #8B1A1A);
        }

        .hg-section::after {
          content: 'INDIA';
          position: absolute;
          bottom: -40px;
          right: -20px;
          font-family: 'Playfair Display', serif;
          font-size: 200px;
          font-weight: 900;
          color: rgba(139,26,26,0.04);
          letter-spacing: -10px;
          pointer-events: none;
          user-select: none;
        }

        .hg-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .hg-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 64px;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .hg-header.hg-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hg-eyebrow {
          font-family: 'Montserrat', 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #FF6B1A;
          margin-bottom: 14px;
        }

        .hg-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 700;
          color: #2D1B00;
          line-height: 1.1;
          max-width: 480px;
        }

        .hg-title em {
          font-style: italic;
          color: #8B1A1A;
        }

        .hg-subtitle {
          font-family: 'Montserrat', 'DM Sans', sans-serif;
          font-size: 15px;
          color: #6B5B45;
          line-height: 1.7;
          max-width: 320px;
          text-align: right;
        }

        .hg-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: auto;
          gap: 20px;
        }

        /* Masonry placement */
        .hg-card:nth-child(1) { grid-column: 1 / 6; grid-row: 1; }
        .hg-card:nth-child(2) { grid-column: 6 / 9; grid-row: 1; }
        .hg-card:nth-child(3) { grid-column: 9 / 13; grid-row: 1; }
        .hg-card:nth-child(4) { grid-column: 1 / 5; grid-row: 2; }
        .hg-card:nth-child(5) { grid-column: 5 / 9; grid-row: 2; }
        .hg-card:nth-child(6) { grid-column: 9 / 13; grid-row: 2; }

        .hg-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s ease, transform 0.7s ease, box-shadow 0.4s ease;
        }

        .hg-card.hg-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hg-card:nth-child(2) { transition-delay: 0.1s; }
        .hg-card:nth-child(3) { transition-delay: 0.2s; }
        .hg-card:nth-child(4) { transition-delay: 0.15s; }
        .hg-card:nth-child(5) { transition-delay: 0.25s; }
        .hg-card:nth-child(6) { transition-delay: 0.3s; }

        .hg-card:hover {
          box-shadow: 0 32px 64px rgba(45,27,0,0.25);
          transform: translateY(-6px) !important;
        }

        .hg-img-wrap {
          position: relative;
          overflow: hidden;
        }

        .hg-card:nth-child(1) .hg-img-wrap,
        .hg-card:nth-child(6) .hg-img-wrap { height: 420px; }
        .hg-card:nth-child(2) .hg-img-wrap,
        .hg-card:nth-child(3) .hg-img-wrap { height: 260px; }
        .hg-card:nth-child(4) .hg-img-wrap,
        .hg-card:nth-child(5) .hg-img-wrap { height: 300px; }

        .hg-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .hg-card:hover .hg-img-wrap img {
          transform: scale(1.08);
        }

        .hg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(45,27,0,0.85) 0%,
            rgba(45,27,0,0.3) 50%,
            transparent 100%
          );
        }

        .hg-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(255,107,26,0.9);
          backdrop-filter: blur(8px);
          color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 20px;
        }

        .hg-season {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 20px;
        }

        .hg-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
        }

        .hg-state {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #F5A623;
          margin-bottom: 6px;
        }

        .hg-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px, 2.5vw, 26px);
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .hg-desc {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.8);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .hg-card:hover .hg-desc {
          opacity: 1;
          transform: translateY(0);
        }

        .hg-arrow {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #FF6B1A;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.7);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .hg-card:hover .hg-arrow {
          opacity: 1;
          transform: scale(1);
        }

        .hg-arrow svg {
          width: 16px;
          height: 16px;
          color: #fff;
        }

        .hg-cta-row {
          display: flex;
          justify-content: center;
          margin-top: 56px;
        }

        .hg-btn {
          display: inline-block;
          text-decoration: none;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 16px 40px;
          border: 2px solid #8B1A1A;
          background: transparent;
          color: #8B1A1A;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hg-btn:hover {
          background: #8B1A1A;
          color: #FDF6EC;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(139,26,26,0.25);
        }

        @media (max-width: 1024px) {
          .hg-grid {
            grid-template-columns: repeat(6, 1fr);
          }
          .hg-card:nth-child(1) { grid-column: 1 / 4; grid-row: 1; }
          .hg-card:nth-child(2) { grid-column: 4 / 7; grid-row: 1; }
          .hg-card:nth-child(3) { grid-column: 1 / 3; grid-row: 2; }
          .hg-card:nth-child(4) { grid-column: 3 / 5; grid-row: 2; }
          .hg-card:nth-child(5) { grid-column: 5 / 7; grid-row: 2; }
          .hg-card:nth-child(6) { grid-column: 1 / 7; grid-row: 3; }
          .hg-card:nth-child(6) .hg-img-wrap { height: 280px; }
          .hg-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .hg-subtitle { text-align: left; max-width: 100%; }
        }

        @media (max-width: 640px) {
          .hg-section { padding: 72px 0 80px; }
          .hg-grid {
            grid-template-columns: 1fr;
          }
          .hg-card:nth-child(n) { grid-column: 1; grid-row: auto; }
          .hg-card .hg-img-wrap { height: 260px !important; }
        }
      `}</style>

      <section className="hg-section" ref={sectionRef}>
        <div className="hg-container">
          <div className="hg-header">
            <div>
              <p className="hg-eyebrow">Undiscovered India</p>
              <h2 className="hg-title">
                Hidden <em>Gems</em>
                <br />of India
              </h2>
            </div>
            <p className="hg-subtitle">
              Beyond the iconic lies an India that rewards the curious traveller
              — valleys unmarked on tourist maps, islands beyond time, coasts
              touched by myth.
            </p>
          </div>

          <div className="hg-grid">
            {gems.map((gem) => (
              <div 
                className="hg-card" 
                key={gem.id}
                onClick={() => navigate('/coming-soon', {
                  state: {
                    featureName: `${gem.name} — ${gem.state}`,
                    category: gem.tag,
                    description: gem.description
                  }
                })}
              >
                <div className="hg-img-wrap">
                  <img src={gem.image} alt={gem.name} loading="lazy" />
                  <div className="hg-overlay" />
                  <span className="hg-tag">{gem.tag}</span>
                  <span className="hg-season">{gem.season}</span>
                  <div className="hg-info">
                    <p className="hg-state">{gem.state}</p>
                    <h3 className="hg-name">{gem.name}</h3>
                    <p className="hg-desc">{gem.description}</p>
                  </div>
                  <div className="hg-arrow">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hg-cta-row">
            <Link 
              to="/coming-soon" 
              state={{
                featureName: "Hidden Gems Archive & Offline Topo Maps",
                category: "Uncharted Expeditions",
                description: "Full curated catalog of 200+ secluded valleys, river islands, living root trails, and tribal homestays with verified routes."
              }}
              className="hg-btn"
            >
              Explore All Hidden Gems
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
