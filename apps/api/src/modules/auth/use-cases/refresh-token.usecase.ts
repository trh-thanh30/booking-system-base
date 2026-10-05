import { UnauthorizedError } from '@/common/response/client-errors/unauthorized';
import { PrismaService } from '@/database/prisma/prisma.service';
import type { AuthContext } from '@/modules/auth/auth.types';
import { AuthTokenService } from '@/modules/auth/services/auth-token.service';
import { RefreshTokenSessionService } from '@/modules/auth/services/refresh-token-session.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';
import { user_role, user_status } from '@prisma/client';

export interface RefreshTokenResponse {
  access_token: string;
}

@Injectable()
export class RefreshTokenUseCase extends BaseUseCase<
  string,
  RefreshTokenResponse
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: AuthTokenService,
    private readonly refreshTokenSessionService: RefreshTokenSessionService = new RefreshTokenSessionService(),
  ) {
    super();
  }

  async execute(
    refreshToken: string,
    requiredRole?: user_role | user_role[],
    authContext: AuthContext = 'client',
  ): Promise<RefreshTokenResponse> {
    if (!refreshToken) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    try {
      // 1. Verify the refresh token
      const decoded = this.tokenService.verifyRefreshToken(
        refreshToken,
        authContext,
      );

      // 2. Find user and check if token matches
      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.payload.id },
      });

      if (!user) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      if (decoded.payload.tenant_id !== user.tenant_id) {
        await this.prismaService.user.update({
          where: { id: user.id },
          data: { refresh_token_hash: null },
        });
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      if (
        !this.refreshTokenSessionService.matches(
          refreshToken,
          user.refresh_token_hash,
        )
      ) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      if (user.status !== user_status.ACTIVE) {
        await this.prismaService.user.update({
          where: { id: user.id },
          data: { refresh_token_hash: null },
        });
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      if (!user.is_verified) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      if (requiredRole && !this.isAllowedRole(user.role, requiredRole)) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      const isBusinessAdmin =
        user.role === user_role.OWNER || user.role === user_role.STAFF;
      if (isBusinessAdmin && !user.tenant_id) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      // 3. Generate a fresh access token but keep the refresh token stable.
      // Rotating the refresh token on every refresh can invalidate another
      // in-flight refresh request from a second tab and force a logout.
      const accessToken = this.tokenService.generateAccessToken(
        {
          id: user.id,
          tenant_id: user.tenant_id,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
        },
        authContext,
      );

      return { access_token: accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async revoke(
    refreshToken: string,
    requiredRole?: user_role | user_role[],
    authContext: AuthContext = 'client',
  ) {
    if (!refreshToken) {
      return;
    }

    try {
      const decoded = this.tokenService.verifyRefreshToken(
        refreshToken,
        authContext,
      );
      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.payload.id },
      });

      if (
        user &&
        this.refreshTokenSessionService.matches(
          refreshToken,
          user.refresh_token_hash,
        ) &&
        (!requiredRole || this.isAllowedRole(user.role, requiredRole))
      ) {
        await this.prismaService.user.update({
          where: { id: user.id },
          data: { refresh_token_hash: null },
        });
      }
    } catch {
      return;
    }
  }

  private isAllowedRole(
    role: user_role,
    requiredRole: user_role | user_role[],
  ): boolean {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(role);
  }
}
