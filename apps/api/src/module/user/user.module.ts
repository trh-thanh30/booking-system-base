import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { BcryptService } from '@/common/helpers/bcrypt.util';
import { AuthTokenService } from '@/module/auth/service/auth-token.service';
import { UsersController } from '@/module/user/user.controller';
import { UsersService } from '@/module/user/user.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, BcryptService, AuthTokenService],
  exports: [UsersService],
})
export class UsersModule {}
