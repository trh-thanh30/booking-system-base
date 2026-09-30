import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { SendMailOptions } from 'nodemailer';

import { WorkerEmailService } from '@/workers/email/worker.service';

const mockSendMail =
  jest.fn<(message: SendMailOptions) => Promise<{ messageId: string }>>();
const mockVerify = jest.fn<() => Promise<boolean>>();
let sentMessage: SendMailOptions | undefined;

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
    verify: mockVerify,
  })),
}));

describe('WorkerEmailService templates', () => {
  const templatesPath = path.join(
    process.cwd(),
    'src',
    'modules',
    'email',
    'templates',
  );

  beforeEach(() => {
    jest.clearAllMocks();
    sentMessage = undefined;
    mockSendMail.mockImplementation((message: SendMailOptions) => {
      sentMessage = message;
      return Promise.resolve({ messageId: 'message-1' });
    });
    mockVerify.mockResolvedValue(true);
  });

  it('renders MJML Handlebars templates to email-safe HTML', async () => {
    const service = createService(templatesPath);

    await service.sendVerificationEmail(
      'user@example.com',
      '123456',
      new Date('2026-09-30T12:15:00.000Z'),
    );

    expect(sentMessage?.html).toContain('123456');
    expect(sentMessage?.html).not.toContain('<mjml>');
    expect(sentMessage?.subject).toBe('Verify your email');
    expect(sentMessage?.to).toBe('user@example.com');
  });

  it('does not fall back to legacy HTML Handlebars templates', async () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'booking-email-'),
    );
    fs.writeFileSync(
      path.join(temporaryDirectory, 'legacy.hbs'),
      '<p>Legacy template</p>',
    );

    try {
      const service = createService(temporaryDirectory);

      await expect(
        service.sendTemplatedEmail('user@example.com', 'legacy', {
          subject: 'Legacy template',
        }),
      ).rejects.toThrow('legacy.mjml.hbs');
      expect(mockSendMail).not.toHaveBeenCalled();
    } finally {
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });
});

function createService(templatesPath: string): WorkerEmailService {
  return new WorkerEmailService({
    from: 'Booking System <no-reply@example.com>',
    host: 'smtp.example.com',
    pass: 'secret',
    port: 587,
    secure: false,
    templatesPath,
    user: 'no-reply@example.com',
  });
}
