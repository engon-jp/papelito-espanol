/* Papelito Español — Service Worker（オフライン対応）
   方針：
   - HTML …… ネットワーク優先。git push した更新が常に即反映され、オフライン時のみキャッシュを使う。
   - 素材（音声mp3・アイコン・manifest）…… キャッシュ優先＋裏で更新（stale-while-revalidate）。
   - Range リクエスト（Safari の音声部分取得）は SW を素通し。オフライン時はアプリ側の音声合成フォールバックが効く。
   この方針のため、コンテンツ更新時にこのファイルのバージョン番号を上げる必要はない。 */
const CACHE = "papelito-v1";

const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./yo-hablo-espanol/",
  "./yo-hablo-espanol/index.html",
  "./yo-hablo-espanol/manifest.json",
  "./yo-hablo-espanol/assets/icon-180.png",
  "./yo-hablo-espanol/assets/icon-192.png",
  "./yo-hablo-espanol/assets/icon-512.png",
  "./soy-estudiante/",
  "./soy-estudiante/index.html",
  "./soy-estudiante/manifest.json",
  "./soy-estudiante/assets/icon-180.png",
  "./soy-estudiante/assets/icon-192.png",
  "./soy-estudiante/assets/icon-512.png",
  "./como-estas/",
  "./como-estas/index.html",
  "./como-estas/manifest.json",
  "./como-estas/assets/icon-180.png",
  "./como-estas/assets/icon-192.png",
  "./como-estas/assets/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith("papelito-") && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function isHTML(req) {
  return req.mode === "navigate" || req.destination === "document"
    || new URL(req.url).pathname.endsWith(".html");
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.headers.get("range")) return; // 部分取得はキャッシュ不可（206）のため素通し
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isHTML(req)) {
    // HTML：ネットワーク優先
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }))
    );
  } else {
    // 素材：キャッシュ優先＋裏で更新
    e.respondWith(
      caches.match(req).then((cached) => {
        const fetched = fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || fetched;
      })
    );
  }
});
