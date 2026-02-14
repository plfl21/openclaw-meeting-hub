import express from 'express';
import cors from 'cors';
import { runMigrations } from './migrations.js';

import metricsRoutes from './routes/metrics.js';
import analyticsRoutes from './routes/analytics.js';
import meetingsRoutes from './routes/meetings.js';
import neuronRoutes from './routes/neuron.js';
import proposalsRoutes from './routes/proposals.js';
import tasksRoutes from './routes/tasks.js';
import teamRoutes from './routes/team.js';
import githubRoutes from './routes/github.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5000');

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));

app.get('/', (_req, res) => {
  res.json({ data: { status: 'ok', service: 'OpenClaw Meeting Hub API', version: '1.0.0', routes: 72 } });
});
app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'healthy', timestamp: new Date().toISOString() } });
});

app.use('/api/metrics', metricsRoutes);
app.use('/api/meeting-hub/analytics', analyticsRoutes);
app.use('/api/meeting-hub/meetings', meetingsRoutes);
app.use('/api/neuron', neuronRoutes);
app.use('/api/meeting-hub/proposals', proposalsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/meeting-hub', teamRoutes);
app.use('/api/github', githubRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  try {
    await runMigrations();
    console.log('Database migrations complete');
  } catch (err) {
    console.warn('Migration warning (continuing anyway):', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OpenClaw Meeting Hub API running on port ${PORT}`);
    console.log(`📊 Routes: /api/metrics/* (4), /api/meeting-hub/analytics/* (7), /api/meeting-hub/meetings/* (17), /api/neuron/* (11), /api/meeting-hub/proposals/* (8), /api/tasks/* (6), /api/meeting-hub/* (7), /api/github/* (5)`);
    console.log(`🌐 CORS: all origins allowed`);
    console.log(`📦 Total endpoints: 72+`);
  });
}

start();

export default app;
