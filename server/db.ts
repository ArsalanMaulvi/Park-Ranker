import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '@shared/schema';
import { nationalParksData } from './national-parks-data';

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a drizzle instance
export const db = drizzle(pool, { schema });

// Initialize the database with national parks data if empty
export async function initDatabase() {
  // Check if parks table is empty
  const parks = await db.select().from(schema.parks);
  
  if (parks.length === 0) {
    console.log('Initializing database with national parks data...');
    
    try {
      // Insert all parks data
      await db.insert(schema.parks).values(nationalParksData);
      console.log(`Successfully added ${nationalParksData.length} national parks to the database`);
    } catch (error) {
      console.error('Error initializing database with parks data:', error);
    }
  } else {
    console.log(`Database already contains ${parks.length} parks. Skipping initialization.`);
  }
}