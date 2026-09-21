import { BcryptService } from '@/common/helpers/bcrypt.util';
import { PrismaService } from '@/database/prisma/prisma.service';
import { UsersRepository } from '@/modules/user/repository/users.repository';
import { UsersController } from '@/modules/user/user.controller';
import { UsersService } from '@/modules/user/user.service';
import { CreateUserUseCase } from '@/modules/user/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '@/modules/user/use-cases/delete-user.use-case';
import { GetUserUseCase } from '@/modules/user/use-cases/get-user.use-case';
import { ListUsersUseCase } from '@/modules/user/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '@/modules/user/use-cases/update-user.use-case';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersService,
    CreateUserUseCase,
    ListUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    PrismaService,
    BcryptService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
