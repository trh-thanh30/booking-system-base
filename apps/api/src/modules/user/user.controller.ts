import { Permissions, RequireTenant, Tenant } from '@/common/decorators';
import type { TenantContext } from '@/common/types/tenant-context.types';
import { PERMISSIONS } from '@/modules/permission/constants/permission.constants';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { CreateUserUseCase } from '@/modules/user/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '@/modules/user/use-cases/delete-user.use-case';
import { GetUserUseCase } from '@/modules/user/use-cases/get-user.use-case';
import { ListUsersUseCase } from '@/modules/user/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '@/modules/user/use-cases/update-user.use-case';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

/**
 * Controller for user management endpoints
 */
@Controller('users')
@RequireTenant()
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  /**
   * Create a new user (Admin only)
   * @param createUserDto - User creation data
   * @returns Created user
   */
  @Post()
  @Permissions([PERMISSIONS.USER.CREATE])
  async create(
    @Tenant() tenant: TenantContext,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.createUserUseCase.execute(tenant.id, createUserDto);
  }

  /**
   * Get all users (Admin only)
   * @returns List of all users
   */
  @Get()
  @Permissions([PERMISSIONS.USER.READ])
  async findAll(@Tenant() tenant: TenantContext) {
    return this.listUsersUseCase.execute(tenant.id);
  }

  /**
   * Get user by ID (Admin only)
   * @param id - User ID
   * @returns User data
   */
  @Get(':id')
  @Permissions([PERMISSIONS.USER.READ])
  async findOne(@Tenant() tenant: TenantContext, @Param('id') id: string) {
    return this.getUserUseCase.execute(tenant.id, id);
  }

  /**
   * Update user by ID (Admin only)
   * @param id - User ID
   * @param updateUserDto - Update data
   * @returns Updated user
   */
  @Put(':id')
  @Permissions([PERMISSIONS.USER.UPDATE])
  async update(
    @Tenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.updateUserUseCase.execute(tenant.id, id, updateUserDto);
  }

  /**
   * Delete user by ID (Admin only)
   * @param id - User ID
   * @returns Deleted user
   */
  @Delete(':id')
  @Permissions([PERMISSIONS.USER.DELETE])
  async remove(@Tenant() tenant: TenantContext, @Param('id') id: string) {
    return this.deleteUserUseCase.execute(tenant.id, id);
  }
}
