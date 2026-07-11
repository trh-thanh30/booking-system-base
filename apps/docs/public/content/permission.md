# Permission API

Permission module cung cấp permission engine dùng chung cho toàn API: định nghĩa danh mục quyền, gán quyền trực tiếp cho user theo tenant, và guard để bảo vệ endpoint bằng `@Permissions()`.

Backend module:

```txt
apps/api/src/modules/permission
```

Shared constants:

```txt
packages/shared/src/constants/permissions.ts
```

FE Admin dùng module này cho:

- Lấy danh sách quyền để render form phân quyền.
- Xem quyền hiện tại của user.
- Gán thêm quyền cho user.
- Replace toàn bộ quyền user.
- Thu hồi quyền user.
- Ẩn/hiện navigation và action theo permissions từ `/auth/me`.

## Trạng thái triển khai

Status: `implemented`

Đã hỗ trợ:

- `Permission` dictionary.
- `UserPermission` assignment theo `user_id + tenant_id`.
- `PermissionsGuard`.
- `@Permissions()` decorator.
- `SUPER_ADMIN` bypass permission check toàn hệ thống.
- `OWNER` bypass permission check trong tenant của chính họ.
- `resource:manage` cover action cùng resource.
- API list permissions.
- API list/assign/replace/revoke user permissions.
- Unit tests cho use cases và guard.

Không dùng:

- Không dùng `Role`.
- Không dùng `UserRole`.
- Không dùng `RolePermission`.

## Mô hình phân quyền

F1 dùng mô hình hybrid tối giản:

```txt
user_role enum        -> quyền thô
UserPermission table  -> quyền chi tiết theo user trong tenant
```

Role thô hiện có:

| Role        | Ý nghĩa chính                               |
| ----------- | ------------------------------------------- |
| SUPER_ADMIN | Quản trị platform, không phụ thuộc tenant   |
| OWNER       | Chủ tenant, bypass permission trong tenant  |
| STAFF       | Nhân sự tenant, phải có permission chi tiết |
| CUSTOMER    | Người dùng web/client, không vào admin app  |

Permission check:

- Endpoint không có `@Permissions()` thì guard bỏ qua.
- `SUPER_ADMIN` pass ngay, không query database.
- `OWNER` cần tenant context và pass trong tenant đó.
- `STAFF` phải có tenant context và đọc quyền từ `UserPermission`.
- Required permission phải match exact hoặc được cover bởi `resource:manage`.

Ví dụ:

```txt
User có booking:manage -> pass booking:read, booking:create, booking:update, booking:delete.
User có booking:read -> chỉ pass booking:read.
User có * -> pass mọi quyền.
```

## Permission key convention

Permission key dùng format:

```txt
resource:action
```

Ví dụ:

```txt
user:read
user:create
user:update
user:delete
user:manage
permission:read
permission:manage
booking:read
booking:create
booking:update
booking:delete
booking:manage
staff:invite
```

Rule:

- `read`: xem danh sách/detail.
- `create`: tạo mới.
- `update`: chỉnh sửa.
- `delete`: xoá.
- `manage`: quyền bao trùm resource.
- Action đặc thù được phép nếu rõ nghĩa, ví dụ `staff:invite`.

Khi thêm module mới:

1. Thêm key vào `packages/shared/src/constants/permissions.ts`.
2. Seed permission mới trong `apps/api/prisma/seed.ts`.
3. Dùng `@Permissions([PERMISSIONS.<RESOURCE>.<ACTION>])` ở controller.
4. FE dùng key từ `/auth/me` hoặc `/permissions`.

## Database schema

### Permission

```prisma
model Permission {
  id          String   @id @default(uuid()) @db.Uuid
  key         String   @unique
  resource    String
  action      String
  description String?
  created_at  DateTime @default(now())

  user_permissions UserPermission[]

  @@unique([resource, action])
  @@index([resource])
  @@map("permission")
}
```

Ý nghĩa:

- `key`: permission string FE/BE dùng, ví dụ `booking:read`.
- `resource`: phần trước dấu `:`.
- `action`: phần sau dấu `:`.
- `description`: mô tả ngắn cho UI.

### UserPermission

```prisma
model UserPermission {
  id            String   @id @default(uuid()) @db.Uuid
  user_id       String   @db.Uuid
  permission_id String   @db.Uuid
  tenant_id     String   @db.Uuid
  granted_by_id String?  @db.Uuid
  created_at    DateTime @default(now())
}
```

