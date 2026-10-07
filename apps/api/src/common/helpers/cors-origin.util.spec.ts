import {
  isCorsOriginAllowed,
  parseCorsOrigins,
} from '@/common/helpers/cors-origin.util';

describe('CORS origin utilities', () => {
  const configuredOrigins = [
    'http://localhost:3001',
    'https://platform.bookingbase.com',
  ];
  const workspaceUrl = 'https://app.bookingbase.com';

  it('parses and normalizes configured HTTP origins', () => {
    expect(
      parseCorsOrigins(
        ' http://localhost:3001,https://app.bookingbase.com/,not-a-url ',
      ),
    ).toEqual(['http://localhost:3001', 'https://app.bookingbase.com']);
  });

  it('allows configured origins and one-label Tenant workspace origins', () => {
    expect(
      isCorsOriginAllowed(
        'http://localhost:3001',
        configuredOrigins,
        workspaceUrl,
      ),
    ).toBe(true);
    expect(
      isCorsOriginAllowed(
        'https://acme.app.bookingbase.com',
        configuredOrigins,
        workspaceUrl,
      ),
    ).toBe(true);
    expect(
      isCorsOriginAllowed(
        'https://app.bookingbase.com',
        configuredOrigins,
        workspaceUrl,
      ),
    ).toBe(true);
  });

  it('rejects lookalike, nested, wrong protocol and wrong port origins', () => {
    for (const origin of [
      'https://evil-app.bookingbase.com',
      'https://nested.acme.app.bookingbase.com',
      'http://acme.app.bookingbase.com',
      'https://acme.app.bookingbase.com:444',
      'https://app.bookingbase.com.evil.test',
      'not-a-url',
    ]) {
      expect(isCorsOriginAllowed(origin, configuredOrigins, workspaceUrl)).toBe(
        false,
      );
    }
  });

  it('allows requests without an Origin header', () => {
    expect(
      isCorsOriginAllowed(undefined, configuredOrigins, workspaceUrl),
    ).toBe(true);
  });

  it('does not enable Tenant subdomains for the localhost development base', () => {
    expect(
      isCorsOriginAllowed(
        'http://acme.localhost:3001',
        ['http://localhost:3001'],
        'http://localhost:3001',
      ),
    ).toBe(false);
  });
});
