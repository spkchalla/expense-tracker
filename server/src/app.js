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

  // Trust proxy if in production
  if (config.env === 'production') {
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
  const allowedOrigins = [
    config.clientOrigin,
    'http://localhost:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // allow server-to-server or curl/mobile requests without origin header
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
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
      cookie: {
        httpOnly: true,
        secure: config.cookieSecure,
        sameSite: 'lax',
        maxAge: config.sessionMaxAgeMs,
      },
    })
  );

  // Mount API
  app.use('/api', apiRoutes);

  // Central error handling
  app.use(errorHandler);

  return app;
}
