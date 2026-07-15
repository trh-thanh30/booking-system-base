# Categories API

Categories module quản lý category generic theo business. Module này đã triển khai để dùng lại cho nhiều domain như service, product, expense, customer hoặc content category.

## Status

Status: `implemented`

Đã hỗ trợ:

- Model `Category` trong Prisma.
- Category type: `SERVICE`, `PRODUCT`, `EXPENSE`, `CUSTOMER`, `CONTENT`.
- Category status: `ACTIVE`, `INACTIVE`, `ARCHIVED`.
- List categories theo business.
- Get category detail.
- Create category.
- Update category.
- Archive category bằng soft delete.
- Parent/children tree một cấp hoặc nhiều cấp.
- Validate parent cùng business, cùng type và không archived.
- Chặn cycle trong category tree.
- Permission guard `category:*`.

Chưa hỗ trợ:

- Chưa có hard delete.
- Chưa có reorder endpoint riêng.
- Chưa có category cấp tenant/global qua Admin API thường.
- Chưa có relation tới Service vì Service Catalog là Phase 1B.

## Backend Module

```txt
apps/api/src/modules/category
```

Base route:

```txt
/api/v1/categories
```

Controller dùng:

```ts
@RequireTenant()
@RequireBusiness()
```

## App Usage

| App            | Mục đích                         |
| -------------- | -------------------------------- |
| Admin          | Quản lý categories theo business |
| Web            | Chưa dùng trực tiếp              |
| Platform Admin | Chưa dùng trực tiếp              |

## Auth & Headers

Admin app gửi:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
x-tenant-id: <tenant_id>
x-business-id: <business_id>
```

Không gửi `tenant_id` hoặc `business_id` trong body. Backend luôn lấy từ context.

## Permissions

| Action           | Permission        |
| ---------------- | ----------------- |
| List categories  | `category:read`   |
| Get category     | `category:read`   |
| Create category  | `category:create` |
| Update category  | `category:update` |
| Archive category | `category:delete` |
| Full manage      | `category:manage` |

`OWNER` bypass permission trong tenant. `STAFF` cần permission tương ứng.

## Data Model

```ts
type CategoryType = "SERVICE" | "PRODUCT" | "EXPENSE" | "CUSTOMER" | "CONTENT";

type CategoryStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

type CategorySummary = {
  id: string;
  tenant_id: string;
  business_id: string | null;
  type: CategoryType;
  name: string;
  slug: string;
  description: string | null;
  status: CategoryStatus;
  sort_order: number;
  parent_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
```

## Endpoints

| Method | Endpoint                 | Permission        | Dùng cho         |
| ------ | ------------------------ | ----------------- | ---------------- |
| GET    | `/api/v1/categories`     | `category:read`   | List categories  |
| POST   | `/api/v1/categories`     | `category:create` | Create category  |
| GET    | `/api/v1/categories/:id` | `category:read`   | Category detail  |
| PATCH  | `/api/v1/categories/:id` | `category:update` | Update category  |
| DELETE | `/api/v1/categories/:id` | `category:delete` | Archive category |

## GET /api/v1/categories

Query:

```ts
type ListCategoriesQuery = {
  type?: CategoryType;
  status?: CategoryStatus;
  search?: string;
  parent_id?: string | null;
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
- `search` match `name` hoặc `slug`.
- `parent_id=null` dùng để lấy root categories.
- Sort theo `sort_order asc`, `name asc`, `id asc`.

Response:

```ts
type Response = PaginatedApiResponse<CategorySummary>;
```

FE notes:

- Service Catalog Phase 1B sẽ gọi `GET /categories?type=SERVICE`.
- Query key nên có `business_id`, `type`, `status`, `parent_id`, `search`, `page`, `limit`.
- Khi đổi business switcher, invalidate categories query.

## POST /api/v1/categories

Body:

```ts
type CreateCategoryInput = {
  type: CategoryType;
  name: string;
  slug?: string;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  sort_order?: number;
  parent_id?: string | null;
  metadata?: Record<string, unknown>;
};
```

Behavior:

- `name` được trim và collapse khoảng trắng.
- Nếu không gửi `slug`, backend generate slug từ `name`.
- Slug được normalize lowercase, dash-separated.
- `status` mặc định `ACTIVE`.
- `sort_order` mặc định `0`.
- `business_id` lấy từ selected business.

Response:

```ts
type Response = CategorySummary;
```

Validation:

- `name` là bắt buộc.
- `type` là bắt buộc.
- Không cho create status `ARCHIVED`.
- Slug unique theo `tenant_id + business_id + type`.
- Parent nếu có phải cùng business, cùng type và không archived.

## GET /api/v1/categories/:id

Response:

```ts
type Response = CategorySummary;
```

Rules:

- API query bằng `id + tenant_id + business_id`.
- Category khác business trả `404`.

## PATCH /api/v1/categories/:id

Body:

```ts
type UpdateCategoryInput = {
  name?: string;
  slug?: string;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  sort_order?: number;
  parent_id?: string | null;
  metadata?: Record<string, unknown>;
};
```

Behavior:

- Không cho đổi `type`.
- Không cho update status thành `ARCHIVED`; dùng DELETE để archive.
- Nếu đổi slug, check duplicate trong cùng business/type.
- Nếu `parent_id=null`, category thành root.
- Parent mới phải qua tree validation.

Response:

```ts
type Response = CategorySummary;
```

## DELETE /api/v1/categories/:id

Archive category bằng soft delete:

```txt
status = ARCHIVED
```

Behavior:

- Không hard delete.
- Nếu category đã archived, endpoint trả success idempotent.
- Không tự archive children.
- Không tự xóa relation của children.

Response:

```ts
type Response = CategorySummary;
```

## Parent Tree Rules

Rules:

- Parent phải tồn tại trong cùng `tenant_id + business_id`.
- Parent phải cùng `type`.
- Parent không được `ARCHIVED`.
- Parent không được là chính category.
- Update parent không được tạo cycle.

Ví dụ cycle bị chặn:

```txt
A parent = B
B parent = C
Không cho update C parent = A
```

## Error Cases

| Status | Trường hợp                                       |
| ------ | ------------------------------------------------ |
| 400    | Body/query sai validation                        |
| 400    | Parent khác type hoặc archived                   |
| 400    | Parent là chính nó hoặc tạo cycle                |
| 400    | Thiếu `x-business-id`                            |
| 401    | Thiếu hoặc sai access token                      |
| 403    | Staff không thuộc business hoặc thiếu permission |
| 404    | Category không tồn tại trong business hiện tại   |
| 409    | Slug đã tồn tại trong cùng business/type         |

## FE Checklist

- Luôn gửi `x-tenant-id` và `x-business-id`.
- Không gửi `tenant_id` hoặc `business_id` trong form.
- Với Service Catalog, dùng `type=SERVICE`.
- Với root categories, truyền `parent_id=null`.
- Sau create/update/delete, invalidate category query theo business hiện tại.
- Không show archived category trong select mặc định.
