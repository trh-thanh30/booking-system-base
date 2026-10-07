import { CommonService } from '@/modules/common/common.service';
import { CommonUtils } from '@/modules/common/helpers/common.utils';
import type { GeocodingResult } from '@repo/shared';
import { Test } from '@nestjs/testing';

const result: GeocodingResult = {
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
};

describe('CommonService geocoding', () => {
  let service: CommonService;
  const forwardGeocode = jest.fn<
    ReturnType<CommonUtils['forwardGeocode']>,
    Parameters<CommonUtils['forwardGeocode']>
  >();
  const reverseGeocode = jest.fn<
    ReturnType<CommonUtils['reverseGeocode']>,
    Parameters<CommonUtils['reverseGeocode']>
  >();

  beforeEach(async () => {
    forwardGeocode.mockReset();
    reverseGeocode.mockReset();
    const module = await Test.createTestingModule({
      providers: [
        CommonService,
        {
          provide: CommonUtils,
          useValue: { forwardGeocode, reverseGeocode },
        },
      ],
    }).compile();
    service = module.get(CommonService);
  });

  it('caches identical forward-geocoding requests', async () => {
    forwardGeocode.mockResolvedValue(result);
    const input = {
      countryCode: 'VN',
      addressLine1: '12 Nguyễn Trãi',
      addressLine2: 'Thanh Xuân',
      locality: 'Hà Nội',
      administrativeAreaLevel1: 'Hà Nội',
      administrativeAreaLevel2: 'Thanh Xuân',
      postalCode: '100000',
      locale: 'vi' as const,
    };

    await expect(service.forwardGeocode(input)).resolves.toEqual(result);
    await expect(service.forwardGeocode(input)).resolves.toEqual(result);

    expect(forwardGeocode).toHaveBeenCalledTimes(1);
  });

  it('rounds reverse-geocoding coordinates before lookup and caching', async () => {
    reverseGeocode.mockResolvedValue(result);
    const input = {
      latitude: 21.02850041,
      longitude: 105.85420041,
      locale: 'vi' as const,
    };

    await service.reverseGeocode(input);
    await service.reverseGeocode({
      ...input,
      latitude: 21.0285004,
      longitude: 105.8542004,
    });

    expect(reverseGeocode).toHaveBeenCalledTimes(1);
    expect(reverseGeocode).toHaveBeenCalledWith({
      latitude: 21.0285,
      longitude: 105.8542,
      locale: 'vi',
    });
  });

  it('returns null when the provider fails', async () => {
    forwardGeocode.mockRejectedValue(new Error('provider down'));

    await expect(
      service.forwardGeocode({
        countryCode: 'VN',
        addressLine1: '12 Nguyen Trai',
        addressLine2: '',
        locality: 'Hanoi',
        administrativeAreaLevel1: '',
        administrativeAreaLevel2: '',
        postalCode: '',
        locale: 'en',
      }),
    ).resolves.toBeNull();
  });

  it('logs diagnostic details when the geocoding provider error has no message', async () => {
    const loggerError = jest
      .spyOn(service['logger'], 'error')
      .mockImplementation(() => undefined);
    forwardGeocode.mockRejectedValue({
      name: 'AxiosError',
      message: '',
      code: 'ERR_BAD_RESPONSE',
      response: {
        status: 429,
        statusText: 'Too Many Requests',
        data: { error: 'rate limited' },
      },
    });

    await service.forwardGeocode({
      countryCode: 'VN',
      addressLine1: '12 Nguyen Trai',
      addressLine2: '',
      locality: 'Hanoi',
      administrativeAreaLevel1: '',
      administrativeAreaLevel2: '',
      postalCode: '',
      locale: 'en',
    });

    expect(loggerError).toHaveBeenCalledWith(
      expect.stringContaining('code=ERR_BAD_RESPONSE'),
    );
    expect(loggerError).toHaveBeenCalledWith(
      expect.stringContaining('status=429 Too Many Requests'),
    );
    expect(loggerError).toHaveBeenCalledWith(
      expect.stringContaining('response={"error":"rate limited"}'),
    );
  });
});
