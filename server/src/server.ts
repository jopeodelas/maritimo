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
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import cacheMiddleware from './middleware/cache.middleware';
import schedulerService from './services/scheduler.service';
import maritodleSchedulerService from './services/maritodle-scheduler.service';

const app = express();

// Configurar timeouts e keepalive
app.use((req, res, next) => {
  // Set timeout para requests
  req.setTimeout(30000, () => {
    console.warn(`⏰ Request timeout: ${req.method} ${req.url}`);
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  });
  
  // Set keepalive headers
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=30, max=100');
  
  next();
});

// Middleware para detectar erros de rede
app.use((req, res, next) => {
  // Log requests para debug
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
  
  // Handle connection errors
  req.on('error', (error) => {
    console.error('❌ Request connection error:', error);
  });
  
  res.on('error', (error) => {
    console.error('❌ Response connection error:', error);
  });
  
  next();
});

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
      connectSrc: ["'self'", "https://api.maritimofans.pt", "https://maritimofans.pt", "http://localhost:5000", "ws://localhost:*"],
    },
  },
}));

// CORS middleware com configuração mais robusta
app.use(cors({
  origin: function (origin, callback) {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5173/',
      'https://maritimofans.pt',
      'https://maritimofans.pt/',
      'http://maritimofans.pt',
      'http://maritimofans.pt/',
      config.clientUrl
    ];
    
    // Permitir requests sem origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar se a origin está na lista permitida
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.maritimofans.pt')) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-Forwarded-For',
    'X-Real-IP'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200, // For legacy browser support
  maxAge: 86400 // Cache preflight for 24 hours
}));

// Handle preflight requests e adicionar headers CORS para todos os requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'https://maritimofans.pt',
    'http://maritimofans.pt',
    config.clientUrl
  ];
  
  // Se é uma origin permitida, adicionar headers CORS
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.maritimofans.pt'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin, Cache-Control');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS Preflight: ${req.headers.origin} → ${req.url}`);
    return res.sendStatus(200);
  }
  
  next();
});

app.use(cookieParser(config.cookieSecret));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// PERFORMANCE: Global cache middleware
app.use(cacheMiddleware);

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

// Test route for debugging
app.get('/test-auth', (req, res) => {
  res.json({ 
    message: 'Auth test route working!',
    timestamp: new Date().toISOString()
  });
});

// Debug: Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
console.log('🔧 Registering routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered');
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
app.use('/api/analytics', analyticsRoutes);
console.log('✅ All routes registered');

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server com configurações otimizadas
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`Compression enabled for responses > 1KB`);
  console.log(`CORS configured for: https://maritimofans.pt`);
  
  // Inicializar scheduler para verificação automática de novos jogos
  console.log('🚀 Initializing automatic voting system...');
  schedulerService.startAutoVotingCheck();
  
  // Inicializar scheduler do maritodle diário
  console.log('🎮 Initializing Maritodle daily scheduler...');
  maritodleSchedulerService.startDailyScheduler();
});

// Configurar server timeouts e keepalive
server.keepAliveTimeout = 65000; // 65 segundos (maior que o default)
server.headersTimeout = 66000; // 66 segundos (maior que keepAliveTimeout)
server.requestTimeout = 30000; // 30 segundos para requests individuais
server.timeout = 120000; // 2 minutos timeout geral

// Handle server errors
server.on('error', (error: any) => {
  console.error('❌ Server error:', error);
});

server.on('clientError', (error: any, socket: any) => {
  console.error('❌ Client error:', error.message);
  if (socket.writable) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

export default app;