Ý nghĩa:

- `user_id`: user được cấp quyền.
- `permission_id`: quyền được cấp.
- `tenant_id`: tenant nơi quyền có hiệu lực.
- `granted_by_id`: user đã cấp quyền.
- Unique theo `user_id + permission_id + tenant_id`.

## Base route

```txt
/api/v1
```

Controller hiện đặt route trực tiếp:

```txt
GET    /permissions
GET    /permissions/resources
GET    /users/:userId/permissions
POST   /users/:userId/permissions
PUT    /users/:userId/permissions
DELETE /users/:userId/permissions
```

## Auth chung

Các endpoint permission management cần:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
x-tenant-id: <tenant_id>
```

Tenant context có thể resolve từ:

- `x-tenant-id`
- `x-tenant-host`
- `host`

## GET /api/v1/permissions

Dùng cho: Admin permission dictionary, form phân quyền.

Auth: required.

Tenant: required vì controller dùng `@RequireTenant()`.

Permission:

```txt
permission:read
```

Response chính:

```ts
type PermissionSummary = {
  id: string;
  key: string;
  resource: string;
  action: string;
  description: string | null;
};

type Response = PermissionSummary[];
```

BE behavior:

- Query toàn bộ `Permission`.
- Sort theo `resource asc`, `action asc`.
- Trả summary cho FE.

FE states:

- Loading: skeleton list/group.
- Empty: báo chưa seed permissions.
- Error: show API message.
- Success: cache dictionary theo session.

## GET /api/v1/permissions/resources

Dùng cho: Form phân quyền grouped by resource.

Auth: required.

Tenant: required.

Permission:

```txt
permission:read
```

Response chính:

```ts
type PermissionResourceGroup = {
  resource: string;
  permissions: PermissionSummary[];
};

