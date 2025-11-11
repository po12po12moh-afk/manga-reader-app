import axios from "axios";
import * as cheerio from "cheerio";
import { storagePut } from "../storage";

/**
 * Scraper مخصص لموقع olympustaff.com
 * 
 * هذا الملف يحتوي على دوال لسحب المحتوى من موقع olympustaff.com
 * بما في ذلك قائمة المانجا، تفاصيل المانجا، الفصول، والصفحات
 */

export interface OlympusManga {
  title: string;
  titleAr: string;
  slug: string;
  coverImage: string;
  description: string;
  status: string;
  type: string;
  author: string;
  genres: string[];
  rating: number;
}

export interface OlympusChapter {
  number: number;
  title: string;
  url: string;
  publishedAt: Date;
}

export interface OlympusPage {
  number: number;
  imageUrl: string;
}

/**
 * سحب قائمة المانجا من الصفحة الرئيسية
 */
export async function scrapeOlympusMangaList(): Promise<OlympusManga[]> {
  try {
    const response = await axios.get("https://olympustaff.com/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const mangaList: OlympusManga[] = [];

    // TODO: تحديث CSS selectors بناءً على بنية الموقع الفعلية
    // هذه مجرد أمثلة، يجب فحص HTML الفعلي للموقع
    
    $(".manga-item").each((index, element) => {
      const $el = $(element);
      
      const title = $el.find(".manga-title").text().trim();
      const slug = $el.find("a").attr("href")?.split("/").pop() || "";
      const coverImage = $el.find("img").attr("src") || "";
      
      if (title && slug) {
        mangaList.push({
          title,
          titleAr: title,
          slug,
          coverImage,
          description: "",
          status: "مستمرة",
          type: "مانها صيني",
          author: "غير معروف",
          genres: [],
          rating: 0,
        });
      }
    });

    return mangaList;
  } catch (error) {
    console.error("Error scraping manga list:", error);
    throw error;
  }
}

/**
 * سحب تفاصيل مانجا معينة
 */
export async function scrapeOlympusMangaDetails(slug: string): Promise<OlympusManga | null> {
  try {
    const url = `https://olympustaff.com/series/${slug}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // استخراج البيانات من الصفحة
    const title = $("h1").first().text().trim() || slug;
    const coverImage = $('img[alt="Manga Image"]').attr("src") || "";
    
    // استخراج الوصف
    let description = "";
    $("p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 100) {
        description = text;
        return false; // break
      }
    });

    // استخراج التصنيفات
    const genres: string[] = [];
    $("a").each((i, el) => {
      const href = $(el).attr("href") || "";
      if (href.includes("/genre/") || href.includes("/tag/")) {
        genres.push($(el).text().trim());
      }
    });

    // استخراج الحالة والنوع
    let status = "مستمرة";
    let type = "مانها صيني";
    $("a").each((i, el) => {
      const text = $(el).text().trim();
      if (text === "مكتملة" || text === "مستمرة") {
        status = text;
      }
      if (text.includes("مانها") || text.includes("مانجا") || text.includes("مانهوا")) {
        type = text;
      }
    });

    return {
      title,
      titleAr: title,
      slug,
      coverImage,
      description,
      status,
      type,
      author: "غير معروف",
      genres,
      rating: 0,
    };
  } catch (error) {
    console.error(`Error scraping manga details for ${slug}:`, error);
    return null;
  }
}

/**
 * سحب قائمة الفصول لمانجا معينة
 */
export async function scrapeOlympusChapters(slug: string): Promise<OlympusChapter[]> {
  try {
    const url = `https://olympustaff.com/series/${slug}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const chapters: OlympusChapter[] = [];

    // TODO: تحديث CSS selectors بناءً على بنية الموقع الفعلية
    $("a").each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const href = $el.attr("href") || "";

      // البحث عن روابط الفصول
      if (text.includes("الفصل") && href.includes(`/series/${slug}/`)) {
        const chapterNumber = parseInt(href.split("/").pop() || "0");
        if (chapterNumber > 0) {
          chapters.push({
            number: chapterNumber,
            title: text,
            url: href,
            publishedAt: new Date(),
          });
        }
      }
    });

    // ترتيب الفصول من الأقدم للأحدث
    chapters.sort((a, b) => a.number - b.number);

    return chapters;
  } catch (error) {
    console.error(`Error scraping chapters for ${slug}:`, error);
    return [];
  }
}

