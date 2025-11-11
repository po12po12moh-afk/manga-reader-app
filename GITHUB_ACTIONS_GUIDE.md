# دليل بناء APK باستخدام GitHub Actions 🤖

تم إعداد المشروع للبناء التلقائي على GitHub Actions. كل مرة ترفع فيها تحديث، سيتم بناء APK تلقائياً!

---

## كيف يعمل؟

عند كل `git push` للمشروع، GitHub Actions سيقوم بـ:
1. ✅ تثبيت المكتبات
2. ✅ بناء التطبيق الويب
3. ✅ مزامنة Capacitor
4. ✅ بناء APK للأندرويد
5. ✅ رفع APK كـ Artifact

---

## تحميل APK المبني

### الطريقة 1: من صفحة Actions
1. اذهب إلى: https://github.com/po12po12moh-afk/manga-reader-app/actions
2. اضغط على آخر workflow run (الأخضر ✓)
3. انزل للأسفل إلى قسم "Artifacts"
4. حمّل `manga-reader-debug.apk`
5. ثبّته على هاتفك!

### الطريقة 2: من Releases (قريباً)
سنضيف نظام Releases تلقائي لتسهيل التحميل.

---

## تشغيل البناء يدوياً

1. اذهب إلى: https://github.com/po12po12moh-afk/manga-reader-app/actions
2. اضغط على "Build Android APK" من القائمة اليسرى
3. اضغط "Run workflow" → "Run workflow"
4. انتظر 5-10 دقائق
5. حمّل APK من Artifacts

---

## أنواع APK المبنية

### Debug APK
- ✅ جاهز للتثبيت مباشرة
- ✅ لا يحتاج توقيع
- ✅ مناسب للاختبار
- ❌ حجم أكبر قليلاً
- ❌ لا يمكن نشره على Google Play

**الملف:** `manga-reader-debug.apk`

### Release APK (غير موقّع)
- ⚠️ يحتاج توقيع قبل التثبيت
- ✅ حجم أصغر
- ✅ أداء أفضل
- ✅ جاهز للنشر بعد التوقيع

**الملف:** `manga-reader-release-unsigned.apk`

---

## توقيع Release APK للنشر

لنشر التطبيق على Google Play، تحتاج توقيع Release APK:

### 1. إنشاء Keystore (مرة واحدة فقط)
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias manga-reader -keyalg RSA -keysize 2048 -validity 10000
```

### 2. إضافة Keystore كـ GitHub Secret
1. اذهب إلى: Settings → Secrets and variables → Actions
2. أضف هذه Secrets:
   - `KEYSTORE_FILE`: محتوى keystore (base64)
   - `KEYSTORE_PASSWORD`: كلمة مرور keystore
   - `KEY_ALIAS`: اسم alias (مثلاً: manga-reader)
   - `KEY_PASSWORD`: كلمة مرور key

### 3. تحديث Workflow
سنضيف خطوة التوقيع التلقائي لاحقاً.

---

## حل المشاكل الشائعة

### ❌ Build failed
- تحقق من Logs في صفحة Actions
- غالباً المشكلة في dependencies

### ❌ APK لا يعمل
- تأكد أنك حمّلت Debug APK
- فعّل "Install from unknown sources" على هاتفك

### ❌ Workflow لا يعمل
- تحقق من أن Actions مفعّل في Settings → Actions

---

## تحديثات مستقبلية

سنضيف:
- ✅ توقيع تلقائي لـ Release APK
- ✅ رفع APK تلقائي على Releases
- ✅ إشعارات عند اكتمال البناء
- ✅ نسخ متعددة (arm64, x86, universal)

---

## روابط مفيدة

- **Repository**: https://github.com/po12po12moh-afk/manga-reader-app
- **Actions**: https://github.com/po12po12moh-afk/manga-reader-app/actions
- **Issues**: https://github.com/po12po12moh-afk/manga-reader-app/issues

---

**استمتع بتطبيقك! 🎉**
