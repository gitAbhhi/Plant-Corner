Plant Corner

Plant Corner is a full-stack, geolocation-based e-commerce platform that connects local plant buyers and sellers through an interactive map experience. Built as a MERN stack application, it combines real-time communication, AI assistance, and geospatial features into a single cohesive platform.

Core Features:

Users can browse an interactive Leaflet.js map displaying live plant listings as custom green markers anywhere in the world. Clicking a marker reveals the plant's image, price, description, and seller details. Sellers can list plants by uploading images via Cloudinary and automatically detecting their location using the browser's native Geolocation API.

The platform includes a real-time chat system powered by Socket.io, allowing buyers to message sellers directly without exposing personal contact information. All conversations are persisted in MongoDB and loaded instantly on reconnect.

A floating AI botanical assistant called GreenSage, powered by the Google Gemini API, helps users with plant care guides, climate suitability, watering schedules, soil conditions, and medicinal benefits — all within a conversational interface.

The application features full JWT-based authentication with role-based access control. An admin dashboard gives administrators visibility into platform metrics including total users, active listings, and sales conversion rates, along with tools to block users and remove listings in real time.

Tech Stack:

Frontend — React.js, Vite, Leaflet.js, Socket.io Client
Backend — Node.js, Express.js, Socket.io
Database — MongoDB Atlas with Mongoose
Auth — JWT + bcryptjs
Storage — Cloudinary (image hosting)
AI — gemini-3.8-flash
Deployment — Vercel (frontend) · Render (backend)