/**
 * سحب صفحات فصل معين
 */
export async function scrapeOlympusChapterPages(
  slug: string,
  chapterNumber: number
): Promise<OlympusPage[]> {
  try {
    const url = `https://olympustaff.com/series/${slug}/${chapterNumber}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const pages: OlympusPage[] = [];

    // استخراج جميع الصور من الصفحة
    $("img").each((i, el) => {
      const src = $(el).attr("src") || "";
      const alt = $(el).attr("alt") || "";
      
      // تصفية الصور (فقط صور الفصل)
      if (
        src &&
        !src.includes("logo") &&
        !src.includes("icon") &&
        (alt.includes("image") || alt.includes("page") || src.includes("chapter"))
      ) {
        pages.push({
          number: pages.length + 1,
          imageUrl: src.startsWith("http") ? src : `https://olympustaff.com${src}`,
        });
      }
    });

    return pages;
  } catch (error) {
    console.error(`Error scraping pages for ${slug} chapter ${chapterNumber}:`, error);
    return [];
  }
}

/**
 * تحميل صورة وحفظها على S3
 */
export async function downloadAndUploadImage(imageUrl: string, filename: string): Promise<string> {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://olympustaff.com/",
      },
    });

    const buffer = Buffer.from(response.data);
    const contentType = response.headers["content-type"] || "image/jpeg";

    // رفع الصورة على S3
    const { url } = await storagePut(filename, buffer, contentType);

    return url;
  } catch (error) {
    console.error(`Error downloading image ${imageUrl}:`, error);
    throw error;
  }
}

/**
 * استيراد مانجا كاملة من olympustaff.com
 * 
 * @param slug - معرف المانجا في الموقع
 * @param maxChapters - الحد الأقصى لعدد الفصول المراد استيرادها (اختياري)
 * @returns معلومات المانجا المستوردة
 */
export async function importMangaFromOlympus(
  slug: string,
  maxChapters?: number
): Promise<{
  manga: OlympusManga;
  chapters: Array<{ chapter: OlympusChapter; pages: OlympusPage[] }>;
}> {
  console.log(`Starting import for manga: ${slug}`);

  // 1. سحب تفاصيل المانجا
  const manga = await scrapeOlympusMangaDetails(slug);
  if (!manga) {
    throw new Error(`Failed to scrape manga details for ${slug}`);
  }

  // 2. تحميل صورة الغلاف
  if (manga.coverImage) {
    try {
      const coverFilename = `manga-covers/${slug}-cover.jpg`;
      manga.coverImage = await downloadAndUploadImage(manga.coverImage, coverFilename);
    } catch (error) {
      console.error("Failed to upload cover image:", error);
    }
  }

  // 3. سحب قائمة الفصول
  let chapters = await scrapeOlympusChapters(slug);
  if (maxChapters && chapters.length > maxChapters) {
    chapters = chapters.slice(0, maxChapters);
  }

  // 4. سحب صفحات كل فصل
  const chaptersWithPages: Array<{ chapter: OlympusChapter; pages: OlympusPage[] }> = [];

  for (const chapter of chapters) {
    console.log(`Scraping chapter ${chapter.number}...`);
    
    const pages = await scrapeOlympusChapterPages(slug, chapter.number);
    
    // تحميل صور الصفحات
    const uploadedPages: OlympusPage[] = [];
    for (const page of pages) {
      try {
        const pageFilename = `manga-pages/${slug}/chapter-${chapter.number}/page-${page.number}.jpg`;
        const uploadedUrl = await downloadAndUploadImage(page.imageUrl, pageFilename);
        uploadedPages.push({
          number: page.number,
          imageUrl: uploadedUrl,
        });
      } catch (error) {
        console.error(`Failed to upload page ${page.number}:`, error);
      }
    }

    chaptersWithPages.push({
      chapter,
      pages: uploadedPages,
    });

    // تأخير بسيط لتجنب حظر IP
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`Import completed for manga: ${slug}`);

  return {
    manga,
    chapters: chaptersWithPages,
  };
}
