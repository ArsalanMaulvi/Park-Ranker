import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base schema for users (optional for future auth)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Schema for national parks
export const parks = pgTable("parks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  establishedYear: integer("established_year").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  icon: text("icon").notNull(), // Emoji icon for the park
  eloScore: integer("elo_score").notNull().default(1500),
  previousRank: integer("previous_rank"),
  totalVotes: integer("total_votes").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
});

export const insertParkSchema = createInsertSchema(parks).pick({
  name: true,
  description: true,
  establishedYear: true,
  location: true,
  imageUrl: true,
  icon: true,
});

// Schema for votes
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  winnerParkId: integer("winner_park_id").notNull(),
  loserParkId: integer("loser_park_id").notNull(),
  scoreDelta: integer("score_delta").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  winnerParkId: true,
  loserParkId: true,
  scoreDelta: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Park = typeof parks.$inferSelect;
export type InsertPark = z.infer<typeof insertParkSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

// Extended Park type with rank
export type RankedPark = Park & { 
  rank: number; 
  rankChange: number;
};
