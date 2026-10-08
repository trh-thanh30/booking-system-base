# [Feature] WP-03: Service Category & Catalog Management

| Thuộc tính | Giá trị                                               |
| ---------- | ----------------------------------------------------- |
| Trạng thái | Backend partially complete                            |
| Giai đoạn  | Tuần 3–4                                              |
| Ưu tiên    | Critical                                              |
| Bề mặt     | API, Business Admin, public booking, Shared contracts |

## Goal

Cho Business quản lý category và service có thể đặt lịch, gồm giá, thời lượng, buffer, ảnh, trạng thái và dữ liệu import/export.

Feature cung cấp catalog active ổn định cho Staff assignment, Availability và public booking.

## Tại sao cần feature này?

Backend CRUD cơ bản đã có nhưng Business Admin chưa có màn hình thật. Nếu thiếu public contract và rule archive, catalog không thể làm nguồn dữ liệu an toàn cho booking.

## Scope

### Bao gồm

- Category list, create, update, reorder và archive.
- Service list, detail, create, update và archive.
- Duration, price, currency, buffer trước/sau, category và status.
- Một hoặc nhiều ảnh Service qua asset foundation.
- Public query chỉ trả Category/Service active.
- Gán Staff cho Service khi WP-04 cung cấp Staff Profile.
- Excel import/export với validation lỗi theo dòng.
- Permission-based actions trong Business Admin.

### Không bao gồm

- Combo hoặc package dịch vụ.
- Giá riêng theo Staff.
- Inventory, POS hoặc customer payment.

## Dependencies

- WP-02: Business Profile, Operating Hours & Booking Subdomain.
- WP-04 bổ sung Staff assignment nhưng không chặn Category/Service CRUD.

## Actors & Access Control

| Actor                       | Khả năng                                           |
| --------------------------- | -------------------------------------------------- |
| Owner/Manager có permission | Quản lý Category và Service trong Business         |
| Staff                       | Chỉ đọc catalog cần cho lịch cá nhân nếu được phép |
| Public visitor              | Chỉ đọc Category/Service active và public          |

## Data / Domain

### Entities hiện có

- `Category` scope theo Tenant + Business.
- `Service` thuộc Category và Business.
- `Asset`/`AssetLink` cho ảnh.

### Fields chính

- Category: `name`, `slug`, `description`, `order`, `status`, `type`.
- Service: `name`, `slug`, `description`, `duration`, `price`, `currency`, `bufferBefore`, `bufferAfter`, `status`.
- Target relation: Service N-N Staff qua assignment thuộc WP-04.

## Business Rules

- Service name bắt buộc; duration lớn hơn 0; price và buffer không âm.
- Slug unique trong `tenant_id + business_id`.
- Category/Service inactive không xuất hiện public.
- Không hard delete Service đã được Appointment tham chiếu.
- Category có Service phải archive hoặc xử lý relation theo policy đã chốt.
- Import phải atomic hoặc trả rõ các dòng bị bỏ qua theo mode được chọn.

## Main Flows

### Flow 1: Quản lý Service

`Mở catalog → chọn Category → tạo/sửa Service → upload ảnh → validate → publish hoặc archive`.

### Flow 2: Import Excel

`Tải template → nhập dữ liệu → upload → preview lỗi theo dòng → confirm → transaction import → tải kết quả`.

### Flow 3: Public catalog

`Resolve Business → query active Categories → query active Services → map public DTO không chứa field nội bộ`.

## API Contract

| Method           | Endpoint                          | Trạng thái | Mục đích                            |
| ---------------- | --------------------------------- | ---------- | ----------------------------------- |
| GET/POST         | `/api/v1/categories`              | Current    | List/create Category                |
| GET/PATCH/DELETE | `/api/v1/categories/:id`          | Current    | Detail/update/archive Category      |
| GET/POST         | `/api/v1/services`                | Current    | List/create Service                 |
| GET/PATCH/DELETE | `/api/v1/services/:id`            | Current    | Detail/update/archive Service       |
| POST             | `/api/v1/services/import/preview` | Target     | Validate Excel và trả lỗi theo dòng |
| POST             | `/api/v1/services/import`         | Target     | Confirm import                      |
| GET              | `/api/v1/services/export`         | Target     | Export theo filter                  |
| GET              | `/api/v1/public/catalog`          | Target     | Active public catalog theo hostname |

