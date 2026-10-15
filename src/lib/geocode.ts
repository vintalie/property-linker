// OpenStreetMap Nominatim geocoding with a browser cache (1 request per second policy).
const CACHE_KEY = "geocode_cache_v1";
let last = 0;

function readCache(): Record<string, [number, number] | null> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

export async function geocode(query: string): Promise<[number, number] | null> {
  const cache = readCache();
  if (query in cache) return cache[query] ?? null;
  const wait = Math.max(0, last + 1100 - Date.now());
  if (wait) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
  let result: [number, number] | null = null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } },
    );
    const j = await res.json();
    if (j?.[0]) result = [Number(j[0].lat), Number(j[0].lon)];
  } catch {
    return null;
  }
  cache[query] = result;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  return result;
}

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
}

export const encodePoints = (pts: MapPoint[]) =>
  pts.map((p) => `${p.id}:${p.lat.toFixed(5)}:${p.lng.toFixed(5)}`).join(",");

export const decodePoints = (s: string | undefined): MapPoint[] =>
  (s ?? "")
    .split(",")
    .map((x) => x.split(":"))
    .filter((p) => p.length === 3 && !isNaN(Number(p[1])) && !isNaN(Number(p[2])))
    .map(([id, lat, lng]) => ({ id: String(id), lat: Number(lat), lng: Number(lng) }));
