import { UnauthorizedError } from '@/common/response';
import { googleOAuthConfig } from '@/config';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library';
import { timingSafeEqual } from 'node:crypto';

export type GoogleIdentityProfile = {
  email: string;
  emailVerified: true;
  name?: string;
  picture?: string;
  subject: string;
};

@Injectable()
export class GoogleOAuthProvider {
  private readonly client: OAuth2Client;

  constructor(
    @Inject(googleOAuthConfig.KEY)
    private readonly config: ConfigType<typeof googleOAuthConfig>,
  ) {
    this.client = new OAuth2Client({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
    });
  }

  createAuthorizationUrl(input: {
    codeChallenge: string;
    nonce: string;
    state: string;
  }): string {
    this.assertConfigured();
    return this.client.generateAuthUrl({
      access_type: 'online',
      code_challenge: input.codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
      nonce: input.nonce,
      prompt: 'select_account',
      scope: ['openid', 'email', 'profile'],
      state: input.state,
    });
  }

  async exchangeCode(input: {
    code: string;
    codeVerifier: string;
    nonce: string;
  }): Promise<GoogleIdentityProfile> {
    this.assertConfigured();

    try {
      const { tokens } = await this.client.getToken({
        code: input.code,
        codeVerifier: input.codeVerifier,
        redirect_uri: this.config.redirectUri,
      });
      if (!tokens.id_token) {
        throw new UnauthorizedError(
          'Google did not return an ID token',
          'GOOGLE_ID_TOKEN_MISSING',
        );
      }

      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.config.clientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        throw new UnauthorizedError(
          'Google identity is incomplete',
          'GOOGLE_IDENTITY_INVALID',
        );
      }
      if (!payload.email_verified) {
        throw new UnauthorizedError(
          'Google email is not verified',
          'GOOGLE_EMAIL_NOT_VERIFIED',
        );
      }
      if (!payload.nonce || !this.valuesMatch(payload.nonce, input.nonce)) {
        throw new UnauthorizedError(
          'Invalid Google ID token nonce',
          'GOOGLE_NONCE_INVALID',
        );
      }

      return {
        email: payload.email.trim().toLowerCase(),
        emailVerified: true,
        name: payload.name,
        picture: payload.picture,
        subject: payload.sub,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError(
        'Google authentication failed',
        'GOOGLE_AUTH_FAILED',
      );
    }
  }

  private assertConfigured(): void {
    if (
      !this.config.clientId ||
      !this.config.clientSecret ||
      !this.config.redirectUri
    ) {
      throw new Error('Google OAuth is not configured');
    }
  }

  private valuesMatch(value: string, expected: string): boolean {
    const actualBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);
    return (
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(actualBuffer, expectedBuffer)
    );
  }
}
