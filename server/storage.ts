import { type Vote, type InsertVote, type Park, type InsertPark, RankedPark } from "@shared/schema";

export interface IStorage {
  // Park operations
  getParks(): Promise<Park[]>;
  getParkById(id: number): Promise<Park | undefined>;
  addPark(park: InsertPark): Promise<Park>;
  updateParkScore(id: number, newScore: number): Promise<Park>;
  getRandomParkPair(): Promise<[Park, Park]>;
  getRankedParks(): Promise<RankedPark[]>;
  
  // Vote operations
  addVote(vote: InsertVote): Promise<Vote>;
  getRecentVotes(limit?: number): Promise<Vote[]>;
  
  // Rank history operations
  updatePreviousRanks(): Promise<void>;
}

export class MemStorage implements IStorage {
  private parks: Map<number, Park>;
  private votes: Map<number, Vote>;
  private parkCurrentId: number;
  private voteCurrentId: number;

  constructor() {
    this.parks = new Map();
    this.votes = new Map();
    this.parkCurrentId = 1;
    this.voteCurrentId = 1;
    
    // Automatically initialize with data on server start
    this.initializeData();
  }
  
  private async initializeData() {
    try {
      // Only initialize if there are no parks
      if (this.parks.size === 0) {
        // Import the national parks data
        const { nationalParksData } = await import('./national-parks-data');
        
        // Add each park to storage
        for (const parkData of nationalParksData) {
          await this.addPark(parkData);
        }
        
        // Update rankings
        await this.updatePreviousRanks();
        
        console.log(`Initialized with ${nationalParksData.length} national parks`);
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }

  async getParks(): Promise<Park[]> {
    return Array.from(this.parks.values());
  }

  async getParkById(id: number): Promise<Park | undefined> {
    return this.parks.get(id);
  }

  async addPark(parkData: InsertPark): Promise<Park> {
    const id = this.parkCurrentId++;
    const park: Park = {
      id,
      ...parkData,
      eloScore: 1500, // Default ELO score
      previousRank: null, // Start with null instead of undefined
      totalVotes: 0,
      wins: 0,
      losses: 0,
    };
    
    this.parks.set(id, park);
    return park;
  }

  async updateParkScore(id: number, newScore: number): Promise<Park> {
    const park = this.parks.get(id);
    if (!park) {
      throw new Error(`Park with id ${id} not found`);
    }
    
    const updatedPark: Park = {
      ...park,
      eloScore: newScore
    };
    
    this.parks.set(id, updatedPark);
    return updatedPark;
  }

  async getRandomParkPair(): Promise<[Park, Park]> {
    const parks = Array.from(this.parks.values());
    if (parks.length < 2) {
      throw new Error("Not enough parks to create a pair");
    }
    
    // Get two different random parks
    const index1 = Math.floor(Math.random() * parks.length);
    let index2 = Math.floor(Math.random() * (parks.length - 1));
    if (index2 >= index1) index2++; // Adjust to avoid duplicate
    
    return [parks[index1], parks[index2]];
  }

  async getRankedParks(): Promise<RankedPark[]> {
    const parks = Array.from(this.parks.values());
    
    // Sort parks by ELO score in descending order
    const sortedParks = parks.sort((a, b) => b.eloScore - a.eloScore);
    
    // Map to RankedPark with rank and rank change
    return sortedParks.map((park, index) => {
      const rank = index + 1;
      let rankChange = 0;
      
      // Calculate rank change if previousRank exists
      if (park.previousRank !== null && park.previousRank !== undefined) {
        rankChange = park.previousRank - rank;
      }
      
      return {
        ...park,
        rank,
        rankChange
      };
    });
  }

  async addVote(voteData: InsertVote): Promise<Vote> {
    const id = this.voteCurrentId++;
    const timestamp = new Date();
    
    // Update park win/loss records and total votes
    const winner = this.parks.get(voteData.winnerParkId);
    const loser = this.parks.get(voteData.loserParkId);
    
    if (!winner || !loser) {
      throw new Error("Winner or loser park not found");
    }
    
    this.parks.set(winner.id, {
      ...winner,
      wins: winner.wins + 1,
      totalVotes: winner.totalVotes + 1,
      eloScore: winner.eloScore + voteData.scoreDelta
    });
    
    this.parks.set(loser.id, {
      ...loser,
      losses: loser.losses + 1,
      totalVotes: loser.totalVotes + 1,
      eloScore: loser.eloScore - voteData.scoreDelta
    });
    
    const vote: Vote = {
      id,
      ...voteData,
      timestamp
    };
    
    this.votes.set(id, vote);
    return vote;
  }

  async getRecentVotes(limit: number = 10): Promise<Vote[]> {
    const votes = Array.from(this.votes.values());
    
    // Sort by timestamp in descending order (newest first)
    return votes
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async updatePreviousRanks(): Promise<void> {
    const rankedParks = await this.getRankedParks();
    
    // Update previous rank for each park
    for (const park of rankedParks) {
      const currentPark = this.parks.get(park.id);
      if (currentPark) {
        this.parks.set(park.id, {
          ...currentPark,
          previousRank: park.rank
        });
      }
    }
  }
}

export const storage = new MemStorage();
