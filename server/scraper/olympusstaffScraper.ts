import puppeteer from "puppeteer";
import axios from "axios";
import { storagePut } from "../storage";

/**
 * Scraper محسّن لموقع olympustaff.com باستخدام Puppeteer
 * 
 * يستخدم Puppeteer لمعالجة JavaScript وتحميل المحتوى الديناميكي
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

let browserInstance: any = null;

/**
 * الحصول على browser instance (singleton)
 */
async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
}

/**
 * إغلاق المتصفح
 */
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * سحب قائمة المانجا من الصفحة الرئيسية
 */
export async function scrapeOlympusMangaList(): Promise<OlympusManga[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto('https://olympustaff.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // استخراج قائمة المانجا
    const mangaList = await page.evaluate(() => {
      const results: any[] = [];
      const links = document.querySelectorAll('a[href*="/series/"]');

      links.forEach((link: any) => {
        const href = link.getAttribute('href');
        if (!href) return;

        const slug = href.split('/').filter((p: string) => p).pop();
        const img = link.querySelector('img');
        const title = img ? img.alt : '';
        const coverImage = img ? img.src : '';

        if (title && slug && !results.find((r) => r.slug === slug)) {
          results.push({
            title,
            titleAr: title,
            slug,
            coverImage,
            description: '',
            status: 'مستمرة',
            type: 'مانها',
            author: 'غير معروف',
            genres: [],
            rating: 0,
          });
        }
      });

      return results;
    });

    await page.close();
    return mangaList;
  } catch (error) {
    await page.close();
    console.error('Error scraping manga list:', error);
    throw error;
  }
}

/**
 * سحب تفاصيل مانجا معينة
 */
export async function scrapeOlympusMangaDetails(slug: string): Promise<OlympusManga | null> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    const url = `https://olympustaff.com/series/${slug}`;
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // استخراج البيانات
    const mangaData = await page.evaluate(() => {
      // العنوان
      const titleElement = document.querySelector('title');
      const title = titleElement ? titleElement.textContent?.split(' - ')[0].trim() || '' : '';

      // صورة الغلاف
      const coverImg = document.querySelector('img[alt="Manga Image"]') as HTMLImageElement;
      const coverImage = coverImg ? coverImg.src : '';

      // الوصف - البحث عن أول فقرة طويلة
      let description = '';
      const paragraphs = document.querySelectorAll('p');
      paragraphs.forEach((p) => {
        const text = p.textContent?.trim() || '';
        if (text.length > 100 && !description) {
          description = text;
        }
      });

      // التصنيفات والأنواع
      const genres: string[] = [];
      let status = 'مستمرة';
      let type = 'مانها';
      let author = 'غير معروف';

      const allLinks = document.querySelectorAll('a');
      allLinks.forEach((link) => {
        const text = link.textContent?.trim() || '';
        
        if (text === 'مكتملة' || text === 'مستمرة') {
          status = text;
        } else if (text.includes('مانها') || text.includes('مانجا') || text.includes('مانهوا')) {
          type = text;
        } else if (text && text.length > 2 && text.length < 20 && !text.includes('الفصل')) {
          // قد يكون نوع أو مؤلف
          if (genres.length < 10 && !genres.includes(text)) {
            genres.push(text);
          }
        }
      });

      return {
        title,
        coverImage,
        description,
        status,
        type,
        author,
        genres,
      };
    });

    await page.close();

    return {
      ...mangaData,
      titleAr: mangaData.title,
      slug,
      rating: 0,
    };
  } catch (error) {
    await page.close();
    console.error(`Error scraping manga details for ${slug}:`, error);
    return null;
  }
}

/**
 * سحب قائمة الفصول لمانجا معينة
 */
