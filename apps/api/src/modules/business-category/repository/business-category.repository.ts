import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { business_category_status } from '@prisma/client';

@Injectable()
export class BusinessCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  listActive() {
    return this.prisma.businessCategory.findMany({
      where: { status: business_category_status.ACTIVE },
      select: {
        id: true,
        slug: true,
        name_vi: true,
        name_en: true,
        metadata: true,
      },
      orderBy: [{ sort_order: 'asc' }, { name_en: 'asc' }],
    });
  }

  findActiveById(id: string) {
    return this.prisma.businessCategory.findFirst({
      where: { id, status: business_category_status.ACTIVE },
      select: { id: true },
    });
  }
}
