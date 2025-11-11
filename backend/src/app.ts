import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();

  // Security middleware (POC-level)
  app.use(helmet()); // Secure HTTP headers (CSP, XSS, clickjacking, etc.)
  // Note: XSS protection via Zod validation on all inputs (already implemented)

  // CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
      credentials: true,
    })
  );

  // Rate limiting (permissive for POC)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Max 1000 requests per 15min per IP (permissive for dev/POC)
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' })); // Limit payload size
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Routes
  app.use('/', routes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

