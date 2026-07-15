import { BadRequestError } from '@/common/response';

export function normalizeServiceName(name: string) {
  const normalized = name.trim().replace(/\s+/g, ' ');

  if (!normalized) {
    throw new BadRequestError('Service name is required');
  }

  return normalized;
}

export function normalizeServiceSlug(value: string) {
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

export function normalizeServiceCurrency(value: string | undefined) {
  return (value?.trim() || 'VND').toUpperCase();
}
