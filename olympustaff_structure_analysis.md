# تحليل بنية موقع olympustaff.com (Team-X)

## معلومات عامة
- **الموقع**: https://olympustaff.com
- **النوع**: موقع مانجا عربي
- **الفريق**: Team-X لترجمة المانجا والمانهوا

---

## 1. الصفحة الرئيسية (Homepage)
**URL**: `https://olympustaff.com/`

### بنية HTML:
- **روابط المانجا**: `<a href="/series/{slug}">`
- **صور الأغلفة**: `<img alt="{manga-title}"/>`
- **العناصر الرئيسية**:
  - قسم "الأكثر مشاهدة" يحتوي على بطاقات المانجا
  - كل بطاقة تحتوي على صورة الغلاف ورابط للمانجا

### CSS Selectors المقترحة:
```javascript
// قائمة المانجا
const mangaLinks = document.querySelectorAll('a[href*="/series/"]');

// الصور
const images = document.querySelectorAll('img[alt]');

// استخراج البيانات
mangaLinks.forEach(link => {
  const href = link.getAttribute('href'); // /series/martial-peak
  const img = link.querySelector('img');
  const title = img ? img.alt : '';
  const coverImage = img ? img.src : '';
});
```

---

## 2. صفحة تفاصيل المانجا
**URL Pattern**: `https://olympustaff.com/series/{slug}`
**مثال**: `https://olympustaff.com/series/martial-peak`

### العناصر الموجودة:
1. **صورة الغلاف**: `<img alt="Manga Image"/>`
2. **العنوان**: يظهر في `<title>` و في الصفحة
3. **التصنيفات**: روابط مثل `<a>مانها صيني</a>`, `<a>مستمرة</a>`
4. **الأنواع (Genres)**: `<a>أكشن</a>`, `<a>خيال</a>`, `<a>دموي</a>`, إلخ
5. **الرسام**: `<a>PIKAPI</a>`
6. **الوصف**: نص طويل يصف القصة
7. **عدد الفصول**: `الفصول (3851)`
8. **أزرار**: "الفصل الاول", "فصل جديد"

### بنية قائمة الفصول:
- **بطاقات الفصول**: تحتوي على:
  - صورة مصغرة للفصل
  - رقم الفصل: `الفصل 3756`
  - عنوان الفصل: `ماذا لو؟`
  - عدد المشاهدات: `32,620`
  - تاريخ النشر: `1 year ago`

### CSS Selectors المقترحة:
```javascript
// العنوان
const title = document.querySelector('title').textContent.split(' - ')[0];

// صورة الغلاف
const coverImage = document.querySelector('img[alt="Manga Image"]')?.src;

// الوصف
const description = document.querySelector('p')?.textContent; // أول فقرة طويلة

// التصنيفات والأنواع
const genres = [];
document.querySelectorAll('a').forEach(link => {
  const text = link.textContent.trim();
  if (text && text.length < 20 && !text.includes('الفصل')) {
    genres.push(text);
  }
});

// قائمة الفصول
const chapters = [];
document.querySelectorAll('a[href*="/series/"][href*="/3"]').forEach(link => {
  const href = link.getAttribute('href'); // /series/martial-peak/3756
  const parts = href.split('/');
  const chapterNumber = parseInt(parts[parts.length - 1]);
  
  if (chapterNumber) {
    chapters.push({
      number: chapterNumber,
      url: href,
      title: link.textContent.trim()
    });
  }
});
```

---

## 3. صفحة القراءة (Chapter Reader)
**URL Pattern**: `https://olympustaff.com/series/{slug}/{chapter_number}`
**مثال**: `https://olympustaff.com/series/martial-peak/3756`

### العناصر الموجودة:
1. **عنوان الفصل**: `ماذا لو؟`
2. **رقم الفصل**: `فصل رقم : 3756`
3. **أزرار التنقل**:
   - "الرجوع الى المانجا"
   - "جميع الصور"
   - "التبليغ عن الفصل"
4. **قائمة الفصول**: `<select>` dropdown
5. **صفحات الفصل**: `<img alt="image of episode"/>`

### بنية الصور:
- جميع صور الفصل تستخدم نفس alt text: `"image of episode"`
- الصور مرتبة عمودياً
- كل صورة تمثل صفحة واحدة من الفصل

### CSS Selectors المقترحة:
```javascript
// عنوان الفصل
const chapterTitle = document.querySelector('title').textContent.split('|')[0].trim();

// جميع صور الفصل
const pages = [];
document.querySelectorAll('img[alt="image of episode"]').forEach((img, index) => {
  pages.push({
    number: index + 1,
    imageUrl: img.src
  });
});

// رقم الفصل من URL
const url = window.location.href;
const chapterNumber = parseInt(url.split('/').pop());
```

---

## 4. ملاحظات مهمة

### التحديات:
1. **JavaScript Rendering**: الموقع يستخدم JavaScript لتحميل المحتوى، لذا قد نحتاج `puppeteer` بدلاً من `cheerio`
2. **Anti-Scraping**: قد يكون هناك حماية ضد السحب المتكرر
3. **الصور**: بعض الصور قد تكون محمية أو تحتاج Referer header

### الحلول المقترحة:
1. استخدام `puppeteer` للصفحات التي تعتمد على JavaScript
2. إضافة delays بين الطلبات (1-2 ثانية)
3. استخدام User-Agent و Referer headers مناسبة
4. حفظ الصور على S3 فوراً بعد تحميلها

---

## 5. CSS Selectors النهائية للـ Scraper

### للصفحة الرئيسية:
```typescript
// قائمة المانجا
const mangaLinks = await page.$$eval('a[href*="/series/"]', links => 
  links.map(link => ({
    slug: link.href.split('/').pop(),
    title: link.querySelector('img')?.alt || '',
    coverImage: link.querySelector('img')?.src || ''
  }))
);
```

### لصفحة التفاصيل:
```typescript
// استخراج جميع البيانات
const mangaData = await page.evaluate(() => {
  const title = document.querySelector('title')?.textContent.split(' - ')[0] || '';
  const coverImage = document.querySelector('img[alt="Manga Image"]')?.src || '';
  
  // الوصف - أول فقرة طويلة
  let description = '';
  document.querySelectorAll('p').forEach(p => {
    if (p.textContent.length > 100 && !description) {
      description = p.textContent.trim();
    }
  });
  
  // التصنيفات
  const genres = Array.from(document.querySelectorAll('a'))
    .map(a => a.textContent.trim())
    .filter(text => text && text.length < 20 && !text.includes('الفصل'));
  
  return { title, coverImage, description, genres };
});
```

### لصفحة القراءة:
```typescript
// استخراج صفحات الفصل
const pages = await page.$$eval('img[alt="image of episode"]', imgs =>
  imgs.map((img, index) => ({
    number: index + 1,
    imageUrl: img.src
  }))
);
```

---

## 6. خطة التنفيذ

1. **تحديث olympusstaffScraper.ts**:
   - استبدال `axios + cheerio` بـ `puppeteer`
   - تحديث جميع CSS selectors
   - إضافة error handling أفضل

2. **اختبار السحب**:
   - اختبار سحب مانجا واحدة كاملة
   - التحقق من جودة الصور
   - التأكد من حفظ البيانات بشكل صحيح

3. **تحسينات**:
   - إضافة progress tracking
   - إضافة retry logic للطلبات الفاشلة
   - تحسين سرعة السحب مع الحفاظ على الأمان
