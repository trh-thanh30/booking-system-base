import { BcryptService } from '@/common/helpers/bcrypt.util';
import { NotFoundError } from '@/common/response';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { UsersRepository } from '@/modules/user/repository/users.repository';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Service for handling user-related operations
 */
@Injectable()
export class UsersService {
  /**
   * Initialize service with repository and password hashing helper.
   */
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  /**
   * Find user by email
   * @param email - User's email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  /**
   * Find user by username
   * @param username - User's username
   * @returns User or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findByPhone(phone);
  }

  /**
   * Find user by email or username
   * @param identifier - Email or username
   * @returns User or null if not found
   */
  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.usersRepository.findByEmailOrUsername(identifier);
  }

  /**
   * Find user by ID
   * @param id - User's ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findAuthProfileById(id: string) {
    return this.usersRepository.findAuthProfileById(id);
  }

  /**
   * Create a new user
   * @param dto - User creation data
   * @returns Created user
   */
  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.bcryptService.hashPassword(dto.password);
    return this.usersRepository.createUnchecked({
      ...dto,
      password: hashedPassword,
    });
  }

  async createInTenant(tenantId: string, dto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.bcryptService.hashPassword(dto.password);

    return this.usersRepository.createUnchecked({
      ...dto,
      tenant_id: tenantId,
      password: hashedPassword,
    });
  }

  /**
   * Update user information
   * @param id - User's ID
   * @param dto - Update data
   * @returns Updated user
   */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    if (dto.password) {
      dto.password = await this.bcryptService.hashPassword(dto.password);
    }
    return this.usersRepository.update(id, dto);
  }

  async updatePasswordAndClearRefreshToken(
    id: string,
    password: string,
  ): Promise<User> {
    const hashedPassword = await this.bcryptService.hashPassword(password);

    return this.usersRepository.update(id, {
      password: hashedPassword,
      refresh_token: null,
    });
  }

  async clearRefreshToken(id: string): Promise<User> {
    return this.usersRepository.update(id, { refresh_token: null });
  }

  /**
   * Get all users
   * @returns List of users
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findAllByTenant(tenantId: string): Promise<User[]> {
    return this.usersRepository.findAllByTenant(tenantId);
  }

  async findByIdInTenant(id: string, tenantId: string): Promise<User | null> {
    return this.usersRepository.findByIdInTenant(id, tenantId);
  }

  async updateInTenant(
    id: string,
    tenantId: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    if (dto.password) {
      dto.password = await this.bcryptService.hashPassword(dto.password);
    }

    const user = await this.findByIdInTenant(id, tenantId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.usersRepository.update(id, dto);
  }

  async deleteInTenant(id: string, tenantId: string): Promise<User> {
    const user = await this.findByIdInTenant(id, tenantId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.usersRepository.delete(id);
  }

  /**
   * Delete user by ID
   * @param id - User's ID
   * @returns Deleted user
   */
  async delete(id: string): Promise<User> {
    return this.usersRepository.delete(id);
  }
}
