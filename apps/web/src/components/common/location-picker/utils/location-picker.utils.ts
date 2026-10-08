import { COUNTRY_MAP_CENTERS } from "../data/country-map-centers.data";

export function getCountryMapView(countryCode: string) {
  const [latitude, longitude, zoom] = COUNTRY_MAP_CENTERS[
    countryCode.toUpperCase()
  ] ?? [20, 0, 2];
  return { latitude, longitude, zoom };
}
