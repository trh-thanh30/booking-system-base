import { clientConfig } from '@/config';
import { CommonUtils } from '@/modules/common/helpers/common.utils';
import { HttpService } from '@nestjs/axios';
import { Test } from '@nestjs/testing';

describe('CommonUtils geocoding mapping', () => {
  let utils: CommonUtils;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommonUtils,
        { provide: HttpService, useValue: {} },
        {
          provide: clientConfig.KEY,
          useValue: {
            nominatimBaseUrl: 'https://nominatim.example',
            nominatimUserAgent: 'booking-base-test',
          },
        },
      ],
    }).compile();
    utils = module.get(CommonUtils);
  });

  it('maps a Nominatim result to the shared address contract', () => {
    expect(
      utils.mapGeocodingResult({
        display_name: '12 Nguyễn Trãi, Hà Nội, Việt Nam',
        lat: '21.0285',
        lon: '105.8542',
        address: {
          house_number: '12',
          road: 'Nguyễn Trãi',
          neighbourhood: 'Thanh Xuân',
          suburb: 'Thanh Xuân',
          city: 'Hà Nội',
          city_district: 'Thanh Xuân',
          state: 'Hà Nội',
          postcode: '100000',
          country: 'Việt Nam',
          country_code: 'vn',
        },
      }),
    ).toEqual({
      displayName: '12 Nguyễn Trãi, Hà Nội, Việt Nam',
      address: {
        countryCode: 'VN',
        addressLine1: '12 Nguyễn Trãi',
        addressLine2: 'Thanh Xuân',
        locality: 'Hà Nội',
        administrativeAreaLevel1: 'Hà Nội',
        administrativeAreaLevel2: 'Thanh Xuân',
        postalCode: '100000',
        formattedAddress: '12 Nguyễn Trãi, Hà Nội, Việt Nam',
      },
      location: { latitude: 21.0285, longitude: 105.8542 },
    });
  });

  it('rejects results without valid coordinates', () => {
    expect(
      utils.mapGeocodingResult({
        display_name: 'Unknown place',
        address: { country: 'Vietnam' },
      }),
    ).toBeNull();
  });
});
