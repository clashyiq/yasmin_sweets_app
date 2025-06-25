# 🌸 تطبيق حلويات الياسمين PWA

تطبيق ويب متقدم (PWA) لإدارة المعجنات والكيك والحلويات مع إمكانية التثبيت على الأجهزة.

## ⚡ الإعداد السريع

### 1. تحميل الملفات المطلوبة:
```
📁 yasmin-sweets-pwa/
├── 📄 index.html           (الصفحة الرئيسية)
├── 📄 manifest.json        (إعدادات PWA)
├── 📄 sw.js               (Service Worker)
├── 📄 offline.html        (صفحة بدون إنترنت)
├── 📄 browserconfig.xml   (إعدادات Windows)
└── 🖼️ icons/              (جميع الصور:  
      https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin//clashy_admin_1750834776504_flv3a844e.png
   )
```

### 2. إنشاء الأيقونات:
استخدم أي من هذه الأدوات لإنشاء الأيقونات:
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)
- [Favicon Generator](https://realfavicongenerator.net/)
- [App Icon Co](https://appicon.co/)

### 3. رفع على الدومين:
1. ارفع جميع الملفات للمجلد الجذر
2. تأكد من تفعيل HTTPS
3. اختبر على: `https://yourdomain.com`

### 4. إعداد Supabase:
1. إنشاء مشروع جديد في [Supabase](https://supabase.com)
2. تشغيل SQL Commands من دليل الإعداد
3. تحديث متغيرات الاتصال في `index.html`
4. إضافة الدومين في CORS settings

## 🎯 الميزات الرئيسية

- ✅ **PWA كامل** - قابل للتثبيت على الأجهزة
- ✅ **عمل بدون إنترنت** - يعمل حتى بدون اتصال
- ✅ **واجهة عربية** - مصممة للغة العربية
- ✅ **متجاوب** - يعمل على جميع الأجهزة
- ✅ **سلة تسوق** - نظام طلبات متقدم
- ✅ **واتساب** - طلب مباشر عبر واتساب
- ✅ **إدارة متكاملة** - إضافة وتعديل المنتجات
- ✅ **تحديثات تلقائية** - تحديث التطبيق تلقائياً

## 📱 كيفية التثبيت للمستخدمين

### Android:
1. افتح الموقع في Chrome
2. انقر على "إضافة إلى الشاشة الرئيسية"
3. أو من قائمة Chrome ← "تثبيت التطبيق"

### iOS:
1. افتح الموقع في Safari
2. انقر على زر المشاركة 📤
3. اختر "إضافة إلى الشاشة الرئيسية"

### Windows/Mac:
1. افتح الموقع في Chrome/Edge
2. انقر على أيقونة التثبيت في شريط العنوان
3. أو Ctrl+Shift+A (Windows) / Cmd+Shift+A (Mac)

## 🔧 إعدادات مهمة

### في `manifest.json`:
```json
{
  "name": "حلويات الياسمين",
  "start_url": "https://yourdomain.com/",
  "theme_color": "#D97706"
}
```

### في `index.html`:
```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const contactInfo = {
    phone: '07712345678',
    whatsapp: '9647712345678'
};
```

## 🚀 اختبار PWA

1. **Chrome DevTools**: F12 → Application → Manifest
2. **Lighthouse**: `lighthouse https://yourdomain.com --view`
3. **PWA Builder**: https://www.pwabuilder.com/

## 📊 متطلبات النجاح

- ✅ HTTPS مفعل (إجباري)
- ✅ Service Worker يعمل
- ✅ Manifest.json صحيح
- ✅ أيقونات 192x192 و 512x512
- ✅ يعمل بدون إنترنت
- ✅ Lighthouse PWA score > 90

## 🆘 حل المشاكل

### إذا لم يظهر بانر التثبيت:
- تحقق من HTTPS
- امسح cache المتصفح
- تأكد من صحة manifest.json

### إذا لم يعمل بدون إنترنت:
- تحقق من تسجيل Service Worker
- افحص الكونسول للأخطاء
- تأكد من cache الملفات

## 📞 تواصل

- **هاتف**: 07712345678
- **واتساب**: https://wa.me/9647712345678
- **إنستغرام**: @yasmin_sweets_store

---

🌸 **حلويات الياسمين - أطيب المعجنات والكيك والحلويات الطازجة** 🌸