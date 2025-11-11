# دليل بناء تطبيق APK - مانجا ريدر

هذا الدليل يشرح خطوة بخطوة كيفية تحويل تطبيق الويب إلى تطبيق Android (APK) ونشره على Google Play Store.

---

## المتطلبات الأساسية

### 1. البرامج المطلوبة على جهازك:

#### أ) **Java Development Kit (JDK)**
- **الإصدار المطلوب**: JDK 17 أو أحدث
- **التحميل**: [https://www.oracle.com/java/technologies/downloads/](https://www.oracle.com/java/technologies/downloads/)
- **التثبيت**:
  1. قم بتحميل JDK 17 أو أحدث
  2. قم بتثبيته على جهازك
  3. تأكد من إضافة `JAVA_HOME` إلى متغيرات البيئة

**التحقق من التثبيت:**
```bash
java -version
# يجب أن يظهر: java version "17.x.x" أو أحدث
```

#### ب) **Android Studio**
- **التحميل**: [https://developer.android.com/studio](https://developer.android.com/studio)
- **الحجم**: حوالي 1 GB للتحميل + 3-4 GB بعد التثبيت
- **التثبيت**:
  1. قم بتحميل Android Studio
  2. قم بتثبيته (اختر التثبيت القياسي "Standard")
  3. عند أول تشغيل، سيقوم بتحميل Android SDK تلقائياً
  4. انتظر حتى ينتهي من تحميل جميع المكونات

**المكونات المطلوبة في Android Studio:**
- Android SDK Platform 34 (أو أحدث)
- Android SDK Build-Tools
- Android SDK Platform-Tools
- Android SDK Command-line Tools
- Android Emulator (اختياري للاختبار)

**التحقق من التثبيت:**
```bash
# في Command Prompt أو Terminal
adb --version
# يجب أن يظهر إصدار ADB
```

#### ج) **Node.js و npm**
- **الإصدار المطلوب**: Node.js 18 أو أحدث
- **التحميل**: [https://nodejs.org/](https://nodejs.org/)
- **التحقق**:
```bash
node --version
npm --version
```

#### د) **Git** (اختياري لكن موصى به)
- **التحميل**: [https://git-scm.com/downloads](https://git-scm.com/downloads)

---

## الخطوات التفصيلية

### الخطوة 1: تحميل المشروع

1. قم بتحميل جميع ملفات المشروع من لوحة التحكم
2. فك الضغط عن الملفات في مجلد على جهازك (مثلاً: `C:\manga-reader`)

### الخطوة 2: تثبيت المكتبات

افتح Terminal أو Command Prompt في مجلد المشروع:

```bash
cd C:\manga-reader  # أو المسار الذي اخترته

# تثبيت المكتبات
npm install

# أو إذا كنت تستخدم pnpm
pnpm install
```

### الخطوة 3: بناء التطبيق للإنتاج

```bash
# بناء الواجهة الأمامية
npm run build

# أو
pnpm build
```

هذا الأمر سينشئ مجلد `client/dist` يحتوي على ملفات التطبيق المحسّنة.

### الخطوة 4: مزامنة Capacitor

```bash
# مزامنة الملفات مع مشروع Android
npx cap sync android
```

هذا الأمر سينسخ ملفات التطبيق إلى مجلد `android/`.

### الخطوة 5: فتح المشروع في Android Studio

```bash
# فتح المشروع في Android Studio
npx cap open android
```

أو يمكنك فتح Android Studio يدوياً واختيار:
- File → Open
- اختر مجلد `android` داخل مشروعك

### الخطوة 6: إعداد التوقيع (Signing)

لنشر التطبيق على Google Play، تحتاج لتوقيع التطبيق:

#### أ) إنشاء Keystore:

في Android Studio:
1. اذهب إلى: **Build** → **Generate Signed Bundle / APK**
2. اختر **APK**
3. اضغط **Create new...** لإنشاء keystore جديد
4. املأ البيانات:
   - **Key store path**: اختر مكان حفظ الملف (مثلاً: `manga-reader-key.jks`)
   - **Password**: كلمة مرور قوية (احفظها جيداً!)
   - **Key alias**: `manga-reader`
   - **Key password**: نفس كلمة المرور أو كلمة مرور أخرى
   - **Validity**: 25 سنة (أو أكثر)
   - **First and Last Name**: اسمك أو اسم الشركة
   - **Organization**: اسم المؤسسة (اختياري)
   - **Country Code**: SA (للسعودية)

⚠️ **مهم جداً**: احفظ ملف `.jks` وكلمات المرور في مكان آمن! إذا فقدتها لن تستطيع تحديث التطبيق على Google Play.

#### ب) تكوين ملف `gradle.properties`:

أضف هذه الأسطر إلى ملف `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=../manga-reader-key.jks
MYAPP_UPLOAD_KEY_ALIAS=manga-reader
MYAPP_UPLOAD_STORE_PASSWORD=كلمة_المرور_هنا
MYAPP_UPLOAD_KEY_PASSWORD=كلمة_المرور_هنا
```

⚠️ **تحذير أمني**: لا ترفع هذا الملف على GitHub أو أي مكان عام!

### الخطوة 7: بناء APK

في Android Studio:

#### للاختبار (Debug APK):
1. اذهب إلى: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. انتظر حتى ينتهي البناء
3. ستجد الملف في: `android/app/build/outputs/apk/debug/app-debug.apk`

#### للنشر (Release APK):
1. اذهب إلى: **Build** → **Generate Signed Bundle / APK**
2. اختر **APK**
3. اختر الـ keystore الذي أنشأته
4. أدخل كلمات المرور
5. اختر **release** build variant
6. اضغط **Finish**
7. ستجد الملف في: `android/app/build/outputs/apk/release/app-release.apk`

### الخطوة 8: اختبار APK

قبل النشر، اختبر التطبيق:

1. **على هاتفك الحقيقي**:
   - انقل ملف APK إلى هاتفك
   - قم بتثبيته (قد تحتاج تفعيل "مصادر غير معروفة")
   - اختبر جميع الميزات

2. **على المحاكي (Emulator)**:
   - في Android Studio: **Tools** → **Device Manager**
   - أنشئ جهاز افتراضي
   - شغّل التطبيق عليه

---

## النشر على Google Play Store

### متطلبات Google Play:

1. **حساب مطور Google Play**:
   - التكلفة: $25 دفعة واحدة (مدى الحياة)
   - التسجيل: [https://play.google.com/console](https://play.google.com/console)

2. **Android App Bundle (AAB)** بدلاً من APK:
   - Google Play يفضل AAB على APK
   - لبناء AAB:
     ```bash
     # في Android Studio
     Build → Generate Signed Bundle / APK → Android App Bundle
     ```
   - ستجد الملف في: `android/app/build/outputs/bundle/release/app-release.aab`

3. **محتوى مطلوب للنشر**:
   - **أيقونة التطبيق**: 512x512 بكسل (PNG)
   - **صور الشاشة**: على الأقل 2 صورة (1080x1920 أو أكبر)
   - **وصف قصير**: حتى 80 حرف
   - **وصف كامل**: حتى 4000 حرف
   - **صورة مميزة**: 1024x500 بكسل
   - **فئة التطبيق**: Books & Reference أو Entertainment
   - **تقييم المحتوى**: املأ استبيان التقييم
   - **سياسة الخصوصية**: رابط لصفحة سياسة الخصوصية

### خطوات النشر:

1. سجّل دخول إلى [Google Play Console](https://play.google.com/console)
2. اضغط **Create app**
3. املأ البيانات الأساسية
4. ارفع ملف AAB
5. املأ جميع المعلومات المطلوبة
6. أرسل للمراجعة
7. انتظر الموافقة (عادة 1-3 أيام)

---

## حل المشاكل الشائعة

### المشكلة 1: "JAVA_HOME is not set"
**الحل**:
```bash
# Windows
setx JAVA_HOME "C:\Program Files\Java\jdk-17"

# Mac/Linux
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

### المشكلة 2: "SDK location not found"
**الحل**:
أنشئ ملف `android/local.properties`:
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

### المشكلة 3: "Build failed"
**الحل**:
1. نظّف المشروع: **Build** → **Clean Project**
2. أعد البناء: **Build** → **Rebuild Project**
3. تأكد من تحديث Gradle

### المشكلة 4: التطبيق يتعطل عند التشغيل
**الحل**:
1. افتح **Logcat** في Android Studio
2. ابحث عن رسائل الخطأ (Error)
3. تأكد من أن جميع الأذونات مضافة في `AndroidManifest.xml`

---

## الأذونات المطلوبة

تأكد من إضافة هذه الأذونات في `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

---

## تحسينات موصى بها

### 1. تغيير الأيقونة:
- استخدم أداة: [https://icon.kitchen/](https://icon.kitchen/)
- ارفع شعار التطبيق
- حمّل جميع الأحجام
- استبدل الملفات في: `android/app/src/main/res/mipmap-*/`

### 2. تغيير Splash Screen:
- عدّل الملف: `android/app/src/main/res/drawable/splash.xml`
- أو استخدم plugin: `@capacitor/splash-screen`

### 3. تحسين الأداء:
- فعّل ProGuard للتشويش والتصغير
- قلل حجم الصور
- استخدم lazy loading

---

## الأوامر المفيدة

```bash
# بناء التطبيق
npm run build

# مزامنة مع Android
npx cap sync android

# فتح في Android Studio
npx cap open android

# تحديث Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest

# تنظيف البناء
cd android && ./gradlew clean

# بناء من Terminal
cd android && ./gradlew assembleRelease
```

---

## روابط مفيدة

- **Capacitor Docs**: [https://capacitorjs.com/docs](https://capacitorjs.com/docs)
- **Android Developer**: [https://developer.android.com](https://developer.android.com)
- **Google Play Console**: [https://play.google.com/console](https://play.google.com/console)
- **App Icon Generator**: [https://icon.kitchen/](https://icon.kitchen/)
- **Splash Screen Generator**: [https://apetools.webprofusion.com/app/#/tools/imagegorilla](https://apetools.webprofusion.com/app/#/tools/imagegorilla)

---

## ملاحظات مهمة

1. **حجم التطبيق**: التطبيق النهائي سيكون حوالي 10-20 MB
2. **الإصدار الأدنى**: Android 5.0 (API 21) أو أحدث
3. **التحديثات**: لتحديث التطبيق، زِد رقم الإصدار في `android/app/build.gradle`:
   ```gradle
   versionCode 2
   versionName "1.1"
   ```

4. **الاختبار**: اختبر التطبيق جيداً قبل النشر على Google Play

---

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من Logcat في Android Studio
2. ابحث عن الخطأ في Google أو Stack Overflow
3. راجع Capacitor Documentation
4. تواصل مع مجتمع Capacitor على Discord

---

**بالتوفيق! 🚀**
