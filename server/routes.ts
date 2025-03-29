import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertParkSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Park routes
  app.get("/api/parks", async (_req, res) => {
    try {
      const parks = await storage.getParks();
      res.json(parks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parks" });
    }
  });
  
  app.get("/api/parks/ranked", async (_req, res) => {
    try {
      const rankedParks = await storage.getRankedParks();
      res.json(rankedParks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ranked parks" });
    }
  });

  app.get("/api/parks/pair", async (_req, res) => {
    try {
      const [park1, park2] = await storage.getRandomParkPair();
      res.json({ park1, park2 });
    } catch (error) {
      res.status(500).json({ message: "Failed to get park pair" });
    }
  });

  app.post("/api/parks", async (req, res) => {
    try {
      const parkData = insertParkSchema.parse(req.body);
      const park = await storage.addPark(parkData);
      res.status(201).json(park);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid park data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create park" });
      }
    }
  });
  
  // Get specific park by ID - should be after specialized routes like /ranked and /pair
  app.get("/api/parks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid park ID" });
      }
      
      const park = await storage.getParkById(id);
      if (!park) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      res.json(park);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch park" });
    }
  });

  // Vote routes
  app.post("/api/votes", async (req, res) => {
    try {
      const voteData = insertVoteSchema.parse(req.body);
      const vote = await storage.addVote(voteData);
      
      // Update previous ranks after a vote to track rank changes
      await storage.updatePreviousRanks();
      
      const updatedRanks = await storage.getRankedParks();
      
      res.status(201).json({
        vote,
        updatedRanks
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to register vote" });
      }
    }
  });

  app.get("/api/votes/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recentVotes = await storage.getRecentVotes(limit);
      
      // Get park data for each vote to return more complete info
      const votesWithParkInfo = await Promise.all(
        recentVotes.map(async (vote) => {
          const winner = await storage.getParkById(vote.winnerParkId);
          const loser = await storage.getParkById(vote.loserParkId);
          
          return {
            ...vote,
            winner,
            loser
          };
        })
      );
      
      res.json(votesWithParkInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent votes" });
    }
  });

  // Initialize with national parks data if needed
  app.post("/api/initialize", async (_req, res) => {
    try {
      const parks = await storage.getParks();
      if (parks.length === 0) {
        // Import and run the migration function
        const { migrateData } = await import("./migrate-data");
        await migrateData();
        
        // Get the updated park count
        const updatedParks = await storage.getParks();
        
        res.json({ 
          message: "Data initialized successfully", 
          count: updatedParks.length 
        });
      } else {
        res.json({ 
          message: "Data already initialized", 
          count: parks.length 
        });
      }
    } catch (error) {
      console.error("Failed to initialize data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
