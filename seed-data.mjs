import { drizzle } from "drizzle-orm/mysql2";
import { manga, genres, mangaGenres, chapters, pages } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seedData() {
  console.log("Starting to seed data...");

  try {
    // Insert genres
    console.log("Inserting genres...");
    const genreData = [
      { name: "Action", nameAr: "أكشن" },
      { name: "Romance", nameAr: "رومانسي" },
      { name: "Fantasy", nameAr: "خيال" },
      { name: "Drama", nameAr: "دراما" },
      { name: "Comedy", nameAr: "كوميدي" },
      { name: "Adventure", nameAr: "مغامرة" },
      { name: "Supernatural", nameAr: "خارق للطبيعة" },
      { name: "School Life", nameAr: "حياة مدرسية" },
    ];

    for (const genre of genreData) {
      await db.insert(genres).values(genre);
    }

    // Insert manga
    console.log("Inserting manga...");
    const mangaData = [
      {
        title: "Solo Leveling",
        titleAr: "الارتقاء الفردي",
        description: "In a world where hunters fight monsters, Sung Jin-Woo is the weakest. But after a mysterious event, he gains the power to level up infinitely.",
        descriptionAr: "في عالم يقاتل فيه الصيادون الوحوش، سونغ جين وو هو الأضعف. لكن بعد حدث غامض، يكتسب القدرة على الارتقاء بلا حدود.",
        coverImage: "https://placehold.co/400x600/6366F1/FFFFFF?text=Solo+Leveling",
        author: "Chugong",
        artist: "DUBU",
        status: "completed",
        type: "manhwa",
        rating: 4.8,
        views: 1500000,
      },
      {
        title: "Tower of God",
        titleAr: "برج الإله",
        description: "Bam enters the Tower to find his friend Rachel. To reunite with her, he must climb the mysterious Tower.",
        descriptionAr: "يدخل بام البرج للعثور على صديقته راشيل. لإعادة الاتصال بها، يجب عليه تسلق البرج الغامض.",
        coverImage: "https://placehold.co/400x600/8B5CF6/FFFFFF?text=Tower+of+God",
        author: "SIU",
        artist: "SIU",
        status: "ongoing",
        type: "manhwa",
        rating: 4.7,
        views: 1200000,
      },
      {
        title: "The Beginning After The End",
        titleAr: "البداية بعد النهاية",
        description: "King Grey has unrivaled strength, but solitude lingers behind. Reincarnated into a new world filled with magic, he gets a second chance.",
        descriptionAr: "الملك جراي لديه قوة لا مثيل لها، لكن الوحدة تلوح في الأفق. يتناسخ في عالم جديد مليء بالسحر، يحصل على فرصة ثانية.",
        coverImage: "https://placehold.co/400x600/EC4899/FFFFFF?text=TBATE",
        author: "TurtleMe",
        artist: "Fuyuki23",
        status: "ongoing",
        type: "manhwa",
        rating: 4.9,
        views: 980000,
      },
      {
        title: "Omniscient Reader",
        titleAr: "القارئ العليم",
        description: "Dokja Kim is an ordinary office worker whose only joy is reading his favorite web novel. One day, the novel becomes reality.",
        descriptionAr: "دوكجا كيم موظف مكتب عادي وفرحته الوحيدة هي قراءة روايته الإلكترونية المفضلة. في يوم من الأيام، تصبح الرواية حقيقة.",
        coverImage: "https://placehold.co/400x600/10B981/FFFFFF?text=ORV",
        author: "Sing Shong",
        artist: "Sleepy-C",
        status: "ongoing",
        type: "manhwa",
        rating: 4.8,
        views: 850000,
      },
      {
        title: "The God of High School",
        titleAr: "إله المدرسة الثانوية",
        description: "A tournament to determine the strongest fighter among high school students. The winner gets any wish granted.",
        descriptionAr: "بطولة لتحديد أقوى مقاتل بين طلاب المدرسة الثانوية. الفائز يحصل على أي أمنية.",
        coverImage: "https://placehold.co/400x600/F59E0B/FFFFFF?text=GOH",
        author: "Yongje Park",
        artist: "Yongje Park",
        status: "completed",
        type: "manhwa",
        rating: 4.6,
        views: 750000,
      },
      {
        title: "Noblesse",
        titleAr: "النبلاء",
        description: "Cadis Etrama Di Raizel, a noble vampire, awakens after 820 years of slumber in modern-day South Korea.",
        descriptionAr: "كاديس إيتراما دي رايزل، مصاص دماء نبيل، يستيقظ بعد 820 عامًا من السبات في كوريا الجنوبية الحديثة.",
        coverImage: "https://placehold.co/400x600/EF4444/FFFFFF?text=Noblesse",
        author: "Son Jeho",
        artist: "Lee Kwangsu",
        status: "completed",
        type: "manhwa",
        rating: 4.7,
        views: 680000,
      },
    ];

    const insertedMangaIds = [];
    for (const m of mangaData) {
      const result = await db.insert(manga).values(m);
      insertedMangaIds.push(result[0].insertId);
    }

    // Assign genres to manga
    console.log("Assigning genres to manga...");
    const genreAssignments = [
      { mangaIndex: 0, genreIds: [1, 3, 6] }, // Solo Leveling: Action, Fantasy, Supernatural
      { mangaIndex: 1, genreIds: [1, 3, 6] }, // Tower of God: Action, Fantasy, Supernatural
      { mangaIndex: 2, genreIds: [1, 3, 6] }, // TBATE: Action, Fantasy, Supernatural
      { mangaIndex: 3, genreIds: [1, 3, 6] }, // ORV: Action, Fantasy, Supernatural
      { mangaIndex: 4, genreIds: [1, 5, 8] }, // GOH: Action, Comedy, School Life
      { mangaIndex: 5, genreIds: [1, 6, 7] }, // Noblesse: Action, Adventure, Supernatural
    ];

    for (const assignment of genreAssignments) {
      for (const genreId of assignment.genreIds) {
        await db.insert(mangaGenres).values({
          mangaId: insertedMangaIds[assignment.mangaIndex],
          genreId: genreId,
        });
      }
    }

    // Add chapters for first manga
    console.log("Adding chapters...");
    for (let i = 1; i <= 5; i++) {
      const chapterResult = await db.insert(chapters).values({
        mangaId: insertedMangaIds[0],
        chapterNumber: i,
        title: `Chapter ${i}`,
        titleAr: `الفصل ${i}`,
        views: Math.floor(Math.random() * 50000) + 10000,
      });

      // Add pages for this chapter
      const chapterId = chapterResult[0].insertId;
      for (let p = 1; p <= 20; p++) {
        await db.insert(pages).values({
          chapterId: chapterId,
          pageNumber: p,
          imageUrl: `https://placehold.co/800x1200/6366F1/FFFFFF?text=Ch${i}+P${p}`,
        });
      }
    }

    console.log("Data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}

seedData()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
