import { BcryptService } from '@/common/helpers/bcrypt.util';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UsersRepository } from '@/modules/user/repository/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(tenantId: string, dto: CreateUserDto) {
    const password = await this.bcryptService.hashPassword(dto.password);

    return this.usersRepository.createUnchecked({
      ...dto,
      tenant_id: tenantId,
      password,
    });
  }
}
