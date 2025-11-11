# دليل بناء تطبيق APK للأندرويد - نسخة محسّنة 📱

هذا الدليل الشامل يشرح كيفية تحويل تطبيق قراءة المانهوا إلى تطبيق Android APK ونشره على Google Play Store.

---

## الجزء الأول: المتطلبات والإعداد 🛠️

### 1. Java Development Kit (JDK) 17
**رابط التحميل**: https://www.oracle.com/java/technologies/downloads/#java17

**خطوات التثبيت:**
1. حمّل ملف التثبيت المناسب لنظامك
2. شغّل الملف واتبع التعليمات
3. تأكد من إضافة JDK إلى PATH

**التحقق:**
```bash
java -version
# يجب أن يظهر: java version "17.x.x"
```

---

### 2. Android Studio
**رابط التحميل**: https://developer.android.com/studio

**الحجم**: حوالي 1 GB + 3-4 GB بعد التثبيت

**خطوات التثبيت:**
1. حمّل وثبّت Android Studio
2. اختر "Standard Installation"
3. انتظر تحميل Android SDK
4. تأكد من تثبيت:
   - Android SDK Platform 34
   - Android SDK Build-Tools
   - Android SDK Command-line Tools

---

### 3. Node.js و PNPM
```bash
# تحميل Node.js من
https://nodejs.org/

# تثبيت PNPM
npm install -g pnpm
```

---

## الجزء الثاني: بناء التطبيق 🚀

### الخطوة 1: إعداد المشروع

```bash
# في مجلد المشروع
cd /path/to/mobile-auth-app

# تثبيت المكتبات
pnpm install

# بناء التطبيق
pnpm run build
```

---

### الخطوة 2: مزامنة Capacitor

```bash
# مزامنة الملفات مع Android
npx cap sync android

# فتح في Android Studio
npx cap open android
```

---

### الخطوة 3: إعداد التوقيع (Keystore)

**إنشاء Keystore للمرة الأولى:**

```bash
keytool -genkey -v -keystore manga-reader-release.keystore \
  -alias manga-reader -keyalg RSA -keysize 2048 -validity 10000
```

**احفظ هذه المعلومات بأمان:**
- مسار الـ keystore
- كلمة مرور الـ keystore
- alias name
- كلمة مرور الـ key

⚠️ **تحذير**: إذا فقدت هذه المعلومات، لن تستطيع تحديث التطبيق على Google Play!

---

### الخطوة 4: إعداد Signing Config

افتح `android/app/build.gradle` وأضف:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('../../manga-reader-release.keystore')
            storePassword 'your-keystore-password'
            keyAlias 'manga-reader'
            keyPassword 'your-key-password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

### الخطوة 5: بناء APK

**للاختبار (Debug):**
```bash
cd android
./gradlew assembleDebug
# الملف: android/app/build/outputs/apk/debug/app-debug.apk
```

**للنشر (Release):**
```bash
cd android
./gradlew assembleRelease
# الملف: android/app/build/outputs/apk/release/app-release.apk
```

**أو من Android Studio:**
1. Build → Generate Signed Bundle / APK
2. اختر APK
3. اختر keystore وأدخل كلمات المرور
4. اختر release variant
5. Finish

---

## الجزء الثالث: Firebase Cloud Messaging (FCM) 🔔

### إعداد Firebase للإشعارات:

**1. إنشاء مشروع Firebase:**
- اذهب إلى: https://console.firebase.google.com
- اضغط "Add project"
- اتبع الخطوات

**2. إضافة Android App:**
- في Firebase Console: Add app → Android
- أدخل package name (من build.gradle)
- حمّل `google-services.json`
- ضعه في `android/app/`

**3. تحديث build.gradle:**

