import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Global pool to prevent creating new connections on every serverless invocation
declare global {
  var pgPool: Pool | undefined;
}

const createPool = () => new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,                    // Don't overwhelm RDS
  min: 1,                     // Keep at least 1 connection warm
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Timeout connection attempts after 10s
  // Fix schema issues for Supabase
  options: '-c search_path=public,pg_catalog',
});

// Use global pool in production to persist across serverless invocations
const pool = globalThis.pgPool ?? createPool();

if (process.env.NODE_ENV === 'production') {
  globalThis.pgPool = pool;
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Gracefully closing database pool...');
  pool.end();
});

process.on('SIGTERM', () => {
  console.log('🔄 Gracefully closing database pool...');
  pool.end();
});

export default pool;