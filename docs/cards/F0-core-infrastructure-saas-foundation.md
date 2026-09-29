# F0 - Core Infrastructure & SaaS Foundation

## Status

**Partially complete.** Hạ tầng chính đã tồn tại trong repository; F0 chỉ được
đánh dấu `Done` sau khi baseline được chạy lại và các acceptance criteria bên
dưới có bằng chứng kiểm tra.

## Overview

Thiết lập nền tảng kỹ thuật cho SaaS multi-tenant white-label: API, các ứng dụng
Web/Business Admin/Platform Admin, database, cache/job queue, tenant/business
context, object storage, health check, logging, environment validation, CI/CD và
deployment baseline.

Phase 1 chỉ resolve tenant bằng **subdomain** hoặc header nội bộ được bảo vệ.
Custom domain không thuộc phạm vi F0 Phase 1.

## Business Goal

Đảm bảo hệ thống có thể phục vụ nhiều tenant trên cùng hạ tầng, cô lập dữ liệu
theo tenant và business, đồng thời cung cấp baseline ổn định để phát triển các
domain booking, CRM, notification, subscription và reporting.

## User Stories

- Là Platform Operator, tôi muốn vận hành nhiều tenant trên cùng hệ thống.
- Là Engineering Team, tôi muốn request thuộc tenant/business có context rõ
  ràng để tránh rò rỉ dữ liệu.
- Là Engineering Team, tôi muốn build, scan, publish và deploy các ứng dụng theo
  một quy trình có thể kiểm tra và rollback.
- Là Business Admin, tôi muốn hệ thống ổn định và có thể sử dụng trên các kích
  thước màn hình được hỗ trợ.

## Phase 1 Scope

### Included

- Turborepo cho API, Web, Business Admin, Platform Admin và shared packages.
- PostgreSQL, Redis/BullMQ và S3-compatible object storage bằng Silo.
- Prisma migration và seed baseline.
- Tenant resolution qua subdomain.
- Header nội bộ `x-tenant-id`/`x-tenant-host` cho luồng hệ thống, development và
  test; không xem đây là public tenant selection API.
- Tenant context và business context guard/decorator.
- Health/liveness/readiness cho API, database và Redis.
- Structured logging, error handling và Sentry foundation.
- Environment validation cho các ứng dụng và worker.
- Docker image cho API, Web, Business Admin và Platform Admin.
- CI lint/typecheck/test/build, dependency/image scan, publish image và
  deployment baseline.

### Excluded

- Custom domain.
- Kubernetes, multi-region hoặc auto-scaling.
- Audit/observability portal nâng cao.
- SMS provider và các background job nghiệp vụ của feature sau.
- Quản lý nhiều business/chi nhánh trên giao diện Phase 1; schema nền vẫn có
  thể hỗ trợ nhiều `Business` trong một `Tenant`.

## Current Implementation Status

| Capability                     | Status                        | Remaining work                                                                     |
| ------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------- |
| Monorepo và shared packages    | Implemented                   | Xác nhận lại lint, typecheck, test và build toàn workspace.                        |
| PostgreSQL/Prisma              | Implemented                   | Kiểm tra migrate/seed trên database sạch và rehearsal production migration.        |
| Redis/BullMQ và email worker   | Implemented foundation        | Loại example cron; job booking/reminder thuộc F9.                                  |
| Object storage                 | Implemented foundation        | Smoke test upload/read với Silo trong development và deployment.                   |
| Tenant/business context        | Implemented foundation        | Bổ sung negative integration test chống cross-tenant/cross-business access.        |
| Tenant resolution              | Implemented for domain/header | Giới hạn Phase 1 ở subdomain; bổ sung public fallback/unavailable states.          |
| Health và Sentry               | Implemented foundation        | Xác nhận production configuration và không expose debug endpoint.                  |
| Docker/CI/security scan        | Implemented                   | Xác nhận pipeline trên pull request và image release thật.                         |
| Publish/deploy/rollback        | Implemented foundation        | Chạy rehearsal trên staging và lưu acceptance evidence.                            |
| Platform system diagnostics UI | Placeholder                   | Chỉ nối basic health status hoặc ẩn khỏi Phase 1; không xây audit portal nâng cao. |

