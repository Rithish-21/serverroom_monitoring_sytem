import mysql from 'mysql2/promise';
import { config } from './env.js';
import { memoryStore, executeMockQuery } from './mockStore.js';

let pool = null;
let isMockDb = false;

export const initDb = async () => {
  try {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test connection
    const conn = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL (${config.db.host}:${config.db.port}/${config.db.database})`);
    conn.release();
    isMockDb = false;
  } catch (err) {
    console.warn(`[Database] MySQL connection failed (${err.code || err.message}).`);
    console.warn('[Database] Falling back to high-fidelity In-Memory mock store for development.');
    isMockDb = true;
  }
};

export const query = async (sql, params = []) => {
  if (!isMockDb && pool) {
    const [rows] = await pool.query(sql, params);
    return rows;
  }
  return executeMockQuery(sql, params);
};

export const getStore = () => memoryStore;
export const isUsingMock = () => isMockDb;
