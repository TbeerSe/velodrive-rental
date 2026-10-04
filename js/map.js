/**
 * Интерактивная карта станций проката.
 * Использует тёмные тайлы CARTO Dark Matter (не нужен API-ключ).
 */

const CITY_CENTER = [55.751244, 37.618423];
const DEFAULT_ZOOM = 12;

/** @type {{ id: number, coords: [number, number] }[]} */
const STATIONS = [
  { id: 1, coords: [55.751244, 37.618423] },
  { id: 2, coords: [55.760186, 37.618711] },
  { id: 3, coords: [55.744667, 37.603851] },
  { id: 4, coords: [55.735942, 37.627314] }
];

/** Инициализирует карту, если контейнер и Leaflet доступны. */
export function initMap() {
  const mapElement = document.querySelector("#map");
  if (!mapElement) return;
  if (typeof L === "undefined") {
    console.warn("Leaflet не загрузился — карта пропущена.");
    return;
  }

  const map = L.map(mapElement, {
    scrollWheelZoom: false,
    zoomControl: true
  }).setView(CITY_CENTER, DEFAULT_ZOOM);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      subdomains: "abcd",
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  ).addTo(map);

  STATIONS.forEach(({ id, coords }) => {
    L.marker(coords)
      .addTo(map)
      .bindPopup(`Станция ВелоДрайв №${id}`);
  });
}
