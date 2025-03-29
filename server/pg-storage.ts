import { db } from './db';
import { IStorage } from './storage';
import { Park, InsertPark, Vote, InsertVote, RankedPark, parks, votes } from '@shared/schema';
import { eq, desc, asc, sql, and } from 'drizzle-orm';

export class PgStorage implements IStorage {
  async getParks(): Promise<Park[]> {
    try {
      return await db.select().from(parks);
    } catch (error) {
      console.error('Error fetching parks:', error);
      throw error;
    }
  }

  async getParkById(id: number): Promise<Park | undefined> {
    try {
      const result = await db.select().from(parks).where(eq(parks.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error(`Error fetching park with id ${id}:`, error);
      throw error;
    }
  }

  async addPark(parkData: InsertPark): Promise<Park> {
    try {
      const [newPark] = await db.insert(parks).values(parkData).returning();
      return newPark;
    } catch (error) {
      console.error('Error adding park:', error);
      throw error;
    }
  }

  async updateParkScore(id: number, newScore: number): Promise<Park> {
    try {
      const [updatedPark] = await db.update(parks)
        .set({ score: newScore })
        .where(eq(parks.id, id))
        .returning();
      
      return updatedPark;
    } catch (error) {
      console.error(`Error updating park score for id ${id}:`, error);
      throw error;
    }
  }

  async getRandomParkPair(): Promise<[Park, Park]> {
    try {
      // Get the total count
      const countResult = await db.select({ count: sql`count(*)` }).from(parks);
      const count = Number(countResult[0].count);
      
      if (count < 2) {
        throw new Error("Not enough parks to create a pair");
      }
      
      // Get two random indexes
      const index1 = Math.floor(Math.random() * count);
      let index2 = Math.floor(Math.random() * count);
      
      // Make sure we get two different parks
      while (index1 === index2) {
        index2 = Math.floor(Math.random() * count);
      }
      
      // Get all parks ordered by id and use the random indexes
      const allParks = await db.select().from(parks).orderBy(parks.id);
      
      return [allParks[index1], allParks[index2]];
    } catch (error) {
      console.error('Error getting random park pair:', error);
      throw error;
    }
  }

  async getRankedParks(): Promise<RankedPark[]> {
    try {
      const allParks = await db.select().from(parks).orderBy(desc(parks.score));
      
      // Calculate ranks
      return allParks.map((park, index) => {
        const rank = index + 1;
        const prevRank = park.previousRanking || rank;
        const rankChange = prevRank - rank;
        
        return {
          ...park,
          rank,
          rankChange
        };
      });
    } catch (error) {
      console.error('Error getting ranked parks:', error);
      throw error;
    }
  }

  async addVote(voteData: InsertVote): Promise<Vote> {
    try {
      // Get the parks involved
      const winner = await this.getParkById(voteData.winnerParkId);
      const loser = await this.getParkById(voteData.loserParkId);
      
      if (!winner || !loser) {
        throw new Error("Winner or loser park not found");
      }
      
      // Update winner's score
      await this.updateParkScore(winner.id, winner.score + voteData.scoreDelta);
      
      // Update loser's score
      await this.updateParkScore(loser.id, loser.score - voteData.scoreDelta);
      
      // Record the vote
      const [newVote] = await db.insert(votes).values(voteData).returning();
      
      return newVote;
    } catch (error) {
      console.error('Error adding vote:', error);
      throw error;
    }
  }

  async getRecentVotes(limit: number = 10): Promise<Vote[]> {
    try {
      const recentVotes = await db.select()
        .from(votes)
        .orderBy(desc(votes.timestamp))
        .limit(limit);
      
      // Now we need to fetch the related park data
      const votesWithParks = await Promise.all(
        recentVotes.map(async (vote) => {
          const winner = await this.getParkById(vote.winnerParkId);
          const loser = await this.getParkById(vote.loserParkId);
          
          if (!winner || !loser) {
            throw new Error(`Missing park data for vote ${vote.id}`);
          }
          
          return {
            ...vote,
            winner,
            loser
          };
        })
      );
      
      return votesWithParks;
    } catch (error) {
      console.error('Error getting recent votes:', error);
      throw error;
    }
  }

  async updatePreviousRanks(): Promise<void> {
    try {
      const rankedParks = await this.getRankedParks();
      
      // Update previous rankings for all parks
      for (const park of rankedParks) {
        await db.update(parks)
          .set({ previousRanking: park.rank })
          .where(eq(parks.id, park.id));
      }
    } catch (error) {
      console.error('Error updating previous ranks:', error);
      throw error;
    }
  }
}