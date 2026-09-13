# Travel In Depth
 
A full-stack, AI-powered travel discovery and planning platform for exploring destinations across India — built with React (frontend) and Node/Express + MongoDB (backend).
 
> **Project status:** Core platform is feature-complete and hardened for launch readiness (security review, QA pass, SEO, error monitoring all done). A booking system (hotels, flights, trains) is planned but not yet built.
 
## Features
 
### 🔐 Authentication & Accounts
- Email/password signup and login with hashed passwords (bcrypt) and JWT sessions.
- **Sign in with Google** — verified server-side, auto-links to an existing email/password account if one exists.
- Role-based access control (`user` / `admin`) enforced on every protected route.
### 🗺️ Destinations
- Full destinations catalog stored in MongoDB, browsable and filterable by region, budget, and season.
- Rich per-destination detail pages: about section, attractions, food recommendations, activities, and photo galleries — populated via an admin content-drafting tool (AI-assisted, human-reviewed before publishing) and a real photo-search integration (Unsplash), never auto-published without review.
- **Community-submitted destinations**: any logged-in user can suggest a destination that's missing. Gemini fact-checks the submission and gives a verdict, but nothing goes live until an admin explicitly approves it — approval creates the real destination and awards the contributor a badge on their profile.
### 🤖 AI Trip Planner
- Day-by-day itinerary generation (not a single block of text) — pick a destination, duration, budget, style, and interests.
- Per-day regeneration — don't like Day 3? Regenerate just that day without losing the rest.
- Save itineraries to your account and revisit them from the dashboard.
- Backed by a secure server-side AI proxy (API key never exposed to the browser), with rate limiting and a curated fallback plan if the AI provider is slow or unavailable — clearly labeled as such, never presented as live AI output when it isn't.
### 🌦️ Live Weather
- Real-time conditions and 5-day forecasts per destination via Open-Meteo (no API key required).
- Surfaced on destination pages and integrated into the trip planner.
### 🎯 Personalized Recommendations
- A scoring engine that matches destinations to a user's stated interests, the current season, budget tier, and region preference — with transparent match reasons shown, not a black box.
- Users set their interests from Settings; recommendations update accordingly.
### ❤️ Wishlist
- Like/unlike any destination from a browsing grid or its detail page.
- Persisted per-account and viewable from the dashboard.
### ⭐ Reviews
- Logged-in users can leave a rating, category, and comment about a location, the website itself, or a bug they hit.
- Reviews are tied to the real authenticated account (no free-text impersonation), rate-limited, and shown live on the reviews page.
### 🌱 Sustainable Travel Hub
- **Community Impact Stats** — live, database-aggregated totals for carbon saved, plastic bottles prevented, and local economic support, sourced from real logged user actions (auth-required, with sanity-bounded values to resist gaming).
- **Eco-Pledge & Digital Passport Stamps** — users commit to specific sustainable-travel actions per trip and receive a shareable digital stamp.
- **Crowdsourced Green Spots & Eco-Alerts** — a community feed of refill stations, zero-waste eateries, and transit tips, clearly labeled by source (user-submitted, admin-curated, or live external data) so nothing is presented as "live" unless it genuinely is.
### 👤 Dynamic Profile, Settings & Notifications
- Editable profile (avatar, bio, location), with contributor and eco-badges displayed as earned.
- Settings for notification preferences, dark mode, and currency.
- A real notification system triggered by actual account events (submission approved/rejected, itinerary saved), not a static, empty inbox.
### 🛠️ Admin Panel
- Full CRUD for destinations, with AI-assisted content drafting and a photo-search/bulk-suggest tool for imagery — every AI or automated suggestion is a draft an admin reviews and edits before publishing.
- Destination submission review queue with Approve/Reject actions.
- Protected end-to-end by real JWT verification and role checks, not client-side flags.
## Tech Stack
 
**Frontend**
- React 19 + Vite
- React Router
- Tailwind CSS
- Framer Motion, Recharts, Lucide Icons
- `@react-oauth/google` for Google Sign-In
**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication, bcrypt password hashing, Google OAuth verification
- Google Gemini (AI planning, content drafting, submission verification)
- Unsplash API (real destination photography)
- Open-Meteo (weather, no key required)
- Cloudinary (media hosting/CDN)
- Sentry (error monitoring)
## Project Structure
 
