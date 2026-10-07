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
    return this.cachedGeocoding(
      'forward',
      `forward:${JSON.stringify(input)}`,
      () => this.commonUtils.forwardGeocode(input),
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
    return this.cachedGeocoding(
      'reverse',
      `reverse:${JSON.stringify(rounded)}`,
      () => this.commonUtils.reverseGeocode(rounded),
    );
  }

  private async cachedGeocoding(
    operation: 'forward' | 'reverse',
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
      this.logger.error(
        `Geocoding ${operation} failed: ${this.formatGeocodingError(error)}`,
      );
      return null;
    }
  }

  private formatGeocodingError(error: unknown): string {
    const details: string[] = [];
    const record = this.asRecord(error);

    if (error instanceof Error) {
      details.push(`name=${error.name}`);
      details.push(`message=${error.message || '(empty)'}`);
    } else if (record) {
      details.push(`name=${this.readString(record.name) || 'UnknownError'}`);
      details.push(`message=${this.readString(record.message) || '(empty)'}`);
    } else {
      return `value=${this.serializeLogValue(error)}`;
    }

    const code = this.readString(record?.code);
    if (code) details.push(`code=${code}`);

    const config = this.asRecord(record?.config);
    const method = this.readString(config?.method).toUpperCase();
    const url = this.readString(config?.url);
    if (method || url) {
      details.push(`request=${[method, url].filter(Boolean).join(' ')}`);
    }

    const response = this.asRecord(record?.response);
    if (response) {
      const status =
        typeof response.status === 'number' ? response.status : undefined;
      const statusText = this.readString(response.statusText);
      if (status !== undefined || statusText) {
        details.push(
          `status=${[status, statusText].filter(Boolean).join(' ')}`,
        );
      }
      if (response.data !== undefined) {
        details.push(`response=${this.serializeLogValue(response.data)}`);
      }
    }

    if (record?.cause !== undefined) {
      details.push(`cause=${this.serializeLogValue(record.cause)}`);
    }

    if (error instanceof Error && !error.message && error.stack) {
      details.push(`stack=${error.stack.slice(0, 2_000)}`);
    }

    return details.join(' | ');
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return this.isRecord(value) ? value : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private readString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private serializeLogValue(value: unknown): string {
    try {
      const serialized = JSON.stringify(value);
      return (serialized ?? String(value)).slice(0, 2_000);
    } catch {
      return String(value).slice(0, 2_000);
    }
  }
}
