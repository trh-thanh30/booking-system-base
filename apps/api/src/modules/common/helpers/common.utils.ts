import { clientConfig } from '@/config';
import {
  ADDRESS_SEARCH_LIMIT,
  UK_COUNTRY_CODE,
  UK_POSTCODE_PATTERN,
} from '@/modules/common/constant';
import {
  AddressSearchResult,
  NominatimAddress,
  NominatimSearchItem,
} from '@/modules/common/types';
import type {
  ForwardGeocodingInput,
  GeocodingResult,
  ReverseGeocodingInput,
} from '@repo/shared';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CommonUtils {
  private lastNominatimRequestAt = 0;
  private nominatimQueue: Promise<void> = Promise.resolve();

  constructor(
    private readonly httpService: HttpService,
    @Inject(clientConfig.KEY)
    private readonly clientCfg: ConfigType<typeof clientConfig>,
  ) {}
  async searchAddressItems(query: string): Promise<NominatimSearchItem[]> {
    const primaryResults = (await this.callNominatim(query)).filter((item) =>
      this.isUkAddress(item),
    );
    if (primaryResults.length > 0) return primaryResults;

    if (this.isUkPostcode(query)) {
      return (
        await this.callNominatim(`${this.formatPostcode(query)} london`)
      ).filter((item) => this.isUkAddress(item));
    }

    return [];
  }

  async callNominatim(query: string): Promise<NominatimSearchItem[]> {
    const { data } = await this.requestNominatim<NominatimSearchItem[]>(
      '/search',
      {
        q: query,
        format: 'jsonv2',
        addressdetails: 1,
        countrycodes: UK_COUNTRY_CODE,
        limit: ADDRESS_SEARCH_LIMIT,
        dedupe: 1,
        extratags: 1,
      },
    );

    return data ?? [];
  }

  async forwardGeocode(
    input: ForwardGeocodingInput,
  ): Promise<GeocodingResult | null> {
    const { data } = await this.requestNominatim<NominatimSearchItem[]>(
      '/search',
      {
        street: this.joinAddressParts(
          [input.addressLine1, input.addressLine2],
          ', ',
        ),
        city: input.locality,
        county: input.administrativeAreaLevel2 || undefined,
        state: input.administrativeAreaLevel1 || undefined,
        countrycodes: input.countryCode.toLowerCase(),
        postalcode: input.postalCode || undefined,
        format: 'jsonv2',
        addressdetails: 1,
        limit: 1,
        dedupe: 1,
        layer: 'address',
      },
      input.locale,
    );

    return this.mapGeocodingResult(data?.[0]);
  }

  async reverseGeocode(
    input: ReverseGeocodingInput,
  ): Promise<GeocodingResult | null> {
    const { data } = await this.requestNominatim<NominatimSearchItem>(
      '/reverse',
      {
        lat: input.latitude,
        lon: input.longitude,
        format: 'jsonv2',
        addressdetails: 1,
        layer: 'address',
        zoom: 18,
      },
      input.locale,
    );

    return this.mapGeocodingResult(data);
  }

  mapGeocodingResult(
    item: NominatimSearchItem | undefined,
  ): GeocodingResult | null {
    const latitude = Number(item?.lat);
    const longitude = Number(item?.lon);
    if (
      !item?.address ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }
    const address = item.address;
    const streetName = this.getStreetName(address);
    const addressLine1 =
      this.joinUniqueAddressParts(
        [address.house_number, address.house_name, streetName],
        ' ',
      ) ||
      item.display_name.split(',')[0]?.trim() ||
      '';
    const addressLine2 = this.joinUniqueAddressParts(
      [address.neighbourhood, address.quarter, address.suburb, address.hamlet],
      ', ',
      [addressLine1],
    );
    const locality =
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      '';
    const administrativeAreaLevel2 = this.firstDistinctAddressPart(
      [
        address.city_district,
        address.district,
        address.borough,
        address.county,
      ],
      [],
    );
    const administrativeAreaLevel1 = this.firstDistinctAddressPart(
      [address.state, address.region, address.state_district],
      [],
    );
    return {
      displayName: item.display_name,
      address: {
        countryCode: address.country_code?.toUpperCase() ?? '',
        addressLine1,
        addressLine2,
        locality,
        administrativeAreaLevel1,
        administrativeAreaLevel2,
        postalCode: address.postcode ?? '',
        formattedAddress: item.display_name,
      },
      location: { latitude, longitude },
    };
  }

  private async requestNominatim<T>(
    path: string,
    params: Record<string, unknown>,
    locale?: string,
  ) {
    const request = this.nominatimQueue.then(async () => {
      const remaining = 1000 - (Date.now() - this.lastNominatimRequestAt);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      this.lastNominatimRequestAt = Date.now();
      return firstValueFrom(
        this.httpService.get<T>(`${this.clientCfg.nominatimBaseUrl}${path}`, {
          params,
          headers: {
            'Accept-Language': locale,
            'User-Agent': this.clientCfg.nominatimUserAgent,
          },
        }),
      );
    });
    this.nominatimQueue = request.then(
      () => undefined,
      () => undefined,
    );
    return request;
  }

  private isUkAddress(item: NominatimSearchItem): boolean {
    const a = item.address;

    if (!a) return false;

    return (
      a.country_code?.toLowerCase() === 'gb' &&
      Boolean(a.postcode) &&
      (Boolean(this.getStreetName(a)) ||
        Boolean(a.city) ||
        Boolean(a.town) ||
        Boolean(a.village) ||
        Boolean(a.county))
    );
  }

  mapNominatimAddress(item: NominatimSearchItem): AddressSearchResult {
    const address = item.address ?? {};
    const street = this.getStreetName(address);
    const addressLine1 =
      this.joinAddressParts([address.house_number, street], ' ') || street;
    const city =
      address.city || address.town || address.village || address.county || '';
    const state = address.state || address.county || '';

    return {
      display_name: item.display_name,
      address_line1: addressLine1,
      address_line2: this.joinAddressParts([
        address.neighbourhood,
        address.suburb,
      ]),
      city,
      state,
      postal_code: address.postcode ?? '',
      country: 'GB',
    };
  }

  getStreetName(address: NominatimAddress): string {
    return (
      address.road ||
      address.pedestrian ||
      address.footway ||
      address.path ||
      address.residential ||
      ''
    );
  }

  joinAddressParts(parts: Array<string | undefined>, separator = ', '): string {
    return parts
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part))
      .join(separator);
  }

  joinUniqueAddressParts(
    parts: Array<string | undefined>,
    separator = ', ',
    excluded: Array<string | undefined> = [],
  ): string {
    const seen = new Set(
      excluded.map((part) => this.normalizeAddressPart(part)).filter(Boolean),
    );
    return parts
      .map((part) => part?.trim())
      .filter((part): part is string => {
        if (!part) return false;
        const normalized = this.normalizeAddressPart(part);
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      })
      .join(separator);
  }

  firstDistinctAddressPart(
    parts: Array<string | undefined>,
    excluded: Array<string | undefined>,
  ): string {
    const excludedParts = new Set(
      excluded.map((part) => this.normalizeAddressPart(part)).filter(Boolean),
    );
    return (
      parts
        .find((part) => {
          const normalized = this.normalizeAddressPart(part);
          return Boolean(normalized) && !excludedParts.has(normalized);
        })
        ?.trim() ?? ''
    );
  }

  private normalizeAddressPart(value?: string): string {
    return value?.trim().toLocaleLowerCase() ?? '';
  }

  normalizeQuery(value?: string): string {
    return value?.trim() ?? '';
  }

  isUkPostcode(value: string): boolean {
    return UK_POSTCODE_PATTERN.test(value.trim());
  }

  formatPostcode(value: string): string {
    const compact = value.replace(/\s+/g, '').toUpperCase();
    if (compact.length <= 3) return compact;
    return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
  }
}
