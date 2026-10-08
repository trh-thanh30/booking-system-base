# [Feature] WP-15: Public Contact Form & Platform Inbox

| Thuộc tính | Giá trị                                    |
| ---------- | ------------------------------------------ |
| Trạng thái | Not started                                |
| Giai đoạn  | Tuần 12                                    |
| Ưu tiên    | High                                       |
| Bề mặt     | API, Landing, Platform Admin, email worker |

## Goal

Biến contact form công khai thành Platform inbox có validation, spam protection, read/status workflow, internal notes, email reply và lịch sử xử lý.

## Tại sao cần feature này?

Landing hiện chỉ có UI minh họa. Một submission thật cần rate limit, sanitization và operational workflow; nếu chỉ gửi email trực tiếp sẽ không có ownership hoặc history.

## Scope

### Bao gồm

- Public contact form với field/length validation.
- Rate limit và spam protection cơ bản.
- Contact Message status enum được chốt trước implementation.
- Platform inbox list, search, filter và detail.
- Read/unread count.
- Internal notes.
- Reply qua email và lưu reply history/delivery status.
- Archive và spam actions.
- Notification/email khi có message mới.

### Không bao gồm

- Live chat.
- CRM sales pipeline.
- Workflow SLA và assignment automation.
- Marketing opt-in campaign.

## Dependencies

- WP-11: Platform Admin access foundation.
- Email/notification infrastructure hiện có được tái sử dụng.

## Actors & Access Control

| Actor                         | Khả năng                               |
| ----------------------------- | -------------------------------------- |
| Public visitor                | Gửi contact message trong rate limit   |
| Super Admin/Platform Operator | Xem, note, reply, mark spam và archive |
| Business Admin                | Không truy cập Platform inbox          |

## Data / Domain

### Entities cần có

- `ContactMessage`: sender data, subject/category, sanitized body, source, status và timestamps.
- `ContactNote`: internal author/time/content.
- `ContactReply`: actor, recipient, body/template, delivery status và provider reference.
- Optional status history nếu không thể suy ra đầy đủ từ event records.

## Business Rules

- Validation, rate limit và sanitization chạy ở server.
- Không render raw HTML từ public input.
- Internal note không được gửi ra ngoài.
- Reply history là append-only theo delivery attempt đã chốt.
- Spam/archive không hard delete history.
- Public success response không tiết lộ internal ID nếu không cần.

## Main Flows

### Flow 1: Public submission

`Validate → rate-limit/spam check → sanitize → create Message → notify Platform → return generic success`.

### Flow 2: Platform xử lý message

`Open inbox → mark read → update status → add internal note → reply email → record delivery → archive`.

## API Contract

| Method    | Endpoint                                         | Trạng thái | Mục đích                 |
| --------- | ------------------------------------------------ | ---------- | ------------------------ |
| POST      | `/api/v1/public/contact-messages`                | Target     | Public submission        |
| GET       | `/api/v1/platform/contact-messages`              | Target     | List/search/filter       |
| GET/PATCH | `/api/v1/platform/contact-messages/:id`          | Target     | Detail/status/read state |
| POST      | `/api/v1/platform/contact-messages/:id/notes`    | Target     | Add internal note        |
| POST      | `/api/v1/platform/contact-messages/:id/replies`  | Target     | Queue email reply        |
| POST      | `/api/v1/platform/contact-messages/:id/spam`     | Target     | Mark spam                |
| POST      | `/api/v1/platform/contact-messages/:id/archive`  | Target     | Archive                  |
| GET       | `/api/v1/platform/contact-messages/unread-count` | Target     | Header badge             |

## UI / Routes

| Surface        | Route / Màn hình                                             |
| -------------- | ------------------------------------------------------------ |
| Landing        | Contact form with pending/success/error/rate-limit states    |
| Platform Admin | `/{locale}/contact-messages`, inbox list/filter/detail/reply |

## Implementation Guide

| Layer     | Vị trí / Công việc                                            |
| --------- | ------------------------------------------------------------- |
| Shared    | Contact input, status, filter, note và reply contracts        |
| Database  | ContactMessage, ContactNote, ContactReply/history models      |
| Backend   | New contact module with public/platform controllers and tests |
| Security  | Rate limiter, honeypot/provider option và output sanitization |
| Email     | Reply/new-message jobs và templates                           |
| Frontends | Landing form và Platform inbox views                          |

## Use Cases

### UC-WP15-01: Visitor gửi liên hệ

- **Tác nhân:** Public visitor.
- **Luồng chính:** Nhập form → validation → submit → nhận success state.
- **Ngoại lệ:** Invalid fields, spam detection hoặc rate limit.

### UC-WP15-02: Platform Operator trả lời message

- **Tác nhân:** Platform Operator.
- **Luồng chính:** Open message → add note → reply → delivery status được lưu.

### UC-WP15-03: Platform Operator xử lý spam/archive

- **Tác nhân:** Platform Operator.
- **Luồng chính:** Mark spam hoặc archive → giữ nguyên history → loại khỏi default inbox.

## Checklists

### Planning / Design

- [ ] Chốt fields, categories và status transition table.
- [ ] Chốt rate-limit/spam policy.
- [ ] Chốt reply-from address và delivery tracking.
- [ ] Chốt retention/redaction policy.

### Implementation

| Task ID  | Layer       | Task                                               | Trạng thái |
| -------- | ----------- | -------------------------------------------------- | ---------- |
| WP15-001 | Shared/DB   | Contact, note và reply contracts/models            | Todo       |
| WP15-002 | BE          | Public validation/rate-limit/create endpoint       | Todo       |
| WP15-003 | BE          | Platform list/detail/status/note use cases         | Todo       |
| WP15-004 | Email       | Reply job, template và delivery history            | Todo       |
| WP15-005 | FE Web      | Connect Landing contact form                       | Todo       |
| WP15-006 | FE Platform | Inbox list/filter/detail/note/reply UI             | Todo       |
| WP15-007 | Test        | Validation, sanitization, permission và email jobs | Todo       |

### Review & Testing

- [ ] Raw HTML/script không được phản chiếu.
- [ ] Rate limit chạy ở server.
- [ ] Internal notes không xuất hiện trong email/public response.
- [ ] Business Admin không truy cập inbox.
- [ ] Reply history lưu actor/time/delivery status.

## Acceptance Criteria

- Landing tạo Contact Message thật với state rõ ràng.
- Platform Operator xử lý được message từ nhận đến reply/archive.
- Spam/archive không xóa history.
- Public endpoint chịu rate limit và không lộ internal data.
- API/Web/Platform tests, typecheck và build pass.

## Labels

`feature` `contact` `platform-inbox` `email` `backend` `frontend` `high` `week-12`
