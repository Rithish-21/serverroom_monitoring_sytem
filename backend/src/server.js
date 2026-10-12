import http from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { initDb } from './config/db.js';
import { initSocket } from './sockets/socketManager.js';

const httpServer = http.createServer(app);

// Initialize real-time WebSocket connection
initSocket(httpServer);

const startServer = async () => {
  // Initialize Database Pool
  await initDb();

  httpServer.listen(config.port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SentinelCore Backend is running on port ${config.port}`);
    console.log(`🌐 API base: http://localhost:${config.port}/api`);
    console.log(`⚡ WebSocket: ws://localhost:${config.port}`);
    console.log(`🛡️  Admin Invite Code: ${config.adminInviteCode}`);
    console.log(`======================================================\n`);
  });
};

startServer().catch(err => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