```
Travel-In-Depth2026/
├── backend/
│   ├── config/            # Database connection
│   ├── controllers/        # Route handler logic
│   ├── middleware/          # Auth/admin guards, rate limiting
│   ├── models/                # Mongoose schemas
│   ├── routes/                 # Express route definitions
│   ├── services/                # Background workers (e.g. eco-feed sync)
│   ├── scripts/                  # One-off scripts (media migration, admin promotion)
│   ├── seed/                      # DB seed scripts
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/            # Backend API wrapper functions
    │   ├── components/      # Reusable and page-specific components
    │   ├── context/          # Destinations context
    │   ├── features/          # Auth and wishlist context/hooks
    │   ├── pages/               # Route-level pages (incl. /pages/admin)
    │   ├── routes/                # Router + ProtectedRoute
    │   └── utils/                  # Media/CDN helpers
    └── vite.config.js
```
 
## Getting Started
 
### Prerequisites
- Node.js 18+
- A MongoDB database ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier works well)
### 1. Clone the repo
```bash
git clone https://github.com/yourusername/travel-in-depth.git
cd travel-in-depth
```
 
### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `backend/.env`:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=a_long_random_secret_string
GEMINI_API_KEY=your_gemini_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SENTRY_DSN_BACKEND=your_sentry_dsn
```
Seed the database with starter destinations:
```bash
npm run seed
```
Start the backend:
```bash
npm run dev
```
Server runs at `http://localhost:5000`.
 
### 3. Frontend setup
Open a new terminal:
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_SENTRY_DSN=your_sentry_dsn
```
Start the frontend:
```bash
npm run dev
```
App runs at `http://localhost:5173`.
 
### 4. Create an admin account
1. Sign up for a normal account through the app's UI.
2. Promote it to admin from the backend:
```bash
cd backend
node seed/makeAdmin.js youremail@example.com
```
3. Log in at `/admin/login` with that account.
## API Overview
 
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check (used for uptime monitoring) |
| GET | `/api/destinations` | — | List all destinations |
| GET | `/api/destinations/:slug` | — | Get one destination |
| POST/PUT/DELETE | `/api/destinations` | Admin | Manage destinations |
| POST | `/api/destinations/:slug/generate-content` | Admin | AI-draft rich content (review before saving) |
| POST | `/api/auth/signup` \| `/login` | — | Email/password auth |
| POST | `/api/auth/google` | — | Google Sign-In |
| GET | `/api/auth/me` | User | Current user |
| POST | `/api/planner/generate` | Optional | Generate an itinerary |
| POST | `/api/planner/generate/day` | Optional | Regenerate one day |
| POST | `/api/planner/save` / GET `/api/planner/my` | User | Save/list itineraries |
| GET | `/api/weather` | — | Live weather by destination or coordinates |
| GET | `/api/recommendations` | User | Personalized destination matches |
| POST | `/api/submissions` / GET `/my` | User | Submit/track a destination suggestion |
| GET `/api/submissions`, PATCH `/:id/approve`, `/reject` | Admin | Review queue |
| GET/POST/DELETE | `/api/wishlist` | User | Manage wishlist |
| GET/POST | `/api/reviews` | User (post) | Site/destination reviews |
| GET/POST | `/api/eco/*` | Mixed | Sustainability stats, pledges, green spots |
| GET/PUT | `/api/users/profile`, `/settings` | User | Profile and preferences |
| GET/PUT/DELETE | `/api/notifications` | User | Notification inbox |
 
## Roadmap
 
| Milestone | Status |
|---|---|
| Backend, database, destinations API | ✅ Done |
| Authentication (JWT + Google) | ✅ Done |
| Admin CRUD + submission review queue | ✅ Done |
| AI trip planner (generate/regenerate/save) | ✅ Done |
| Weather integration | ✅ Done |
| Personalized recommendations | ✅ Done |
| Wishlist | ✅ Done |
| Reviews | ✅ Done |
| Sustainable travel hub | ✅ Done |
| Dynamic profile/settings/notifications | ✅ Done |
| Media CDN migration (Cloudinary) | ✅ Done |
| Security, QA, SEO, and error-monitoring pass | ✅ Done |
| Booking system (hotels, flights, trains) | ⏳ Planned |
| Deployment | ⏳ Planned |
 
## License
 
Not yet decided — add a license before making this repository public if you intend for others to reuse the code.
