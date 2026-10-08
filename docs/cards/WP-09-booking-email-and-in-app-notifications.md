# [Feature] WP-09: Booking Email & In-App Notifications

| Thuộc tính | Giá trị                                      |
| ---------- | -------------------------------------------- |
| Trạng thái | Notification/email foundation exists         |
| Giai đoạn  | Tuần 8                                       |
| Ưu tiên    | High                                         |
| Bề mặt     | API, email worker, scheduler, Business Admin |

## Goal

Phát email cho khách và in-app notification cho nhân viên theo vòng đời Appointment, gồm một reminder theo cấu hình Phase 1.

## Tại sao cần feature này?

Notification foundation hiện độc lập với booking. Feature này nối domain events vào delivery pipeline, đảm bảo retry không gửi trùng và notification mở đúng Appointment có quyền truy cập.

## Scope

### Bao gồm

- Event cho Appointment created, rescheduled, cancelled và assigned.
- Email confirmation, change và cancellation.
- Một reminder trước lịch theo cấu hình.
- In-app list/filter/detail/read/unread.
- Link notification tới Appointment.
- Delivery/job status và bounded retry.
- Idempotency cho event, scheduler và worker.
- Không gửi reminder cho Appointment không còn hợp lệ.

### Không bao gồm

- SMS.
- Follow-up marketing và birthday automation.
- Free-form email template editor.
- Multi-step campaign.

## Dependencies

- WP-08: Appointment Operations và domain events.

## Actors & Access Control

| Actor            | Khả năng                                        |
| ---------------- | ----------------------------------------------- |
| Customer/Guest   | Nhận transactional booking emails               |
| Owner/Staff      | Nhận và đọc in-app notifications theo recipient |
| Scheduler/Worker | Tạo và gửi reminder/delivery jobs idempotently  |

## Data / Domain

### Entities hiện có

- `Notification`, `NotificationRecipient`, notification status enums và email job foundation.
- `JobRun` cho scheduled jobs.

### Bổ sung cần thiết

- Appointment reference/source payload an toàn.
- Event/delivery idempotency key.
- Reminder scheduling state hoặc deterministic job key.

## Business Rules

- Một domain event chỉ tạo một logical notification/delivery.
- Cancelled, completed và no-show không nhận reminder.
- Reschedule hủy reminder cũ và lập reminder mới idempotently.
- Worker retry không gửi duplicate khi provider đã nhận request.
- Notification recipient chỉ đọc hoặc mark notification của chính mình.
- Log không chứa raw token hoặc dữ liệu nhạy cảm của Customer.

## Main Flows

### Flow 1: Booking confirmation

`Appointment committed → emit event → create notification/email job → worker render/send → update delivery status`.

### Flow 2: Reminder

`Scheduler tìm eligible Appointment → enqueue deterministic job → recheck status/time → send once`.

### Flow 3: In-app interaction

`User mở notification list → filter/read → mở Appointment link → permission được kiểm tra lại`.

## API Contract

| Method | Endpoint                             | Trạng thái | Mục đích                    |
| ------ | ------------------------------------ | ---------- | --------------------------- |
| GET    | `/api/v1/notifications`              | Current    | Recipient notification list |
| GET    | `/api/v1/notifications/unread-count` | Current    | Unread count                |
| GET    | `/api/v1/notifications/:id`          | Current    | Notification detail         |
| PATCH  | `/api/v1/notifications/:id/read`     | Current    | Mark one read               |
| PATCH  | `/api/v1/notifications/read-all`     | Current    | Mark all read               |
| POST   | Internal event/job interface         | Target     | Appointment event delivery  |

## UI / Routes

| Vị trí                          | Màn hình                             |
| ------------------------------- | ------------------------------------ |
| Admin header/sidebar            | Unread badge và recent notifications |
| `/{locale}/admin/notifications` | List/filter/read state               |
| Appointment detail              | Destination từ notification link     |

## Implementation Guide

| Layer          | Vị trí / Công việc                                                     |
| -------------- | ---------------------------------------------------------------------- |
| Shared         | Notification source/payload types và Appointment reference             |
| Backend        | `apps/api/src/modules/notification`, `email`, `jobs`, `appointments`   |
| Worker         | `apps/api/src/workers/email` và deterministic job processing           |
| Templates      | MJML/Handlebars transactional booking templates                        |
| Business Admin | Notification list/header integration dùng `useToast()` cho UI feedback |

## Use Cases

### UC-WP09-01: Guest nhận email xác nhận

- **Tác nhân:** Guest booking flow.
- **Luồng chính:** Appointment created → confirmation job → email có business/time/services/code.

### UC-WP09-02: Guest nhận email đổi hoặc hủy lịch

- **Tác nhân:** Appointment operator.
- **Luồng chính:** Reschedule/cancel commit → enqueue matching email → delivery tracked.

### UC-WP09-03: Staff nhận notification được gán lịch

- **Tác nhân:** Assigned Staff.
- **Luồng chính:** Assignment event → notification recipient → Staff mở đúng Appointment.

## Checklists

### Planning / Design

- [ ] Chốt event names/payload/version.
- [ ] Chốt reminder offset và booking sát giờ.
- [ ] Chốt provider retry/idempotency strategy.
- [ ] Chốt template content và locale fallback.

### Implementation

| Task ID  | Layer      | Task                                             | Trạng thái |
| -------- | ---------- | ------------------------------------------------ | ---------- |
| WP09-001 | Foundation | Notification CRUD/read state và email queue      | Done       |
| WP09-002 | BE         | Appointment event → notification/email mapping   | Todo       |
| WP09-003 | Email      | Confirmation/change/cancellation templates       | Todo       |
| WP09-004 | Jobs       | Reminder scheduler và deterministic jobs         | Todo       |
| WP09-005 | FE         | Notification center và Appointment deep link     | Todo       |
| WP09-006 | Test       | Event idempotency, retry và reminder eligibility | Todo       |
| WP09-007 | QA         | Staging mailbox smoke test                       | Todo       |

### Review & Testing

- [ ] Create/reschedule/cancel enqueue đúng logical event một lần.
- [ ] Reminder không gửi cho trạng thái không hợp lệ.
- [ ] Retry không tạo duplicate delivery.
- [ ] Mark read chỉ tác động recipient hiện tại.
- [ ] Notification link vẫn kiểm tra Appointment permission.

## Acceptance Criteria

- Customer nhận đúng email booking quan trọng theo locale khả dụng.
- Staff/Owner nhận in-app notification có unread state.
- Reminder chạy một lần theo cấu hình và không gửi sau cancel.
- Job status/retry có thể quan sát mà không lộ dữ liệu nhạy cảm.
- API/worker/Web tests, typecheck và build pass.

## Labels

`feature` `notifications` `email` `worker` `backend` `frontend` `high` `week-8`
