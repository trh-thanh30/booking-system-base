import { SetMetadata } from '@nestjs/common';

export const REQUIRE_TENANT_KEY = 'tenant:required';

export const RequireTenant = () => SetMetadata(REQUIRE_TENANT_KEY, true);
