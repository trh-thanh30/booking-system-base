import { UsersRepository } from '@/modules/user/repository/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  execute(tenantId: string) {
    return this.usersRepository.findAllByTenant(tenantId);
  }
}
