const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const { globalLimiter } = require('./middleware/rateLimit.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Trust the first proxy (Railway/Render/Vercel) so client IPs — and therefore
// rate limiting — are evaluated correctly in production.
app.set('trust proxy', 1);

// Security & infrastructure middleware
app.use(helmet());
app.use(cors({ origin: env.clientOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv === 'development') app.use(morgan('dev'));

// Rate limiting + API routes.
// NOTE: uploaded documents are intentionally NOT served as public static files.
// They are streamed through the authenticated, ownership-checked route
// GET /api/documents/:id/download (see document.controller.js).
app.use('/api', globalLimiter, routes);

app.get('/', (req, res) =>
  res.json({ success: true, message: 'GASTA AI API. See /api/health' })
);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
