import { GoogleOAuthProvider } from '@/modules/auth/providers/google-oauth.provider';
import { GoogleOAuthStateService } from '@/modules/auth/services/google-oauth-state.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StartGoogleLoginUseCase {
  constructor(
    private readonly stateService: GoogleOAuthStateService,
    private readonly googleOAuthProvider: GoogleOAuthProvider,
  ) {}

  async execute(input: { locale?: 'vi' | 'en'; returnTo?: string }) {
    const session = await this.stateService.create(input);
    return {
      authorizationUrl: this.googleOAuthProvider.createAuthorizationUrl({
        codeChallenge: session.codeChallenge,
        nonce: session.nonce,
        state: session.state,
      }),
      state: session.state,
      stateTtlSeconds: this.stateService.ttlSeconds,
    };
  }
}
