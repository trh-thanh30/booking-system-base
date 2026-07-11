# Environment Variables

Repo dùng nhiều file env theo môi trường. File mẫu là `.env.example`.

## File Env

| File               | Vai trò                                       |
| :----------------- | :-------------------------------------------- |
| `.env.example`     | Mẫu public, được commit.                      |
| `.env.development` | Cấu hình local/dev, không commit secret thật. |
| `.env.test`        | Cấu hình test.                                |
| `.env.production`  | Cấu hình production/deploy, không commit.     |

Frontend apps cũng có file mẫu riêng để copy khi cần override cục bộ theo app:

| File                               | Vai trò                                        |
| :--------------------------------- | :--------------------------------------------- |
| `apps/web/.env.example`            | Mẫu env riêng cho public storefront.           |
| `apps/admin/.env.example`          | Mẫu env riêng cho Business Admin Portal.       |
| `apps/platform-admin/.env.example` | Mẫu env riêng cho Platform/Super Admin Portal. |

Với luồng dev thông thường, ưu tiên copy root `.env.example` thành `.env.development`. Chỉ tạo `apps/<app>/.env.local` khi app đó cần override riêng.

## Nhóm Biến Chính

### App Ports

- `API_PORT`
- `WEB_PORT`
- `ADMIN_PORT`
- `PLATFORM_ADMIN_PORT`

Giá trị local mặc định:

| App/Service    | Biến                  | URL mặc định            |
| :------------- | :-------------------- | :---------------------- |
| API            | `API_PORT`            | `http://localhost:3000` |
| Web            | `WEB_PORT`            | `http://localhost:3001` |
| Business Admin | `ADMIN_PORT`          | `http://localhost:3002` |
| Platform Admin | `PLATFORM_ADMIN_PORT` | `http://localhost:3003` |

### Database

- `DATABASE_URL`
- `DIRECT_URL`
- `DEV_DB_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

### Redis

- `REDIS_URL`
- `REDIS_DEV_PORT`
- `REDIS_DB_PORT`

### Asset Storage

- `STORAGE_DRIVER`: `local` hoặc `minio`.
- `ASSET_CDN_URL`: base URL dùng để trả public asset URL. Khi dùng MinIO local, có thể đặt là `http://localhost:9000/booking-public`.
- `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`.
- `MINIO_BUCKET_PUBLIC`, `MINIO_BUCKET_PRIVATE`, `MINIO_BUCKET_TEMP`.

### Telegram CI

Chỉ cần cấu hình trên GitHub Actions Secrets:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

Không cần đưa token thật vào file env local.

### Docker Images

Production compose dùng các biến image sau:

- `API_IMAGE`
- `WEB_IMAGE`
- `ADMIN_IMAGE`
- `PLATFORM_ADMIN_IMAGE`
- `IMAGE_TAG`

## Frontend Env

Các app Next.js chỉ được expose biến ra browser nếu biến có prefix `NEXT_PUBLIC_`.

Biến FE dùng chung:

- `NEXT_PUBLIC_API_URL`: API base URL, ví dụ `http://localhost:3000/api/v1`.
- `NEXT_PUBLIC_ASSET_URL`: public asset base URL, ví dụ `http://localhost:3000/uploads/public/`.

Biến riêng theo app:

| App                   | Biến public URL                  | Auth context |
| :-------------------- | :------------------------------- | :----------- |
| `apps/web`            | `NEXT_PUBLIC_WEB_URL`            | `client`     |
| `apps/admin`          | `NEXT_PUBLIC_ADMIN_URL`          | `admin`      |
| `apps/platform-admin` | `NEXT_PUBLIC_PLATFORM_ADMIN_URL` | `platform`   |

`NEXT_PUBLIC_AUTH_CONTEXT` chỉ nên đặt trong app-local env file nếu cần debug/override. Trong code hiện tại auth context đang được set tường minh theo từng app để tránh trộn Business Admin với Platform Admin.

## Rule

- Biến public cho Next.js phải bắt đầu bằng `NEXT_PUBLIC_`.
- Secret không dùng prefix `NEXT_PUBLIC_`.
- Không đọc env trực tiếp rải rác trong UI component.
- Gom env mapping vào config module khi số lượng biến tăng.
- `.env.example` phải có comment đủ rõ nhưng không chứa secret thật.
- Không commit `.env.local`, `.env.development`, `.env.production` hoặc secret thật.
