import { BadRequestError } from '@/common/response';

export function normalizeCategoryName(name: string) {
  const normalized = name.trim().replace(/\s+/g, ' ');

  if (!normalized) {
    throw new BadRequestError('Category name is required');
  }

  return normalized;
}

export function normalizeCategorySlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    throw new BadRequestError('Category slug is required');
  }

  return slug;
}
