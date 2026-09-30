import { registerAs } from '@nestjs/config';

export default registerAs('googleOAuth', () => ({
  adminUrl:
    process.env.ADMIN_URL ??
    process.env.NEXT_PUBLIC_ADMIN_URL ??
    'http://localhost:3001',
  clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI ?? '',
  stateTtlSeconds: Number(process.env.GOOGLE_OAUTH_STATE_TTL_SECONDS ?? 600),
  onboardingTtlSeconds: Number(
    process.env.GOOGLE_ONBOARDING_TTL_SECONDS ?? 15 * 60,
  ),
}));
