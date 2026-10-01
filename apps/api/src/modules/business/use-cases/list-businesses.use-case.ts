import { BusinessRepository } from '@/modules/business/repository/business.repository';
import { toBusinessContext } from '@/modules/business/business.types';
import { Injectable } from '@nestjs/common';
import { user_role } from '@prisma/client';

@Injectable()
export class ListBusinessesUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(tenantId: string, userId: string, role: user_role) {
    const businesses = await this.businessRepository.listForUser(
      userId,
      tenantId,
      role === user_role.OWNER,
    );
    return businesses.map(toBusinessContext);
  }
}
