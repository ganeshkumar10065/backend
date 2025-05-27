const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const profileRoutes = require('./routes/profile');
const imageRoutes = require('./routes/image');
const paymentRoutes = require('./routes/payment');

const app = express();
const port = 3001;

// Create public directory for default avatar
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Create default avatar if it doesn't exist
const defaultAvatarPath = path.join(publicDir, 'default-avatar.png');
if (!fs.existsSync(defaultAvatarPath)) {
  // Create a simple default avatar (1x1 transparent pixel)
  const defaultAvatar = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  fs.writeFileSync(defaultAvatarPath, defaultAvatar);
}

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'User-Agent'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  credentials: false, // Set to false since we're using * for origin
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enable CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, User-Agent');
  res.header('Access-Control-Max-Age', '86400');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(publicDir, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/payment', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: -1,
    msg: 'Internal server error',
    data: null
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
}); 