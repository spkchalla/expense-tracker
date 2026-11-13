import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or server dir
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const isProduction =
  process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

export const config = {
  appName: process.env.APP_NAME || 'Pocket Ledger',
  env: process.env.NODE_ENV || (process.env.RENDER ? 'production' : 'development'),
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pocket_ledger',
  sessionSecret: process.env.SESSION_SECRET || 'dev_insecure_session_secret_replace_in_prod',
  sessionMaxAgeMs: parseInt(process.env.SESSION_MAX_AGE_MS || `${7 * 24 * 60 * 60 * 1000}`, 10), // 7 days
  cookieSameSite: process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax'),
  cookieSecure:
    process.env.COOKIE_SECURE === 'true' ||
    isProduction ||
    process.env.COOKIE_SAME_SITE === 'none',
  clientOrigin: process.env.CLIENT_ORIGIN || 'https://expense.spkumarchalla.com',
  bootstrapAdminEmail: (process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase(),
  allowPublicRegistration: process.env.ALLOW_PUBLIC_REGISTRATION !== 'false',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '15', 10),
};
