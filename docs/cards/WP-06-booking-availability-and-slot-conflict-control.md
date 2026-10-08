# [Feature] WP-06: Booking Availability & Slot Conflict Control

| Thuộc tính | Giá trị                                                      |
| ---------- | ------------------------------------------------------------ |
| Trạng thái | Not started; high-risk domain                                |
| Giai đoạn  | Tuần 5                                                       |
| Ưu tiên    | Critical                                                     |
| Bề mặt     | API/domain, Shared contracts, public booking, Business Admin |

## Goal

Tính các slot có thể đặt từ giờ hoạt động, lịch Staff, dịch vụ, buffer, timezone và Appointment hiện có; đồng thời ngăn hai request chiếm cùng Staff/time.

## Tại sao cần feature này?

Availability là nguồn sự thật của public booking và manual booking. Chỉ lọc slot ở UI hoặc kiểm tra trước transaction sẽ tạo double-booking khi có request đồng thời.

## Scope

### Bao gồm

- `AvailabilityCalculator` thuần và có table-driven tests.
- Một hoặc nhiều Service được một Staff thực hiện tuần tự.
- Business operating hours và closures.
- Staff working hours, days off và Service assignments.
- Buffer trước/sau và slot interval.
- Chọn Staff cụ thể hoặc `any staff`.
- Trả slot theo Business timezone; lưu Instant bằng UTC.
- Validate lại slot trong transaction khi create/reschedule Appointment.
- Lock/constraint phù hợp để chống race condition.
- Giới hạn date range và số lượng slot.

### Không bao gồm

- Waitlist.
- Room/equipment hoặc multi-resource scheduling.
- Một Appointment dùng nhiều Staff.
- Long-lived slot hold; chỉ thêm short hold nếu confirm flow thực sự cần.

## Dependencies

- WP-02: Business operating hours, closures và timezone.
- WP-03: Service duration và buffer.
- WP-04: Staff schedule, days off và Service assignment.

## Actors & Access Control

| Actor              | Khả năng                                              |
| ------------------ | ----------------------------------------------------- |
| Public visitor     | Query slot public trong date range giới hạn           |
| Owner/Receptionist | Query và validate slot khi tạo/reschedule Appointment |
| Staff              | Query lịch khả dụng trong phạm vi được phép           |

## Data / Domain

### Inputs

- Tenant/Business context.
- Ordered Service IDs.
- Optional Staff ID hoặc `any`.
- Date range, timezone và slot interval.
- Operating hours, closures, Staff schedule, days off và existing blocks.

### Outputs

- Slot start/end Instant.
- Local display time và Business timezone.
- Eligible Staff ID khi policy cho phép expose.
- Optional reason code khi không có availability.

### Target components

- `AvailabilityCalculator`: logic thuần.
- `AvailabilityRepository`: đọc schedule và busy ranges.
- `BookingConflictGuard` hoặc transaction policy: xác nhận slot khi ghi.

## Business Rules

- Slot phải nằm hoàn toàn trong Business và Staff working intervals.
- Closure/day off có độ ưu tiên cao hơn weekly schedule.
- Staff phải active và được gán đủ Services trong sequence.
- Tổng thời lượng gồm Service durations và buffers theo policy đã chốt.
- `Any staff` dùng policy deterministic để kết quả ổn định.
- Appointment statuses giữ/chặn slot phải được định nghĩa tập trung.
- Slot query không đảm bảo giữ chỗ; confirm luôn validate lại.

## Main Flows

### Flow 1: Tính slot

`Resolve context → load Services/schedules/busy ranges → intersect intervals → apply duration/buffer → generate slots → return localized result`.

### Flow 2: Confirm booking an toàn

`Begin transaction → lock/check conflict → validate slot lại → create Appointment → commit → publish event`.

### Flow 3: Reschedule

`Load Appointment → exclude current block → calculate target slot → transaction validate/update → append history`.

## API Contract

| Method | Endpoint                              | Trạng thái   | Mục đích                           |
| ------ | ------------------------------------- | ------------ | ---------------------------------- |
| GET    | `/api/v1/public/availability`         | Target       | Query public slots                 |
| POST   | `/api/v1/availability/search`         | Target       | Admin search với structured input  |
| POST   | `/api/v1/appointments`                | WP-08 target | Validate slot và tạo Appointment   |
| POST   | `/api/v1/appointments/:id/reschedule` | WP-08 target | Validate target slot và reschedule |

## Implementation Guide

| Layer       | Vị trí / Công việc                                                       |
| ----------- | ------------------------------------------------------------------------ |
| Shared      | Availability request/result schema và reason codes                       |
| Database    | Appointment/block constraints và indexes phục vụ overlap query           |
| Backend     | Tạo module `availability` với calculator, repository, use cases và tests |
| Integration | Business, Service, Staff và Appointment module interfaces                |
| Frontend    | Date/time consumers trong public booking và Admin booking form           |

## Use Cases

### UC-WP06-01: Khách xem slot của Staff cụ thể

- **Tác nhân:** Public visitor.
- **Luồng chính:** Chọn Services/Staff/date → hệ thống tính và trả slot hợp lệ.
- **Ngoại lệ:** Staff không phục vụ đủ Services hoặc không làm việc ngày đó.

### UC-WP06-02: Khách chọn bất kỳ Staff

- **Tác nhân:** Public visitor.
- **Luồng chính:** Chọn `any staff` → hệ thống tìm eligible Staff → trả slot hợp nhất theo policy.

### UC-WP06-03: Hai request cùng xác nhận một slot

- **Tác nhân:** Hai booking clients.
- **Luồng chính:** Cả hai thấy cùng slot → confirm đồng thời → transaction chỉ cho một request commit.
- **Kết quả:** Request còn lại nhận conflict có thể retry.

## Checklists

### Planning / Design

- [ ] Chốt slot interval và maximum date range.
- [ ] Chốt Service buffer composition cho multi-service.
- [ ] Chốt Appointment statuses giữ slot.
- [ ] Chọn transaction/lock/constraint strategy cho PostgreSQL.
- [ ] Chốt deterministic `any staff` policy.

### Implementation

| Task ID  | Layer  | Task                                                    | Trạng thái |
| -------- | ------ | ------------------------------------------------------- | ---------- |
| WP06-001 | Shared | Availability request/result/reason contracts            | Todo       |
| WP06-002 | Domain | Pure AvailabilityCalculator                             | Todo       |
| WP06-003 | BE     | Repository/read model cho schedules và busy ranges      | Todo       |
| WP06-004 | BE     | Public/Admin availability endpoints                     | Todo       |
| WP06-005 | DB/BE  | Conflict protection trong create/reschedule transaction | Todo       |
| WP06-006 | Test   | Timezone, DST, interval, buffer và any-staff cases      | Todo       |
| WP06-007 | Test   | Concurrent booking integration test                     | Todo       |

### Review & Testing

- [ ] Không có slot ngoài operating hours hoặc trong closure/day off.
- [ ] Multi-service duration/buffer được tính đúng.
- [ ] DST/timezone boundary không đổi sai ngày hoặc Instant.
- [ ] Inactive/unassigned Staff không xuất hiện.
- [ ] Hai confirm đồng thời chỉ có một request thành công.

## Acceptance Criteria

- Public và Admin dùng chung Availability source of truth.
- Slot query trả dữ liệu ổn định theo Business timezone.
- Confirm và reschedule luôn validate lại trong transaction.
- Không tạo double-booking cho cùng Staff/time.
- Domain, integration, concurrency, typecheck và build pass.

## Labels

`feature` `availability` `scheduling` `backend` `concurrency` `critical` `week-5`
