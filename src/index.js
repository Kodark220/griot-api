import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { registryRouter } from './routes/registry.js';
import { readRouter } from './routes/read.js';
import { payRouter } from './routes/pay.js';
import { fetchRouter } from './routes/fetch.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/registry', registryRouter);
app.use('/api', readRouter);       // /api/read/:slug, /api/verify
app.use('/api', payRouter);        // /api/pay
app.use('/api', fetchRouter);      // /api/fetch-content

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'griot-api' });
});

app.listen(PORT, () => {
  console.log(`[griot] API running on port ${PORT}`);
  console.log(`[griot] Arc RPC: ${process.env.ARC_RPC_URL}`);
});
