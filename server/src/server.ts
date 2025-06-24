// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import config from './config';
import authRoutes from './routes/auth.routes';
import playersRoutes from './routes/players.routes';
import votesRoutes from './routes/votes.routes';
import transferRoutes from './routes/transfer.routes';
import transferAdminRoutes from './routes/transfer-admin.routes';
import newsRoutes from './routes/news.routes';
import pollRoutes from './routes/poll.routes';
import customPollsRoutes from './routes/custom-polls.routes';
import discussionsRoutes from './routes/discussions.routes';
import userManagementRoutes from './routes/user-management.routes';
import maritodleRoutes from './routes/maritodle.routes';
import maritodleDailyRoutes from './routes/maritodle-daily.routes';
import playerRatingsRoutes from './routes/player-ratings.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import schedulerService from './services/scheduler.service';
import maritodleSchedulerService from './services/maritodle-scheduler.service';

const app = express();

// Compression middleware - should be early in the middleware stack
app.use(compression({
  filter: (req, res) => {
    // Don't compress responses if the client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9, 6 is default)
  threshold: 1024, // Only compress responses larger than 1KB
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:*"],
    },
  },
}));

// CORS middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5173/',
    'https://maritimofans.pt',
    'https://maritimofans.pt/',
    'http://maritimofans.pt',
    'http://maritimofans.pt/',
    config.clientUrl
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

app.use(cookieParser(config.cookieSecret));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with caching headers and CORS
app.use('/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.resolve(__dirname, '../../public/images'), {
  maxAge: '1y', // Cache images for 1 year
  etag: true,
  lastModified: true,
}));

// Debug: Log the images directory path
const imagesPath = path.resolve(__dirname, '../../public/images');
console.log('Images directory path:', imagesPath);
console.log('Directory exists:', require('fs').existsSync(imagesPath));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CS Marítimo API is running!',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/admin/transfer', transferAdminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/custom-polls', customPollsRoutes);
app.use('/api/discussions', discussionsRoutes);
app.use('/api/admin', userManagementRoutes);
app.use('/api/maritodle', maritodleRoutes);
app.use('/api/maritodle-daily', maritodleDailyRoutes);
app.use('/api/player-ratings', playerRatingsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`Compression enabled for responses > 1KB`);
  
  // Inicializar scheduler para verificação automática de novos jogos
  console.log('🚀 Initializing automatic voting system...');
  schedulerService.startAutoVotingCheck();
  
  // Inicializar scheduler do maritodle diário
  console.log('🎮 Initializing Maritodle daily scheduler...');
  maritodleSchedulerService.startDailyScheduler();
});

export default app;
