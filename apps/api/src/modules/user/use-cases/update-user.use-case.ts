import { BcryptService } from '@/common/helpers/bcrypt.util';
import { NotFoundError } from '@/common/response';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { UsersRepository } from '@/modules/user/repository/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(tenantId: string, userId: string, dto: UpdateUserDto) {
    const user = await this.usersRepository.findByIdInTenant(userId, tenantId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const data = { ...dto };
    if (data.password) {
      data.password = await this.bcryptService.hashPassword(data.password);
      return this.usersRepository.update(userId, {
        ...data,
        refresh_token: null,
      });
    }

    return this.usersRepository.update(userId, data);
  }
}
