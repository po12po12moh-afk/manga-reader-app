import axios from "axios";
import * as cheerio from "cheerio";
import { getDb } from "../db";
import { manga, chapters, pages, genres, mangaGenres } from "../../drizzle/schema";
import { storagePut } from "../storage";
import { sql, eq } from "drizzle-orm";

interface ScrapedManga {
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  coverImageUrl?: string;
  author?: string;
  artist?: string;
  status: "ongoing" | "completed" | "hiatus";
  type: "manga" | "manhwa" | "manhua";
  genres: string[];
  chapters: ScrapedChapter[];
}

interface ScrapedChapter {
  chapterNumber: number;
  title?: string;
  titleAr?: string;
  pages: string[]; // URLs of page images
}

/**
 * Generic manga scraper - can be adapted for different sources
 * This is a template that needs to be customized based on the target website structure
 */
export class MangaScraper {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    };
  }

  /**
   * Fetch HTML content from a URL
   */
  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching page ${url}:`, error);
      throw error;
    }
  }

  /**
   * Download and upload image to S3
   */
  private async downloadAndUploadImage(imageUrl: string, filename: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        headers: this.headers,
        timeout: 30000,
      });

      const buffer = Buffer.from(response.data);
      const contentType = response.headers["content-type"] || "image/jpeg";
      
      const { url } = await storagePut(filename, buffer, contentType);
      return url;
    } catch (error) {
      console.error(`Error downloading image ${imageUrl}:`, error);
      throw error;
    }
  }

  /**
   * Example scraper for a generic manga website
   * This needs to be customized based on the actual website structure
   */
  async scrapeMangaList(listUrl: string): Promise<{ title: string; url: string }[]> {
    const html = await this.fetchPage(listUrl);
    const $ = cheerio.load(html);
    
    const mangaList: { title: string; url: string }[] = [];

    // Example selectors - MUST be customized for actual website
    $(".manga-item").each((_, element) => {
      const title = $(element).find(".manga-title").text().trim();
      const url = $(element).find("a").attr("href");
      
      if (title && url) {
        mangaList.push({
          title,
          url: url.startsWith("http") ? url : `${this.baseUrl}${url}`,
        });
      }
    });

    return mangaList;
  }

  /**
   * Scrape detailed manga information
   * This is a template - selectors must be customized for each website
   */
  async scrapeMangaDetails(mangaUrl: string): Promise<ScrapedManga> {
    const html = await this.fetchPage(mangaUrl);
    const $ = cheerio.load(html);

    // Example selectors - MUST be customized
    const title = $(".manga-title").text().trim();
    const description = $(".manga-description").text().trim();
    const coverImageUrl = $(".manga-cover img").attr("src");
    const author = $(".manga-author").text().trim();
    const statusText = $(".manga-status").text().trim().toLowerCase();
    
    const status: "ongoing" | "completed" | "hiatus" = 
      statusText.includes("completed") || statusText.includes("مكتملة") ? "completed" :
      statusText.includes("hiatus") || statusText.includes("متوقفة") ? "hiatus" : "ongoing";

    const genres: string[] = [];
    $(".manga-genres .genre").each((_, el) => {
      genres.push($(el).text().trim());
    });

    // Scrape chapters
    const chapters: ScrapedChapter[] = [];
    $(".chapter-list .chapter-item").each((_, el) => {
      const chapterTitle = $(el).find(".chapter-title").text().trim();
      const chapterUrl = $(el).find("a").attr("href");
      const chapterNumberMatch = chapterTitle.match(/(\d+\.?\d*)/);
      
      if (chapterUrl && chapterNumberMatch) {
        chapters.push({
          chapterNumber: parseFloat(chapterNumberMatch[1]),
          title: chapterTitle,
          pages: [], // Will be filled when scraping chapter pages
        });
      }
    });

    return {
      title,
      description,
      coverImageUrl,
      author,
      artist: author,
      status,
      type: "manhwa",
      genres,
      chapters,
    };
  }

  /**
   * Scrape chapter pages
   */
  async scrapeChapterPages(chapterUrl: string): Promise<string[]> {
    const html = await this.fetchPage(chapterUrl);
    const $ = cheerio.load(html);

    const pageUrls: string[] = [];

    // Example selectors - MUST be customized
    $(".chapter-page img, .page-image").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src) {
        pageUrls.push(src.startsWith("http") ? src : `${this.baseUrl}${src}`);
      }
    });

    return pageUrls;
  }

  /**
   * Save scraped manga to database
   */
  async saveMangaToDatabase(scrapedManga: ScrapedManga): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Upload cover image if available
      let coverImageUrl = scrapedManga.coverImageUrl;
      if (coverImageUrl) {
        try {
          const filename = `manga-covers/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          coverImageUrl = await this.downloadAndUploadImage(coverImageUrl, filename);
        } catch (error) {
          console.error("Error uploading cover image:", error);
        }
      }

      // Insert manga
      const mangaResult = await db.insert(manga).values({
        title: scrapedManga.title,
        titleAr: scrapedManga.titleAr,
        description: scrapedManga.description,
        descriptionAr: scrapedManga.descriptionAr,
        coverImage: coverImageUrl,
        author: scrapedManga.author,
        artist: scrapedManga.artist,
        status: scrapedManga.status,
        type: scrapedManga.type,
        rating: 0,
        views: 0,
      });

      const mangaId = Number(mangaResult[0].insertId);

      // Insert genres
      for (const genreName of scrapedManga.genres) {
        // Find or create genre
        const existingGenres = await db
          .select()
          .from(genres)
          .where(sql`${genres.name} = ${genreName}`)
          .limit(1);

        let genreId: number;
        if (existingGenres.length > 0) {
          genreId = existingGenres[0].id;
        } else {
          const genreResult = await db.insert(genres).values({
            name: genreName,
            nameAr: genreName,
          });
          genreId = Number(genreResult[0].insertId);
        }

        // Link manga to genre
        await db.insert(mangaGenres).values({
          mangaId,
          genreId,
        });
      }

      // Insert chapters and pages
      for (const chapter of scrapedManga.chapters) {
        const chapterResult = await db.insert(chapters).values({
          mangaId,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          titleAr: chapter.titleAr,
          views: 0,
        });

        const chapterId = Number(chapterResult[0].insertId);

        // Upload and insert pages
        for (let i = 0; i < chapter.pages.length; i++) {
          const pageUrl = chapter.pages[i];
          try {
            const filename = `manga-pages/${mangaId}/${chapterId}/${i + 1}.jpg`;
            const uploadedUrl = await this.downloadAndUploadImage(pageUrl, filename);

            await db.insert(pages).values({
              chapterId,
              pageNumber: i + 1,
              imageUrl: uploadedUrl,
            });
          } catch (error) {
            console.error(`Error uploading page ${i + 1}:`, error);
          }
        }
      }

      return mangaId;
    } catch (error) {
      console.error("Error saving manga to database:", error);
      throw error;
    }
  }
}

// Helper function to create scraper for specific source
export function createScraper(source: string): MangaScraper {
  const sources: Record<string, string> = {
    // Add your manga sources here
    "example": "https://example-manga-site.com",
  };

  const baseUrl = sources[source];
  if (!baseUrl) {
    throw new Error(`Unknown source: ${source}`);
  }

  return new MangaScraper(baseUrl);
}
