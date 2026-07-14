import { REQUIRE_BUSINESS_KEY } from '@/common/decorators/require-business.decorator';
import { BadRequestError, ForbiddenError } from '@/common/response';
import { BusinessRepository } from '@/modules/business/repository/business.repository';
import { toBusinessContext } from '@/modules/business/business.types';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { business_status, user_role } from '@prisma/client';
import type { Request } from 'express';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class BusinessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly businessRepository: BusinessRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireBusiness = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_BUSINESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireBusiness) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const tenant = request.tenant;
    const user = request.user;

    if (!tenant) {
      throw new BadRequestError('Tenant context is required');
    }

    if (!user) {
      throw new ForbiddenError('User context is required');
    }

    const businessId = this.getHeader(request, 'x-business-id');
    if (!businessId || !UUID_REGEX.test(businessId)) {
      throw new BadRequestError('Business context is required');
    }

    const business = await this.businessRepository.findAccessibleById(
      businessId,
      tenant.id,
      user.id,
      user.role === user_role.OWNER,
    );

    if (!business) {
      throw new ForbiddenError('Business is not accessible');
    }

    if (business.status !== business_status.ACTIVE) {
      throw new ForbiddenError('Business is not active');
    }

    request.business = toBusinessContext(business);

    return true;
  }

  private getHeader(req: Request, name: string) {
    const value = req.headers?.[name];
    if (Array.isArray(value)) return value[0];
    return value;
  }
}
