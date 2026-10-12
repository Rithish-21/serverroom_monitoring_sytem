import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('[SocketService] Connected to real-time telemetry stream');
      });

      this.socket.on('disconnect', () => {
        console.log('[SocketService] Disconnected from stream');
      });
    }
    return this.socket;
  }

  on(event, handler) {
    if (!this.socket) this.connect();
    this.socket.on(event, handler);
  }

  off(event, handler) {
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
