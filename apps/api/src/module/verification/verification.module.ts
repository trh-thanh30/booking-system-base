import { Module } from '@nestjs/common';
import { RedisModule } from '@/database/redis/redis.module';
import { VerificationService } from '@/module/verification/verification.service';

@Module({
  imports: [RedisModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
