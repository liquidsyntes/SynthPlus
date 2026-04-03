import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tracks = sqliteTable("tracks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  artist: text("artist").notNull(),
  year: integer("year"),
  link: text("link"),
  mainSubgenre: text("main_subgenre").notNull(),
  adjacentSubgenre: text("adjacent_subgenre"),
  mainMood: text("main_mood").notNull(),
  secondaryMoods: text("secondary_moods"), // JSON array string
  vector: text("vector").notNull(), // Светлый / Нейтральный / Тёмный
  dynamicAnswers: text("dynamic_answers"), // JSON object string
  bpm: text("bpm"),
  key: text("key"),
  mode: text("mode"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
});

export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracks.$inferSelect;
