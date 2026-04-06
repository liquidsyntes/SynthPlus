import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTrackSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Export all tracks as JSON (must be before :id route)
  app.get("/api/tracks/export/json", async (_req, res) => {
    const tracks = await storage.getAllTracks();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=synthwave-archive.json");
    res.json(tracks);
  });

  // Import tracks from JSON (must be before :id route)
  app.post("/api/tracks/import", async (req, res) => {
    try {
      const trackList = req.body;
      if (!Array.isArray(trackList)) {
        return res.status(400).json({ error: "Expected array of tracks" });
      }
      const parsed = trackList.map((t: any) => {
        const { id, ...rest } = t;
        return insertTrackSchema.parse(rest);
      });
      const imported = await storage.importTracks(parsed);
      res.status(201).json({ imported: imported.length });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      throw e;
    }
  });

  // Get all tracks
  app.get("/api/tracks", async (_req, res) => {
    const tracks = await storage.getAllTracks();
    res.json(tracks);
  });

  // Get single track
  app.get("/api/tracks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const track = await storage.getTrack(id);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }
    res.json(track);
  });

  // Create track
  app.post("/api/tracks", async (req, res) => {
    try {
      const parsed = insertTrackSchema.parse(req.body);
      const track = await storage.createTrack(parsed);
      res.status(201).json(track);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      throw e;
    }
  });

  // Delete track
  app.delete("/api/tracks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    await storage.deleteTrack(id);
    res.status(204).send();
  });

  // Update track
  app.put("/api/tracks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    try {
      const parsed = insertTrackSchema.parse(req.body);
      const track = await storage.updateTrack(id, parsed);
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }
      res.json(track);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      throw e;
    }
  });

  return httpServer;
}
