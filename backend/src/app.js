import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import rackRoutes from './routes/rackRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security and CORS
app.use(helmet());
app.use(cors({
  origin: [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'SentinelCore Environment Monitor API'
  });
});

// Whitelisted Feature Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/racks', rackRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
