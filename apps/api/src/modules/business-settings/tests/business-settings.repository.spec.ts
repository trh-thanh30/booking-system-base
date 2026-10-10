import { BusinessSettingsRepository } from '../repository/business-settings.repository';
import { ServiceRepository } from '@/modules/service/repository/service.repository';
import type { PrismaService } from '@/database/prisma/prisma.service';
import { Prisma, service_status } from '@prisma/client';

function transactionHarness(
  settings: Prisma.JsonValue = { business_profile: { country: 'VN' } },
) {
  const record = { id: 'business-1', timezone: 'UTC', settings };
  const findFirst = jest.fn().mockResolvedValue(record);
  const update = jest
    .fn()
    .mockImplementation((input) =>
      Promise.resolve({ ...record, settings: input.data.settings }),
    );
  const transaction = jest
    .fn()
    .mockImplementation((operation) =>
      operation({ business: { findFirst, update } }),
    );
  const repository = new BusinessSettingsRepository({
    $transaction: transaction,
  } as unknown as PrismaService);
  return { repository, transaction, findFirst, update };
}

function conflict() {
  return new Prisma.PrismaClientKnownRequestError('Write conflict', {
    code: 'P2034',
    clientVersion: '7.4.1',
  });
}

describe('Quick setup repository boundaries', () => {
  it('checks only active Services belonging to both the Tenant and Business', async () => {
    const findFirst = jest.fn().mockResolvedValue({ id: 'service-1' });
    const repository = new ServiceRepository({
      service: { findFirst },
    } as unknown as PrismaService);
    expect(await repository.hasActiveInBusiness('tenant-1', 'business-1')).toBe(
      true,
    );
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        tenant_id: 'tenant-1',
        business_id: 'business-1',
        status: service_status.ACTIVE,
      },
      select: { id: true },
    });
    findFirst.mockResolvedValue(null);
    expect(await repository.hasActiveInBusiness('tenant-1', 'business-1')).toBe(
      false,
    );
  });

  it('scopes reads to both the Tenant and Business', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const repository = new BusinessSettingsRepository({
      business: { findFirst },
    } as unknown as PrismaService);
    expect(await repository.findInTenant('tenant-1', 'business-1')).toBeNull();
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'business-1', tenant_id: 'tenant-1' },
      select: { id: true, timezone: true, settings: true },
    });
  });

  it('merges settings through scoped ORM reads and writes in a Serializable transaction', async () => {
    const h = transactionHarness();
    expect(
      await h.repository.patchSettings('tenant-1', 'business-1', {
        quick_setup_skipped: true,
      }),
    ).toEqual({
      id: 'business-1',
      timezone: 'UTC',
      settings: {
        business_profile: { country: 'VN' },
        quick_setup_skipped: true,
      },
    });
    expect(h.transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
    expect(h.findFirst).toHaveBeenCalledWith({
      where: { id: 'business-1', tenant_id: 'tenant-1' },
      select: { id: true, timezone: true, settings: true },
    });
    expect(h.update).toHaveBeenCalledWith({
      where: { id: 'business-1', tenant_id: 'tenant-1' },
      data: {
        settings: {
          business_profile: { country: 'VN' },
          quick_setup_skipped: true,
        },
      },
      select: { id: true, timezone: true, settings: true },
    });
  });

  it('returns 403 without writing or retrying when the Business is outside the Tenant', async () => {
    const h = transactionHarness();
    h.findFirst.mockResolvedValue(null);
    await expect(
      h.repository.patchSettings('tenant-1', 'business-2', {
        quick_setup_skipped: true,
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(h.update).not.toHaveBeenCalled();
    expect(h.transaction).toHaveBeenCalledTimes(1);
  });

  it.each([null, [], 'invalid'])(
    'handles non-object saved settings: %j',
    async (settings) => {
      const h = transactionHarness(settings);
      expect(
        await h.repository.patchSettings('tenant-1', 'business-1', {
          booking_template_id: 'modern',
        }),
      ).toMatchObject({ settings: { booking_template_id: 'modern' } });
    },
  );

  it('retries the complete transaction with fresh settings after a write conflict', async () => {
    const h = transactionHarness();
    h.update.mockRejectedValueOnce(conflict());
    h.findFirst.mockResolvedValueOnce({
      id: 'business-1',
      timezone: 'UTC',
      settings: { business_profile: { country: 'VN' } },
    });
    h.findFirst.mockResolvedValueOnce({
      id: 'business-1',
      timezone: 'UTC',
      settings: {
        business_profile: { country: 'VN' },
        booking_template_id: 'modern',
      },
    });
    expect(
      await h.repository.patchSettings('tenant-1', 'business-1', {
        quick_setup_skipped: true,
      }),
    ).toMatchObject({
      settings: {
        business_profile: { country: 'VN' },
        booking_template_id: 'modern',
        quick_setup_skipped: true,
      },
    });
    expect(h.transaction).toHaveBeenCalledTimes(2);
    expect(h.findFirst).toHaveBeenCalledTimes(2);
  });

  it('stops after three transaction attempts when conflicts persist', async () => {
    const h = transactionHarness();
    const error = conflict();
    h.transaction.mockRejectedValue(error);
    await expect(
      h.repository.patchSettings('tenant-1', 'business-1', {
        quick_setup_skipped: true,
      }),
    ).rejects.toBe(error);
    expect(h.transaction).toHaveBeenCalledTimes(3);
  });

  it('does not retry unrelated database errors', async () => {
    const h = transactionHarness();
    const error = new Error('Database unavailable');
    h.transaction.mockRejectedValue(error);
    await expect(
      h.repository.patchSettings('tenant-1', 'business-1', {
        quick_setup_skipped: true,
      }),
    ).rejects.toBe(error);
    expect(h.transaction).toHaveBeenCalledTimes(1);
  });
});
