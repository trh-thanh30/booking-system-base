import {
  GEOCODING_CACHE_TTL_MS,
  MIN_ADDRESS_QUERY_LENGTH,
} from '@/modules/common/constant';
import { CommonUtils } from '@/modules/common/helpers/common.utils';
import { AddressSearchResult } from '@/modules/common/types';
import { Injectable, Logger } from '@nestjs/common';
import type {
  ForwardGeocodingInput,
  GeocodingResult,
  ReverseGeocodingInput,
} from '@repo/shared';

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);
  private readonly geocodingCache = new Map<
    string,
    { expiresAt: number; result: GeocodingResult | null }
  >();

  constructor(private readonly commonUtils: CommonUtils) {}

  async search(query: string): Promise<AddressSearchResult[]> {
    const normalizedQuery = this.commonUtils.normalizeQuery(query);
    if (normalizedQuery.length < MIN_ADDRESS_QUERY_LENGTH) return [];

    try {
      const results =
        await this.commonUtils.searchAddressItems(normalizedQuery);
      return results.map((item) => this.commonUtils.mapNominatimAddress(item));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Address search failed: ${msg}`);
      return [];
    }
  }

  async forwardGeocode(
    input: ForwardGeocodingInput,
  ): Promise<GeocodingResult | null> {
    return this.cachedGeocoding(`forward:${JSON.stringify(input)}`, () =>
      this.commonUtils.forwardGeocode(input),
    );
  }

  async reverseGeocode(
    input: ReverseGeocodingInput,
  ): Promise<GeocodingResult | null> {
    const rounded = {
      ...input,
      latitude: Number(input.latitude.toFixed(6)),
      longitude: Number(input.longitude.toFixed(6)),
    };
    return this.cachedGeocoding(`reverse:${JSON.stringify(rounded)}`, () =>
      this.commonUtils.reverseGeocode(rounded),
    );
  }

  private async cachedGeocoding(
    key: string,
    lookup: () => Promise<GeocodingResult | null>,
  ): Promise<GeocodingResult | null> {
    const cached = this.geocodingCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.result;
    try {
      const result = await lookup();
      this.geocodingCache.set(key, {
        expiresAt: Date.now() + GEOCODING_CACHE_TTL_MS,
        result,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Geocoding failed: ${message}`);
      return null;
    }
  }
}
