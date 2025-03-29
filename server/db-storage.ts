import { db } from './db';
import { IStorage } from './storage';
import { Park, RankedPark, Vote, InsertPark, InsertVote } from '@shared/schema';
import { parks, votes } from '@shared/schema';
import { eq, desc, asc } from 'drizzle-orm';

export class DbStorage implements IStorage {
  /**
   * Get all parks from the database
   */
  async getParks(): Promise<Park[]> {
    return db.select().from(parks).execute();
  }

  /**
   * Get a specific park by ID
   */
  async getParkById(id: number): Promise<Park | undefined> {
    const results = await db.select().from(parks).where(eq(parks.id, id)).execute();
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Add a new park to the database
   */
  async addPark(parkData: InsertPark): Promise<Park> {
    const result = await db.insert(parks).values({
      name: parkData.name,
      description: parkData.description,
      location: parkData.location,
      imageUrl: parkData.imageUrl,
      score: parkData.score || 1500,
      previousRanking: parkData.previousRanking || null,
    }).returning();

    return result[0];
  }

  /**
   * Update a park's ELO score
   */
  async updateParkScore(id: number, newScore: number): Promise<Park> {
    const result = await db
      .update(parks)
      .set({ score: newScore })
      .where(eq(parks.id, id))
      .returning();

    return result[0];
  }

  /**
   * Get a random pair of parks for voting
   */
  async getRandomParkPair(): Promise<[Park, Park]> {
    const allParks = await this.getParks();
    
    if (allParks.length < 2) {
      throw new Error("Not enough parks to create a pair");
    }
    
    // Get two different random parks
    const index1 = Math.floor(Math.random() * allParks.length);
    let index2 = Math.floor(Math.random() * (allParks.length - 1));
    if (index2 >= index1) index2++;
    
    return [allParks[index1], allParks[index2]];
  }

  /**
   * Get all parks sorted by their ELO score with ranks
   */
  async getRankedParks(): Promise<RankedPark[]> {
    const allParks = await db
      .select()
      .from(parks)
      .orderBy(desc(parks.score))
      .execute();
    
    // Map parks to ranked parks with rank and rank change
    return allParks.map((park, index) => {
      const rank = index + 1;
      let rankChange = 0;
      
      // Calculate rank change if previousRanking exists
      if (park.previousRanking !== null && park.previousRanking !== undefined) {
        rankChange = park.previousRanking - rank;
      }
      
      return {
        ...park,
        rank,
        rankChange
      };
    });
  }

  /**
   * Add a new vote
   */
  async addVote(voteData: InsertVote): Promise<Vote> {
    // Get winner and loser parks
    const winner = await this.getParkById(voteData.winnerParkId);
    const loser = await this.getParkById(voteData.loserParkId);
    
    if (!winner || !loser) {
      throw new Error("Winner or loser park not found");
    }
    
    // Update winner score
    await this.updateParkScore(winner.id, winner.score + voteData.scoreDelta);
    
    // Update loser score
    await this.updateParkScore(loser.id, loser.score - voteData.scoreDelta);
    
    // Insert the vote
    const insertedVote = await db
      .insert(votes)
      .values({
        winnerParkId: voteData.winnerParkId,
        loserParkId: voteData.loserParkId,
        scoreDelta: voteData.scoreDelta,
      })
      .returning();
    
    return insertedVote[0];
  }

  /**
   * Get recent votes
   */
  async getRecentVotes(limit: number = 10): Promise<Vote[]> {
    return db
      .select()
      .from(votes)
      .orderBy(desc(votes.timestamp))
      .limit(limit)
      .execute();
  }

  /**
   * Update previous ranks to track rank changes
   */
  async updatePreviousRanks(): Promise<void> {
    const rankedParks = await this.getRankedParks();
    
    // Update each park's previous ranking
    for (const park of rankedParks) {
      await db
        .update(parks)
        .set({ previousRanking: park.rank })
        .where(eq(parks.id, park.id))
        .execute();
    }
  }
}