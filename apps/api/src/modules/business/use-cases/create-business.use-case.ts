import { ConflictError } from '@/common/response';
import { CreateBusinessDto } from '@/modules/business/dto/create-business.dto';
import { BusinessRepository } from '@/modules/business/repository/business.repository';
import { toBusinessContext } from '@/modules/business/business.types';
import { Injectable } from '@nestjs/common';
import { business_status, type Prisma } from '@prisma/client';

@Injectable()
export class CreateBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(tenantId: string, dto: CreateBusinessDto) {
    const existing = await this.businessRepository.findBySlugInTenant(
      tenantId,
      dto.slug,
    );

    if (existing) {
      throw new ConflictError('Business slug is already taken');
    }

    const business = await this.businessRepository.create({
      tenant_id: tenantId,
      slug: dto.slug,
      name: dto.name,
      status: dto.status ?? business_status.ACTIVE,
      timezone: dto.timezone ?? 'Asia/Ho_Chi_Minh',
      locale: dto.locale ?? 'vi',
      settings: (dto.settings ?? {}) as Prisma.InputJsonValue,
      is_default: false,
    });

    return toBusinessContext(business);
  }
}
