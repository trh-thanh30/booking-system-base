import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { CommonController } from '@/modules/common/common.controller';

describe('CommonController access policy', () => {
  it('is public so onboarding can geocode without an access token', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, CommonController)).toBe(true);
  });
});
