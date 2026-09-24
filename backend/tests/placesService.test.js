import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  getDestinationCoordinates,
  searchNearbyPlaces,
  getPlaceDetails,
  mapInterestsToCategories,
} from "../services/placesService.js";

describe("placesService & OpenTripMap / Nominatim integration", () => {
  test("mapInterestsToCategories generates 2-3 categories based on keywords", () => {
    const categories1 = mapInterestsToCategories("heritage, food, architecture");
    assert.ok(categories1.includes("historic,cultural"));
    assert.ok(categories1.includes("foods"));
    assert.ok(categories1.length >= 2 && categories1.length <= 3);

    const categories2 = mapInterestsToCategories("nature and trekking");
    assert.ok(categories2.includes("natural"));
    assert.ok(categories2.includes("sport,amusements"));

    const categories3 = mapInterestsToCategories("");
    assert.ok(categories3.length >= 2);
  });

  test("getDestinationCoordinates returns null safely on empty or invalid input", async () => {
    const res1 = await getDestinationCoordinates("");
    assert.equal(res1, null);

    const res2 = await getDestinationCoordinates(null);
    assert.equal(res2, null);
  });

  test("searchNearbyPlaces falls back to Wikipedia or returns empty on invalid coords without throwing", async () => {
    const originalKey = process.env.OPENTRIPMAP_API_KEY;
    delete process.env.OPENTRIPMAP_API_KEY;

    try {
      // Without API key, it falls back to Wikipedia GeoSearch and returns real places
      const places = await searchNearbyPlaces(26.9124, 75.7873, "historic");
      assert.ok(Array.isArray(places));
      assert.ok(places.length > 0);
      assert.ok(places[0].name.length > 0);

      // Invalid coords return empty array safely
      const invalidPlaces = await searchNearbyPlaces(NaN, NaN, "historic");
      assert.deepEqual(invalidPlaces, []);
    } finally {
      if (originalKey) process.env.OPENTRIPMAP_API_KEY = originalKey;
    }
  });

  test("getPlaceDetails handles missing API key or invalid XID gracefully without throwing", async () => {
    const originalKey = process.env.OPENTRIPMAP_API_KEY;
    delete process.env.OPENTRIPMAP_API_KEY;

    try {
      const details = await getPlaceDetails("W12345");
      assert.equal(details, null);

      // Wikipedia fallback details lookup
      const wikiDetails = await getPlaceDetails("wiki_9251821");
      if (wikiDetails) {
        assert.ok(wikiDetails.name.length > 0);
      }
    } finally {
      if (originalKey) process.env.OPENTRIPMAP_API_KEY = originalKey;
    }
  });
});
