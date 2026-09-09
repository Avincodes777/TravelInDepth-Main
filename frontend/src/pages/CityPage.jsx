import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CityContext } from "../context/CityContext";
import * as plannerApi from "../api/plannerApi";
import { fetchWeather } from "../api/weatherApi";
import { useAuth } from "../features/auth/useAuth";
import { getMediaUrl } from "../utils/media";
import { Helmet } from "react-helmet-async";
import WishlistButton from "../components/common/WishlistButton";
import JournalButton from "../components/common/JournalButton";


/* ─── JAIPUR DATA (swap via CityContext for other cities) ─── */
const JAIPUR = {
  slug: "jaipur",
  name: "Jaipur",
  tagline: "Royal & Timeless",
  subtitle: "Where every stone whispers stories of maharajas and moonlight",
  description:
    "Step into a city draped in terracotta hues, where forts rise from golden hills, bazaars hum with silk and spice, and every sunset turns the sky into a masterpiece. Jaipur doesn't just welcome you — it enchants you.",
  region: "Rajasthan, India",
  badge: "The Pink City",
  image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=1200&q=80",
  stats: [
    { value: "300+", label: "Years of History" },
    { value: "4.8★", label: "Traveller Rating" },
    { value: "3", label: "UNESCO Sites" },
    { value: "12M+", label: "Annual Visitors" },
  ],
  attractions: [
    {
      name: "Amber Fort",
      desc: "A majestic palace complex perched atop the Aravalli hills, with mirror halls, elephant corridors, and sweeping lake views that leave you breathless.",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&q=80",
      tags: [{ label: "UNESCO", color: "#FF6B1A" }, { label: "Must Visit", color: "#6B1A1A" }],
      rating: "4.9", reviews: "48K", hours: "8AM – 5:30PM",
    },
    {
      name: "Hawa Mahal",
      desc: "The Palace of Winds — a five-storey honeycomb of 953 carved windows, built so royal ladies could observe street festivities while remaining unseen.",
      image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&q=80",
      tags: [{ label: "Iconic", color: "#FF6B1A" }, { label: "UNESCO", color: "#FF6B1A" }],
      rating: "4.8", reviews: "62K", hours: "9AM – 4:30PM",
    },
    {
      name: "City Palace",
      desc: "A grand palace complex at the heart of Jaipur's walled city, home to royal art galleries, silver urns, and opulent courtyards still used by the royal family.",
      image: "https://images.unsplash.com/photo-1661924326425-c14a6426d989?w=800&q=80",
      tags: [{ label: "Royal", color: "#6B1A1A" }, { label: "Heritage", color: "#b37a00" }],
      rating: "4.7", reviews: "35K", hours: "9:30AM – 5PM",
    },
    {
      name: "Jantar Mantar",
      desc: "The world's largest stone astronomical observatory, built in 1724. Its giant instruments measure time, predict eclipses, and track stars with startling accuracy.",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&q=80",
      tags: [{ label: "UNESCO", color: "#FF6B1A" }, { label: "Science", color: "#2e7d32" }],
      rating: "4.6", reviews: "28K", hours: "9AM – 4:30PM",
    },
    {
      name: "Nahargarh Fort",
      desc: 'Perched on the rocky Aravalli ridge, this "Tiger Fort" offers the most dramatic panoramic view of Jaipur — especially at twilight when the city glows amber.',
      image: "https://images.unsplash.com/photo-1653495484044-479eeabe94ab?w=800&q=80",
      tags: [{ label: "Sunset Spot", color: "#e05a10" }, { label: "Fort", color: "#6B1A1A" }],
      rating: "4.5", reviews: "22K", hours: "10AM – 5:30PM",
    },
    {
      name: "Johari Bazaar",
      desc: "Jaipur's legendary jewellery market, glittering with kundan, meenakari, and precious gemstones. Also home to vibrant textile stalls and the city's finest silver.",
      image: "https://images.unsplash.com/photo-1606837731918-f006ef0ef3da?w=800&q=80",
      tags: [{ label: "Shopping", color: "#b37a00" }, { label: "Cultural", color: "#5c3d8f" }],
      rating: "4.6", reviews: "19K", hours: "10AM – 8PM",
    },
  ],
  food: [
    {
      name: "Laxmi Misthan Bhandar (LMB)",
      desc: "A Jaipur institution since 1954 — their sweets and Rajasthani thali are legendary.",
      type: "Heritage Restaurant",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    },
    {
      name: "Suvarna Mahal, Rambagh Palace",
      desc: "Dine like royalty in a gilded ballroom with the finest Rajasthani and Mughal cuisine.",
      type: "Luxury / Fine Dining",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    },
    {
      name: "Peacock Rooftop Restaurant",
      desc: "Rooftop dining with views of Hawa Mahal — perfect at sunset with a cold lassi.",
      type: "Views + Great Food",
      image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=300&fit=crop",
    },
    {
      name: "Rawat Mishthan Bhandar",
      desc: "The birthplace of Jaipur's famous Pyaaz Kachori. No visit is complete without stopping here.",
      type: "Street Food Icon",
      image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop",
    },
  ],
  experiences: [
    {
      name: "Elephant Ride at Amber Fort",
      desc: "Ascend to Amber Fort on the back of a majestic painted elephant — a royal arrival befitting the palace you're about to enter.",
      icon: "🐘",
      time: "Morning Only",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=600&h=400&fit=crop",
    },
    {
      name: "Shopping in Johari Bazaar",
      desc: "Hunt for blue pottery, kundan jewellery, block-printed textiles, and handcrafted leather shoes in Jaipur's bustling walled-city markets.",
      icon: "💍",
      time: "Evening Best",
      image: "https://images.unsplash.com/photo-1606837731918-f006ef0ef3da?w=600&h=400&fit=crop",
    },
    {
      name: "Sunset at Nahargarh Fort",
      desc: "Watch the Pink City blush deeper as the sun melts into the Aravalli ridgeline — one of India's most dramatic and romantic sunsets.",
      icon: "🌅",
      time: "5 PM – 7 PM",
      image: "https://images.unsplash.com/photo-1653495484044-479eeabe94ab?w=600&h=400&fit=crop",
    },
    {
      name: "Cultural Shows & Folk Dance",
      desc: "Experience Kalbelia snake-charmer dances, puppet shows, and Ghoomar performances at Chokhi Dhani — a village turned cultural theme park.",
      icon: "💃",
      time: "Evening Show",
      image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&h=400&fit=crop",
    },
  ],
  hiddenGems: [
    {
      name: "Panna Meena Ka Kund",
      desc: "A mesmerising 16th-century stepwell near Amber Fort with symmetrical staircases forming perfect geometric patterns. Peaceful, photogenic, and almost always uncrowded.",
      icon: "🪜",
      location: "Amer",
      image: "https://images.unsplash.com/photo-1630261000949-b4a3c3571af4?w=600&h=400&fit=crop",
    },
    {
      name: "Jawahar Circle Garden",
      desc: "The largest circular park in Asia, this gorgeous garden dazzles at evening with illuminated fountains and manicured flower beds. Perfect for a quiet evening stroll.",
      icon: "🌸",
      location: "Malviya Nagar",
      image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=600&h=400&fit=crop",
    },
    {
      name: "Kanak Vrindavan Garden",
      desc: "Nestled beside the Jal Mahal lake, this serene 18th-century garden with its ornate temples and peacock-filled lawns is overlooked by nearly every tourist guide.",
      icon: "🌺",
      location: "Nahargarh Road",
      image: "https://images.unsplash.com/photo-1661924326425-c14a6426d989?w=600&h=400&fit=crop",
    },
    {
      name: "Chandlai Lake",
      desc: "A birder's paradise just 25km from Jaipur — winter months bring flamingos, cranes, and migratory ducks in stunning numbers. Bring binoculars and your silence.",
      icon: "🦢",
      location: "25km from City",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop",
    },
  ],
  nearby: [
    {
      name: "Ajmer",
      emoji: "🕌",
      desc: "Home to the revered Dargah of Sufi saint Moinuddin Chishti, Ajmer radiates a profound spiritual calm. Visit during Urs festival for an otherworldly experience.",
      distance: "135 km · ~2.5 hrs by road",
      image: "https://images.unsplash.com/photo-1666175146759-ce6a39f991ae?w=600&h=400&fit=crop",
    },
    {
      name: "Pushkar",
      emoji: "🐪",
      desc: "A sacred lake town with 52 bathing ghats and over 400 temples. November's Pushkar Camel Fair is one of the world's most surreal spectacles.",
      distance: "145 km · ~3 hrs by road",
      image: "https://images.unsplash.com/photo-1715168931029-2949161ee406?w=600&h=400&fit=crop",
    },
    {
      name: "Ranthambore",
      emoji: "🐯",
      desc: "India's most famed tiger reserve, set against ancient fort ruins. A morning safari here, watching a Bengal tiger stalk through tall grass, is a defining life experience.",
      distance: "180 km · ~3.5 hrs by road",
      image: "https://images.unsplash.com/photo-1725990076174-a3448eb86e76?w=600&h=400&fit=crop",
    },
  ],
  months: [
    { m: "Jan", range: "8°– 22°C", label: "Cold Nights", type: "warn" },
    { m: "Feb", range: "12°– 25°C", label: "Great!", type: "good" },
    { m: "Mar", range: "18°– 32°C", label: "Best", type: "best" },
    { m: "Apr", range: "25°– 38°C", label: "Warm", type: "warn" },
    { m: "May", range: "30°– 44°C", label: "Very Hot", type: "bad" },
    { m: "Jun", range: "28°– 42°C", label: "Monsoon", type: "bad" },
    { m: "Jul", range: "25°– 37°C", label: "Heavy Rain", type: "bad" },
    { m: "Aug", range: "24°– 34°C", label: "Clearing", type: "warn" },
    { m: "Sep", range: "22°– 33°C", label: "Good", type: "good" },
    { m: "Oct", range: "18°– 32°C", label: "Best", type: "best" },
    { m: "Nov", range: "12°– 26°C", label: "Ideal", type: "best" },
    { m: "Dec", range: "8°– 22°C", label: "Chilly", type: "warn" },
  ],
  tips: [
    { icon: "😎", title: "Beat the Heat", desc: "Visit April–June before 10AM and after 5PM. Carry electrolytes and wear light cotton." },
    { icon: "🧥", title: "Winter Nights", desc: "December–January evenings drop to 5–8°C. Pack a warm jacket for open-air heritage dinners." },
    { icon: "🤝", title: "Bargain Wisely", desc: "Haggling is expected at bazaars. Start at 50% of the quoted price. Always smile — it's part of the ritual." },
    { icon: "🌸", title: "Festival Timing", desc: "Visit during Diwali (Oct–Nov) or Holi (Mar) for a transformative cultural experience — but book 3 months ahead." },
  ],
  checklist: {
    Summer: ["High-SPF sunscreen (SPF 50+)", "2-litre reusable water bottle", "Light cotton or linen clothing", "UV-protective sunglasses", "Wide-brimmed hat or scarf", "ORS sachets / electrolyte tablets", "Cooling face mist spray", "Portable fan or mini cooler"],
    Winter: ["Warm jacket or shawl", "Thermal innerwear for evenings", "Comfortable walking shoes", "Lip balm & moisturiser", "Scarf for cold mornings", "Hand warmers"],
    Essentials: ["Aadhaar / passport copy", "Travel insurance docs", "Offline maps (Google Maps)", "Cash in small denominations", "Reusable bag for shopping", "Basic first-aid kit", "Power bank", "Camera with extra memory"],
  },
};

