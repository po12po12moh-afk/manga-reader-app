import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { createScraper } from "../scraper/mangaScraper";

/**
 * Scraper router - Admin only
 * Provides endpoints to scrape manga from external sources
 */
export const scraperRouter = router({
  // Scrape manga list from a source
  scrapeMangaList: protectedProcedure
    .input(z.object({
      source: z.string(),
      listUrl: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can scrape manga",
        });
      }

      try {
        const scraper = createScraper(input.source);
        const mangaList = await scraper.scrapeMangaList(input.listUrl);
        return {
          success: true,
          count: mangaList.length,
          manga: mangaList,
        };
      } catch (error) {
        console.error("Error scraping manga list:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to scrape manga list",
        });
      }
    }),

  // Scrape full manga details and save to database
  scrapeMangaDetails: protectedProcedure
    .input(z.object({
      source: z.string(),
      mangaUrl: z.string().url(),
      includeChapters: z.boolean().optional().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can scrape manga",
        });
      }

      try {
        const scraper = createScraper(input.source);
        const mangaDetails = await scraper.scrapeMangaDetails(input.mangaUrl);

        // If includeChapters is true, scrape chapter pages
        if (input.includeChapters && mangaDetails.chapters.length > 0) {
          // Limit to first 5 chapters to avoid long processing time
          const chaptersToScrape = mangaDetails.chapters.slice(0, 5);
          
          for (const chapter of chaptersToScrape) {
            // You need to construct chapter URL based on the source
            // This is a placeholder - needs to be implemented based on actual website structure
            const chapterUrl = `${input.mangaUrl}/chapter-${chapter.chapterNumber}`;
            try {
              chapter.pages = await scraper.scrapeChapterPages(chapterUrl);
            } catch (error) {
              console.error(`Error scraping chapter ${chapter.chapterNumber}:`, error);
              chapter.pages = [];
            }
          }
        }

        // Save to database
        const mangaId = await scraper.saveMangaToDatabase(mangaDetails);

        return {
          success: true,
          mangaId,
          title: mangaDetails.title,
          chaptersCount: mangaDetails.chapters.length,
        };
      } catch (error) {
        console.error("Error scraping manga details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to scrape manga details",
        });
      }
    }),

  // Manual scrape - for testing
  testScraper: protectedProcedure
    .input(z.object({
      url: z.string().url(),
    }))
    .query(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can test scraper",
        });
      }

      return {
        success: true,
        message: "Scraper test endpoint - implement custom logic here",
        url: input.url,
      };
    }),
});
