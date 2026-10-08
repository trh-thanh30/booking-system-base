# [Feature] WP-05: Customer Records, Notes & Booking History

| Thuộc tính | Giá trị                                               |
| ---------- | ----------------------------------------------------- |
| Trạng thái | Not started                                           |
| Giai đoạn  | Tuần 4                                                |
| Ưu tiên    | High                                                  |
| Bề mặt     | API, Business Admin, public/admin booking integration |

## Goal

Quản lý hồ sơ khách vãng lai để lễ tân tìm kiếm, tái sử dụng thông tin, ghi chú nội bộ và xem lịch sử booking mà không yêu cầu Customer account.

## Tại sao cần feature này?

Public booking và manual booking đều cần cùng một Customer record. Nếu không normalize và deduplicate từ đầu, lịch sử sẽ bị chia nhỏ và guest lookup dễ làm lộ dữ liệu.

## Scope

### Bao gồm

- Customer CRUD và soft delete.
- Normalize và search theo name, phone và email.
- Deduplicate trong cùng Tenant theo phone/email đã normalize.
- Internal notes có actor và timestamp.
- Booking history read model.
- Excel import/export với lỗi theo dòng.
- Customer list, detail, create và edit trong Business Admin.
- Find-or-create Customer khi public hoặc Admin tạo Appointment.

### Không bao gồm

- Customer account và lịch sử xuyên thiết bị.
- Guest OTP.
- Tags/VIP, loyalty, birthday automation và marketing campaign.

## Dependencies

- WP-01: Tenant, Admin auth và permission foundation.
- WP-08 cung cấp Appointment history; Customer CRUD có thể hoàn thành trước.

## Actors & Access Control

| Actor                      | Khả năng                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| Owner/Manager/Receptionist | CRUD, search, note và xem booking history                          |
| Staff                      | Chỉ xem Customer gắn với Appointment được phép nếu policy cho phép |
| Public visitor             | Gửi thông tin booking; không truy cập Customer CRUD                |

## Data / Domain

### Entities cần có

- `Customer`: identity/contact record scope theo Tenant.
- `CustomerNote`: ghi chú nội bộ với actor/time.
- `Appointment.customerId`: liên kết booking history khi WP-08 được triển khai.

### Fields chính

- `fullName`, `phone`, `normalizedPhone`, `email`, `normalizedEmail`.
- Optional locale, timezone hoặc marketing consent chỉ khi có requirement rõ ràng.
- `deletedAt` hoặc status cho soft delete.

## Business Rules

- Phone bắt buộc cho guest booking; email optional theo cấu hình Phase 1.
- Normalize phone theo country context trước khi deduplicate.
- Không tạo Customer trùng trong cùng Tenant khi request đồng thời.
- Customer có Appointment history chỉ được soft delete.
- Internal note không xuất hiện trong public response.
- Guest lookup dùng booking code + phone, không expose Customer ID.

## Main Flows

### Flow 1: Lễ tân tìm hoặc tạo Customer

`Nhập phone/email → search normalized value → chọn Customer có sẵn hoặc tạo mới → gắn vào Appointment`.

### Flow 2: Public booking tạo Customer an toàn

`Validate guest data → normalize → transaction find-or-create → tạo Appointment → trả booking code`.

### Flow 3: Xem lịch sử

`Mở Customer detail → tải notes + Appointment summary theo quyền → filter/sort`.

## API Contract

| Method           | Endpoint                             | Trạng thái | Mục đích                    |
| ---------------- | ------------------------------------ | ---------- | --------------------------- |
| GET/POST         | `/api/v1/customers`                  | Target     | List/search/create Customer |
| GET/PATCH/DELETE | `/api/v1/customers/:id`              | Target     | Detail/update/soft delete   |
| GET/POST         | `/api/v1/customers/:id/notes`        | Target     | List/create internal notes  |
| GET              | `/api/v1/customers/:id/appointments` | Target     | Booking history             |
| POST             | `/api/v1/customers/import/preview`   | Target     | Validate Excel              |
| POST             | `/api/v1/customers/import`           | Target     | Confirm import              |
| GET              | `/api/v1/customers/export`           | Target     | Export theo filter          |

