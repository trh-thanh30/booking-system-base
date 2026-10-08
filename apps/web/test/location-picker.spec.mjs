import assert from "node:assert/strict";
import test from "node:test";
import { getCountryMapView } from "../src/components/common/location-picker/utils/location-picker.utils.ts";
import { COUNTRY_MAP_CENTERS } from "../src/components/common/location-picker/data/country-map-centers.data.ts";

test("country map defaults follow the selected country instead of Hanoi", () => {
  assert.deepEqual(getCountryMapView("VN"), {
    latitude: 16.16666666,
    longitude: 107.83333333,
    zoom: 4,
  });
  assert.equal(getCountryMapView("US").longitude, -97);
  assert.equal(getCountryMapView("fr").longitude, 2);
  assert.deepEqual(getCountryMapView("unknown"), {
    latitude: 20,
    longitude: 0,
    zoom: 2,
  });
});
test("country map data contains finite viewing coordinates and valid zoom levels", () => {
  assert.ok(Object.keys(COUNTRY_MAP_CENTERS).length > 240);
  for (const [code, [latitude, longitude, zoom]] of Object.entries(
    COUNTRY_MAP_CENTERS,
  )) {
    assert.ok(Number.isFinite(latitude) && Math.abs(latitude) <= 90, code);
    assert.ok(Number.isFinite(longitude) && Math.abs(longitude) <= 180, code);
    assert.ok(zoom >= 2 && zoom <= 9, code);
  }
});
