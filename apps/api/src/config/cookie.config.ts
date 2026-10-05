import { registerAs } from '@nestjs/config';

const isProd = process.env.NODE_ENV === 'production';

function durationToMs(value: string): number {
  const match = value.match(/^(\d+)([smhd])/);
  if (!match || match[0] !== value) {
    throw new Error('JWT_REFRESH_EXPIRES_IN must use s, m, h, or d units');
  }

  const amount = Number(match[1]);
  const multipliers = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * multipliers[match[2] as keyof typeof multipliers];
}

export default registerAs('cookie', () => {
  const domain = isProd ? process.env.COOKIE_DOMAIN : 'localhost';
  const secure = isProd || process.env.COOKIE_SECURE === 'true';
  const sameSite =
    (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none' | undefined) ??
    'lax';
  const partitioned = process.env.COOKIE_PARTITIONED === 'true';
  const refreshTokenTtl = durationToMs(
    process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  );
  const maxAge = Number(process.env.COOKIE_MAX_AGE || String(refreshTokenTtl));
  const configuredRefreshPath =
    process.env.COOKIE_AUTH_PATH_PREFIX || '/api/v1/auth';
  const refreshBasePath = configuredRefreshPath.endsWith('/')
    ? configuredRefreshPath.slice(0, -1)
    : configuredRefreshPath;

  if (maxAge !== refreshTokenTtl) {
    throw new Error('COOKIE_MAX_AGE must match JWT_REFRESH_EXPIRES_IN');
  }

  if (sameSite === 'none') {
    throw new Error('COOKIE_SAME_SITE=none requires CSRF protection');
  }

  return {
    // In production, if domain is not explicitly provided or is localhost,
    // it's better to leave it undefined so it defaults to the host domain.
    domain: domain && domain !== 'localhost' ? domain : undefined,
    // SameSite=None stays disabled until cookie-auth endpoints have CSRF protection.
    sameSite: sameSite,
    secure,
    httpOnly: true,
    maxAge,
    path: process.env.COOKIE_PATH || '/',
    refreshPaths: {
      client: refreshBasePath,
      admin: refreshBasePath + '/admin',
      platform: refreshBasePath + '/platform',
    },
    oauthCallbackPath: refreshBasePath + '/admin/google/callback',
    googleOnboardingPath: refreshBasePath + '/admin/google/onboarding',
    // Only enable CHIPS/Partitioned cookies for true third-party embeds.
    // Admin/API run under the same site in production, so regular cross-subdomain
    // cookies are more reliable.
    partitioned,
  };
});
