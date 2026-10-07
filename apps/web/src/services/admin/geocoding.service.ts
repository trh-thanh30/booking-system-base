import { publicAuthClient } from "@/src/lib/admin/api-client";
import type {
  ForwardGeocodingInput,
  GeocodingResult,
  ReverseGeocodingInput,
} from "@repo/shared";
import { unwrapApiData } from "@repo/shared";

export const geocodingService = {
  async forward(input: ForwardGeocodingInput) {
    return unwrapApiData(
      await publicAuthClient.get<GeocodingResult | null>(
        "/common/geocoding/forward",
        { params: input },
      ),
    );
  },

  async reverse(input: ReverseGeocodingInput) {
    return unwrapApiData(
      await publicAuthClient.get<GeocodingResult | null>(
        "/common/geocoding/reverse",
        { params: input },
      ),
    );
  },
};
