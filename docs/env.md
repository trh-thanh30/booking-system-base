# Environment Variables

Repo dùng nhiều file env theo môi trường. File mẫu là `.env.example`.

## File Env

| File               | Vai trò                                       |
| :----------------- | :-------------------------------------------- |
| `.env.example`     | Mẫu public, được commit.                      |
| `.env.development` | Cấu hình local/dev, không commit secret thật. |
| `.env.test`        | Cấu hình test.                                |
| `.env.production`  | Cấu hình production/deploy, không commit.     |

## Nhóm Biến Chính

### App Ports

- `API_PORT`
- `WEB_PORT`
- `ADMIN_PORT`

### Database

- `DATABASE_URL`
- `DIRECT_URL`
- `DEV_DB_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

### Redis

- `REDIS_URL`
- `REDIS_DB_PORT`

### Telegram CI

Chỉ cần cấu hình trên GitHub Actions Secrets:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

Không cần đưa token thật vào file env local.

## Rule

- Biến public cho Next.js phải bắt đầu bằng `NEXT_PUBLIC_`.
- Secret không dùng prefix `NEXT_PUBLIC_`.
- Không đọc env trực tiếp rải rác trong UI component.
- Gom env mapping vào config module khi số lượng biến tăng.
- `.env.example` phải có comment đủ rõ nhưng không chứa secret thật.
