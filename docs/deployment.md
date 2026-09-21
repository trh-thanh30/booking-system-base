# Deployment

Tài liệu này mô tả hướng build và deploy cho repo base. Repo không hardcode provider để có thể dùng với nhiều môi trường khác nhau.

## Build Local

```bash
pnpm build:packages
pnpm build:api
pnpm build:web
pnpm build:admin
pnpm build:platform-admin
```

Hoặc build toàn bộ:

```bash
pnpm build
```

## Docker

Build image:

```bash
pnpm docker:build:api
pnpm docker:build:web
pnpm docker:build:admin
pnpm docker:build:platform-admin
pnpm docker:build:all
```

Kiểm tra Dockerfile:

```bash
pnpm docker:check:all
```

## Docker Compose

Development:

```bash
pnpm infra:dev:up
pnpm infra:dev:logs
pnpm infra:dev:down
```

Production-like:

```bash
pnpm infra:prod:config
pnpm infra:prod:up
pnpm infra:prod:logs
pnpm infra:prod:down
```

Production compose dùng image qua biến:

- `API_IMAGE`
- `WEB_IMAGE`
- `ADMIN_IMAGE`
- `PLATFORM_ADMIN_IMAGE`
- `IMAGE_TAG`

## Database Migration

Không chạy Prisma migrate tự động trong app startup.

Development:

```bash
pnpm prisma:migrate:dev
```

Production:

```bash
pnpm prisma:migrate:prod
```

## CI/CD

GitHub Actions chạy theo pipeline:

1. `CI`: lint, typecheck, test, build và Trivy dependency scan.
2. `Build, Scan, and Push Images`: build bốn application image, báo cáo
   vulnerability HIGH/CRITICAL, chặn CRITICAL và push image đã qua gate lên
   GHCR.
3. `Deploy Production`: chạy Prisma migration, cập nhật Docker Compose qua
   SSH và kiểm tra health endpoint.

Push vào `main` sẽ tự chạy toàn bộ pipeline. Workflow publish chạy thủ công chỉ
build/push image; muốn deploy lại một image cụ thể, chạy workflow
`Deploy Production` và nhập immutable image tag.

### GitHub production environment

Tạo environment tên `production` và cấu hình các secrets:

- `DEPLOY_HOST`: hostname/IP của production server.
- `DEPLOY_USER`: SSH user.
- `DEPLOY_SSH_KEY`: private key dùng cho SSH.
- `DEPLOY_PATH`: thư mục deployment trên server.
- `DEPLOY_PORT`: SSH port, không bắt buộc, mặc định `22`.
- `DEPLOY_API_HEALTH_URL`: API liveness URL công khai, ví dụ
  `https://api.example.com/health/live`.
- `DEPLOY_WEB_URL`, `DEPLOY_ADMIN_URL`, `DEPLOY_PLATFORM_ADMIN_URL`: endpoint
  frontend để kiểm tra sau deploy, không bắt buộc.
- `GHCR_USERNAME`: tài khoản đọc private GHCR package, không bắt buộc nếu
  `github.repository_owner` có thể dùng được.
- `GHCR_READ_TOKEN`: token `read:packages`; nên cấu hình khi production server
  không pull được private package bằng token mặc định của workflow.

Production server phải có Docker Engine, Docker Compose v2 và file
`.env.production` trong `DEPLOY_PATH`. Workflow không tự tạo file môi trường để
tránh deploy bằng các giá trị mặc định không an toàn.

Trước khi cập nhật container, workflow snapshot `.env.production`, pull đúng
immutable image tag và chạy service `migrate`. Nếu API nội bộ hoặc public health
check thất bại, application images được đưa về cấu hình trước deploy. Database
migration không tự rollback; migration production phải backward-compatible.

### Image security policy

- HIGH được in trong log và lưu artifact 30 ngày nhưng không chặn pipeline.
- CRITICAL có bản vá làm fail CI/publish.
- Image chỉ được push sau khi CRITICAL gate thành công.

Telegram secrets cần cấu hình trong GitHub Actions:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

Nếu thiếu hai secret này, notification sẽ tự skip.
