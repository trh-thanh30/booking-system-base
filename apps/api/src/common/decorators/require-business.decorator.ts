import { SetMetadata } from '@nestjs/common';

export const REQUIRE_BUSINESS_KEY = 'business:required';

export const RequireBusiness = () => SetMetadata(REQUIRE_BUSINESS_KEY, true);