type Response = PermissionResourceGroup[];
```

BE behavior:

- Query toàn bộ `Permission`.
- Group theo `resource`.
- Mỗi group chứa danh sách permission summary.

FE states:

- Render accordion hoặc grouped checkbox list.
- Có thể sort resource theo response từ backend.

## GET /api/v1/users/:userId/permissions

Dùng cho: Xem quyền hiện tại của một user trong tenant.

Auth: required.

Tenant: required.

Permission:

```txt
permission:manage
```

Path params:

```ts
type Params = {
  userId: string;
};
```

Response chính:

```ts
type UserPermissionsResponse = {
  user_id: string;
  tenant_id: string;
  permissions: PermissionSummary[];
};
```

BE behavior:

- Check user tồn tại trong tenant.
- Query `UserPermission` theo `user_id + tenant_id`.
- Include `Permission`.
- Return permission summary.

Error thường gặp:

- `404 User not found`.
- `403 Access denied`.

FE states:

- Loading: checkbox skeleton.
- Empty: user chưa có quyền nào.
- Success: tick checkbox theo `permissions[].key`.

## POST /api/v1/users/:userId/permissions

Dùng cho: Gán thêm quyền cho user, không xoá quyền hiện có.

Auth: required.

Tenant: required.

Permission:

```txt
permission:manage
```

Path params:

```ts
type Params = {
  userId: string;
};
```

Body:

```ts
type UserPermissionsBody = {
  permission_keys: string[];
};
```

Response chính:

```ts
type Response = UserPermissionsResponse;
```

BE behavior:

- Check user thuộc tenant.
- Validate toàn bộ `permission_keys` tồn tại.
- Convert keys sang permission ids.
- `createMany` vào `UserPermission`.
- `skipDuplicates: true`.
- Return quyền mới nhất của user.

Validation:

- `permission_keys`: array string.
- Nếu bất kỳ key không tồn tại, reject toàn bộ request.

Error thường gặp:

- `404 User not found`.
- `400 One or more permissions are invalid`.

FE states:

- Success: update permission panel bằng response.
- Error: nếu invalid key, refetch dictionary hoặc báo stale data.

## PUT /api/v1/users/:userId/permissions

Dùng cho: Replace toàn bộ quyền của user trong tenant.

Auth: required.

Tenant: required.

Permission:

```txt
permission:manage
```

Body:

```ts
type UserPermissionsBody = {
  permission_keys: string[];
};
```

Response chính:

```ts
type Response = UserPermissionsResponse;
```

BE behavior:

- Check user thuộc tenant.
- Deduplicate `permission_keys`.
- Validate keys tồn tại.
- Transaction:
  - delete all `UserPermission` của user trong tenant.
  - create new rows theo body.
- Cho phép replace bằng mảng rỗng để clear toàn bộ quyền.

FE states:

- Đây là endpoint phù hợp nhất cho form checkbox "Save permissions".
- Disable save khi request đang chạy.
- Sau success, sync local selected keys từ response.

## DELETE /api/v1/users/:userId/permissions

Dùng cho: Thu hồi một nhóm quyền khỏi user.

Auth: required.

Tenant: required.

Permission:

```txt
permission:manage
```

Body:

```ts
type UserPermissionsBody = {
  permission_keys: string[];
};
```

Response chính:

```ts
type Response = UserPermissionsResponse;
```

BE behavior:

- Check user thuộc tenant.
- Validate keys tồn tại.
- Delete matching `UserPermission` rows.
- Return quyền còn lại.

FE states:

- Dùng cho action revoke từng quyền hoặc bulk revoke.
- Nếu form checkbox save toàn bộ thì ưu tiên `PUT`.

## Guard usage

Decorator:

```ts
@Permissions([PERMISSIONS.USER.READ])
```

Ví dụ controller:

```ts
@Get()
@RequireTenant()
@Permissions([PERMISSIONS.USER.READ])
findAll(@Tenant() tenant: TenantContext) {
  return this.usersService.findAllByTenant(tenant.id);
}
```

Guard behavior:

```txt
requiredPermissions empty -> allow
request.user missing -> 403
user.role SUPER_ADMIN -> allow
user.role OWNER + tenant -> allow
tenant missing -> 400
exact permission exists -> allow
resource:manage exists -> allow
else -> 403
```

## FE permission helper

FE nên expose helper:

```ts
function can(permissions: string[], required: string) {
  if (permissions.includes("*")) return true;
  if (permissions.includes(required)) return true;

  const [resource] = required.split(":");
  return permissions.includes(`${resource}:manage`);
}
```

Ví dụ dùng cho navigation:

```ts
const navItems = [
  {
    label: "Users",
    href: "/users",
    permission: "user:read",
  },
  {
    label: "Invite Staff",
    href: "/staff/invitations",
    permission: "staff:invite",
  },
];
```

FE rule:

- UI được phép ẩn action theo permission.
- API vẫn là nguồn kiểm soát cuối.
- Không dùng role để quyết định action chi tiết, trừ route context thô như admin/client.

## Shared contracts

Constants:

```txt
packages/shared/src/constants/permissions.ts
```

Shared types:

```txt
packages/shared/src/types/permission.types.ts
```

Shared schema:

```txt
packages/shared/src/schemas/permission.schema.ts
```

Backend DTO:

```txt
apps/api/src/modules/permission/dto/user-permissions.dto.ts
```

## Seed

Seed permissions nằm trong:

```txt
apps/api/prisma/seed.ts
```

Seed hiện tạo các key nền tảng như:

- `user:read`
- `user:create`
- `user:update`
- `user:delete`
- `user:manage`
- `permission:read`
- `permission:manage`
- `booking:read`
- `booking:create`
- `booking:update`
- `booking:delete`
- `booking:manage`
- `service:read`
- `service:create`
- `service:update`
- `service:delete`
- `service:manage`
- `staff:read`
- `staff:invite`
- `staff:update`
- `staff:delete`
- `staff:manage`
- `tenant:read`
- `tenant:update`
- `tenant:manage`

Staff demo được gán trực tiếp một số quyền qua `UserPermission`.

## Tests

Permission tests:

```txt
apps/api/src/modules/permission/tests
```

Chạy:

```bash
pnpm --filter @repo/api test -- permission
```

Coverage hiện có:

- List permissions.
- Group permissions by resource.
- Get user permission keys.
- List user permissions.
- Assign permissions.
- Replace permissions.
- Revoke permissions.
- Guard admin bypass.
- Guard tenant required.
- Guard exact permission.
- Guard `resource:manage`.
- Guard denied khi thiếu quyền.

## Checklist khi thêm quyền mới

1. Thêm constant vào `packages/shared/src/constants/permissions.ts`.
2. Thêm seed key vào `apps/api/prisma/seed.ts`.
3. Chạy `pnpm prisma:generate` nếu schema có đổi.
4. Gắn `@Permissions()` vào endpoint cần bảo vệ.
5. Cập nhật FE navigation/action config.
6. Thêm test guard/use-case nếu có behavior mới.

## Changelog

- 2026-07-05: tạo docs chi tiết cho Permission API.
