// 缓存名称和版本
const CACHE_NAME = 'luozhi-homepage-cache-v1';

// 需要缓存的资源
const CACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo.png',
  '/css/main.css',
  '/js/main.js',
];

// Service Worker 安装事件
self.addEventListener('install', (event) => {
  // 跳过等待，直接激活
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('缓存已打开');
        return cache.addAll(CACHE_URLS);
      })
      .catch((error) => {
        console.error('预缓存失败:', error);
      })
  );
});

// Service Worker 激活事件
self.addEventListener('activate', (event) => {
  // 清理旧缓存
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 立即控制所有打开的页面
      return self.clients.claim();
    })
  );
});

// 资源请求拦截
self.addEventListener('fetch', (event) => {
  // 忽略非GET请求
  if (event.request.method !== 'GET') return;
  
  // 忽略浏览器扩展请求和API请求
  const url = new URL(event.request.url);
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }
  
  // 网络优先策略
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 获取响应的克隆，因为响应流只能使用一次
        const responseClone = response.clone();
        
        // 打开缓存并存储响应
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          })
          .catch((error) => {
            console.error('缓存响应失败:', error);
          });
        
        return response;
      })
      .catch(() => {
        // 网络失败，尝试从缓存获取
        return caches.match(event.request)
          .then((cachedResponse) => {
            // 返回缓存中的数据或者给出网络错误提示
            return cachedResponse || new Response(
              '<h1>网络连接失败，请检查网络</h1>', 
              { 
                headers: { 'Content-Type': 'text/html;charset=utf-8' }
              }
            );
          });
      })
  );
}); 