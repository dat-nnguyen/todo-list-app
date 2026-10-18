import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'todo_app',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  session: {
    secret: process.env.SESSION_SECRET || 'dev-secret',
    secure: process.env.SESSION_SECURE === 'true',
    maxAgeMs: parseInt(process.env.SESSION_MAX_AGE_MS || '86400000', 10),
  },
};

export function getDatabaseUrl() {
  return (process.env.DATABASE_URL)
    ? process.env.DATABASE_URL
    : `postgresql://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`;
}