## UI / Routes

| Route                             | Màn hình                              |
| --------------------------------- | ------------------------------------- |
| `/{locale}/admin/services`        | Service list, filters và bulk actions |
| `/{locale}/admin/services/new`    | Create Service                        |
| `/{locale}/admin/services/[id]`   | Edit/detail Service                   |
| `/{locale}/admin/categories`      | Category management và ordering       |
| `/{locale}/admin/services/import` | Preview/confirm Excel import          |

## Implementation Guide

| Layer          | Vị trí / Công việc                                                     |
| -------------- | ---------------------------------------------------------------------- |
| Shared         | `category.schema.ts`, `service.schema.ts`, types/constants/permissions |
| Backend        | `apps/api/src/modules/category`, `service`, `assets`                   |
| Database       | Existing Category/Service; thêm assignment/import support khi cần      |
| Business Admin | `apps/web/src/views/admin/services` và `categories` mới                |
| Public         | Public catalog service/query trong API và Web                          |

## Use Cases

### UC-WP03-01: Owner tạo Service có thể đặt lịch

- **Tác nhân:** Owner/Manager có permission.
- **Luồng chính:** Chọn Category → nhập duration/price/buffer → upload ảnh → activate.
- **Ngoại lệ:** Slug trùng, Category khác Business hoặc dữ liệu số không hợp lệ.

### UC-WP03-02: Owner archive Service

- **Tác nhân:** Owner/Manager.
- **Luồng chính:** Chọn Service → xem ảnh hưởng → archive.
- **Kết quả:** Service biến mất khỏi public catalog nhưng lịch sử vẫn còn.

### UC-WP03-03: Owner import catalog bằng Excel

- **Tác nhân:** Owner/Manager.
- **Luồng chính:** Upload → preview → sửa lỗi hoặc confirm → nhận báo cáo kết quả.

## Checklists

### Planning / Design

- [x] Shared validation cho Category và Service CRUD.
- [x] Permission keys và Business-scoped API foundation.
- [ ] Chốt archive semantics và Category reorder contract.
- [ ] Chốt Excel columns, atomicity và duplicate policy.

### Implementation

| Task ID  | Layer | Task                                                | Trạng thái |
| -------- | ----- | --------------------------------------------------- | ---------- |
| WP03-001 | BE    | Category CRUD use cases/repository/tests            | Done       |
| WP03-002 | BE    | Service CRUD use cases/repository/tests             | Done       |
| WP03-003 | BE    | Archive/history-safe delete và public catalog query | Todo       |
| WP03-004 | Asset | Service image ownership và ordering                 | Todo       |
| WP03-005 | FE    | Category management UI                              | Todo       |
| WP03-006 | FE    | Service list/create/edit/detail UI                  | Todo       |
| WP03-007 | BE/FE | Excel preview/import/export                         | Todo       |
| WP03-008 | Test  | Permission, isolation và active-only contract       | Todo       |

### Review & Testing

- [ ] Owner tạo, sửa, archive Category/Service bằng dữ liệu thật.
- [ ] Public catalog không trả inactive records.
- [ ] Cross-Tenant và cross-Business ID bị từ chối.
- [ ] Import lỗi hiển thị đúng row/column và không ghi ngoài policy.
- [ ] UI có loading, empty, error, forbidden và responsive states.

## Acceptance Criteria

- Business Admin không còn dùng mock data cho catalog.
- Category/Service CRUD, archive, image và public status hoạt động đúng.
- Catalog public chỉ chứa record active thuộc Business đã resolve.
- Import/export dùng cùng validation và filter semantics với API.
- API/Web lint, typecheck, tests và build pass.

## Labels

`feature` `service-catalog` `backend` `frontend` `excel` `critical` `week-3`
