import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const festivals = [
  {
    id: 1,
    name: "Holi",
    location: "Mathura, Uttar Pradesh",
    month: "Mar",
    dates: "14–15 Mar 2026",
    color: "#FF6B1A",
    accent: "#F5A623",
    description:
      "The festival of colours explodes across the streets of Mathura and Vrindavan in a riot of gulal, devotion, and collective joy.",
    tags: ["Cultural", "Spiritual", "Photography"],
    image:
      "https://plus.unsplash.com/premium_photo-1664304095595-e428558e8161?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG9saXxlbnwwfHwwfHx8MA%3D%3D",
    duration: "2 days",
  },
  {
    id: 2,
    name: "Pushkar Fair",
    location: "Pushkar, Rajasthan",
    month: "Nov",
    dates: "1–9 Nov 2025",
    color: "#8B1A1A",
    accent: "#FF6B1A",
    description:
      "One of the world's largest camel fairs transforms the desert into a theatrical spectacle of traders, pilgrims, and folk performers.",
    tags: ["Heritage", "Wildlife", "Photography"],
    image:
      "https://images.unsplash.com/photo-1718528509538-bde1de6a056f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHVzaGthciUyMGZhaXJ8ZW58MHx8MHx8fDA%3D",
    duration: "9 days",
  },
  {
    id: 3,
    name: "Durga Puja",
    location: "Kolkata, West Bengal",
    month: "Oct",
    dates: "2–6 Oct 2025",
    color: "#C0392B",
    accent: "#F5A623",
    description:
      "Kolkata transforms into the world's largest open-air art gallery as thousands of illuminated pandals compete in breathtaking devotion.",
    tags: ["Cultural", "Art", "Spiritual"],
    image:
      "https://images.unsplash.com/photo-1634015158905-de840be0c62c?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZHVyZ2ElMjBwdWphJTIwa29sa2F0YXxlbnwwfHwwfHx8MA%3D%3D",
    duration: "5 days",
  },
  {
    id: 4,
    name: "Hornbill Festival",
    location: "Kohima, Nagaland",
    month: "Dec",
    dates: "1–10 Dec 2025",
    color: "#2D6A4F",
    accent: "#F5A623",
    description:
      "Nagaland's tribal nations gather in a celebration of warrior traditions, folk music, and ancient customs that rarely meet an outsider's eye.",
    tags: ["Tribal", "Music", "Adventure"],
    image:
      "https://newsarenaindia.com/_next/image?url=https%3A%2F%2Fimages.newsarenaindia.com%2Fhornbill-festival-jpg_1764505018661.jpg&w=1920&q=75",
    duration: "10 days",
  },
  {
    id: 5,
    name: "Diwali Jaipur",
    location: "Jaipur, Rajasthan",
    month: "Oct",
    dates: "20 Oct 2025",
    color: "#FF6B1A",
    accent: "#F5A623",
    description:
      "The Pink City blazes golden as Rajput palaces and bazaars are draped in earthen lamps, creating a scene from a living fairy tale.",
    tags: ["Spiritual", "Heritage", "Photography"],
    image:
      "https://images.unsplash.com/photo-1592843997881-cab3860b1067?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZGl3YWxpfGVufDB8fDB8fHww",
    duration: "1 night",
  },
];

