# Users API

Users module quản lý user trong tenant hiện tại. Module đã được refactor theo pattern controller -> use case -> repository -> database.

## Status

Status: `implemented`

Đã hỗ trợ:

- Tạo user trong tenant.
- List users trong tenant.
- Get user detail trong tenant.
- Update user trong tenant.
- Delete user trong tenant.
- Permission guard theo `user:*`.

Chưa hỗ trợ:

- Chưa có pagination/filter trong controller hiện tại.
- Chưa có business membership management ở Users API.
- Invitation flow nằm trong Auth API, không nằm trong Users API.

## Backend Module

```txt
apps/api/src/modules/user
```

Controller:

```txt
apps/api/src/modules/user/user.controller.ts
```

Base route:

```txt
/api/v1/users
```

## App Usage

| App            | Mục đích                                |
| -------------- | --------------------------------------- |
| Admin          | Quản lý user/staff account trong tenant |
| Platform Admin | Không dùng trực tiếp endpoint này       |
| Web            | Không dùng trực tiếp                    |

## Auth & Headers

Users controller dùng `@RequireTenant()`.

Admin app gửi:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
x-tenant-id: <tenant_id>
```

Endpoint hiện chưa yêu cầu `@RequireBusiness()`, vì user là tenant-level account. Business access được quản lý bằng `BusinessMembership` trong business/auth context.

## Permissions

| Action      | Permission    |
| ----------- | ------------- |
| Create user | `user:create` |
| List users  | `user:read`   |
| Get user    | `user:read`   |
| Update user | `user:update` |
| Delete user | `user:delete` |

`OWNER` bypass permission trong tenant. `STAFF` cần permission tương ứng.

## Data Models

```ts
type UserRole = "SUPER_ADMIN" | "OWNER" | "STAFF" | "CUSTOMER";
type UserStatus = "ACTIVE" | "INACTIVE";

type UserSummary = {
  id: string;
  tenant_id: string | null;
  email: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};
```

## Create User Body

```ts
type CreateUserInput = {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  status?: UserStatus;
};
```

Validation:

- `username` là bắt buộc.
- `email` phải đúng email format.
- `password` là bắt buộc.
- `role` nếu có phải thuộc enum `user_role`.
- `status` nếu có phải thuộc enum `user_status`.

## Update User Body

```ts
type UpdateUserInput = {
  username?: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  is_verified?: boolean;
};
```

## Endpoints

| Method | Endpoint            | Permission    | Dùng cho                |
| ------ | ------------------- | ------------- | ----------------------- |
| GET    | `/api/v1/users`     | `user:read`   | List users trong tenant |
| POST   | `/api/v1/users`     | `user:create` | Tạo user trong tenant   |
| GET    | `/api/v1/users/:id` | `user:read`   | User detail             |
| PUT    | `/api/v1/users/:id` | `user:update` | Update user             |
| DELETE | `/api/v1/users/:id` | `user:delete` | Delete user             |

## GET /api/v1/users

Response:

```ts
type Response = UserSummary[];
```

Behavior:

- Chỉ trả users có `tenant_id` bằng tenant context hiện tại.
- Không trả user tenant khác.
- Không dùng pagination hiện tại.

FE notes:

- Dùng cho user management table.
- Nếu table cần search/pagination, FE hiện phải xử lý client-side hoặc chờ API bổ sung query.

## POST /api/v1/users

Body:

```ts
type Body = CreateUserInput;
```

Response:

```ts
type Response = UserSummary;
```

Behavior:

- Backend gán `tenant_id` từ `@Tenant()`.
- FE không gửi `tenant_id`.
- Password được hash trong use case/service.

FE notes:

- Flow mời staff nên ưu tiên Auth Invitation API nếu muốn email invite.
- Endpoint này phù hợp tạo user trực tiếp bởi admin.

## GET /api/v1/users/:id

Response:

```ts
type Response = UserSummary;
```

Rules:

- `id` phải thuộc tenant hiện tại.
- User tenant khác không được trả về.

## PUT /api/v1/users/:id

Body:

```ts
type Body = UpdateUserInput;
```

Response:

```ts
type Response = UserSummary;
```

FE notes:

- Không dùng endpoint này để update profile của user hiện tại; profile dùng Auth API `PATCH /auth/me`.
- Role/status update nên chỉ hiện với user có quyền manage.

## DELETE /api/v1/users/:id

Response:

```ts
type Response = UserSummary;
```

FE notes:

- Xác nhận trước khi delete.
- Nếu sau này user có booking/staff profile, nên chuyển sang deactivate thay vì hard delete.

## Error Cases

| Status | Trường hợp                                                |
| ------ | --------------------------------------------------------- |
| 400    | Body sai validation                                       |
| 401    | Thiếu token                                               |
| 403    | Thiếu permission                                          |
| 404    | User không tồn tại trong tenant hiện tại                  |
| 409    | Email/username đã tồn tại nếu repository/use case enforce |

## FE Checklist

- Gửi `x-tenant-id` trong mọi request.
- Không gửi `tenant_id` từ form.
- Sau create/update/delete, invalidate `users` query.
- Với permission UI, dùng Permission API riêng để assign permissions cho user.
