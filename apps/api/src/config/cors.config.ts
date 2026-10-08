import { parseCorsOrigins } from '@/common/helpers/cors-origin.util';
import { registerAs } from '@nestjs/config';

const DEFAULT_CORS_ORIGINS =
  'http://localhost:3000,http://localhost:3001,http://localhost:4200';
const DEFAULT_ADMIN_WORKSPACE_URL = 'http://localhost:3001';

export default registerAs('cors', () => ({
  origins: parseCorsOrigins(process.env.CORS_ORIGINS ?? DEFAULT_CORS_ORIGINS),
  adminWorkspaceUrl:
    process.env.ADMIN_WORKSPACE_URL ?? DEFAULT_ADMIN_WORKSPACE_URL,
}));
