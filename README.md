# 🌸 دليل إعداد تطبيق حلويات الياسمين PWA الشامل

## 📋 الملفات المطلوبة

### 1. الملفات الأساسية
```
yasmin-sweets-pwa/
├── index.html              # الصفحة الرئيسية (PWA)
├── manifest.json           # إعدادات PWA
├── sw.js                   # Service Worker
├── offline.html            # صفحة العمل بدون إنترنت
├── browserconfig.xml       # إعدادات Windows/Edge
└── .htaccess              # إعدادات Apache (اختياري)
```

### 2. الأيقونات
استخدم الصورة المحددة في جميع الأحجام:
```
https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin//clashy_admin_1750834776504_flv3a844e.png
```

**أحجام الأيقونات المطلوبة:**
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512
- Apple Touch Icon: 180x180
- Favicon: 16x16, 32x32

### 3. إنشاء الأيقونات
استخدم أحد هذه الأدوات:
1. **PWA Builder**: https://www.pwabuilder.com/imageGenerator
2. **Favicon Generator**: https://realfavicongenerator.net/
3. **App Icon Co**: https://appicon.co/

## 🚀 خطوات الرفع على الدومين

### 1. إعداد الملفات

**انسخ الملفات التالية:**
- `index.html` (الكود الكامل المُحدث)
- `manifest.json`
- `sw.js`
- `offline.html`
- جميع الأيقونات في مجلد `/icons/`

### 2. تحديث إعدادات الدومين

**في `manifest.json`:**
```json
{
  "name": "حلويات الياسمين",
  "start_url": "https://yourdomain.com/",
  "scope": "https://yourdomain.com/"
}
```

**في `index.html`:**
- تأكد من صحة مسارات الأيقونات
- تحديث معلومات الاتصال إذا لزم الأمر

### 3. إعداد الخادم

#### أ. Apache (.htaccess):
```apache
# PWA Configuration
<IfModule mod_mime.c>
    AddType application/manifest+json .webmanifest
    AddType application/manifest+json .json
    AddType text/cache-manifest .appcache
</IfModule>

# Service Worker
<Files "sw.js">
    Header set Service-Worker-Allowed "/"
    Header set Cache-Control "no-cache"
</Files>

# HTTPS Redirect (مطلوب للـ PWA)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Cache Policy
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

#### ب. Nginx:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        root /var/www/yasmin-sweets;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /sw.js {
        add_header Cache-Control "no-cache";
        add_header Service-Worker-Allowed "/";
    }
    
    location /manifest.json {
        add_header Content-Type application/manifest+json;
    }
}
```

## 🔧 إعداد Supabase

### 1. إنشاء الجداول

تشغيل SQL في Supabase SQL Editor:

```sql
-- إنشاء جداول حلويات الياسمين (منفصلة عن التطبيقات الأخرى)

-- جدول منتجات حلويات الياسمين
CREATE TABLE IF NOT EXISTS yasmin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  original_price DECIMAL(12,2),
  category TEXT NOT NULL CHECK (category IN ('savory_pastries', 'cakes_sweets', 'sweet_pastries', 'hot_drinks', 'cold_drinks')),
  badge TEXT,
  rating DECIMAL(2,1) DEFAULT 4.5 CHECK (rating >= 1 AND rating <= 5),
  reviews INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول إعلانات حلويات الياسمين
CREATE TABLE IF NOT EXISTS yasmin_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  linked_product UUID REFERENCES yasmin_products(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول رسائل حلويات الياسمين
CREATE TABLE IF NOT EXISTS yasmin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES yasmin_products(id) ON DELETE SET NULL,
  sender_name TEXT DEFAULT 'عميل',
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء bucket للصور منفصل للياسمين
INSERT INTO storage.buckets (id, name, public) 
VALUES ('yasmin-images', 'yasmin-images', true) 
ON CONFLICT (id) DO NOTHING;

-- تفعيل Row Level Security
ALTER TABLE yasmin_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE yasmin_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE yasmin_messages ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول العام
CREATE POLICY "Allow all operations on yasmin_products" 
ON yasmin_products FOR ALL USING (true);

CREATE POLICY "Allow all operations on yasmin_ads" 
ON yasmin_ads FOR ALL USING (true);

CREATE POLICY "Allow all operations on yasmin_messages" 
ON yasmin_messages FOR ALL USING (true);

-- سياسة bucket الصور للياسمين
CREATE POLICY "Allow all operations on yasmin-images" 
ON storage.objects FOR ALL 
USING (bucket_id = 'yasmin-images');
```

