import { PrismaService } from '@/database/prisma/prisma.service';
import { ForbiddenError } from '@/common/response';
import { Injectable } from '@nestjs/common';
import type { Business } from '@prisma/client';
import { Prisma } from '@prisma/client';

export type BusinessSettingsRecord = Pick<
  Business,
  'id' | 'timezone' | 'settings'
>;

@Injectable()
export class BusinessSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findInTenant(tenantId: string, businessId: string) {
    return this.prisma.business.findFirst({
      where: { id: businessId, tenant_id: tenantId },
      select: { id: true, timezone: true, settings: true },
    });
  }

  async patchSettings(
    tenantId: string,
    businessId: string,
    patch: Prisma.InputJsonObject,
  ): Promise<BusinessSettingsRecord> {
    // Retry the entire read/merge/write so a concurrent update is never lost.
    const maxAttempts = 3;
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (transaction) => {
            const business = await transaction.business.findFirst({
              where: { id: businessId, tenant_id: tenantId },
              select: { id: true, timezone: true, settings: true },
            });
            if (!business)
              throw new ForbiddenError('Business is not accessible');

            const settings =
              business.settings !== null &&
              typeof business.settings === 'object' &&
              !Array.isArray(business.settings)
                ? business.settings
                : {};

            return transaction.business.update({
              where: { id: businessId, tenant_id: tenantId },
              data: { settings: { ...settings, ...patch } },
              select: { id: true, timezone: true, settings: true },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          error.code !== 'P2034' ||
          attempt >= maxAttempts
        ) {
          throw error;
        }
      }
    }
  }
}
