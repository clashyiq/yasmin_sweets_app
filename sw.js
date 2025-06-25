// Service Worker لتطبيق حلويات الياسمين PWA
// إصدار: 2.0.0

const CACHE_NAME = 'yasmin-sweets-v2.0.0';
const OFFLINE_URL = '/offline.html';

// الملفات الأساسية للتخزين المؤقت
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // CSS External
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap',
  // JS External
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  // الأيقونة الرئيسية
  'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin//clashy_admin_1750834776504_flv3a844e.png'
];

// الملفات الديناميكية للتخزين المؤقت عند الطلب
const DYNAMIC_CACHE_URLS = [
  // Supabase URLs
  'https://wgvkbrmcgejscgsyapcs.supabase.co',
  // صور المنتجات
  'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin-images'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing Yasmin Sweets PWA...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching static files for Yasmin Sweets');
        return cache.addAll(STATIC_CACHE_URLS.map(url => {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .then(() => {
        console.log('✅ Service Worker: Yasmin Sweets installation complete');
        // تفعيل فوري للـ Service Worker الجديد
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Yasmin Sweets installation failed', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating Yasmin Sweets PWA...');
  
  event.waitUntil(
    Promise.all([
      // تنظيف الـ caches القديمة
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old Yasmin cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // السيطرة على جميع الصفحات فوراً
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Yasmin Sweets activation complete');
    })
  );
});

// التعامل مع طلبات الشبكة
self.addEventListener('fetch', event => {
  // تجاهل الطلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // تجاهل طلبات POST/PUT/DELETE للـ Supabase
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // استراتيجية Cache First للملفات الثابتة
  if (STATIC_CACHE_URLS.some(staticUrl => event.request.url.includes(staticUrl))) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // استراتيجية Network First للـ API calls
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // استراتيجية Stale While Revalidate للصور
  if (event.request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // استراتيجية Network First للباقي
  event.respondWith(networkFirst(event.request));
});

// استراتيجية Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 Service Worker: Serving from cache (offline)');
    return await caches.match(request) || await caches.match(OFFLINE_URL);
  }
}

// استراتيجية Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 Service Worker: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // إذا كان طلب HTML، إرجاع صفحة offline
    if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
      return await caches.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

// استراتيجية Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || await fetchPromise;
}

// التعامل مع رسائل من التطبيق الرئيسي
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// إشعارات Push للعروض الجديدة
self.addEventListener('push', event => {
  console.log('📢 Service Worker: Push notification received for Yasmin Sweets');
  
  const options = {
    body: event.data ? event.data.text() : 'منتجات جديدة وعروض مميزة في حلويات الياسمين! 🌸',
    icon: 'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin//clashy_admin_1750834776504_flv3a844e.png',
    badge: 'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin//clashy_admin_1750834776504_flv3a844e.png',
    image: 'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin//clashy_admin_1750834776504_flv3a844e.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      source: 'yasmin-sweets'
    },
    actions: [
      {
        action: 'explore',
        title: 'تصفح المنتجات',
        icon: 'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin//clashy_admin_1750834776504_flv3a844e.png'
      },
      {
        action: 'order',
        title: 'طلب سريع',
        icon: 'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin//clashy_admin_1750834776504_flv3a844e.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: 'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin//clashy_admin_1750834776504_flv3a844e.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('🌸 حلويات الياسمين', options)
  );
});

// التعامل مع النقر على الإشعارات
self.addEventListener('notificationclick', event => {
  console.log('🔔 Service Worker: Yasmin Sweets notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/?from=notification&action=explore')
    );
  } else if (event.action === 'order') {
    event.waitUntil(
      clients.openWindow('https://wa.me/9647712345678?text=' + 
        encodeURIComponent('السلام عليكم، أرغب في طلب سريع من حلويات الياسمين'))
    );
  } else if (event.action === 'close') {
    // لا نفعل شيء، فقط إغلاق الإشعار
  } else {
    // النقر على الإشعار نفسه
    event.waitUntil(
      clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(clientList => {
          // إذا كان التطبيق مفتوح، ركز عليه
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // إذا لم يكن مفتوح، افتح نافذة جديدة
          if (clients.openWindow) {
            return clients.openWindow('/?from=notification');
          }
        })
    );
  }
});

// مزامنة الخلفية
self.addEventListener('sync', event => {
  console.log('🔄 Service Worker: Background sync triggered for Yasmin Sweets');
  
  if (event.tag === 'yasmin-background-sync') {
    event.waitUntil(
      // هنا يمكن إضافة منطق مزامنة البيانات
      syncYasminData()
    );
  }
});

// دالة مزامنة بيانات حلويات الياسمين
async function syncYasminData() {
  try {
    console.log('📊 Service Worker: Syncing Yasmin Sweets data in background');
    
    // يمكن إضافة منطق مزامنة البيانات هنا
    // مثل تحديث المنتجات أو الإعلانات
    
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Service Worker: Failed to sync Yasmin data:', error);
    return Promise.reject(error);
  }
}

// معالجة الأخطاء
self.addEventListener('error', event => {
  console.error('❌ Service Worker: Error occurred in Yasmin Sweets PWA', event.error);
});

// معالجة الأخطاء غير المتوقعة
self.addEventListener('unhandledrejection', event => {
  console.error('❌ Service Worker: Unhandled promise rejection in Yasmin Sweets PWA', event.reason);
});

// تنظيف الـ cache القديم
async function cleanupOldCaches() {
  const cacheWhitelist = [CACHE_NAME];
  const cacheNames = await caches.keys();
  
  return Promise.all(
    cacheNames.map(cacheName => {
      if (!cacheWhitelist.includes(cacheName)) {
        console.log('🗑️ Service Worker: Deleting old Yasmin cache:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

// إشعار عند اكتمال التثبيت
self.addEventListener('install', event => {
  console.log('🌸 Service Worker لحلويات الياسمين جاهز للعمل!');
  console.log('✨ الميزات المتاحة:');
  console.log('  • العمل بدون إنترنت');
  console.log('  • تخزين مؤقت للصور والمنتجات');
  console.log('  • إشعارات العروض الجديدة');
  console.log('  • مزامنة تلقائية للبيانات');
  console.log('  • تحديثات سلسة للتطبيق');
});

console.log('🌸 Service Worker حلويات الياسمين v2.0.0 - مُحمل ومُفعل!');