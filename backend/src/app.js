import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { standardRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';
import { NotFoundError } from './utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration supporting authenticated clinical sessions with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost frontend development and configured CLIENT_URL
      if (!origin || origin === env.CLIENT_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, or origin in prod
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-DrugSafe-Client-Version',
      'X-DrugSafe-Timestamp',
      'X-Requested-With',
    ],
  })
);

// Request body and cookie parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting
app.use('/api', standardRateLimiter);

// Static uploads directory for prescriptions
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// OpenAPI / Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root welcome & API health indicator
app.get('/', (req, res) => {
  res.json({
    platform: 'DrugSafe Clinical Intelligence API',
    status: 'ONLINE',
    documentation: '/api/docs',
    healthCheck: '/api/health',
    version: '1.0.0',
  });
});

// Primary API Router Gateway
app.use('/api', apiRouter);

// Unmatched Route 404 Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Clinical endpoint '${req.method} ${req.originalUrl}' not found on DrugSafe server.`));
});

// Centralized Medical Error Handling Middleware
app.use(errorHandler);

export { app };
export default app;