export default function FestivalCalendar() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("fc-visible");
        });
      },
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll(".fc-reveal");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fest = festivals[active];

  const navigate = useNavigate();

  const handlePlanFestival = () => {
    navigate('/coming-soon', {
      state: {
        featureName: `${fest.name} Festival Expedition (${fest.dates})`,
        category: "Festival Concierge & VIP Access",
        description: `Experience the grandeur of ${fest.name} in ${fest.location} with local hosts, verified heritage homestays, and exclusive festival passes.`
      }
    });
  };

  return (
    <>
      <style>{`
        .fc-section {
          background: #2D1B00;
          padding: 100px 0 120px;
          position: relative;
          overflow: hidden;
        }

        .fc-section::before {
          content: '';
          position: absolute;
          top: 0px; left: 0; right: 0;
          height: 60px;
          background: #FDF6EC;
          
        }

        .fc-section::after {
          content: '';
          position: absolute;
          bottom: 0px; left: 0; right: 0;
          height: 60px;
          background: #FDF6EC;
          
        }

        .fc-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .fc-header {
          text-align: center;
          margin-bottom: 72px;
        }

        .fc-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .fc-reveal.fc-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .fc-eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #F5A623;
          margin-bottom: 14px;
        }

        .fc-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 700;
          color: #FDF6EC;
          line-height: 1.1;
        }

        .fc-title em {
          font-style: italic;
          color: #FF6B1A;
        }

        .fc-body {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 48px;
          align-items: start;
        }

        /* Timeline */
        .fc-timeline {
          position: relative;
        }

        .fc-timeline-line {
          position: absolute;
          left: 28px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(245,166,35,0.15);
        }

        .fc-timeline-progress {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: linear-gradient(to bottom, #FF6B1A, #F5A623);
          transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fc-item {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          padding: 20px 0;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
        }

        .fc-dot-wrap {
          flex-shrink: 0;
          width: 58px;
          display: flex;
          justify-content: center;
          padding-top: 4px;
          position: relative;
          z-index: 1;
        }

        .fc-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(245,166,35,0.3);
          background: #2D1B00;
          transition: all 0.3s ease;
        }

        .fc-item.fc-active .fc-dot,
        .fc-item:hover .fc-dot {
          border-color: #FF6B1A;
          background: #FF6B1A;
          box-shadow: 0 0 0 6px rgba(255,107,26,0.15);
        }

        .fc-item-meta {
          flex: 1;
          padding-bottom: 4px;
        }

        .fc-month {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #F5A623;
          margin-bottom: 4px;
        }

        .fc-item-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: #FDF6EC;
          margin-bottom: 4px;
          transition: color 0.3s ease;
        }

        .fc-item:hover .fc-item-name,
        .fc-item.fc-active .fc-item-name {
          color: #FF6B1A;
        }

        .fc-item-loc {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          color: rgba(253,246,236,0.5);
        }

        /* Card */
        .fc-card {
          position: sticky;
          top: 40px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.4);
          transition: all 0.5s ease;
        }

        .fc-card-img-wrap {
          position: relative;
          height: 320px;
          overflow: hidden;
        }

        .fc-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .fc-card:hover .fc-card-img-wrap img {
          transform: scale(1.05);
        }

        .fc-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(45,27,0,0.9), transparent 60%);
        }

        .fc-card-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255,107,26,0.9);
          backdrop-filter: blur(8px);
          color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
          letter-spacing: 1px;
        }

        .fc-card-info {
          background: rgba(45,27,0,0.95);
          padding: 28px 28px 32px;
          border: 1px solid rgba(245,166,35,0.1);
          border-top: none;
        }

        .fc-card-dates {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #F5A623;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .fc-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: #FDF6EC;
          margin-bottom: 12px;
          line-height: 1.1;
        }

        .fc-card-desc {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          color: rgba(253,246,236,0.7);
          line-height: 1.7;
          margin-bottom: 20px;
        }

        .fc-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .fc-tag {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid rgba(245,166,35,0.3);
          color: #F5A623;
          background: rgba(245,166,35,0.08);
        }

        .fc-card-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #FF6B1A, #8B1A1A);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .fc-card-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255,107,26,0.3);
        }

        @media (max-width: 900px) {
          .fc-body {
            grid-template-columns: 1fr;
          }
          .fc-card {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .fc-section {
            padding: 80px 0 100px;
          }
        }
      `}</style>

      <section className="fc-section" ref={sectionRef}>
        <div className="fc-container">
          <div className="fc-header fc-reveal">
            <p className="fc-eyebrow">Mark Your Calendar</p>
            <h2 className="fc-title">
              Festival <em>Calendar</em>
            </h2>
          </div>

          <div className="fc-body">
            {/* Timeline */}
            <div className="fc-timeline fc-reveal">
              <div className="fc-timeline-line" ref={lineRef}>
                <div
                  className="fc-timeline-progress"
                  style={{
                    height: `${((active + 0.5) / festivals.length) * 100}%`,
                  }}
                />
              </div>

              {festivals.map((f, i) => (
                <div
                  key={f.id}
                  className={`fc-item${i === active ? " fc-active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <div className="fc-dot-wrap">
                    <div className="fc-dot" />
                  </div>
                  <div className="fc-item-meta">
                    <p className="fc-month">{f.month}</p>
                    <h3 className="fc-item-name">{f.name}</h3>
                    <p className="fc-item-loc">{f.location}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Card */}
            <div
              className="fc-card fc-reveal"
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="fc-card-img-wrap">
                <img src={fest.image} alt={fest.name} />
                <div className="fc-card-overlay" />
                <span className="fc-card-badge">{fest.duration}</span>
              </div>
              <div className="fc-card-info">
                <p className="fc-card-dates">{fest.dates}</p>
                <h3 className="fc-card-name">{fest.name}</h3>
                <p className="fc-card-desc">{fest.description}</p>
                <div className="fc-tags">
                  {fest.tags.map((t) => (
                    <span className="fc-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
                <button className="fc-card-btn" onClick={handlePlanFestival}>
                  Plan This Festival Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
