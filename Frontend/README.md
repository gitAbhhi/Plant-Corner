# 🌿 GeoPlant Marketplace — React Frontend

A geolocation-based plant marketplace built with React + Vite.

## Project Structure

```
src/
├── components/
│   ├── AI/BotanistAI.jsx         # Floating Gemini AI chatbot
│   ├── Auth/ProtectedRoute.jsx   # JWT route guards
│   ├── Chat/ChatOverlay.jsx      # Real-time STOMP chat window
│   ├── Layout/Navbar.jsx         # Responsive nav
│   └── Map/
│       ├── AddListingModal.jsx   # Create listing + Cloudinary upload
│       └── PlantPopup.jsx        # Leaflet marker popup
├── context/AuthContext.jsx       # Global JWT auth state
├── hooks/useChat.js              # WebSocket/STOMP hook
├── pages/
│   ├── MapPage.jsx               # Leaflet map with green pins
│   ├── LoginPage.jsx / RegisterPage.jsx
│   ├── MyListingsPage.jsx        # Seller inventory
│   ├── MessagesPage.jsx          # Chat rooms list
│   └── AdminPage.jsx             # Admin dashboard (RBAC)
├── services/api.js               # Axios + all API modules
└── index.css                     # Design tokens + global styles
```

## Setup

```bash
cp .env.example .env   # Fill in your credentials
npm install
npm run dev            # http://localhost:5173
```

## Environment Variables (.env)

```
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws-chat
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Cloudinary Setup
1. Create account at cloudinary.com
2. Settings → Upload → Upload Presets → Create unsigned preset
3. Copy Cloud Name + Preset name into .env

### Gemini API Setup
1. Go to aistudio.google.com → Get API Key
2. Paste into VITE_GEMINI_API_KEY

## Routes

| Route | Access | Page |
|-------|--------|------|
| `/` | Public | Interactive Leaflet map |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/my-listings` | Auth | Seller dashboard |
| `/messages` | Auth | Chat rooms |
| `/admin` | Admin | Admin dashboard |

## Backend API Expected

Spring Boot at VITE_API_BASE_URL:
- POST /api/auth/login + /register → { token, user }
- GET/POST /api/plants, PATCH /api/plants/{id}/sold
- POST /api/chat/room, GET /api/chat/rooms
- WebSocket /ws-chat via SockJS + STOMP
- GET/PATCH /api/admin/* (ROLE_ADMIN only)

## Design Tokens

Forest green palette with Playfair Display + DM Sans fonts.
Primary: #4a7c59 (--sage), Background: #f7f3ee (--cream)
