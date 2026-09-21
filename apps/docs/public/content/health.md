# Health API

Health module cung cấp liveness, readiness, detailed health check và Sentry debug endpoint. Đây là API đã triển khai trong `apps/api/src/modules/health`.

## Status

Status: `implemented`

Đã hỗ trợ:

- Liveness endpoint.
- Readiness endpoint.
- Detailed health endpoint.
- Alias liveness cũ.
- Sentry debug endpoint có guard production config.

## Backend Module

```txt
apps/api/src/modules/health
```

Base route:

```txt
/health
```

Health endpoints không dùng global prefix `/api/v1`.

## Auth & Headers

Controller dùng `@Public()`, không cần access token.

Production behavior:

- `GET /health/live` và `GET /health/liveness` luôn dùng được.
- `GET /health`, `GET /health/readiness`, `GET /health/debug-sentry` bị chặn trong production nếu `HEALTH_ENDPOINTS_ENABLED` không bật.

Config:

```txt
NODE_ENV=production
HEALTH_ENDPOINTS_ENABLED=true
```

## Endpoints

| Method | Endpoint               | Dùng cho          |
| ------ | ---------------------- | ----------------- |
| GET    | `/health/live`         | Liveness probe    |
| GET    | `/health/liveness`     | Alias liveness    |
| GET    | `/health/readiness`    | Readiness probe   |
| GET    | `/health`              | Detailed health   |
| GET    | `/health/debug-sentry` | Test Sentry event |

## GET /health/live

Kiểm tra process API còn sống.

Response example:

```ts
type Response = {
  status: string;
  timestamp?: string;
};
```

FE usage:

- FE bình thường không cần gọi.
- Dùng cho deployment, uptime monitor, container liveness.

## GET /health/readiness

Kiểm tra API sẵn sàng nhận traffic.

Behavior:

- Gọi health service readiness.
- Có thể kiểm tra database/redis/system tùy service implementation.
- Trong production cần `HEALTH_ENDPOINTS_ENABLED=true`.

## GET /health

Detailed health check.

Behavior:

- Gọi `healthService.check()`.
- Dùng cho debug/dev/staging.
- Production nên hạn chế public exposure.

## GET /health/debug-sentry

Gửi một exception test lên Sentry.

Response:

```ts
type Response = {
  status: "sent" | "queued_or_failed" | "disabled";
  eventId?: string;
  dsnConfigured?: boolean;
  sentryProjectId?: string | null;
  environment?: string;
  message: string;
};
```

Rules:

- Nếu production và `HEALTH_ENDPOINTS_ENABLED` không bật, trả status disabled.
- Endpoint này chỉ dùng để verify Sentry config, không dùng trong app UI.

## FE/DevOps Notes

- Admin/Web không nên phụ thuộc health endpoint cho runtime UI.
- CI/deployment có thể dùng `/health/readiness`.
- Load balancer/container probe nên dùng `/health/live` hoặc `/health/liveness`.
- Không expose `/health/debug-sentry` trên production public nếu không cần.
