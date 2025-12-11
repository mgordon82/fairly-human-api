import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { storyRouter } from './routes/story';
import { analyzeLimiter, analyzeFailsafe } from './middleware/analyzeRateLimit';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// 🔍 Simple request logger so we can see what hits the server
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

// ✅ Root route (optional but helpful)
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'FairlyHuman API root. Try GET /api/health'
  });
});

// ✅ Health route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'FairlyHuman backend alive' });
});

// ✅ Analyze route protections
app.use('/api/stories/analyze', analyzeLimiter, analyzeFailsafe);

// ✅ Main stories router
app.use('/api/stories', storyRouter);

// 🔍 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// 🔥 Error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FairlyHuman backend listening on port ${PORT}`);
});
