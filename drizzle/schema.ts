import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, float } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Manga/Manhwa table - stores information about each manga series
 */
export const manga = mysqlTable("manga", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }), // Arabic title
  description: text("description"),
  descriptionAr: text("descriptionAr"), // Arabic description
  coverImage: text("coverImage"), // URL to cover image
  author: varchar("author", { length: 255 }),
  artist: varchar("artist", { length: 255 }),
  status: mysqlEnum("status", ["ongoing", "completed", "hiatus"]).default("ongoing").notNull(),
  type: mysqlEnum("type", ["manga", "manhwa", "manhua"]).default("manhwa").notNull(),
  rating: float("rating").default(0),
  views: int("views").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Manga = typeof manga.$inferSelect;
export type InsertManga = typeof manga.$inferInsert;

/**
 * Genres table - stores available genres
 */
export const genres = mysqlTable("genres", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 100 }), // Arabic name
});

export type Genre = typeof genres.$inferSelect;
export type InsertGenre = typeof genres.$inferInsert;

/**
 * Manga-Genre relationship table (many-to-many)
 */
export const mangaGenres = mysqlTable("manga_genres", {
  id: int("id").autoincrement().primaryKey(),
  mangaId: int("mangaId").notNull(),
  genreId: int("genreId").notNull(),
});

export type MangaGenre = typeof mangaGenres.$inferSelect;
export type InsertMangaGenre = typeof mangaGenres.$inferInsert;

/**
 * Chapters table - stores chapters for each manga
 */
export const chapters = mysqlTable("chapters", {
  id: int("id").autoincrement().primaryKey(),
  mangaId: int("mangaId").notNull(),
  chapterNumber: float("chapterNumber").notNull(), // Allows decimal chapters like 5.5
  title: varchar("title", { length: 255 }),
  titleAr: varchar("titleAr", { length: 255 }), // Arabic title
  views: int("views").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;

/**
 * Pages table - stores pages for each chapter
 */
export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  chapterId: int("chapterId").notNull(),
  pageNumber: int("pageNumber").notNull(),
  imageUrl: text("imageUrl").notNull(), // URL to page image
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

/**
 * Favorites table - stores user's favorite manga
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mangaId: int("mangaId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Reading history table - tracks user's reading progress
 */
export const readingHistory = mysqlTable("reading_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mangaId: int("mangaId").notNull(),
  chapterId: int("chapterId").notNull(),
  pageNumber: int("pageNumber").default(1), // Last page read
  lastReadAt: timestamp("lastReadAt").defaultNow().notNull(),
});

export type ReadingHistory = typeof readingHistory.$inferSelect;
export type InsertReadingHistory = typeof readingHistory.$inferInsert;

// Relations
export const mangaRelations = relations(manga, ({ many }) => ({
  chapters: many(chapters),
  genres: many(mangaGenres),
  favorites: many(favorites),
  readingHistory: many(readingHistory),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  manga: one(manga, {
    fields: [chapters.mangaId],
    references: [manga.id],
  }),
  pages: many(pages),
  readingHistory: many(readingHistory),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  chapter: one(chapters, {
    fields: [pages.chapterId],
    references: [chapters.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  manga: one(manga, {
    fields: [favorites.mangaId],
    references: [manga.id],
  }),
}));

export const readingHistoryRelations = relations(readingHistory, ({ one }) => ({
  user: one(users, {
    fields: [readingHistory.userId],
    references: [users.id],
  }),
  manga: one(manga, {
    fields: [readingHistory.mangaId],
    references: [manga.id],
  }),
  chapter: one(chapters, {
    fields: [readingHistory.chapterId],
    references: [chapters.id],
  }),
}));

export const mangaGenresRelations = relations(mangaGenres, ({ one }) => ({
  manga: one(manga, {
    fields: [mangaGenres.mangaId],
    references: [manga.id],
  }),
  genre: one(genres, {
    fields: [mangaGenres.genreId],
    references: [genres.id],
  }),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  mangaGenres: many(mangaGenres),
}));

export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  readingHistory: many(readingHistory),
}));