في `android/build.gradle`:
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
}
```

في `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
}
```

**4. إضافة Service Account Key:**
- Firebase Console → Project Settings → Service Accounts
- Generate new private key
- حمّل JSON file
- أضف محتواه كـ environment variable: `FIREBASE_SERVICE_ACCOUNT`

---

## الجزء الرابع: النشر على Google Play Store 🌐

### المتطلبات:

**1. حساب Google Play Developer**
- التكلفة: $25 (مرة واحدة)
- التسجيل: https://play.google.com/console

**2. المحتوى المطلوب:**
- أيقونة 512x512 بكسل
- لقطات شاشة (2 على الأقل)
- صورة مميزة 1024x500
- وصف قصير (80 حرف)
- وصف كامل (4000 حرف)
- سياسة خصوصية (رابط)

---

### خطوات النشر:

**1. إنشاء التطبيق:**
- اذهب إلى Google Play Console
- Create app
- املأ المعلومات الأساسية

**2. رفع APK/AAB:**
- Release → Production
- Create new release
- ارفع app-release.apk أو app-release.aab

**3. إكمال Store Listing:**
- أضف الوصف والصور
- اختر التصنيف (Books & Reference)
- أضف رابط سياسة الخصوصية

**4. Content Rating:**
- املأ الاستبيان
- احصل على التقييم

**5. Pricing & Distribution:**
- اختر Free أو Paid
- اختر الدول المستهدفة
- وافق على الشروط

**6. Submit for Review:**
- راجع جميع المعلومات
- اضغط Submit
- انتظر الموافقة (1-3 أيام)

---

## الجزء الخامس: حل المشاكل الشائعة 🔧

### مشكلة: Gradle build failed
```bash
cd android
./gradlew clean
./gradlew build --stacktrace
```

### مشكلة: JAVA_HOME not set
```bash
# Windows
setx JAVA_HOME "C:\Program Files\Java\jdk-17"

# Mac/Linux
export JAVA_HOME=/path/to/jdk-17
```

### مشكلة: SDK not found
1. افتح Android Studio
2. Tools → SDK Manager
3. ثبّت المكونات المطلوبة

### مشكلة: App crashes
1. افتح Logcat في Android Studio
2. ابحث عن Error messages
3. راجع AndroidManifest.xml للأذونات

---

## الجزء السادس: التحديثات والصيانة 🔄

### تحديث التطبيق:

**1. زيادة رقم الإصدار:**

في `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 2  // زد هذا الرقم
        versionName "1.1"  // غيّر النسخة
    }
}
```

**2. بناء APK جديد:**
```bash
pnpm run build
npx cap sync android
cd android && ./gradlew assembleRelease
```

**3. رفع على Google Play:**
- اذهب إلى Google Play Console
- Release → Production
- Create new release
- ارفع APK الجديد

---

## سكريبتات مساعدة 📝

أضف هذه السكريبتات إلى `package.json`:

```json
{
  "scripts": {
    "android:build": "pnpm build && npx cap sync android",
    "android:open": "npx cap open android",
    "android:debug": "cd android && ./gradlew assembleDebug",
    "android:release": "cd android && ./gradlew assembleRelease",
    "android:clean": "cd android && ./gradlew clean"
  }
}
```

**الاستخدام:**
```bash
pnpm android:build    # بناء ومزامنة
pnpm android:open     # فتح في Android Studio
pnpm android:release  # بناء Release APK
```

---

## نصائح مهمة 💡

### الأمان:
- احتفظ بنسخة احتياطية من keystore
- لا تشارك كلمات المرور
- لا ترفع keystore على GitHub

### الأداء:
- فعّل ProGuard للتصغير
- قلل حجم الصور
- استخدم WebP بدلاً من PNG/JPG

### الاختبار:
- اختبر على أجهزة مختلفة
- اختبر جميع الميزات offline
- راقب استهلاك البطارية

---

## موارد إضافية 📚

- **Capacitor**: https://capacitorjs.com/docs
- **Android Developer**: https://developer.android.com
- **Firebase**: https://firebase.google.com/docs
- **Google Play**: https://support.google.com/googleplay/android-developer

---

**حظاً موفقاً! 🎉**
