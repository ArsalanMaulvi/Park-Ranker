import { nationalParksData } from './national-parks-data';
import { db } from './db';
import { parks, votes } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function migrateData() {
  try {
    // Check if there's data in the parks table
    const existingParks = await db.select().from(parks).limit(1);
    
    if (existingParks.length === 0) {
      console.log('Parks table is empty. Migrating data...');
      // Insert all parks from nationalParksData
      for (const parkData of nationalParksData) {
        await db.insert(parks).values({
          name: parkData.name,
          description: parkData.description,
          location: parkData.location,
          imageUrl: parkData.imageUrl,
          score: parkData.score || 1500,
          previousRanking: parkData.previousRanking
        });
      }
      
      console.log(`Successfully migrated ${nationalParksData.length} parks to the database.`);
      
      // Update previous rankings after data migration
      const allParks = await db.select().from(parks).orderBy(parks.score);
      
      for (let i = 0; i < allParks.length; i++) {
        const park = allParks[i];
        const rank = allParks.length - i;  // Highest score gets rank 1
        
        await db.update(parks)
          .set({ previousRanking: rank })
          .where(eq(parks.id, park.id));
      }
      
      console.log('Updated previous rankings for all parks.');
    } else {
      console.log('Parks table already contains data. Skipping migration.');
    }
  } catch (error) {
    console.error('Failed to migrate data:', error);
    throw error;
  }
}