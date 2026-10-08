# [Foundation] WP-00: Phase 1 Baseline & Scope Governance

| Thuộc tính | Giá trị                                                                   |
| ---------- | ------------------------------------------------------------------------- |
| Trạng thái | In progress                                                               |
| Giai đoạn  | Tuần 1                                                                    |
| Ưu tiên    | Critical                                                                  |
| Bề mặt     | API, Web, Business Admin, Platform Admin, Shared packages, Infrastructure |

## Goal

Đưa repository về một baseline có thể kiểm chứng và khóa phạm vi Phase 1 trước khi các domain booking mới được phát triển song song.

Feature hoàn thành khi backlog, schema, route, permission, seed, environment và CI cùng mô tả một hệ thống thống nhất.

## Tại sao cần feature này?

Codebase đã có nhiều nền tảng dùng lại được, nhưng card cũ chứa cả tính năng Phase 2 như deposit, SMS, waitlist và loyalty. Nếu không khóa phạm vi, các feature sau dễ tạo contract và schema mâu thuẫn.

## Scope

### Bao gồm

- Chốt phạm vi và các quyết định mở của Phase 1.
- Chuẩn hóa seed cho Super Admin, Owner, Staff, Tenant và default Business.
- Đối chiếu permission keys theo `platform`, `admin` và `client` auth contexts.
- Kiểm tra Tenant/Business isolation của các module hiện có.
- Chốt route map cho Landing, Business Admin, public booking và Platform Admin.
- Kiểm kê mock data và contract cần thay bằng dữ liệu thật.
- Chốt UI states: loading, empty, error, forbidden, suspended và unavailable.
- Chạy baseline lint, typecheck, test, build và security scan.

### Không bao gồm

- Xây mới Appointment, Availability hoặc Billing domain.
- Custom domain, Kubernetes, multi-region và auto-scaling.
- Audit portal nâng cao.

## Dependencies

- Không có dependency feature.
- [`phase-1-implementation-plan.md`](../implementation/phase-1-implementation-plan.md) là nguồn phạm vi ưu tiên.

## Actors & Access Control

| Actor              | Trách nhiệm                                                 |
| ------------------ | ----------------------------------------------------------- |
| Tech Lead          | Khóa decision, dependency và Definition of Done             |
| Backend developer  | Xác nhận schema, migration, seed và isolation baseline      |
| Frontend developer | Xác nhận route, mock data, states và design-system baseline |
| QA/PO              | Xác nhận acceptance và các phần ngoài phạm vi               |

## Data / Domain

### Domain boundaries phải thống nhất

- `Tenant` là ranh giới tổ chức, billing, user và domain.
- `Business` là đơn vị vận hành đặt lịch bên trong Tenant.
- `BusinessMembership` giới hạn Staff theo Business.
- Business-scoped data luôn được truy vấn bằng `tenant_id + business_id`.
- Platform Admin không nhận Tenant context; Business Admin không dùng Platform session.

### Dữ liệu baseline hiện có

`User`, `Tenant`, `Business`, `BusinessMembership`, `TenantDomain`, `TenantSettings`, `Permission`, `UserPermission`, `Asset`, `Notification`, `JobRun` và `SystemEvent`.

## Business Rules

- Client không được tự quyết định `tenant_id` hoặc `business_id` trong payload.
- Business context phải được resolve trước khi use case chạy.
- Không đánh dấu feature hoàn thành nếu UI vẫn dùng mock data trong happy path.
- Migration và seed phải chạy lại được trên database development sạch.
- Mọi phạm vi mới ngoài kế hoạch phải đi qua change request trước khi thêm vào card.

## Main Flows

### Flow 1: Baseline repository

`Install dependencies → start infrastructure → migrate → seed → lint/typecheck/test/build → smoke các app`.

### Flow 2: Scope governance

`Đề xuất thay đổi → đối chiếu Phase 1 → đánh giá dependency/timeline → phê duyệt → cập nhật plan và card`.

## API / Operational Interfaces

| Interface                      | Trạng thái | Mục đích                                |
| ------------------------------ | ---------- | --------------------------------------- |
| `GET /api/v1/health/live`      | Current    | Liveness probe                          |
| `GET /api/v1/health/readiness` | Current    | Readiness của dependency                |
| `GET /api/v1/health`           | Current    | Health tổng hợp                         |
| Root package scripts           | Current    | Baseline lint, test, typecheck và build |

## Implementation Guide

| Layer        | Vị trí / Công việc                                                  |
| ------------ | ------------------------------------------------------------------- |
| Planning     | `docs/implementation/phase-1-implementation-plan.md`, `docs/cards/` |
| Architecture | `CONTEXT.md`, `docs/architecture/`, `docs/adr/`                     |
| Database     | `apps/api/prisma/schema.prisma`, migrations và seed                 |
| CI           | `.github/workflows/`, root `package.json`, package scripts          |
| Environment  | `.env.example`, Compose files và app config providers               |

## Use Cases

### UC-WP00-01: Developer dựng môi trường sạch

- **Tác nhân:** Developer.
- **Tiền điều kiện:** Có Node, pnpm, Docker và environment development hợp lệ.
- **Luồng chính:** Khởi động infra → migrate → seed → chạy baseline → mở health và các app.
- **Kết quả:** Repository chạy được mà không cần thao tác ngầm ngoài tài liệu.

### UC-WP00-02: Nhóm đánh giá thay đổi phạm vi

- **Tác nhân:** PO, Tech Lead.
- **Luồng chính:** So sánh yêu cầu mới với Phase 1 → xác định tác động → chấp nhận hoặc chuyển Phase 2.
- **Kết quả:** Card và plan không chứa phạm vi mâu thuẫn.

## Checklists

### Planning / Design

- [x] Đồng bộ card với 18 work packages trong kế hoạch Phase 1.
- [ ] Chốt các quyết định mở tại mục 12 của implementation plan.
- [ ] Chốt permission matrix và route map cuối cùng.
- [ ] Chốt strategy cho migration, seed và rollback.

### Implementation

| Task ID  | Layer | Task                                                    | Trạng thái |
| -------- | ----- | ------------------------------------------------------- | ---------- |
| WP00-001 | Docs  | Chuẩn hóa feature cards và dependency graph             | Done       |
| WP00-002 | DB    | Kiểm chứng migrate/seed trên database sạch              | Todo       |
| WP00-003 | API   | Audit Tenant/Business isolation hiện có                 | Todo       |
| WP00-004 | FE    | Kiểm kê route và mock data của ba frontend surfaces     | Todo       |
| WP00-005 | CI    | Chạy và ghi baseline lint/typecheck/test/build/security | Todo       |
| WP00-006 | Ops   | Đồng bộ env example và Compose workflow                 | Todo       |

### Review & Testing

- [ ] Negative test chặn giả mạo Tenant/Business context.
- [ ] Health checks pass khi dependency sẵn sàng và fail đúng khi dependency hỏng.
- [ ] CI dùng đúng command đang tồn tại trong `package.json`.
- [ ] README và card không còn liên kết tới feature card cũ.

## Acceptance Criteria

- WP-00 đến WP-17 khớp tên, phạm vi và dependency trong implementation plan.
- Repository migrate và seed thành công trên database development sạch.
- Root lint, typecheck, test và build có kết quả baseline được lưu lại.
- Không còn card Phase 1 chứa tính năng đã bị loại trừ.
- Các decision còn mở có owner và thời hạn xử lý.

## Labels

`foundation` `architecture` `backend` `frontend` `infra` `critical` `week-1`
