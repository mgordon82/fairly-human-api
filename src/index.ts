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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'FairlyHuman backend alive' });
});

app.use('/api/stories/analyze', analyzeLimiter, analyzeFailsafe);

app.use('/api/stories', storyRouter);

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