## API Endpoints

- `GET /health/live`
- `GET /health/liveness` — alias của liveness
- `GET /health/readiness`
- `GET /health` — detailed health khi environment cho phép
- `GET /tenants/resolve?host={host}`
- `GET /internal/tenants/:tenantId/context` — chỉ `SUPER_ADMIN`

`GET /health/debug-sentry` chỉ dùng để kiểm tra ở môi trường được cho phép và
không phải endpoint sản phẩm của Phase 1.

## Database Foundation

- `tenants`
- `businesses`
- `business_memberships`
- `tenant_domains`
- `tenant_settings`
- `job_runs`
- `system_events`

Các bảng nghiệp vụ như staff, customer và appointment thuộc feature card tương
ứng, không thuộc F0.

## Frontend States

- Tenant/subdomain không tồn tại.
- Tenant bị suspend hoặc chưa sẵn sàng phục vụ.
- Loading, maintenance và generic error state.
- Platform System chỉ hiển thị basic operational status nếu được expose an toàn.

## Validation and Security Rules

- Tenant-scoped API phải resolve tenant context trước khi thực thi use case.
- Business-scoped API phải resolve cả `tenant_id + business_id`; không tin
  `tenant_id` hoặc `business_id` do client gửi tùy ý trong body.
- Platform API dùng `SUPER_ADMIN` và không yêu cầu tenant context.
- Public health/auth endpoints chỉ yêu cầu context khi endpoint đó khai báo.
- Subdomain/host được normalize và phải duy nhất.
- Header nội bộ không được trở thành cách cho public client tùy ý chọn tenant.
- Repository query nghiệp vụ phải scope theo tenant/business phù hợp.
- Environment bắt buộc phải được validate khi ứng dụng boot.
- Log không chứa password, token, cookie hoặc dữ liệu nhạy cảm đầy đủ.

## Acceptance Criteria

- API và worker khởi động thành công với environment hợp lệ, fail fast với
  environment bắt buộc bị thiếu hoặc sai.
- `live` phản ánh process đang chạy; `readiness` phản ánh database/Redis cần
  thiết để nhận traffic.
- Resolve subdomain trả đúng tenant; host không tồn tại không làm lộ tenant khác.
- Tenant/business guard từ chối request thiếu hoặc giả mạo context ở API được
  bảo vệ.
- Negative integration test chứng minh tenant/business không đọc hoặc sửa dữ
  liệu của tenant/business khác.
- Migration và seed chạy được trên database development sạch.
- Docker Compose development khởi động được PostgreSQL, Redis, Silo, API và
  worker cần thiết.
- CI chạy lint, typecheck, unit test, build và scan HIGH/CRITICAL theo chính sách
  repository.
- Image của bốn ứng dụng được build/publish bằng immutable tag.
- Deployment staging chạy migration, health check và rollback rehearsal thành
  công.
- Custom domain không xuất hiện trong acceptance criteria Phase 1.

## Technical Notes

- Backend tuân theo `controller -> use case -> repository -> Prisma`.
- Shared tenant/business contract dùng chung giữa nhiều app đặt trong
  `packages/shared`.
- `Tenant` là ranh giới account/organization; `Business` là đơn vị vận hành đặt
  lịch.
- Job queue trong F0 chỉ là foundation. Email booking/reminder được triển khai ở
  F9.
- Không coi UI placeholder hoặc mock operational status là tính năng đã hoàn
  thành.

## Dependencies

- None

## Estimate

- Initial estimate: 32h.
- Remaining verification/hardening: xác định lại sau khi chạy baseline đầy đủ.

## Priority

Critical
