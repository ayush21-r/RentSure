export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Offline/Error handling wrapper
export async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }
      return response;
    } catch (error) {
      if (i === retries) {
        // Check localStorage cache
        const cacheKey = `cache_${url}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          console.log("Using cached data for:", url);
          return {
            ok: true,
            json: async () => JSON.parse(cached),
            _fromCache: true
          };
        }
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Cache helper
export function cacheResponse(url, data) {
  try {
    localStorage.setItem(`cache_${url}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to cache:", e);
  }
}

