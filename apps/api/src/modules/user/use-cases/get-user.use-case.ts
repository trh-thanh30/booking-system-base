import { NotFoundError } from '@/common/response';
import { UsersRepository } from '@/modules/user/repository/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(tenantId: string, userId: string) {
    const user = await this.usersRepository.findByIdInTenant(userId, tenantId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}