export async function scrapeOlympusChapters(slug: string): Promise<OlympusChapter[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    const url = `https://olympustaff.com/series/${slug}`;
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // التمرير لأسفل لتحميل الفصول
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(1000);

    // استخراج الفصول
    const chapters = await page.evaluate((mangaSlug: string) => {
      const results: any[] = [];
      const links = document.querySelectorAll('a');

      links.forEach((link: any) => {
        const href = link.getAttribute('href');
        if (!href || !href.includes(`/series/${mangaSlug}/`)) return;

        const parts = href.split('/').filter((p: string) => p);
        const chapterNumber = parseInt(parts[parts.length - 1]);

        if (chapterNumber && !isNaN(chapterNumber)) {
          const text = link.textContent?.trim() || '';
          const title = text.replace(/\d+/g, '').trim() || `الفصل ${chapterNumber}`;

          results.push({
            number: chapterNumber,
            title,
            url: href,
            publishedAt: new Date().toISOString(),
          });
        }
      });

      // إزالة التكرارات وترتيب
      const unique = results.filter(
        (item, index, self) => index === self.findIndex((t) => t.number === item.number)
      );
      unique.sort((a, b) => a.number - b.number);

      return unique;
    }, slug);

    await page.close();

    return chapters.map((ch: any) => ({
      ...ch,
      publishedAt: new Date(ch.publishedAt),
    }));
  } catch (error) {
    await page.close();
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
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    const url = `https://olympustaff.com/series/${slug}/${chapterNumber}`;
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // التمرير لأسفل لتحميل جميع الصور
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    await page.waitForTimeout(2000);

    // استخراج الصور
    const pages = await page.evaluate(() => {
      const results: any[] = [];
      const images = document.querySelectorAll('img[alt="image of episode"]');

      images.forEach((img: any, index: number) => {
        if (img.src && img.src.startsWith('http')) {
          results.push({
            number: index + 1,
            imageUrl: img.src,
          });
        }
      });

      return results;
    });

    await page.close();
    return pages;
  } catch (error) {
    await page.close();
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
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://olympustaff.com/',
      },
      timeout: 30000,
    });

    const buffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'image/jpeg';

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
 */
export async function importMangaFromOlympus(
  slug: string,
  maxChapters?: number
): Promise<{
  manga: OlympusManga;
  chapters: Array<{ chapter: OlympusChapter; pages: OlympusPage[] }>;
}> {
  console.log(`[Olympus Scraper] Starting import for manga: ${slug}`);

  // 1. سحب تفاصيل المانجا
  const manga = await scrapeOlympusMangaDetails(slug);
  if (!manga) {
    throw new Error(`Failed to scrape manga details for ${slug}`);
  }

  console.log(`[Olympus Scraper] Manga details scraped: ${manga.title}`);

  // 2. تحميل صورة الغلاف
  if (manga.coverImage && manga.coverImage.startsWith('http')) {
    try {
      const coverFilename = `manga-covers/${slug}-${Date.now()}.jpg`;
      manga.coverImage = await downloadAndUploadImage(manga.coverImage, coverFilename);
      console.log(`[Olympus Scraper] Cover image uploaded`);
    } catch (error) {
      console.error('[Olympus Scraper] Failed to upload cover image:', error);
    }
  }

  // 3. سحب قائمة الفصول
  let chapters = await scrapeOlympusChapters(slug);
  console.log(`[Olympus Scraper] Found ${chapters.length} chapters`);

  if (maxChapters && chapters.length > maxChapters) {
    chapters = chapters.slice(0, maxChapters);
    console.log(`[Olympus Scraper] Limited to ${maxChapters} chapters`);
  }

  // 4. سحب صفحات كل فصل
  const chaptersWithPages: Array<{ chapter: OlympusChapter; pages: OlympusPage[] }> = [];

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    console.log(`[Olympus Scraper] Scraping chapter ${chapter.number} (${i + 1}/${chapters.length})...`);

    try {
      const pages = await scrapeOlympusChapterPages(slug, chapter.number);
      console.log(`[Olympus Scraper] Found ${pages.length} pages`);

      // تحميل صور الصفحات
      const uploadedPages: OlympusPage[] = [];
      for (const page of pages) {
        try {
          const pageFilename = `manga-pages/${slug}/ch${chapter.number}/p${page.number}-${Date.now()}.jpg`;
          const uploadedUrl = await downloadAndUploadImage(page.imageUrl, pageFilename);
          uploadedPages.push({
            number: page.number,
            imageUrl: uploadedUrl,
          });
        } catch (error) {
          console.error(`[Olympus Scraper] Failed to upload page ${page.number}:`, error);
        }
      }

      chaptersWithPages.push({
        chapter,
        pages: uploadedPages,
      });

      // تأخير بين الفصول
      if (i < chapters.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`[Olympus Scraper] Failed to scrape chapter ${chapter.number}:`, error);
    }
  }

  console.log(`[Olympus Scraper] Import completed for manga: ${slug}`);

  return {
    manga,
    chapters: chaptersWithPages,
  };
}