/* ─── STYLES ─── */
const S = {
  orange: "#FF6B1A",
  orangeDark: "#e05a10",
  cream: "#FDF6EC",
  darkBrown: "#5c1a00",
  midBrown: "#8B2500",
  maroon: "#5c1212",
  textMid: "#5a3020",
  textMuted: "#9a7060",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700;1,800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; background: #FDF6EC; color: #2D0A00; }
  html { scroll-behavior: smooth; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #FDF6EC; }
  ::-webkit-scrollbar-thumb { background: #FF6B1A; border-radius: 3px; }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0px); }
  }
`;

/* ─── SUB-COMPONENTS ─── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(234, 88, 12, 0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
      boxShadow: scrolled ? "0 8px 30px rgba(0,0,0,0.12)" : "none",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px", height: 64,
      transition: "all 0.4s ease",
    }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <img 
          src={getMediaUrl("logo.jpg")} 
          alt="logo" 
          loading="lazy"
          style={{ 
           width: 40, height: 40, 
           transition: "transform 0.5s ease",
           border: "none",
           outline: "none",
           borderRadius: 10,
          }}
          onMouseEnter={e => e.target.style.transform = "rotate(360deg)"}
          onMouseLeave={e => e.target.style.transform = "rotate(0deg)"}
        />
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: scrolled ? "#FFFFFF" : "#000000",
          transition: "color 0.3s ease",
        }}>
          Travel in <span style={{ color: scrolled ? "#FDE68A" : S.orange }}>Depth</span>
        </span>
      </a>
      <ul style={{ display: "flex", gap: 36, listStyle: "none" }}>
        {["Plan Trip", "Attractions", "Food", "Experiences", "Best Time"].map(item => (
          <li key={item}>
            <a href={`#${item.toLowerCase().replace(" ", "-")}`} style={{
              textDecoration: "none",
              color: scrolled ? "rgba(255,255,255,0.95)" : "#000000",
              fontSize: 14,
              fontWeight: 700,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.target.style.color = scrolled ? "#FDE68A" : S.orange}
            onMouseLeave={e => e.target.style.color = scrolled ? "rgba(255,255,255,0.95)" : "#000000"}
            >{item}</a>
          </li>
        ))}
      </ul>
      <button
        onClick={() => document.getElementById("plan-trip")?.scrollIntoView({ behavior: "smooth" })}
        style={{
          background: scrolled ? "#FFFFFF" : S.orange,
          color: scrolled ? "#000000" : "#FFFFFF",
          border: "none", borderRadius: 50,
          padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
        }}
      >
        ✦ Plan My Trip
      </button>
    </nav>
  );
}

