# Business API

Business API quản lý các branch, brand, location hoặc store nằm bên trong một tenant. Đây là core API đã triển khai một phần và là nền cho các module service, staff, customer và booking.

## Status

Status: `implemented`

Đã hỗ trợ:

- Business model trong Prisma.
- BusinessMembership model trong Prisma.
- List businesses trong tenant.
- Create business trong tenant.
- Resolve current business bằng `x-business-id`.
- Guard business context bằng `@RequireBusiness()`.
- Admin business switcher đọc danh sách business từ `/auth/me`.
- Admin API client tự gửi `x-tenant-id` và `x-business-id`.

Chưa hỗ trợ:

- Chưa có update/delete business endpoint.
- Chưa có UI/API quản lý BusinessMembership riêng.
- Chưa có permission scope theo từng business; permission hiện vẫn tenant-level.

## Backend Module

```txt
apps/api/src/modules/business
```

Controller:

```txt
apps/api/src/modules/business/business.controller.ts
```

Base route:

```txt
/api/v1/businesses
```

## App Usage

| App            | Mục đích                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| Admin          | Hiển thị business switcher, xem business hiện tại, tạo branch mới        |
| Platform Admin | Xem số lượng businesses trong tenant registry                            |
| Web            | Không gọi trực tiếp, public booking sẽ resolve business bằng slug/domain |

## Auth & Headers

Admin endpoint cần:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
x-tenant-id: <tenant_id>
```

Route business-scoped cần thêm:

```txt
x-business-id: <business_id>
```

## Permissions

| Action                | Permission      |
| --------------------- | --------------- |
| List businesses       | `tenant:read`   |
| Create business       | `tenant:manage` |
| Read current business | `tenant:read`   |

`OWNER` bypass permission trong tenant. `STAFF` cần permission tương ứng và chỉ truy cập business có membership.

## Data Models

```ts
type BusinessSummary = {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED" | "DISABLED";
  timezone: string;
  locale: string;
  is_default: boolean;
};

type BusinessContext = BusinessSummary & {
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
```

## Endpoints

| Method | Endpoint                     | Dùng cho                              |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/api/v1/businesses`         | Admin list businesses trong tenant    |
| POST   | `/api/v1/businesses`         | Admin tạo business mới                |
| GET    | `/api/v1/businesses/current` | FE kiểm tra business context hiện tại |

## GET /api/v1/businesses

Query businesses thuộc tenant hiện tại.

Request:

```txt
GET /api/v1/businesses
```

Response:

```ts
type Response = BusinessContext[];
```

FE notes:

- Dùng để render trang Business Management.
- Business switcher ưu tiên lấy từ `/auth/me.businesses`, không bắt buộc gọi endpoint này khi bootstrap.
- Cache theo `tenant_id`.

## POST /api/v1/businesses

Tạo business mới trong tenant hiện tại.

Body:

```ts
type CreateBusinessInput = {
  slug: string;
  name: string;
  status?: "ACTIVE" | "SUSPENDED" | "DISABLED";
  timezone?: string;
  locale?: string;
  settings?: Record<string, unknown>;
};
```

Response:

```ts
type Response = BusinessContext;
```

Validation:

- `slug` unique trong tenant.
- `name` là bắt buộc.
- `timezone` mặc định `Asia/Ho_Chi_Minh`.
- `locale` mặc định `vi`.
- Business mới không tự là default business.

## GET /api/v1/businesses/current

Trả business context đã được resolve từ `x-business-id`.

Request:

```txt
GET /api/v1/businesses/current
```

Required headers:

```txt
x-tenant-id: <tenant_id>
x-business-id: <business_id>
```

Response:

```ts
type Response = BusinessContext;
```

Guard behavior:

- Thiếu `x-business-id` trả `400`.
- Business không thuộc tenant trả `403`.
- Business không active trả `403`.
- `OWNER` chọn được mọi active business trong tenant.
- `STAFF` chỉ chọn được business có `BusinessMembership`.

## Error Cases

| Status | Trường hợp                                  |
| ------ | ------------------------------------------- |
| 400    | Thiếu tenant context hoặc business context  |
| 403    | Business không accessible hoặc không active |
| 409    | Business slug đã tồn tại trong tenant       |

## FE Implementation Notes

- Sau login hoặc `/auth/me`, admin lưu `tenant_id` và chọn default business từ `user.businesses`.
- API client admin tự gửi `x-tenant-id` và `x-business-id`.
- Khi đổi business trong switcher, FE nên invalidate các query business-scoped như services, staff, customers, bookings.
- Không gửi `business_id` trong body cho route đã dùng selected business.
