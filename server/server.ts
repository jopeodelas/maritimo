// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import config from './src/config';
import authRoutes from './src/routes/auth.routes';
import playersRoutes from './src/routes/players.routes';
import votesRoutes from './src/routes/votes.routes';
import transferRoutes from './src/routes/transfer.routes';
import newsRoutes from './src/routes/news.routes';
import pollRoutes from './src/routes/poll.routes';
import discussionsRoutes from './src/routes/discussions.routes';
import { errorHandler, notFoundHandler } from './src/middleware/error.middleware';

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
    config.clientUrl
  ],
  credentials: true
}));

app.use(cookieParser(config.cookieSecret));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with caching headers
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  maxAge: '1y', // Cache images for 1 year
  etag: true,
  lastModified: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/discussions', discussionsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`Compression enabled for responses > 1KB`);
});

export default app;
