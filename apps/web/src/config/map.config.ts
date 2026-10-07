// Public tile endpoint only: never put a private provider key in this URL.
export const mapConfig = {
  tileUrl:
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  initialCenter: { latitude: 21.0285, longitude: 105.8542 },
};
