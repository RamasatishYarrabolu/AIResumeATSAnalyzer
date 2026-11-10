import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/resume', resumeRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const port = Number(process.env.PORT) || 5000;
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume_ats_analyzer');
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
