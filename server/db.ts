import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../shared/schema';

// Ensure we have the database URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a pool for database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the database connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Function to test database connection
export async function testConnection() {
  const client = await pool.connect();
  try {
    console.log('Successfully connected to PostgreSQL database');
    return true;
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error);
    return false;
  } finally {
    client.release();
  }
}

// Initialize Drizzle ORM with the pool
export const db = drizzle(pool, { schema });

// Helper function to close the database connection when needed
export async function closeDbConnection() {
  await pool.end();
}