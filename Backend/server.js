require('dotenv').config();
console.log("CLIENT_URL:", process.env.CLIENT_URL);
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dns = require('dns');

dns.setServers([
  '1.1.1.1','8.8.8.8'
])

const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/error.middleware');
const initSocket = require('./src/socket/chat.socket');

// Routes
const authRoutes  = require('./src/routes/auth.routes');
const plantRoutes = require('./src/routes/plant.routes');
const chatRoutes  = require('./src/routes/chat.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();
const server = http.createServer(app);

// ── Socket.io setup ───────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

initSocket(io);

// ── Middleware ────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/chat',  chatRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────
const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🌿 GeoPlant API running on port ${PORT}`);
    console.log(`🔌 Socket.io ready`);
  });
});
