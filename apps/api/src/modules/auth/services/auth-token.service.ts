import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { jwtConfig } from '@/config';
import type { AuthContext } from '@/modules/auth/auth.types';
import { UnauthorizedError } from '@/common/response/client-errors/unauthorized';
import { randomUUID } from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTTokenPayload } from '@/shared/interfaces/token.interface';

/**
 * Interface for user token payload containing user information
 */
export interface IUserTokenPayload {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  auth_context: AuthContext;
}

/**
 * Service for handling JWT token generation and verification
 * Uses JWT standard claims (iss, sub, aud, jti) for security
 */
@Injectable()
export class AuthTokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;
  private readonly issuer = 'booking-system';

  /**
   * Constructor injects JWT configuration
   * @param jwtCfg JWT configuration from config service
   */
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtCfg: ConfigType<typeof jwtConfig>,
  ) {
    this.accessSecret = this.jwtCfg.accessSecret;
    this.refreshSecret = this.jwtCfg.refreshSecret;
    this.accessExpiresIn = this.jwtCfg.accessExpiresIn;
    this.refreshExpiresIn = this.jwtCfg.refreshExpiresIn;
  }

  generateAccessToken(
    userPayload: Omit<IUserTokenPayload, 'auth_context'>,
    authContext: AuthContext,
  ): string {
    const fullPayload: JWTTokenPayload<IUserTokenPayload> = {
      payload: { ...userPayload, auth_context: authContext },
      iss: this.issuer,
      sub: userPayload.id,
      aud: this.getAudience(authContext),
      jti: randomUUID(),
    };

    return jwt.sign(fullPayload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
      algorithm: 'HS256',
    } as SignOptions);
  }

  /**
   * Generates access and refresh token pair for user authentication
   * @param userPayload User information to include in token
   * @returns Object containing access_token and refresh_token
   */
  generateTokenPair(
    userPayload: Omit<IUserTokenPayload, 'auth_context'>,
    authContext: AuthContext,
  ): {
    access_token: string;
    refresh_token: string;
  } {
    const fullPayload: JWTTokenPayload<IUserTokenPayload> = {
      payload: { ...userPayload, auth_context: authContext },
      iss: this.issuer,
      sub: userPayload.id,
      aud: this.getAudience(authContext),
      jti: randomUUID(),
      // exp, iat, nbf will be set by jwt.sign
    };

    const access_token = this.generateAccessToken(userPayload, authContext);

    const refresh_token = jwt.sign(fullPayload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
      algorithm: 'HS256',
    } as SignOptions);

    return { access_token, refresh_token };
  }

  /**
   * Verifies access token for API authentication
   * @param token JWT access token to verify
   * @returns Decoded token payload
   * @throws UnauthorizedError if token is invalid or expired
   */
  verifyAccessToken(token: string): JWTTokenPayload<IUserTokenPayload> {
    try {
      const decoded = jwt.verify(token, this.accessSecret, {
        algorithms: ['HS256'],
        audience: [
          this.getAudience('platform'),
          this.getAudience('admin'),
          this.getAudience('client'),
        ],
        issuer: this.issuer,
      }) as JWTTokenPayload<IUserTokenPayload>;
      if (typeof decoded === 'string') {
        throw new UnauthorizedError('Invalid or expired access token.');
      }
      return decoded;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token.');
    }
  }

  /**
   * Verifies refresh token for token renewal
   * @param token JWT refresh token to verify
   * @returns Decoded token payload
   * @throws UnauthorizedError if token is invalid or expired
   */
  verifyRefreshToken(
    token: string,
    expectedContext: AuthContext,
  ): JWTTokenPayload<IUserTokenPayload> {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        algorithms: ['HS256'],
        audience: this.getAudience(expectedContext),
        issuer: this.issuer,
      }) as JWTTokenPayload<IUserTokenPayload>;
      if (
        typeof decoded === 'string' ||
        decoded.payload.auth_context !== expectedContext
      ) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }
      return decoded;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  private getAudience(context: AuthContext): string {
    return 'booking-system:' + context;
  }
}