## UI / Routes

| Route                              | Màn hình                          |
| ---------------------------------- | --------------------------------- |
| `/{locale}/admin/customers`        | Customer list/search/filter       |
| `/{locale}/admin/customers/new`    | Create Customer                   |
| `/{locale}/admin/customers/[id]`   | Contact, notes và booking history |
| `/{locale}/admin/customers/import` | Excel preview/import result       |

## Implementation Guide

| Layer          | Vị trí / Công việc                                                  |
| -------------- | ------------------------------------------------------------------- |
| Shared         | Customer schema, filters, DTOs và normalization-facing contract     |
| Database       | Customer, CustomerNote và uniqueness strategy                       |
| Backend        | Tạo `apps/api/src/modules/customers` với use cases/repository/tests |
| Integration    | Appointment create/find-or-create và guest lookup                   |
| Business Admin | Tạo `apps/web/src/views/admin/customers`                            |

## Use Cases

### UC-WP05-01: Lễ tân tra cứu Customer

- **Tác nhân:** Receptionist.
- **Luồng chính:** Search name/phone/email → xem detail → chọn cho booking.
- **Ngoại lệ:** Không có kết quả hoặc Customer đã soft-delete.

### UC-WP05-02: Hệ thống chống tạo Customer trùng

- **Tác nhân:** Public/Admin booking flow.
- **Luồng chính:** Normalize → tìm match → dùng record hiện có hoặc tạo atomically.
- **Ngoại lệ:** Hai request đồng thời cùng phone/email.

### UC-WP05-03: Owner xem lịch sử và ghi chú

- **Tác nhân:** Owner/Manager/Receptionist.
- **Luồng chính:** Mở detail → xem Appointment history → thêm internal note.

## Checklists

### Planning / Design

- [ ] Chốt Tenant-level hay Business-level Customer ownership.
- [ ] Chốt phone/email duplicate và merge policy.
- [ ] Chốt soft-delete visibility và retention.
- [ ] Chốt Excel columns và import atomicity.

### Implementation

| Task ID  | Layer     | Task                                             | Trạng thái |
| -------- | --------- | ------------------------------------------------ | ---------- |
| WP05-001 | Shared/DB | Customer và CustomerNote contracts/models        | Todo       |
| WP05-002 | BE        | CRUD, search và soft-delete use cases            | Todo       |
| WP05-003 | BE        | Normalize/deduplicate và concurrency protection  | Todo       |
| WP05-004 | BE        | Notes và booking-history read model              | Todo       |
| WP05-005 | FE        | Customer list/create/edit/detail UI              | Todo       |
| WP05-006 | BE/FE     | Excel preview/import/export                      | Todo       |
| WP05-007 | Test      | Isolation, dedup, soft delete và note visibility | Todo       |

### Review & Testing

- [ ] Search trả kết quả đúng với normalized phone/email.
- [ ] Concurrent find-or-create không tạo duplicate.
- [ ] Public response không chứa internal notes.
- [ ] Soft-deleted Customer không biến mất khỏi Appointment history.
- [ ] Import lỗi không ghi dữ liệu ngoài policy.

## Acceptance Criteria

- Business Admin CRUD/search Customer bằng dữ liệu thật.
- Customer được deduplicate an toàn trong đúng Tenant scope.
- Internal notes chỉ hiển thị cho actor có permission.
- Booking history phản ánh đúng Appointment của Customer.
- Excel import/export có preview và lỗi theo dòng.
- API/Web tests, typecheck và build pass.

## Labels

`feature` `customer-crm` `backend` `frontend` `excel` `high` `week-4`
