importScripts("https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js");

const version = 1;
const API_URL = "http://localhost:3001";
const CACHE_NAME = `main-${version}`;

async function addOfflinePosts() {
  const offlinePosts = await idbKeyval.get("offlinePosts");
  await Promise.all(
    offlinePosts.map((postName) =>
      fetch(`${API_URL}/post`, {
        method: "post",
        body: JSON.stringify({ title: postName }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    )
  );

  const allClients = await clients.matchAll({
    includeUncontrolled: true,
  });

  await idbKeyval.del("offlinePosts");

  allClients.forEach((client) => {
    if (client.visibilityState === "visible") {
      client.postMessage({ type: "NEW_POSTS" });
    }
  });
}

async function cacheStaticAssets() {}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  // Check if this is a navigation request
  if (event.request.method === "GET") {
    // Open the cache
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        // Go to the network first
        return fetch(event.request.url)
          .then((fetchedResponse) => {
            cache.put(event.request, fetchedResponse.clone());

            return fetchedResponse;
          })
          .catch(() => {
            // If the network is unavailable, get
            return cache.match(event.request.url);
          });
      })
    );
  } else {
    return;
  }
});

self.addEventListener("sync", function (event) {
  if (event.tag == "addOfflinePosts") {
    event.waitUntil(addOfflinePosts());
  }
});
