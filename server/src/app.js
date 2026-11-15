import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(sessionStoreOverride = null) {
  const app = express();
  const isProduction = config.env === 'production' || Boolean(process.env.RENDER);

  // Trust reverse proxy (Render / Cloudflare) so secure cookies & HTTPS protocols are detected
  if (isProduction) {
    app.set('trust proxy', 1);
  }

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // allow PWA assets and inline styles for dev/production bundles
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  const configuredOrigins = (config.clientOrigin || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const defaultOrigins = [
    'https://expense.spkumarchalla.com',
    'http://localhost:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5000',
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server or requests without origin header (e.g. mobile/curl)
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/+$/, '');
        if (allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-client-id'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Session configuration
  let sessionStore = sessionStoreOverride;
  if (!sessionStore) {
    if (config.env === 'test') {
      // In test mode, create MongoStore using the active mongoose connection or in-memory
      sessionStore = MongoStore.create({
        clientPromise: mongoose.connection.asPromise().then((m) => m.connection.getClient()),
        collectionName: 'sessions',
      });
    } else {
      sessionStore = MongoStore.create({
        mongoUrl: config.mongoUri,
        collectionName: 'sessions',
        ttl: config.sessionMaxAgeMs / 1000,
        autoRemove: 'native',
      });
    }
  }

  app.use(
    session({
      name: 'pocket_ledger_sid',
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      proxy: isProduction, // Trust reverse proxy headers
      cookie: {
        httpOnly: true,
        secure: config.cookieSecure,
        sameSite: config.cookieSameSite, // 'none' in cross-origin production, 'lax' in dev
        maxAge: config.sessionMaxAgeMs,
      },
    })
  );

  // Health check endpoints (available at both root and /api for Render / monitoring services)
  const healthHandler = (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  };
  app.get('/health', healthHandler);

  // Mount API routes
  app.use('/api', apiRoutes);

  // Central error handling
  app.use(errorHandler);

  return app;
}