const PLACEHOLDER_IMAGE = getMediaUrl("photo-placeholder.jpg");
const PLACEHOLDER_ATTRACTION = getMediaUrl("placeholder-attraction.jpg");
const PLACEHOLDER_FOOD = getMediaUrl("placeholder-food.jpg");
const PLACEHOLDER_EXPERIENCE = getMediaUrl("placeholder-experience.jpg");

function Hero({ city }) {
  const subtitle = city.subtitle || `Discover the best of ${city.name}, ${city.state || city.region}`;
  const description = city.about || city.description || `${city.name} is a captivating destination in ${city.state || city.region}, offering unforgettable heritage, culture, and nature experiences.`;
  const badge = city.badge || city.region || "Incredible India";
  const stats = Array.isArray(city.stats) && city.stats.length > 0 ? city.stats : [
    { value: `${city.rating || 4.5}★`, label: "Traveller Rating" },
    { value: city.budget || "Affordable", label: "Budget Tier" },
    { value: city.bestSeason || "All Year", label: "Best Season" },
  ];

  const heroImage = city.image || PLACEHOLDER_IMAGE;

  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", overflow: "hidden", paddingTop: 100, paddingBottom: 60 }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover", backgroundPosition: "center",
        filter: "brightness(0.55) saturate(1.15)",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(40,15,5,0.4) 0%, rgba(70,25,10,0.55) 50%, rgba(30,10,0,0.85) 100%)" }} />

      {/* Main Hero Content */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", color: "white", maxWidth: 900, padding: "20px 24px 30px", margin: "auto 0" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          marginBottom: 18,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 50, padding: "7px 22px", fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ width: 8, height: 8, background: S.orange, borderRadius: "50%", display: "inline-block" }} />
            {city.state ? `${city.state}, India` : city.region} · {badge}
          </div>
          {city.slug && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <WishlistButton
                slug={city.slug}
                className="w-9 h-9 !bg-white/20 !border !border-white/30 backdrop-blur-md hover:!bg-white"
                activeClass="text-red-500 fill-red-500"
                inactiveClass="text-white hover:text-red-500"
                size={16}
              />
              <JournalButton
                destinationName={city.name}
                className="w-9 h-9 !bg-white/20 !border !border-white/30 backdrop-blur-md hover:!bg-white"
                activeClass="text-[#FF6B1A]"
                size={16}
                title={`Write a Journal Entry about ${city.name}`}
              />
            </div>
          )}
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(46px,7vw,84px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 6 }}>
          {city.name}
        </h1>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 700, fontStyle: "italic", color: "#FFB347", lineHeight: 1.15, marginBottom: 20 }}>
          {city.tagline}
        </div>
        <p style={{ fontSize: 16, fontStyle: "italic", color: "rgba(255,255,255,0.85)", marginBottom: 12 }}>{subtitle}</p>
        <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, maxWidth: 640, margin: "0 auto 32px" }}>{description}</p>
        
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          <button onClick={() => document.getElementById("plan-trip")?.scrollIntoView({ behavior: "smooth" })} style={{
            background: S.orange, color: "white", border: "none", borderRadius: 50,
            padding: "14px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, boxShadow: "0 6px 20px rgba(255,107,26,0.4)",
            transition: "all 0.3s ease",
          }}>✦ Plan Your Trip</button>
          <button onClick={() => document.getElementById("attractions")?.scrollIntoView({ behavior: "smooth" })} style={{
            background: "rgba(255,255,255,0.12)", color: "white", border: "1.5px solid rgba(255,255,255,0.6)",
            borderRadius: 50, padding: "14px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(4px)",
            transition: "all 0.3s ease",
          }}>🗺 Explore Places</button>
        </div>
      </div>

      {/* Stats Bottom Container */}
      <div style={{ position: "relative", zIndex: 4, width: "100%", paddingBottom: 20 }}>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>SCROLL TO EXPLORE</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px, 5vw, 70px)", padding: "0 24px", flexWrap: "wrap" }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center", color: "white" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, color: "#FFB347", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlannerSection({ city }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState("Couple / Honeymoon");
  const [budget, setBudget] = useState("mid-range");
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const generate = async () => {
    setLoading(true);
    setItinerary(null);
    setError(null);
    setSavedSuccess(false);
    try {
      const data = await plannerApi.generateItinerary({
        destination: city.name,
        days: days,
        budget: budget,
        travelStyle: style,
        interests: "Sightseeing, Local Food, Culture",
      });
      setItinerary(data);
    } catch (err) {
      console.error("Planner generation failed:", err);
      setError(err.message || "Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname + '#plan-trip' } });
      return;
    }
    const daysList = itinerary?.days || (Array.isArray(itinerary) ? itinerary : []);
    if (!daysList || daysList.length === 0) return;

    setSaving(true);
    try {
      await plannerApi.saveItinerary({
        destination: city.name,
        days: daysList,
        meta: {
          budget,
          travelStyle: style,
          totalDays: days,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save itinerary:", err);
      alert(err.message || "Could not save itinerary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="plan-trip" style={{ padding: "80px 0", background: "#FDF6EC" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: S.orange, textAlign: "center", marginBottom: 10 }}>SMART PLANNER</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, color: S.darkBrown, textAlign: "center", marginBottom: 10 }}>
          Build Your Perfect {city.name} Itinerary
        </h2>
        <div style={{ width: 60, height: 3, background: S.orange, margin: "0 auto 14px", borderRadius: 2 }} />
        <p style={{ color: S.textMuted, textAlign: "center", fontSize: 15.5, maxWidth: 560, margin: "0 auto 52px", lineHeight: 1.7 }}>
          Tell us how you travel, and our AI will craft a day-by-day plan tailored just for you.
        </p>

        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 40px rgba(90,20,0,0.08)" }}>
          {/* Dark header */}
          <div style={{ background: "#5c1212", padding: "28px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 48, height: 48, background: "rgba(255,255,255,0.12)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📅</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1.2 }}>AI Trip Planner</div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>Powered by Gemini AI for {city.name}</div>
              </div>
            </div>
            {user && (
              <span style={{ fontSize: 13, color: "#FFD7B5", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", padding: "8px 18px", borderRadius: 50, display: "inline-flex", alignItems: "center", gap: 6 }}>
                👤 Planning as <b>{user.name}</b>
              </span>
            )}
          </div>
          {/* Controls */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 32,
            padding: "36px 36px 28px",
            alignItems: "start",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: S.textMuted }}>NUMBER OF DAYS</span>
                <span style={{ background: S.orange, color: "white", fontSize: 13, fontWeight: 700, borderRadius: 50, padding: "4px 16px" }}>{days} Days</span>
              </div>
              <input type="range" min={1} max={7} value={days} onChange={e => setDays(+e.target.value)}
                style={{ width: "100%", accentColor: S.orange, cursor: "pointer", marginTop: 6 }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: S.textMuted }}>
                <span>1 Day</span><span>7 Days</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: S.textMuted }}>TRAVEL STYLE</div>
              <select value={style} onChange={e => setStyle(e.target.value)} style={{
                width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #e8d5c4",
                fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff8f4",
                color: S.darkBrown, cursor: "pointer", outline: "none", fontWeight: 500,
              }}>
                {["Couple / Honeymoon", "Solo Explorer", "Family with Kids", "Friends Group", "Cultural Enthusiast"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: S.textMuted }}>BUDGET LEVEL</div>
              <select value={budget} onChange={e => setBudget(e.target.value)} style={{
                width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #e8d5c4",
                fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff8f4",
                color: S.darkBrown, cursor: "pointer", outline: "none", fontWeight: 500,
              }}>
                <option value="budget">Budget (₹2,000–4,000/day) 💰</option>
                <option value="mid-range">Mid-range (₹5,000–10,000/day) 💳</option>
                <option value="luxury">Luxury (₹15,000+/day) 👑</option>
              </select>
            </div>
          </div>
          <div style={{ padding: "0 36px 44px", textAlign: "center" }}>
            <button onClick={generate} disabled={loading} style={{
              background: loading ? "#ccc" : S.orange, color: "white", border: "none", borderRadius: 50,
              padding: "16px 48px", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(255,107,26,0.35)",
              transition: "transform 0.2s ease",
            }}>
              {loading ? "⏳ Crafting Itinerary with AI…" : "✦ Generate My Itinerary"}
            </button>

            {error && (
              <div style={{ marginTop: 24, color: "#c0392b", fontSize: 14, background: "#fde8e8", padding: "14px 24px", borderRadius: 12, display: "inline-block" }}>
                ⚠️ {error}
              </div>
            )}

            {itinerary && (itinerary.days || Array.isArray(itinerary)) && (() => {
              const daysList = itinerary.days || itinerary;
              const isFallback = Boolean(itinerary.isFallback);
              return (
                <div style={{ marginTop: 44, textAlign: "left", borderTop: "1.5px solid #f0e4d8", paddingTop: 36 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: S.darkBrown, margin: 0, fontWeight: 800 }}>
                        Your {daysList.length}-Day {city.name} Itinerary
                      </h3>
                      {isFallback && (
                        <span style={{
                          padding: "5px 16px",
                          background: "rgba(255,107,26,0.1)",
                          border: "1px solid rgba(255,107,26,0.25)",
                          borderRadius: 50,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: S.orange,
                        }}>
                          ✦ Curated Pick
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        background: savedSuccess ? "#138808" : "#8B1A1A",
                        color: "white",
                        border: "none",
                        borderRadius: 50,
                        padding: "12px 28px",
                        fontSize: 13.5,
                        fontWeight: 700,
                        cursor: saving ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                        transition: "all 0.25s ease",
                      }}
                    >
                      {savedSuccess ? "✓ Saved to My Dashboard!" : saving ? "Saving…" : "💾 Save This Trip"}
                    </button>
                  </div>
                  <div style={{ display: "grid", gap: 28 }}>
                    {daysList.map(d => {
                      // Clean title to strip duplicate "Day 1:" prefixes from AI output if present
                      const cleanTitle = (d.title || "")
                        .replace(new RegExp(`^Day\\s*${d.day}\\s*:\\s*`, "i"), "")
                        .replace(/^Day\s*\d+\s*:\s*/i, "")
                        .trim();

                      return (
                        <div key={d.day} style={{ background: "#FFFBF7", border: "1.5px solid #F0E2D2", borderRadius: 20, padding: "32px", boxShadow: "0 4px 20px rgba(90,20,0,0.04)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12, borderBottom: "1px solid #F3E5D8", paddingBottom: 16 }}>
                            <h4 style={{ fontFamily: "'Playfair Display', serif", color: S.orange, fontSize: 20, fontWeight: 800, margin: 0 }}>
                              Day {d.day}: {cleanTitle || `Exploring ${city.name}`}
                            </h4>
                            <span style={{ fontSize: 13.5, color: "#138808", fontWeight: 800, background: "#E8F5E9", padding: "5px 14px", borderRadius: 50 }}>
                              {d.estimatedBudgetINR}
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 15, color: S.textMid, lineHeight: 1.8 }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <span style={{ fontWeight: 800, color: S.darkBrown, minWidth: 110, flexShrink: 0 }}>🌅 Morning:</span>
                              <span>{d.morning}</span>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <span style={{ fontWeight: 800, color: S.darkBrown, minWidth: 110, flexShrink: 0 }}>☀️ Afternoon:</span>
                              <span>{d.afternoon}</span>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <span style={{ fontWeight: 800, color: S.darkBrown, minWidth: 110, flexShrink: 0 }}>🌆 Evening:</span>
                              <span>{d.evening}</span>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <span style={{ fontWeight: 800, color: S.darkBrown, minWidth: 110, flexShrink: 0 }}>🍛 Meals:</span>
                              <span>{d.meals}</span>
                            </div>
                            {d.tips && (
                              <div style={{ marginTop: 10, padding: "14px 18px", background: "#FFF3E8", borderLeft: `4px solid ${S.orange}`, borderRadius: 10, fontSize: 14, color: S.midBrown }}>
                                <b>💡 Insider Tip:</b> {d.tips}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}

function AttractionCard({ a }) {
  const desc = a.desc || a.description || "";
  const tags = a.tags || [{ label: "Popular", color: "#FF6B1A" }];

  const rating = a.rating || "4.7";
  const reviews = a.reviews || "1K+";
  const hours = a.hours || "9AM – 5PM";
  const fallback = PLACEHOLDER_ATTRACTION;

  return (
    <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(90,20,0,0.06)", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: 220, background: "#F3E5D8" }}>
        <img
          src={a.image || fallback}
          alt={a.name}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            if (e.target.src !== fallback) {
              e.target.src = fallback;
            }
          }}
        />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 7 }}>
          {tags.map(t => (
            <span key={t.label} style={{ background: t.color || "#FF6B1A", color: "white", fontSize: 12, fontWeight: 600, borderRadius: 50, padding: "4px 12px" }}>{t.label}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: S.midBrown, marginBottom: 8 }}>{a.name}</h3>
        <p style={{ fontSize: 14, color: S.textMid, lineHeight: 1.75, flex: 1, marginBottom: 18 }}>{desc}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0e4d8", paddingTop: 14 }}>
          <span style={{ fontSize: 14, color: "#b37a00", fontWeight: 600 }}>⭐ {rating} ({reviews} reviews)</span>
          <span style={{ fontSize: 13, color: S.textMuted, display: "flex", alignItems: "center", gap: 5 }}>🕐 {hours}</span>
        </div>
      </div>
    </div>
  );
}

function AttractionsSection({ city }) {
  const attractions = city.attractions || [];
  if (attractions.length === 0) return null;

  return (
    <section id="attractions" style={{ padding: "80px 0", background: "#FDF6EC" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: S.orange, textAlign: "center", marginBottom: 10 }}>MUST-VISIT</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, color: S.darkBrown, textAlign: "center", marginBottom: 10 }}>
          Iconic Attractions of {city.name}
        </h2>
        <div style={{ width: 60, height: 3, background: S.orange, margin: "0 auto 14px", borderRadius: 2 }} />
        <p style={{ color: S.textMuted, textAlign: "center", fontSize: 15.5, maxWidth: 560, margin: "0 auto 56px", lineHeight: 1.7 }}>
          From celebrated landmarks to breathtaking scenic wonders — explore the highlights of {city.name}.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28 }}>
          {attractions.map(a => <AttractionCard key={a.name} a={a} />)}
        </div>
      </div>
    </section>
  );
}

function FoodSection({ city }) {
  const food = city.foodRecommendations || city.food || [];
  if (food.length === 0) return null;
  const fallback = PLACEHOLDER_FOOD;

  return (
    <section id="food" style={{ padding: "80px 0", background: "#FDF6EC" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: S.orange, textAlign: "center", marginBottom: 10 }}>WHERE TO EAT</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: S.orange, textAlign: "center", marginBottom: 10 }}>
          Famous Local Food & Spots
        </h2>
        <div style={{ width: 60, height: 3, background: S.orange, margin: "0 auto 52px", borderRadius: 2 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {food.map(f => (
            <div key={f.name} style={{ background: "white", borderRadius: 16, overflow: "hidden", display: "flex", alignItems: "center", gap: 0, boxShadow: "0 2px 12px rgba(90,20,0,0.06)" }}>
              <img
                src={f.image || fallback}
                alt={f.name}
                loading="lazy"
                style={{ width: 110, height: 110, objectFit: "cover", flexShrink: 0, background: "#F3E5D8" }}
                onError={(e) => {
                  if (e.target.src !== fallback) {
                    e.target.src = fallback;
                  }
                }}
              />
              <div style={{ padding: "14px 18px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: S.darkBrown, marginBottom: 6, lineHeight: 1.3 }}>{f.name}</h3>
                <p style={{ fontSize: 13, color: S.textMid, lineHeight: 1.6, marginBottom: 8 }}>{f.desc || f.description}</p>
                <span style={{ fontSize: 12, color: S.orange, fontWeight: 600 }}>✦ {f.type || "Local Speciality"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperiencesSection({ city }) {
  const experiences = city.activities || city.experiences || [];
  if (experiences.length === 0) return null;
  const fallback = PLACEHOLDER_EXPERIENCE;

  return (
    <section id="experiences" style={{ padding: "80px 0", background: "#5c1212" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#FFB347", textAlign: "center", marginBottom: 10 }}>LIVE IT FULLY</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px,5vw,54px)", fontWeight: 800, color: "white", textAlign: "center", marginBottom: 10 }}>
          Must-Do Experiences in {city.name}
        </h2>
        <div style={{ width: 60, height: 3, background: "#FFB347", margin: "0 auto 14px", borderRadius: 2 }} />
        <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", fontSize: 15.5, maxWidth: 580, margin: "0 auto 56px", lineHeight: 1.7 }}>
          Beyond sightseeing — unforgettable activities that turn a trip into a lifelong memory.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22 }}>
          {experiences.map(exp => (
            <div key={exp.name} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
              <img
                src={exp.image || fallback}
                alt={exp.name}
                loading="lazy"
                style={{ width: "100%", height: 200, objectFit: "cover", display: "block", background: "#8b2500" }}
                onError={(e) => {
                  if (e.target.src !== fallback) {
                    e.target.src = fallback;
                  }
                }}
              />
              <div style={{ padding: "18px 18px 20px" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{exp.icon || "✨"}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "white", marginBottom: 8, lineHeight: 1.3 }}>{exp.name}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 16 }}>{exp.desc || exp.description}</p>
                {exp.time && (
                  <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 500, borderRadius: 50, padding: "5px 14px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    🕐 {exp.time}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HiddenGemsSection({ city }) {
  const hiddenGems = city.hiddenGems || [];
  if (hiddenGems.length === 0) return null;
  const fallback = PLACEHOLDER_ATTRACTION;

  return (
    <section style={{ padding: "80px 0", background: "#FDF6EC" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: S.orange, textAlign: "center", marginBottom: 10 }}>OFF THE BEATEN PATH</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, color: S.darkBrown, textAlign: "center", marginBottom: 10 }}>
          Hidden Gems of {city.name}
        </h2>
        <div style={{ width: 60, height: 3, background: S.orange, margin: "0 auto 14px", borderRadius: 2 }} />
        <p style={{ color: S.textMuted, textAlign: "center", fontSize: 15.5, maxWidth: 560, margin: "0 auto 56px", lineHeight: 1.7 }}>
          Skip the crowds. These lesser-known treasures reveal a quieter, more magical side of {city.name}.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22 }}>
          {hiddenGems.map(gem => (
            <div key={gem.name} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(90,20,0,0.07)" }}>
              <img
                src={gem.image || fallback}
                alt={gem.name}
                loading="lazy"
                style={{ width: "100%", height: 190, objectFit: "cover", display: "block", background: "#F3E5D8" }}
                onError={(e) => {
                  if (e.target.src !== fallback) {
                    e.target.src = fallback;
                  }
                }}
              />
              <div style={{ padding: "18px 18px 20px" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{gem.icon || "💎"}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: S.midBrown, marginBottom: 8, lineHeight: 1.3 }}>{gem.name}</h3>
                <p style={{ fontSize: 13, color: S.textMid, lineHeight: 1.7, marginBottom: 16 }}>{gem.desc || gem.description}</p>
                {gem.location && (
                  <span style={{ background: "#fde8e8", color: "#c0392b", fontSize: 12, fontWeight: 500, borderRadius: 50, padding: "4px 12px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    📍 {gem.location}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NearbySection({ city }) {
  const nearby = city.nearby || [];
  if (nearby.length === 0) return null;
  const fallback = PLACEHOLDER_ATTRACTION;

  return (
    <section style={{ padding: "80px 0", background: "#FDF6EC" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,50px)", fontWeight: 800, color: S.darkBrown, textAlign: "center", marginBottom: 10 }}>
          Nearby Destinations
        </h2>
        <div style={{ width: 60, height: 3, background: S.orange, margin: "0 auto 14px", borderRadius: 2 }} />
        <p style={{ color: S.textMuted, textAlign: "center", fontSize: 15.5, maxWidth: 560, margin: "0 auto 56px", lineHeight: 1.7 }}>
          Extend your journey — explore scenic getaways near {city.name}.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
          {nearby.map(n => (
            <div key={n.name} style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 20px rgba(90,20,0,0.07)" }}>
              <div style={{ position: "relative", height: 220, background: "#F3E5D8" }}>
                <img
                  src={n.image || fallback}
                  alt={n.name}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    if (e.target.src !== fallback) {
                      e.target.src = fallback;
                    }
                  }}
                />
              </div>
              <div style={{ padding: "22px 24px" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: S.darkBrown, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  {n.emoji || "📍"} {n.name}
                </h3>
                <p style={{ fontSize: 14, color: S.textMid, lineHeight: 1.75, marginBottom: 16 }}>{n.desc || n.description}</p>
                {n.distance && (
                  <span style={{ fontSize: 13.5, color: S.orange, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    📍 {n.distance}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



function BestTimeSection({ city }) {
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      try {
        const data = await fetchWeather({ slug: city.slug, lat: city.lat, lng: city.lng });
        if (isMounted && data) {
          setWeather(data);
        }
      } catch (err) {
        console.error("Live weather fetch failed:", err);
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    };
    loadWeather();
    return () => { isMounted = false; };
  }, [city.slug, city.lat, city.lng]);

  const typeStyles = {
    best: { bg: "#e8f5e9", text: "#2e7d32", icon: "✅" },
    good: { bg: "#e8f5e9", text: "#2e7d32", icon: "✅" },
    warn: { bg: "#fff8e1", text: "#b37a00", icon: "⚠️" },
    bad:  { bg: "#fdecea", text: "#b71c1c", icon: "🌧" },
  };

  const months = city.months || [];
  const tips = city.tips || [];

  return (
    <section id="best-time" style={{ padding: "80px 0", background: "#FDF6EC" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
        {/* Live Weather Forecast Widget */}
        <div style={{
          background: "linear-gradient(135deg, #2D1B00 0%, #4D2600 60%, #1A0A00 100%)",
          borderRadius: 24,
          padding: "36px 40px",
          color: "white",
          marginBottom: 60,
          boxShadow: "0 20px 50px rgba(45,27,0,0.25)",
          border: "1px solid rgba(245,166,35,0.2)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#F5A623" }}>
                📡 LIVE CLIMATE RADAR
              </span>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#FDF6EC", marginTop: 4 }}>
                Real-Time Weather in {city.name}
              </h3>
            </div>
            {weather?.current && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 44 }}>{weather.current.icon}</div>
                <div>
                  <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1, color: "#FFB347" }}>
                    {weather.current.temperature}°C
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                    Feels like {weather.current.apparentTemperature}°C • {weather.current.label}
                  </div>
                </div>
              </div>
            )}
          </div>

          {loadingWeather ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.6)" }}>
              Fetching satellite telemetry & 5-day forecast…
            </div>
          ) : weather?.forecast ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
                {weather.forecast.map((f, i) => (
                  <div key={f.date} style={{
                    background: i === 0 ? "rgba(255,107,26,0.18)" : "rgba(255,255,255,0.06)",
                    border: i === 0 ? "1px solid #FF6B1A" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    padding: "16px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? "#FFB347" : "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                      {i === 0 ? "Today" : f.day}
                    </div>
                    <div style={{ fontSize: 26, margin: "8px 0" }}>{f.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>
                      {f.maxTemp}° <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>/ {f.minTemp}°</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {f.label}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 24, marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.65)", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
                <span>💧 Humidity: <b>{weather.current.humidity}%</b></span>
                <span>💨 Wind: <b>{weather.current.windSpeed} km/h</b></span>
                <span>☀️ Daylight: <b>{weather.current.isDay ? "Daytime" : "Night"}</b></span>
              </div>
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Live weather temporarily offline.</p>
          )}
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, color: S.darkBrown, textAlign: "center", marginBottom: 10 }}>
          Best Time to Visit {city.name}
        </h2>
        <div style={{ width: 60, height: 3, background: S.orange, margin: "0 auto 14px", borderRadius: 2 }} />
        <p style={{ color: S.textMuted, textAlign: "center", fontSize: 15.5, maxWidth: 540, margin: "0 auto 52px", lineHeight: 1.7 }}>
          Recommended season: <strong style={{ color: S.orange }}>{city.bestSeason || "October to March"}</strong>
        </p>

        {months.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14, marginBottom: 52 }}>
            {months.map(m => {
              const st = typeStyles[m.type] || typeStyles.good;
              return (
                <div key={m.m} style={{ background: st.bg, borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: st.text, marginBottom: 4 }}>{m.m}</div>
                  <div style={{ fontSize: 13, color: S.textMid, marginBottom: 8 }}>{m.range}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: st.text, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    {st.icon} {m.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tips.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {tips.map(tip => (
              <div key={tip.title} style={{ background: "white", borderRadius: 14, padding: "20px 18px", boxShadow: "0 2px 12px rgba(90,20,0,0.06)" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{tip.icon || "💡"}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: S.darkBrown, marginBottom: 8 }}>{tip.title}</h4>
                <p style={{ fontSize: 13, color: S.textMid, lineHeight: 1.7 }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ChecklistSection({ city }) {
  const checklistObj = city.checklist && Object.keys(city.checklist).length > 0 ? city.checklist : null;
  if (!checklistObj) return null;

  const tabs = Object.keys(checklistObj);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [checked, setChecked] = useState({});
  const toggle = item => setChecked(p => ({ ...p, [item]: !p[item] }));
  const items = checklistObj[activeTab] || [];

  return (
    <section style={{ padding: "80px 0 100px", background: "#FDF6EC" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: S.orange, textAlign: "center", marginBottom: 10 }}>PACK SMART</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, color: S.darkBrown, textAlign: "center", marginBottom: 10 }}>
          Travel Checklist for {city.name}
        </h2>
        <div style={{ width: 60, height: 3, background: S.orange, margin: "0 auto 14px", borderRadius: 2 }} />
        <p style={{ color: S.textMuted, textAlign: "center", fontSize: 15.5, maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Don't leave home without ticking these off. Customised by season.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 44, flexWrap: "wrap" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "11px 28px", borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: "pointer",
              border: activeTab === tab ? "none" : "1.5px solid #E8DCC4",
              background: activeTab === tab ? S.orange : "white",
              color: activeTab === tab ? "white" : S.textMid,
              boxShadow: activeTab === tab ? "0 4px 14px rgba(255,107,26,0.3)" : "none",
              transition: "all 0.25s ease",
            }}>
              {tab === "Summer" ? "☀️" : tab === "Winter" ? "❄️" : "👜"} {tab}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {items.map(item => (
            <label key={item} onClick={() => toggle(item)} style={{
              display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer",
              background: checked[item] ? "#FFF3EB" : "white",
              border: checked[item] ? `1.5px solid ${S.orange}` : "1.5px solid #EDE2D4",
              borderRadius: 14, padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(90,20,0,0.03)",
              transition: "all 0.2s ease",
            }}>
              <div style={{
                width: 22, height: 22, border: `2px solid ${checked[item] ? S.orange : "#CBD5E1"}`,
                borderRadius: 6, flexShrink: 0, marginTop: 1,
                background: checked[item] ? S.orange : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: "white", fontWeight: 800,
              }}>{checked[item] ? "✓" : ""}</div>
              <span style={{ fontSize: 14, color: checked[item] ? S.darkBrown : S.textMid, lineHeight: 1.5, fontWeight: checked[item] ? 600 : 500 }}>{item}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComingSoonGuideBanner({ city }) {
  if (city.isEnriched || (city.attractions && city.attractions.length > 0)) {
    return null;
  }

  return (
    <div style={{ maxWidth: 1180, margin: "20px auto 40px", padding: "0 40px" }}>
      <div style={{
        background: "#FFF8F0",
        border: "1.5px dashed #E8DCC4",
        borderRadius: 16,
        padding: "32px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗺️✨</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: S.darkBrown, marginBottom: 8 }}>
          In-Depth Guide for {city.name} Coming Soon!
        </h3>
        <p style={{ color: S.textMid, fontSize: 14, maxWidth: 600, margin: "0 auto 16px", lineHeight: 1.6 }}>
          Our travel editors and community contributors are currently curating the top attractions, foodie spots, hidden stepwells, and local secrets for {city.name}.
        </p>
        <p style={{ fontSize: 13, color: S.orange, fontWeight: 600, margin: 0 }}>
          💡 In the meantime, you can use our AI Trip Planner above to generate a custom day-by-day itinerary!
        </p>
      </div>
    </div>
  );
}
/* ─── MAIN PAGE ─── */
export default function CityPage() {
  const { slug } = useParams();
  const { cities } = useContext(CityContext);
  const contextCity = cities?.find(c => c.slug === slug);
  const city = contextCity || (slug === "jaipur" ? JAIPUR : null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (!city) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FDF6EC" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#5c1a00" }}>Destination not found</h2>
        <Link to="/destinations" style={{ marginTop: 16, color: "#FF6B1A", fontWeight: 700 }}>Back to Destinations Map</Link>
      </div>
    );
  }

  const months = city.months || (JAIPUR.months);
  const tips = city.tips || (JAIPUR.tips);
  const checklist = city.checklist || (JAIPUR.checklist);

  const pageTitle = `${city.name} Travel Guide | Travel In Depth`;
  const pageDescription =
    city.subtitle ||
    city.about ||
    city.description ||
    `Explore ${city.name}, ${city.state || city.region}. Discover top attractions, authentic local cuisine, hidden gems, and plan a custom AI itinerary.`;
  const pageImage = city.image || PLACEHOLDER_IMAGE;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FDF6EC" }}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription.slice(0, 160)} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription.slice(0, 200)} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://travelindepth.com/destinations/${city.slug}`} />
      </Helmet>
      <Navbar />
      <Hero city={city} />
      <PlannerSection city={city} />
      <ComingSoonGuideBanner city={city} />
      <AttractionsSection city={city} />
      <FoodSection city={city} />
      <ExperiencesSection city={city} />
      <HiddenGemsSection city={city} />
      <NearbySection city={city} />
      <BestTimeSection city={{ ...city, months, tips }} />
      <ChecklistSection city={{ ...city, checklist }} />
    </div>
  );
}