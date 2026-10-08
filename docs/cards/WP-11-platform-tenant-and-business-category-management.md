# [Feature] WP-11: Platform Tenant & Business Category Management

| Thuộc tính | Giá trị                               |
| ---------- | ------------------------------------- |
| Trạng thái | Partially complete                    |
| Giai đoạn  | Tuần 9                                |
| Ưu tiên    | High                                  |
| Bề mặt     | API, Platform Admin, Shared contracts |

## Goal

Cho Super Admin quản lý vòng đời Tenant và taxonomy Business Category dùng bởi onboarding, phân loại doanh nghiệp và Template Platform.

## Tại sao cần feature này?

Platform đã có auth, shell và Tenant API nền nhưng chưa đủ lifecycle. Business Category mới chỉ có active list; chưa có CRUD, ordering, usage count và archive rules cho Platform Admin.

## Scope

### Bao gồm

- Platform dashboard dùng dữ liệu thật trong phạm vi feature.
- Tenant list, detail, search và filter.
- Manual Tenant provisioning.
- Update, suspend và reactivate Tenant.
- Status history tối thiểu cho lifecycle action.
- Business Category CRUD, ordering, active/inactive và usage count.
- Chặn hard delete Category đang được Business sử dụng.
- Suspended Tenant không nhận public booking mới.

### Không bao gồm

- Impersonation.
- Platform audit portal nâng cao.
- Subscription, Template, Policy và Contact business logic.

## Dependencies

- WP-01: Platform/Admin auth contexts và Tenant foundation.

## Actors & Access Control

| Actor       | Khả năng                                         |
| ----------- | ------------------------------------------------ |
| Super Admin | Tenant lifecycle và Business Category management |
| Owner/Staff | Không truy cập `/platform/*`                     |
| Onboarding  | Chỉ đọc active Business Categories               |

## Data / Domain

### Entities hiện có

- `Tenant` với status.
- `Business`, `BusinessCategory` và relations.
- Platform authentication context.

### Bổ sung cần thiết

- Tenant status history với actor/time/reason.
- Business Category ordering, usage count query và safe archive behavior.

## Business Rules

- Chỉ `SUPER_ADMIN` dùng Platform endpoints.
- Suspend/reactivate phải idempotent và ghi actor/time/reason.
- Suspend không xóa dữ liệu cũ nhưng chặn booking mới.
- Business Category inactive không xuất hiện trong onboarding mới.
- Category đang được Business dùng không được hard delete.
- Manual provisioning phải tạo workspace nhất quán hoặc rollback toàn bộ.

## Main Flows

### Flow 1: Suspend Tenant

`Mở Tenant detail → nhập reason → confirm → transition status → append history → public booking bị chặn`.

### Flow 2: Manual provisioning

`Nhập Owner/Tenant/Business → validate uniqueness → transaction create → gửi activation/onboarding email`.

### Flow 3: Quản lý Business Category

`Create/edit/reorder → activate/inactivate → kiểm tra usage trước archive/delete`.

## API Contract

| Method       | Endpoint                                        | Trạng thái         | Mục đích                   |
| ------------ | ----------------------------------------------- | ------------------ | -------------------------- |
| GET/POST     | `/api/v1/platform/tenants`                      | Current foundation | List/manual create         |
| GET          | `/api/v1/platform/tenants/:tenantId`            | Current foundation | Tenant detail              |
| PATCH        | `/api/v1/platform/tenants/:tenantId`            | Target             | Update Tenant              |
| POST         | `/api/v1/platform/tenants/:tenantId/suspend`    | Target             | Suspend                    |
| POST         | `/api/v1/platform/tenants/:tenantId/reactivate` | Target             | Reactivate                 |
| GET          | `/api/v1/platform/tenants/:tenantId/history`    | Target             | Status history             |
| GET          | `/api/v1/business-categories`                   | Current            | Active list cho onboarding |
| GET/POST     | `/api/v1/platform/business-categories`          | Target             | Platform list/create       |
| PATCH/DELETE | `/api/v1/platform/business-categories/:id`      | Target             | Update/archive/delete      |
| POST         | `/api/v1/platform/business-categories/reorder`  | Target             | Reorder                    |

## UI / Routes

| Route                           | Màn hình                            |
| ------------------------------- | ----------------------------------- |
| `/{locale}/dashboard`           | Platform overview dùng dữ liệu thật |
| `/{locale}/tenants`             | Tenant list/filter                  |
| `/{locale}/tenants/[id]`        | Detail, lifecycle và history        |
| `/{locale}/tenants/new`         | Manual provisioning                 |
| `/{locale}/business-categories` | Category CRUD/order/usage           |

## Implementation Guide

| Layer          | Vị trí / Công việc                                                  |
| -------------- | ------------------------------------------------------------------- |
| Shared         | Tenant lifecycle, Business Category và filter contracts             |
| Database       | Tenant history và BusinessCategory constraints/indexes              |
| Backend        | `tenant`, `business-category`, platform controllers/use cases/tests |
| Platform Admin | `apps/platform-admin/src/views/tenants` và new category view        |
| Integration    | Public booking availability check và onboarding category source     |

## Use Cases

### UC-WP11-01: Super Admin suspend Tenant

- **Tác nhân:** Super Admin.
- **Luồng chính:** Search Tenant → xem detail → suspend với reason → hệ thống chặn booking mới.

### UC-WP11-02: Super Admin tạo Tenant thủ công

- **Tác nhân:** Super Admin.
- **Luồng chính:** Nhập workspace và Owner → transaction provision → gửi hướng dẫn kích hoạt.

### UC-WP11-03: Super Admin quản lý Business Category

- **Tác nhân:** Super Admin.
- **Luồng chính:** Tạo/sửa/reorder/disable → onboarding chỉ đọc active list.

## Checklists

### Planning / Design

- [ ] Chốt Tenant lifecycle transition table.
- [ ] Chốt manual provisioning activation flow.
- [ ] Chốt Category archive/delete policy và usage definition.

### Implementation

| Task ID  | Layer | Task                                             | Trạng thái |
| -------- | ----- | ------------------------------------------------ | ---------- |
| WP11-001 | BE    | Platform Tenant list/create/detail foundation    | Partial    |
| WP11-002 | BE/DB | Suspend/reactivate và status history             | Todo       |
| WP11-003 | BE    | Transactional manual provisioning                | Todo       |
| WP11-004 | BE    | Business Category CRUD/order/usage               | Todo       |
| WP11-005 | FE    | Tenant list/detail/provision/lifecycle UI        | Partial    |
| WP11-006 | FE    | Business Category management UI                  | Todo       |
| WP11-007 | Test  | Platform role, idempotency và booking suspension | Todo       |

### Review & Testing

- [ ] Business Admin không bootstrap Platform session.
- [ ] Suspend/reactivate lặp lại không tạo trạng thái sai.
- [ ] Suspended Tenant không nhận public booking mới.
- [ ] Category inactive không xuất hiện trong onboarding.
- [ ] Usage count đúng trước archive/delete.

## Acceptance Criteria

- Super Admin quản lý được Tenant lifecycle và Business Category bằng dữ liệu thật.
- Manual provisioning không để lại workspace dở dang khi lỗi.
- Lifecycle actions có actor, timestamp và reason.
- Platform routes chỉ truy cập được bằng platform context.
- API/Platform Admin tests, typecheck và build pass.

## Labels

`feature` `platform-admin` `tenant` `business-category` `backend` `frontend` `high` `week-9`
