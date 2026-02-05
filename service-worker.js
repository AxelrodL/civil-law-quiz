// service-worker.js

// 1. 設定快取名稱 (如果要更新題庫，只要修改這裡的版本號，例如 v1 -> v2)
const CACHE_NAME = 'civil-law-quiz-v3';

// 2. 指定要快取的檔案 (這些檔案會被下載到手機裡)
const ASSETS_TO_CACHE = [
    './',                 // 根目錄
    './index.html',        // 主程式
    './questions_data.js', // 題庫檔
    './manifest.json',     // PWA 設定
    './icon.png'           // 圖示
];

// 3. 安裝 Service Worker (第一次開啟 App 時執行)
self.addEventListener('install', (event) => {
    console.log('Service Worker: 安裝中...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: 正在快取檔案');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 4. 啟用 Service Worker (清除舊快取)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('Service Worker: 移除舊快取', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// 5. 攔截網路請求 (這是離線功能的關鍵)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 如果快取裡有，直接回傳快取 (離線模式)
            if (cachedResponse) {
                return cachedResponse;
            }
            // 如果快取沒有，才去網路下載
            return fetch(event.request);
        })
    );
});