const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const os = require('os');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const discoveryRoutes = require('./routes/discovery');
const matchRoutes = require('./routes/match');
const chatRoutes = require('./routes/chat');
const documentRoutes = require('./routes/document');
const settingsRoutes = require('./routes/settings');
const profileUpdateRoutes = require('./routes/ProfileUpdate');
const app = express();
const server = http.createServer(app);

/* ============================
   CORS CONFIGURATION
============================ */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, React Native, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Allow localhost + local network + Expo
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+:\d+$/,
      /^exp:\/\/192\.168\.\d+\.\d+:\d+$/,
      /^exp:\/\/.*$/
    ];

    const isAllowed = allowedPatterns.some(pattern =>
      pattern.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      // Development: allow anyway but log
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
};

/* ============================
   SOCKET.IO
============================ */
const io = socketIo(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

/* ============================
   MIDDLEWARE
============================ */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

app.use(cors(corsOptions));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ============================
   REQUEST LOGGER
============================ */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin || 'No origin header');

  if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '***HIDDEN***';
    console.log('Body:', JSON.stringify(logBody, null, 2));
  }
  next();
});

/* ============================
   RATE LIMITING
============================ */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

/* ============================
   STATIC FILES
============================ */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ============================
   MONGODB
============================ */
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/found'
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

/* ============================
   SOCKET EVENTS
============================ */
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_online', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;

    socket.broadcast.emit('user_status_changed', {
      userId,
      status: 'online'
    });
  });

  socket.on('join_chat', (matchId) => {
    socket.join(matchId);
  });

  socket.on('send_message', (data) => {
    const { matchId, message, senderId } = data;

    socket.to(matchId).emit('receive_message', {
      ...message,
      senderId,
      timestamp: new Date()
    });

    socket.to(matchId).emit('message_status', {
      messageId: message._id,
      status: 'delivered'
    });
  });

  socket.on('message_read', (data) => {
    const { matchId, messageId, userId } = data;

    socket.to(matchId).emit('message_status', {
      messageId,
      status: 'read',
      readBy: userId
    });
  });

  socket.on('typing_start', ({ matchId, userId }) => {
    socket.to(matchId).emit('user_typing', {
      userId,
      typing: true
    });
  });

  socket.on('typing_stop', ({ matchId, userId }) => {
    socket.to(matchId).emit('user_typing', {
      userId,
      typing: false
    });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);

      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status: 'offline'
      });
    }
    console.log('User disconnected:', socket.id);
  });
});

/* ============================
   MAKE IO AVAILABLE
============================ */
app.set('io', io);
app.set('connectedUsers', connectedUsers);

/* ============================
   ROUTES
============================ */
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/profileupdate', profileUpdateRoutes);


/* ============================
   TEST + HEALTH
============================ */
app.get('/mongo-test', async (req, res) => {
  try {
    const User = require('./models/User');

    const user = await User.create({
      email: 'test@example.com',
      password: 'Test@12345'
    });

    const found = await User.findById(user._id);

    res.json({
      write: 'SUCCESS',
      read: 'SUCCESS',
      userId: found._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

/* ============================
   SERVER START
============================ */
const PORT = process.env.PORT || 8080;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log('\n📱 Accessible from mobile devices at:');

  const interfaces = os.networkInterfaces();

  Object.keys(interfaces).forEach((name) => {
    interfaces[name].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`  http://${iface.address}:${PORT}`);
        console.log(`  Health: http://${iface.address}:${PORT}/health`);
      }
    });
  });

  console.log(`\n💡 Make sure Windows Firewall allows port ${PORT}`);
  console.log(`Run: .\\scripts\\allow-firewall-port.ps1\n`);
});

module.exports = { app, io };