### 2. إعداد CORS في Supabase
1. اذهب إلى Supabase Dashboard
2. Settings → API
3. أضف الدومين في CORS origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

## 📱 اختبار PWA

### 1. اختبار PWA:
- **Chrome DevTools**: F12 → Application → Manifest
- **Lighthouse**: `lighthouse https://yourdomain.com --view`
- **PWA Builder**: https://www.pwabuilder.com/

### 2. اختبار التثبيت:
1. افتح الموقع على الهاتف
2. يجب أن يظهر بانر التثبيت
3. اختبر التثبيت من قائمة المتصفح

### 3. اختبار العمل بدون إنترنت:
1. افتح التطبيق
2. اقطع الإنترنت
3. تأكد من ظهور صفحة `offline.html`

## 🔒 متطلبات PWA

- ✅ **HTTPS إجباري** (عدا localhost للتطوير)
- ✅ **Service Worker** مسجل ويعمل
- ✅ **Manifest.json** صحيح
- ✅ **الأيقونات** متوفرة بجميع الأحجام
- ✅ **يعمل بدون إنترنت**
- ✅ **قابل للتثبيت**
- ✅ **سريع الاستجابة**

## 🎯 كيفية التثبيت للمستخدمين

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

## 📊 مراقبة الأداء

### Google Lighthouse:
```bash
npm install -g lighthouse
lighthouse https://yourdomain.com --view
```

### PWA Checklist:
- [ ] HTTPS مفعل
- [ ] Service Worker مسجل
- [ ] Manifest.json صحيح
- [ ] الأيقونات متوفرة
- [ ] يعمل بدون إنترنت
- [ ] قابل للتثبيت
- [ ] Lighthouse PWA score > 90

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة:

1. **التطبيق لا يظهر بانر التثبيت:**
   - تحقق من HTTPS
   - تأكد من صحة manifest.json
   - تأكد من تسجيل Service Worker

2. **Service Worker لا يعمل:**
   - تحقق من مسار sw.js
   - تأكد من عدم وجود أخطاء في الكونسول
   - امسح cache المتصفح

3. **الأيقونات لا تظهر:**
   - تحقق من مسارات الأيقونات
   - تأكد من أحجام الأيقونات صحيحة
   - اختبر فتح الأيقونات مباشرة

## ✨ الميزات المتاحة

### 🌟 ميزات PWA:
- **قابل للتثبيت** على جميع الأجهزة
- **يعمل بدون إنترنت** (Service Worker)
- **تحديثات تلقائية** للتطبيق
- **إشعارات** العروض الجديدة
- **اختصارات سريعة** من أيقونة التطبيق
- **تحميل سريع** مع التخزين المؤقت

### 🍰 ميزات التطبيق:
- **واجهة عربية كاملة** مُحسنة للـ RTL
- **تصميم متجاوب** يعمل على جميع الأجهزة
- **سلة تسوق** محفوظة محلياً
- **قائمة مفضلة** للمنتجات
- **طلب سريع** عبر واتساب
- **مشاركة المنتجات** 
- **بحث متقدم** في المنتجات
- **إعلانات تفاعلية** مع العد التنازلي

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل:
1. تحقق من الكونسول للأخطاء (F12)
2. استخدم Chrome DevTools → Application
3. اختبر على أجهزة مختلفة
4. راجع Lighthouse report

---

## 📋 قائمة فحص نهائية

### قبل النشر:
- [ ] جميع الملفات مرفوعة
- [ ] HTTPS مفعل ويعمل
- [ ] Supabase متصل ومُعد
- [ ] الأيقونات تظهر بشكل صحيح
- [ ] Service Worker مسجل
- [ ] Manifest.json يُحمل بدون أخطاء

### بعد النشر:
- [ ] يمكن تثبيت التطبيق
- [ ] يعمل بدون إنترنت
- [ ] الاختصارات تعمل
- [ ] الإشعارات (إذا مُفعلة)
- [ ] اختبر على iOS و Android
- [ ] Lighthouse PWA score > 90

🎉 **مبروك! تطبيق حلويات الياسمين PWA جاهز للاستخدام**

---

### 🔗 روابط مفيدة:
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google Workbox](https://developers.google.com/web/tools/workbox)