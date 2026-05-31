import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from '@/module/email/email.service';
import { SendEmailUseCase } from '@/module/email/use-cases/send-email.usecase';
import { SendVerificationEmailUseCase } from '@/module/email/use-cases/send-verification-email.usecase';
import { SendForgotPasswordEmailUseCase } from '@/module/email/use-cases/send-forgot-password-email.usecase';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [
    EmailService,
    SendEmailUseCase,
    SendVerificationEmailUseCase,
    SendForgotPasswordEmailUseCase,
  ],
  exports: [
    EmailService,
    SendEmailUseCase,
    SendVerificationEmailUseCase,
    SendForgotPasswordEmailUseCase,
  ],
})
export class EmailModule {}
