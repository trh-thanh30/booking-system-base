# Services API

Services module quản lý service catalog theo từng business. Service dùng `Category` với `type = SERVICE` để nhóm dịch vụ.

## Status

Status: `implemented`

Đã hỗ trợ:

- Model `Service` trong Prisma.
- Relation optional tới `Category`.
- List services theo business.
- Get service detail.
- Create service.
- Update service.
- Archive service bằng soft delete.
- Validate category phải thuộc business hiện tại.
- Validate category phải có `type = SERVICE`.
- Validate category không `ARCHIVED`.
- Permission guard `service:*`.

Chưa hỗ trợ:

- Chưa có hard delete.
- Chưa có reorder endpoint riêng.
- Chưa có service media.
- Chưa có staff assignment; phần đó thuộc phase Staff.
- Chưa có package/combo service.

## Backend Module

```txt
apps/api/src/modules/service
```

Base route:

```txt
/api/v1/services
```

Controller dùng:

```ts
@RequireTenant()
@RequireBusiness()
```

## App Usage

| App            | Mục đích                                        |
| -------------- | ----------------------------------------------- |
| Admin          | Quản lý service catalog trong selected business |
| Web            | Chưa dùng trực tiếp public API                  |
| Platform Admin | Không dùng trực tiếp                            |

## Auth & Headers

Admin app gửi:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
x-tenant-id: <tenant_id>
x-business-id: <business_id>
```

Không gửi `tenant_id` hoặc `business_id` trong body. Backend lấy từ context.

## Permissions

| Action          | Permission       |
| --------------- | ---------------- |
| List services   | `service:read`   |
| Get service     | `service:read`   |
| Create service  | `service:create` |
| Update service  | `service:update` |
| Archive service | `service:delete` |
| Full manage     | `service:manage` |

`OWNER` bypass permission trong tenant. `STAFF` cần permission tương ứng.

## Data Model

```ts
type ServiceStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

type ServiceSummary = {
  id: string;
  tenant_id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  price_amount: number;
  currency: string;
  status: ServiceStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ServiceDetail = ServiceSummary & {
  category: CategorySummary | null;
};
```

## Endpoints

| Method | Endpoint               | Permission       | Dùng cho        |
| ------ | ---------------------- | ---------------- | --------------- |
| GET    | `/api/v1/services`     | `service:read`   | List services   |
| POST   | `/api/v1/services`     | `service:create` | Create service  |
| GET    | `/api/v1/services/:id` | `service:read`   | Service detail  |
| PATCH  | `/api/v1/services/:id` | `service:update` | Update service  |
| DELETE | `/api/v1/services/:id` | `service:delete` | Archive service |

## GET /api/v1/services

Query:

```ts
type ListServicesQuery = {
  search?: string;
  category_id?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  include_archived?: boolean;
  page?: number;
  limit?: number;
};
```

Defaults:

```txt
page = 1
limit = 50
include_archived = false
```

Behavior:

- Query theo `tenant_id + business_id`.
- Nếu không truyền `status`, API không trả `ARCHIVED`.
- Nếu truyền `include_archived=true`, API có thể trả archived.
- `category_id=null` dùng để lọc service chưa có category.
- `search` match `name` hoặc `slug`.
- Sort theo `sort_order asc`, `name asc`, `id asc`.

Response:

```ts
type Response = PaginatedApiResponse<ServiceDetail>;
```

## POST /api/v1/services

Body:

```ts
type CreateServiceInput = {
  category_id?: string | null;
  name: string;
  slug?: string;
  description?: string | null;
  duration_minutes: number;
  buffer_before_minutes?: number;
  buffer_after_minutes?: number;
  price_amount: number;
  currency?: string;
  status?: "ACTIVE" | "INACTIVE";
  sort_order?: number;
};
```

Behavior:

- `name` được trim và collapse khoảng trắng.
- Nếu không gửi `slug`, backend generate slug từ `name`.
- Slug lowercase, dash-separated.
- `currency` mặc định `VND` và normalize uppercase.
- `status` mặc định `ACTIVE`.
- Buffer mặc định `0`.
- `sort_order` mặc định `0`.

Validation:

- `duration_minutes` từ `1` đến `1440`.
- `buffer_before_minutes` và `buffer_after_minutes` từ `0` đến `240`.
- `price_amount` không âm.
- `currency` dài 3 ký tự.
- Slug unique theo `tenant_id + business_id`.
- `category_id` nếu có phải là category `SERVICE`, cùng business và không archived.

Response:

```ts
type Response = ServiceDetail;
```

## GET /api/v1/services/:id

Response:

```ts
type Response = ServiceDetail;
```

Rules:

- API query bằng `id + tenant_id + business_id`.
- Service khác business trả `404`.

## PATCH /api/v1/services/:id

Body:

```ts
type UpdateServiceInput = {
  category_id?: string | null;
  name?: string;
  slug?: string;
  description?: string | null;
  duration_minutes?: number;
  buffer_before_minutes?: number;
  buffer_after_minutes?: number;
  price_amount?: number;
  currency?: string;
  status?: "ACTIVE" | "INACTIVE";
  sort_order?: number;
};
```

Behavior:

- Không cho update status thành `ARCHIVED`; dùng DELETE để archive.
- Nếu đổi slug, check duplicate trong cùng business.
- Nếu `category_id=null`, service không thuộc category nào.
- Nếu đổi `category_id`, category phải pass validation.

Response:

```ts
type Response = ServiceDetail;
```

## DELETE /api/v1/services/:id

Archive service bằng soft delete:

```txt
status = ARCHIVED
```

Behavior:

- Không hard delete.
- Nếu service đã archived, endpoint trả success idempotent.

Response:

```ts
type Response = ServiceDetail;
```

## Error Cases

| Status | Trường hợp                                                  |
| ------ | ----------------------------------------------------------- |
| 400    | Body/query sai validation                                   |
| 400    | Category không phải `SERVICE` hoặc đã archived              |
| 400    | Thiếu `x-business-id`                                       |
| 401    | Thiếu hoặc sai access token                                 |
| 403    | Staff không thuộc business hoặc thiếu permission            |
| 404    | Service hoặc category không tồn tại trong business hiện tại |
| 409    | Slug đã tồn tại trong business                              |

## FE Checklist

- Luôn gửi `x-tenant-id` và `x-business-id`.
- Không gửi `tenant_id` hoặc `business_id` trong form.
- Load category select bằng `GET /categories?type=SERVICE`.
- Không show archived categories trong service form.
- Sau create/update/delete, invalidate services query theo business hiện tại.
- Khi đổi business switcher, clear selected service và refetch services/categories.
