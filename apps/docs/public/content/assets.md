# Assets API

Assets module quản lý upload file, metadata asset, thumbnail public và delete asset. Module hiện có controller thật trong `apps/api/src/modules/assets`.

## Status

Status: `implemented`

Đã hỗ trợ:

- Upload file bằng multipart.
- List assets cho Owner.
- Get asset metadata theo id.
- Delete asset.
- Public thumbnail list.
- Storage abstraction local/minio.

Chưa hỗ trợ:

- Chưa có `@RequireTenant()` trong controller assets hiện tại.
- Chưa có business-specific asset context.
- Chưa có signed URL riêng cho private asset trong docs này.

## Backend Module

```txt
apps/api/src/modules/assets
```

Base route:

```txt
/api/v1/assets
```

## App Usage

| App            | Mục đích                                            |
| -------------- | --------------------------------------------------- |
| Admin          | Upload avatar, service image sau này, general media |
| Web            | Đọc public thumbnail                                |
| Platform Admin | Có thể dùng cho platform media sau này              |

## Auth & Headers

Controller assets tự khai báo:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
```

Authenticated endpoints cần:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
```

Admin convention vẫn nên gửi:

```txt
x-tenant-id: <tenant_id>
```

Public endpoint:

```txt
GET /api/v1/assets/thumbnail
```

## Query Types

```ts
type UploadAssetQuery = {
  folder?: string;
  entityId?: string;
  entityType?: string;
  accessType?: "PUBLIC" | "PRIVATE" | "TEMP";
  type?: string;
};

type ListAssetsQuery = {
  page?: number;
  limit?: number;
  uploadedById?: string;
  type?: string;
  accessType?: "PUBLIC" | "PRIVATE" | "TEMP";
  folder?: string;
};
```

## Endpoints

| Method | Endpoint                   | Auth      | Dùng cho              |
| ------ | -------------------------- | --------- | --------------------- |
| POST   | `/api/v1/assets/upload`    | Auth user | Upload file           |
| GET    | `/api/v1/assets/thumbnail` | Public    | Public thumbnail list |
| GET    | `/api/v1/assets/:id`       | Auth user | Get asset metadata    |
| GET    | `/api/v1/assets`           | OWNER     | List assets           |
| DELETE | `/api/v1/assets/:id`       | Auth user | Delete asset          |

## POST /api/v1/assets/upload

Content type:

```txt
multipart/form-data
```

Form field:

```txt
file: File
```

Query params:

```ts
type Query = UploadAssetQuery;
```

Example:

```txt
POST /api/v1/assets/upload?folder=avatars&accessType=PUBLIC&type=IMAGE
```

Response:

```ts
type Response = Asset;
```

FE notes:

- Gửi file trong field tên `file`.
- Không tự set `Content-Type` thủ công khi dùng `FormData`; browser sẽ thêm boundary.
- Sau upload avatar, gọi Auth API update profile nếu cần set `avatar_url`.

## GET /api/v1/assets/thumbnail

Public endpoint trả danh sách thumbnail public.

FE notes:

- Không cần token.
- Dùng cho gallery/preview public nếu UI cần.

## GET /api/v1/assets/:id

Param:

```txt
id: UUID
```

Response:

```ts
type Response = Asset;
```

Validation:

- `id` phải là UUID.

## GET /api/v1/assets

Role:

```txt
OWNER
```

Query:

```ts
type Query = ListAssetsQuery;
```

Response:

```ts
type Response = PaginatedResponse<Asset>;
```

## DELETE /api/v1/assets/:id

Param:

```txt
id: UUID
```

Behavior:

- Service kiểm tra quyền xóa dựa trên user hiện tại.
- Xóa metadata và/hoặc object theo storage implementation.

## Error Cases

| Status | Trường hợp                           |
| ------ | ------------------------------------ |
| 400    | File thiếu, UUID sai, query sai enum |
| 401    | Thiếu token với endpoint auth        |
| 403    | Role không đủ khi list assets        |
| 404    | Asset không tồn tại                  |

## FE Checklist

- Dùng `FormData` với key `file`.
- Upload progress nên nằm ở FE upload component.
- Sau delete, invalidate asset list.
- Không dùng Assets API để lưu domain relation; dùng `entityId/entityType` query nếu cần tracking metadata.
