import { BadRequestError } from '@/common/response';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ServiceInputNormalizer {
  normalizeName(name: string) {
    const normalized = name.trim().replace(/\s+/g, ' ');

    if (!normalized) {
      throw new BadRequestError('Service name is required');
    }

    return normalized;
  }

  normalizeSlug(value: string) {
    const slug = value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      throw new BadRequestError('Service slug is required');
    }

    return slug;
  }

  normalizeCurrency(value: string | undefined) {
    return (value?.trim() || 'VND').toUpperCase();
  }
}
