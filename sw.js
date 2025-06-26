// Service Worker لتطبيق حلويات الياسمين
const CACHE_NAME = 'yasmin-sweets-v2.0.1';
const OFFLINE_PAGE = '/offline.html';

// الملفات الأساسية للتخزين المؤقت
const CORE_ASSETS = [
    '/',
    '/yasmin_sweets_app.html',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin/clashy_admin_1750834776504_flv3a844e.png'
];

// الملفات الخارجية
const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-regular-400.woff2'
];

// أحداث Service Worker
self.addEventListener('install', event => {
    console.log('🌸 تثبيت Service Worker لحلويات الياسمين...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 تخزين الملفات الأساسية...');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                console.log('✅ تم تثبيت Service Worker بنجاح');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ خطأ في تثبيت Service Worker:', error);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('🔄 تفعيل Service Worker لحلويات الياسمين...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ حذف التخزين المؤقت القديم:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ تم تفعيل Service Worker بنجاح');
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', event => {
    // تجاهل الطلبات غير المهمة
    if (
        event.request.method !== 'GET' ||
        event.request.url.includes('chrome-extension') ||
        event.request.url.includes('extension') ||
        event.request.url.includes('moz-extension')
    ) {
        return;
    }

    // استراتيجية Network First للـ API
    if (
        event.request.url.includes('supabase.co') ||
        event.request.url.includes('/rest/v1/') ||
        event.request.url.includes('/storage/v1/')
    ) {
        event.respondWith(networkFirstStrategy(event.request));
        return;
    }

    // استراتيجية Cache First للموارد الثابتة
    if (
        event.request.url.includes('cdnjs.cloudflare.com') ||
        event.request.url.includes('fonts.googleapis.com') ||
        event.request.url.includes('fonts.gstatic.com') ||
        event.request.destination === 'image' ||
        event.request.destination === 'font' ||
        event.request.destination === 'style' ||
        event.request.destination === 'script'
    ) {
        event.respondWith(cacheFirstStrategy(event.request));
        return;
    }

    // استراتيجية Stale While Revalidate للصفحات
    event.respondWith(staleWhileRevalidateStrategy(event.request));
});

// استراتيجية Network First (الشبكة أولاً)
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('🌐 استخدام التخزين المؤقت للطلب:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// استراتيجية Cache First (التخزين المؤقت أولاً)
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('❌ فشل في تحميل المورد:', request.url, error);
        throw error;
    }
}

// استراتيجية Stale While Revalidate
async function staleWhileRevalidateStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request)
        .then(networkResponse => {
            if (networkResponse.ok) {
                const cache = caches.open(CACHE_NAME);
                cache.then(c => c.put(request, networkResponse.clone()));
            }
            return networkResponse;
        })
        .catch(error => {
            console.log('🌐 فشل في الشبكة، استخدام التخزين المؤقت:', request.url);
            return cachedResponse;
        });
    
    return cachedResponse || fetchPromise;
}

// معالجة رسائل من التطبيق الرئيسي
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// معالجة الإشعارات Push
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: 'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin/clashy_admin_1750834776504_flv3a844e.png',
        badge: 'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin/clashy_admin_1750834776504_flv3a844e.png',
        vibrate: [100, 50, 100],
        data: data.data,
        actions: [
            {
                action: 'view',
                title: 'عرض التفاصيل',
                icon: 'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin/clashy_admin_1750834776504_flv3a844e.png'
            },
            {
                action: 'close',
                title: 'إغلاق',
                icon: 'https://wgvkbrmcgejscgsyapcs.supabase.co/storage/v1/object/public/yasmin/clashy_admin_1750834776504_flv3a844e.png'
            }
        ],
        tag: 'yasmin-notification',
        renotify: true,
        requireInteraction: false,
        silent: false
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'حلويات الياسمين 🌸', options)
    );
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // إذا كان التطبيق مفتوحاً، قم بالتركيز عليه
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // إذا لم يكن مفتوحاً، افتح نافذة جديدة
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// معالجة الأخطاء
self.addEventListener('error', event => {
    console.error('❌ خطأ في Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('❌ خطأ غير معالج في Service Worker:', event.reason);
});

// تحديث دوري للتخزين المؤقت
setInterval(() => {
    console.log('🔄 تحديث دوري للتخزين المؤقت...');
    
    caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(EXTERNAL_ASSETS);
    }).catch(error => {
        console.log('⚠️ تم تخطي التحديث الدوري:', error.message);
    });
}, 1800000); // كل 30 دقيقة

console.log('🌸 Service Worker لحلويات الياسمين جاهز ومفعل!');