// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import config from './src/config';
import authRoutes from './src/routes/auth.routes';
import playersRoutes from './src/routes/players.routes';
import votesRoutes from './src/routes/votes.routes';
import transferRoutes from './src/routes/transfer.routes';
import newsRoutes from './src/routes/news.routes';
import { errorHandler, notFoundHandler } from './src/middleware/error.middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser(config.cookieSecret));
app.use(express.json());

// Servir arquivos estáticos
app.use('/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/news', newsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

export default app;
