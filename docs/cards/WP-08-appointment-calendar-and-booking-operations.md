# [Feature] WP-08: Appointment Calendar & Booking Operations

| Thuộc tính | Giá trị                                       |
| ---------- | --------------------------------------------- |
| Trạng thái | Domain not started; Business Admin UI is mock |
| Giai đoạn  | Tuần 7                                        |
| Ưu tiên    | Critical                                      |
| Bề mặt     | API, Business Admin, Shared contracts         |

## Goal

Cho Owner, Manager, Receptionist và Staff vận hành Appointment từ public hoặc manual booking trên calendar/list/detail thống nhất, với state machine và history được kiểm soát ở backend.

## Tại sao cần feature này?

Public booking chỉ tạo giá trị khi cơ sở có thể xác nhận, đổi lịch, check-in, hoàn thành hoặc hủy. Nếu transition chỉ bị ẩn ở UI, client khác vẫn có thể tạo trạng thái sai.

## Scope

### Bao gồm

- Appointment, ordered AppointmentServices, status history và internal notes.
- Calendar ngày/tuần và list/filter Phase 1.
- Detail drawer hoặc page.
- Manual create cho walk-in/phone booking.
- Edit Service, Staff, time và Customer theo rule.
- Reschedule qua WP-06.
- Status machine: pending, confirmed, checked-in, in-progress, completed, cancelled và no-show.
- Actor/time/before/after history.
- Staff personal calendar read model.

### Không bao gồm

- Month calendar nếu day/week đáp ứng MVP.
- Drag-and-drop nếu không cần cho acceptance.
- Waitlist.
- POS, customer payment hoặc invoice.

## Dependencies

- WP-05: Customer records.
- WP-06: Availability và conflict control.
- WP-07: Public booking contract.

## Actors & Access Control

| Actor                 | Khả năng                                                         |
| --------------------- | ---------------------------------------------------------------- |
| Owner/Manager         | Full Appointment operations trong Tenant/Business                |
| Receptionist          | Create/edit/reschedule/status theo permission                    |
| Staff                 | Xem và cập nhật Appointment được gán theo transition policy      |
| Public booking system | Tạo Appointment qua public use case, không dùng Admin controller |

## Data / Domain

### Entities cần có

- `Appointment`: Business, Customer, Staff, start/end, timezone snapshot, status.
- `AppointmentService`: ordered Service snapshot, duration, price và buffer cần thiết.
- `AppointmentStatusHistory`: previous/next status, actor, time và reason.
- `AppointmentNote`: internal note với author/time.

### State machine

```text
PENDING → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED
    └───────────────→ CANCELLED
CONFIRMED/PENDING ──→ NO_SHOW (sau thời điểm hợp lệ)
```

Transition chính xác phải được chốt bằng policy table; diagram chỉ mô tả happy path.

## Business Rules

- Transition được validate trong use case.
- Create/reschedule luôn kiểm tra WP-06 trong transaction.
- Appointment giữ snapshot cần thiết để lịch sử không đổi khi Service được sửa.
- Cancel/no-show yêu cầu reason theo policy.
- Staff chỉ thấy/cập nhật Appointment trong scope được gán.
- Completed Appointment cung cấp estimated revenue; không phải accounting revenue.

## Main Flows

### Flow 1: Manual booking

`Search/create Customer → chọn Services → chọn Staff/time → validate Availability → create Appointment → append history → emit event`.

### Flow 2: Reschedule

`Mở detail → chọn slot mới → validate conflict → transaction update → history → notification event`.

### Flow 3: Status operation

`Actor chọn action → use case kiểm tra role/current status → update → append immutable history → publish event`.

## API Contract

