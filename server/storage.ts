import { type Track, type InsertTrack, tracks } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  getAllTracks(): Promise<Track[]>;
  getTrack(id: number): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  deleteTrack(id: number): Promise<void>;
  importTracks(tracks: InsertTrack[]): Promise<Track[]>;
}

export class DatabaseStorage implements IStorage {
  async getAllTracks(): Promise<Track[]> {
    return db.select().from(tracks).all();
  }

  async getTrack(id: number): Promise<Track | undefined> {
    return db.select().from(tracks).where(eq(tracks.id, id)).get();
  }

  async createTrack(track: InsertTrack): Promise<Track> {
    return db.insert(tracks).values(track).returning().get();
  }

  async deleteTrack(id: number): Promise<void> {
    db.delete(tracks).where(eq(tracks.id, id)).run();
  }

  async importTracks(trackList: InsertTrack[]): Promise<Track[]> {
    const results: Track[] = [];
    for (const t of trackList) {
      const inserted = db.insert(tracks).values(t).returning().get();
      results.push(inserted);
    }
    return results;
  }
}

export const storage = new DatabaseStorage();
