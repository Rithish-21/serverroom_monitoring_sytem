import { Router } from 'express';
import {
  getAllSensors,
  getSensorHistory,
  createSensor,
  updateSensor,
  deleteSensor,
  recordReading,
  simulateEvent
} from '../controllers/sensorController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', authenticate, getAllSensors);
router.get('/:id/history', authenticate, getSensorHistory);
router.post('/', authenticate, requireRole('admin'), createSensor);
router.put('/:id', authenticate, requireRole('admin'), updateSensor);
router.delete('/:id', authenticate, requireRole('admin'), deleteSensor);

// Reading ingestion and simulation endpoints
router.post('/readings', recordReading);
router.post('/simulate-event', authenticate, simulateEvent);

export default router;
