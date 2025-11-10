import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { manga, chapters, pages, favorites, readingHistory, genres, mangaGenres } from "../../drizzle/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export const mangaRouter = router({
  // Get popular manga
  getPopular: publicProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const result = await db
        .select()
        .from(manga)
        .orderBy(desc(manga.views))
        .limit(input.limit);
      return result;
    }),

  // Get recent manga
  getRecent: publicProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const result = await db
        .select()
        .from(manga)
        .orderBy(desc(manga.createdAt))
        .limit(input.limit);
      return result;
    }),

  // Get all genres
  getGenres: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const result = await db.select().from(genres);
    return result;
  }),

  // Get manga by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db
        .select()
        .from(manga)
        .where(eq(manga.id, input.id))
        .limit(1);
      
      if (result.length === 0) {
        throw new Error("Manga not found");
      }

      // Get chapters
      const mangaChapters = await db
        .select()
        .from(chapters)
        .where(eq(chapters.mangaId, input.id))
        .orderBy(desc(chapters.chapterNumber));

      // Get genres
      const mangaGenresData = await db
        .select({
          id: genres.id,
          name: genres.name,
          nameAr: genres.nameAr,
        })
        .from(mangaGenres)
        .innerJoin(genres, eq(mangaGenres.genreId, genres.id))
        .where(eq(mangaGenres.mangaId, input.id));

      return {
        ...result[0],
        chapters: mangaChapters,
        genres: mangaGenresData,
      };
    }),

  // Get chapter by ID
  getChapter: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db
        .select()
        .from(chapters)
        .where(eq(chapters.id, input.id))
        .limit(1);
      
      if (result.length === 0) {
        throw new Error("Chapter not found");
      }

      // Get pages
      const chapterPages = await db
        .select()
        .from(pages)
        .where(eq(pages.chapterId, input.id))
        .orderBy(pages.pageNumber);

      return {
        ...result[0],
        pages: chapterPages,
      };
    }),

  // Search manga
  search: publicProcedure
    .input(z.object({ 
      query: z.string(),
      limit: z.number().optional().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const result = await db
        .select()
        .from(manga)
        .where(
          sql`${manga.title} LIKE ${`%${input.query}%`} OR ${manga.titleAr} LIKE ${`%${input.query}%`}`
        )
        .limit(input.limit);
      return result;
    }),

  // Get manga by genre
  getByGenre: publicProcedure
    .input(z.object({ 
      genreId: z.number(),
      limit: z.number().optional().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const result = await db
        .select({
          id: manga.id,
          title: manga.title,
          titleAr: manga.titleAr,
          description: manga.description,
          descriptionAr: manga.descriptionAr,
          coverImage: manga.coverImage,
          author: manga.author,
          artist: manga.artist,
          status: manga.status,
          type: manga.type,
          rating: manga.rating,
          views: manga.views,
          createdAt: manga.createdAt,
          updatedAt: manga.updatedAt,
        })
        .from(manga)
        .innerJoin(mangaGenres, eq(manga.id, mangaGenres.mangaId))
        .where(eq(mangaGenres.genreId, input.genreId))
        .limit(input.limit);
      return result;
    }),

  // Add to favorites (protected)
  addToFavorites: protectedProcedure
    .input(z.object({ mangaId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.insert(favorites).values({
        userId: ctx.user.id,
        mangaId: input.mangaId,
      });
      return { success: true };
    }),

  // Remove from favorites (protected)
  removeFromFavorites: protectedProcedure
    .input(z.object({ mangaId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, ctx.user.id),
            eq(favorites.mangaId, input.mangaId)
          )
        );
      return { success: true };
    }),

  // Get user favorites (protected)
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const result = await db
      .select({
        id: manga.id,
        title: manga.title,
        titleAr: manga.titleAr,
        description: manga.description,
        descriptionAr: manga.descriptionAr,
        coverImage: manga.coverImage,
        author: manga.author,
        artist: manga.artist,
        status: manga.status,
        type: manga.type,
        rating: manga.rating,
        views: manga.views,
        createdAt: manga.createdAt,
        updatedAt: manga.updatedAt,
        favoritedAt: favorites.createdAt,
      })
      .from(favorites)
      .innerJoin(manga, eq(favorites.mangaId, manga.id))
      .where(eq(favorites.userId, ctx.user.id))
      .orderBy(desc(favorites.createdAt));
    return result;
  }),

  // Update reading history (protected)
  updateReadingHistory: protectedProcedure
    .input(z.object({
      mangaId: z.number(),
      chapterId: z.number(),
      pageNumber: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Check if history exists
      const existing = await db
        .select()
        .from(readingHistory)
        .where(
          and(
            eq(readingHistory.userId, ctx.user.id),
            eq(readingHistory.mangaId, input.mangaId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(readingHistory)
          .set({
            chapterId: input.chapterId,
            pageNumber: input.pageNumber,
            lastReadAt: new Date(),
          })
          .where(eq(readingHistory.id, existing[0].id));
      } else {
        // Insert new
        await db.insert(readingHistory).values({
          userId: ctx.user.id,
          mangaId: input.mangaId,
          chapterId: input.chapterId,
          pageNumber: input.pageNumber,
        });
      }

      return { success: true };
    }),

  // Get reading history (protected)
  getReadingHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const result = await db
      .select({
        id: manga.id,
        title: manga.title,
        titleAr: manga.titleAr,
        coverImage: manga.coverImage,
        chapterId: readingHistory.chapterId,
        chapterNumber: chapters.chapterNumber,
        chapterTitle: chapters.title,
        pageNumber: readingHistory.pageNumber,
        lastReadAt: readingHistory.lastReadAt,
      })
      .from(readingHistory)
      .innerJoin(manga, eq(readingHistory.mangaId, manga.id))
      .innerJoin(chapters, eq(readingHistory.chapterId, chapters.id))
      .where(eq(readingHistory.userId, ctx.user.id))
      .orderBy(desc(readingHistory.lastReadAt));
    return result;
  }),
});
