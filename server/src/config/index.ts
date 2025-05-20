import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: (process.env.JWT_SECRET as string) || 'jwt_default_secret_dev_only',
  jwtExpiry: (process.env.JWT_EXPIRY as string) || '24h',
  cookieSecret: process.env.COOKIE_SECRET || 'cookie_default_secret_dev_only',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};