| Method    | Endpoint                               | Trạng thái | Mục đích                    |
| --------- | -------------------------------------- | ---------- | --------------------------- |
| GET/POST  | `/api/v1/appointments`                 | Target     | List/filter/manual create   |
| GET/PATCH | `/api/v1/appointments/:id`             | Target     | Detail và allowed edits     |
| POST      | `/api/v1/appointments/:id/reschedule`  | Target     | Reschedule qua Availability |
| POST      | `/api/v1/appointments/:id/transitions` | Target     | Thực hiện status transition |
| GET       | `/api/v1/appointments/:id/history`     | Target     | Status/change history       |
| GET/POST  | `/api/v1/appointments/:id/notes`       | Target     | Internal notes              |
| GET       | `/api/v1/appointments/calendar`        | Target     | Calendar read model         |

## UI / Routes

| Route                           | Màn hình                                     |
| ------------------------------- | -------------------------------------------- |
| `/{locale}/admin/bookings`      | Day/week calendar và list/filter             |
| `/{locale}/admin/bookings/new`  | Manual booking form                          |
| `/{locale}/admin/bookings/[id]` | Detail, status, reschedule, notes và history |

## Implementation Guide

| Layer          | Vị trí / Công việc                                                      |
| -------------- | ----------------------------------------------------------------------- |
| Shared         | Appointment schemas, status enum, filters và transition commands        |
| Database       | Appointment, AppointmentService, history, notes và conflict indexes     |
| Backend        | Tạo module `appointments` theo use cases/repository/domain policy/tests |
| Events         | Outbox/event boundary cho Notification và Report consumers nếu cần      |
| Business Admin | Thay mock trong `apps/web/src/views/admin/bookings` bằng service thật   |

## Use Cases

### UC-WP08-01: Receptionist tạo lịch qua điện thoại

- **Tác nhân:** Receptionist.
- **Luồng chính:** Chọn Customer/Services/Staff/slot → confirm → Appointment được tạo.
- **Ngoại lệ:** Slot conflict hoặc thiếu permission.

### UC-WP08-02: Manager đổi lịch

- **Tác nhân:** Manager/Receptionist có permission.
- **Luồng chính:** Mở Appointment → chọn target slot → reschedule → ghi history và event.

### UC-WP08-03: Staff cập nhật trạng thái phục vụ

- **Tác nhân:** Assigned Staff.
- **Luồng chính:** Check-in/in-progress/completed theo transition hợp lệ.
- **Ngoại lệ:** Appointment không được gán hoặc transition sai.

## Checklists

### Planning / Design

- [ ] Chốt Appointment status transition matrix.
- [ ] Chốt snapshot fields và edit policy.
- [ ] Chốt cancellation/no-show reasons.
- [ ] Chốt calendar query shape và pagination/windowing.

### Implementation

| Task ID  | Layer     | Task                                                  | Trạng thái |
| -------- | --------- | ----------------------------------------------------- | ---------- |
| WP08-001 | Shared/DB | Appointment, service snapshot, history và note models | Todo       |
| WP08-002 | Domain    | Status transition policy và tests                     | Todo       |
| WP08-003 | BE        | Create/list/detail/update use cases                   | Todo       |
| WP08-004 | BE        | Reschedule và conflict integration                    | Todo       |
| WP08-005 | BE        | History, notes và calendar read models                | Todo       |
| WP08-006 | FE        | Replace mock calendar/list/detail                     | Todo       |
| WP08-007 | FE        | Manual create/reschedule/status UI                    | Todo       |
| WP08-008 | Test      | Permission, transition và concurrent reschedule       | Todo       |

### Review & Testing

- [ ] Invalid transition bị API từ chối dù gọi trực tiếp.
- [ ] Reschedule không gây double-booking.
- [ ] History ghi actor, time, before/after và reason.
- [ ] Staff không xem Appointment ngoài scope.
- [ ] Calendar/list phản ánh cùng dữ liệu và filter.

## Acceptance Criteria

- Public và manual Appointment dùng cùng domain model.
- Calendar, list và detail dùng dữ liệu thật.
- Status transitions, edit và reschedule được kiểm soát trong use case.
- History/internal notes giữ đúng visibility.
- API/Web unit, integration, browser, typecheck và build pass.

## Labels

`feature` `appointments` `calendar` `backend` `frontend` `critical` `week-7`
