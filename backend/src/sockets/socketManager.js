import { Server } from 'socket.io';
import { config } from '../config/env.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getSocketIO = () => {
  return ioInstance;
};

export const broadcastTelemetry = (telemetryData) => {
  if (ioInstance) {
    ioInstance.emit('sensor:update', telemetryData);
  }
};
