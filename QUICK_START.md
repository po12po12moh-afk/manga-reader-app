# دليل البدء السريع 🚀

## تشغيل التطبيق محلياً

```bash
# تثبيت المكتبات
pnpm install

# تشغيل التطبيق في وضع التطوير
pnpm dev

# الوصول للتطبيق
# افتح المتصفح على: http://localhost:3000
```

---

## بناء APK للأندرويد

### المتطلبات:
- ✅ JDK 17 أو أحدث
- ✅ Android Studio
- ✅ Node.js 18+

### السكريبتات المتاحة:

```bash
# 1. بناء التطبيق ومزامنة مع Android
pnpm android:build

# 2. فتح المشروع في Android Studio
pnpm android:open

# 3. بناء APK للاختبار (Debug)
pnpm android:debug

# 4. بناء APK للنشر (Release)
pnpm android:release

# 5. تنظيف البناء
pnpm android:clean

# 6. بناء كامل (Build + Sync + Release APK)
pnpm android:full-build
```

---

## الخطوات السريعة لبناء APK:

### 1. بناء ومزامنة:
```bash
pnpm android:build
```

### 2. فتح في Android Studio:
```bash
pnpm android:open
```

### 3. في Android Studio:
- اذهب إلى: **Build → Generate Signed Bundle / APK**
- اختر **APK**
- أنشئ keystore جديد (أول مرة فقط)
- اختر **release** variant
- اضغط **Finish**

### 4. العثور على APK:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## إعداد Firebase للإشعارات

### 1. إنشاء مشروع Firebase:
- اذهب إلى: https://console.firebase.google.com
- اضغط "Add project"
- اتبع الخطوات

### 2. إضافة Android App:
- في Firebase Console: Add app → Android
- أدخل package name: `com.mangareader.app` (أو حسب اختيارك)
- حمّل `google-services.json`
- ضعه في `android/app/`

### 3. الحصول على Service Account:
- Firebase Console → Project Settings → Service Accounts
- اضغط "Generate new private key"
- حمّل ملف JSON

### 4. إضافة Credentials:
- افتح التطبيق واذهب إلى `/firebase-setup`
- ارفع ملف JSON أو الصقه
- اتبع التعليمات لإضافته كـ environment variable

---

## قاعدة البيانات

### تطبيق التغييرات على قاعدة البيانات:
```bash
pnpm db:push
```

### إضافة بيانات تجريبية:
```bash
npx tsx seed-data.ts
```

---

## البنية الأساسية

```
mobile-auth-app/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/      # صفحات التطبيق
│   │   ├── components/ # مكونات قابلة لإعادة الاستخدام
│   │   └── lib/        # مكتبات مساعدة
│   └── public/         # ملفات ثابتة
├── server/             # Backend (Express + tRPC)
│   ├── routers.ts      # API endpoints
│   ├── db.ts           # دوال قاعدة البيانات
│   └── scraper/        # نظام Web Scraping
├── drizzle/            # Database schema
├── android/            # مشروع Android (Capacitor)
└── BUILD_APK_GUIDE.md  # دليل مفصل لبناء APK
```

---

## الميزات الرئيسية

✅ **PWA** - قابل للتثبيت على الهواتف  
✅ **Web Scraping** - سحب المحتوى من olympustaff.com  
✅ **Firebase FCM** - إشعارات Push  
✅ **Capacitor** - تحويل إلى APK  
✅ **تسجيل الدخول** - نظام مصادقة كامل  
✅ **المفضلة** - حفظ المانجا المفضلة  
✅ **سجل القراءة** - تتبع التقدم  
✅ **لوحة التحكم** - إدارة المحتوى  

---

## المشاكل الشائعة

### المشكلة: `JAVA_HOME not set`
```bash
# Windows
setx JAVA_HOME "C:\Program Files\Java\jdk-17"

# Mac/Linux
export JAVA_HOME=/path/to/jdk-17
```

### المشكلة: `SDK not found`
1. افتح Android Studio
2. Tools → SDK Manager
3. ثبّت Android SDK Platform 34

### المشكلة: `Build failed`
```bash
pnpm android:clean
pnpm android:build
```

---

## روابط مفيدة

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Firebase Console**: https://console.firebase.google.com
- **Google Play Console**: https://play.google.com/console
- **Android Studio**: https://developer.android.com/studio

---

## الدعم

للمزيد من التفاصيل، راجع:
- `BUILD_APK_GUIDE.md` - دليل شامل لبناء APK
- `BUILD_APK_GUIDE_v2.md` - نسخة محسّنة من الدليل

---

**بالتوفيق! 🎉**
