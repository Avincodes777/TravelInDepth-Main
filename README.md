# 🌍 Travel In Depth

> **A full-stack, AI-powered travel discovery and itinerary planning platform for exploring India's heritage, culture, and landscapes.**

[![Deploy Status](https://img.shields.io/badge/Deployment-Live%20on%20Netlify-success?style=for-the-badge&logo=netlify)](https://netlify.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%203.8%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

---

## 🚀 Live Deployment

* **Frontend**: Deployed and hosted on [Netlify](https://netlify.com) with automated continuous deployment and SPA client-side route redirects via [`netlify.toml`](./netlify.toml).
* **Backend API**: Hosted on Node.js cloud runtime connected to a high-availability MongoDB Atlas cluster.
* **Media CDN**: Cloudinary for responsive image delivery and caching.

---

## ✨ Key Highlights & Recent Upgrades

### 🤖 1. Unified, Non-Generic AI Trip Planner (Gemini 3.8 Flash)
* **Zero Generic Filler**: Enforced strict anti-generic AI prompt mandates prohibiting vague descriptions (no *"visit local market"*, *"traditional lunch"*, or *"city center"*).
* **35+ Indian Destination Knowledge Base**: Built-in curated intelligence across major hubs (*Jaipur, Agra, Varanasi, Prayagraj, Goa, Manali, Ladakh, Kerala, Udaipur, Rishikesh, Kolkata, Mumbai, Hampi*, etc.) providing authentic landmarks, real geo-coordinates, local street food specialties, and regional cultural experiences.
* **Sequential Multi-City Routing**: Plan multi-stop itineraries across India with drag/reorder controls (`▲`/`▼`), per-city stay lengths, transit time estimates, and road distance calculations.
* **Custom Destination Input**: Users can enter *any* destination in India or worldwide directly into the planner to generate an authentic trip.
* **Granular Day Customization**:
  * `✏️ Edit Day`: Inline editing for activity descriptions and titles.
  * `🔄 Regenerate Day`: Fast, targeted single-day AI regeneration without altering the rest of the trip.
  * `💾 Save to Dashboard`: One-click saving to the user's personal travel dashboard.

### 🔒 2. Strict Route Protection & Authentication
* **Authorized Access Only**: Direct URL access to all internal pages (`/destinations`, `/destinations/:slug`, `/experience`, `/book-trip`, `/reviews`, `/coming-soon`, and `/dashboard/*`) is strictly guarded by authentication checks.
* **Public Content**: Only the **Home Page (`/`)** and **About Page (`/about`)** are publicly accessible without signing in.
* **Smart Post-Login Redirection**: Unauthenticated visitors attempting to access direct URLs are redirected to `/login`, with their intended destination preserved and restored immediately upon login.
* **Role-Based Access Control**: Secure administrator portal (`/admin/*`) guarded by server-side JWT verification and `admin` role checks.

### 🗺️ 3. Curated Destination Catalog & Experience Discovery
* Extensive database of Indian destinations filterable by region, budget tier, travel style, and season.
* Interactive city pages featuring high-resolution photography, live weather conditions via Open-Meteo, regional food guides, curated attraction maps, and nearby transit routes.

### 🌱 4. Sustainable Travel & Community Hub
* **Live Community Impact Tracking**: Aggregates community carbon offset, plastic bottles eliminated, and local economy contributions.
* **Eco-Pledges & Digital Passport Stamps**: Interactive sustainability challenges rewarding travelers with verified profile stamps.
* **Crowdsourced Destination Submissions**: Community members can submit new places, verified via Gemini AI and vetted by administrators before publication.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Tailwind CSS, Lucide Icons, Framer Motion, Recharts |
| **Backend** | Node.js, Express.js, Mongoose, RESTful API architecture |
| **Database** | MongoDB Atlas |
| **AI / LLM** | Google Gemini 3.8 Flash & Gemini Flash Latest (`@google/generative-ai` / REST v1beta) |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs password hashing, Google OAuth 2.0 (`@react-oauth/google`), rate limiting |
| **APIs & Services** | Cloudinary (Media CDN), Open-Meteo (Live Weather), Unsplash API (Destination Photography), Sentry (Error Logging) |
| **Deployment** | Netlify (Frontend SPA), Cloud Node Environment (Backend) |

---

## 📁 Repository Structure

```
Travel-In-Depth2026/
├── netlify.toml                # Netlify build configuration & SPA rewrites
├── backend/
│   ├── config/                 # Database connection (MongoDB)
│   ├── controllers/            # Route controllers (planner, destinations, auth, admin)
│   ├── middleware/             # Auth guards (verifyToken, requireAdmin), rate limiting
│   ├── models/                 # Mongoose schemas (User, Destination, Itinerary, Review)
│   ├── routes/                 # Express API routes
│   ├── services/               # Knowledge base, routing calculations, external APIs
│   │   └── destinationKnowledge.js  # Curated data for 35+ Indian destinations
│   ├── seed/                   # Database seed scripts
│   └── server.js               # Application entry point
└── frontend/
    ├── public/                 # Static assets & favicon
    ├── src/
    │   ├── api/                # API client abstraction layer
    │   ├── components/         # Modular UI components (home, layout, admin, stats)
    │   ├── context/            # Global React contexts (CityContext, WishlistContext)
    │   ├── features/           # Authentication state & useAuth hook
    │   ├── pages/              # Routed views (HomePage, CityPage, DashboardPage, etc.)
    │   ├── routes/             # AppRouter & ProtectedRoute definitions
    │   └── utils/              # Media helpers & formatters
    ├── vite.config.js          # Vite build configuration
    └── package.json
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/TravelInDepth
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_ai_studio_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
SENTRY_DSN=your_backend_sentry_dsn
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=https://your-backend-api.com/api # or http://localhost:5000/api for local dev
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_SENTRY_DSN=your_frontend_sentry_dsn
```

---

## 💻 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Avincodes777/TravelInDepth-Main.git
cd TravelInDepth-Main
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create and configure .env
npm run seed     # Optional: seed initial destination data
npm run dev      # Runs server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
# Create and configure .env
npm run dev      # Runs client on http://localhost:5173
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT |
| `POST` | `/api/auth/google` | Public | Verify Google OAuth credential |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `POST` | `/api/planner/generate` | Authenticated | Generate grounded single-destination itinerary |
| `POST` | `/api/planner/multi-city` | Authenticated | Generate sequential multi-city itinerary |
| `POST` | `/api/planner/regenerate-day` | Authenticated | Regenerate a single day with real landmarks |
| `POST` | `/api/planner/save` | Authenticated | Save trip itinerary to user account |
| `GET` | `/api/planner/my` | Authenticated | Fetch user's saved itineraries |
| `GET` | `/api/destinations` | Authenticated | Browse destination catalog |
| `GET` | `/api/destinations/:slug` | Authenticated | Fetch destination details, photos, and guide |
| `GET` | `/api/weather` | Public / Auth | Live conditions & forecast via Open-Meteo |
| `GET/POST` | `/api/reviews` | Authenticated | Read & submit community reviews |
| `POST` | `/api/destinations` | Admin | Create or modify destination entries |

---

## 📞 Contact & Support

* **Organization**: Travel In Depth
* **Email**: [2k24.csaiml1a.2413616@gmail.com](mailto:2k24.csaiml1a.2413616@gmail.com)
* **Phone**: [+91 8957565316](tel:+918957565316)
* **Headquarters**: Prayagraj, India

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
