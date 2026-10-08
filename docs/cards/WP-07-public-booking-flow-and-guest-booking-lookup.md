# [Feature] WP-07: Public Booking Flow & Guest Booking Lookup

| Thuộc tính | Giá trị                           |
| ---------- | --------------------------------- |
| Trạng thái | Not started                       |
| Giai đoạn  | Tuần 6                            |
| Ưu tiên    | Critical                          |
| Bề mặt     | Public Web, API, Shared contracts |

## Goal

Cho khách vãng lai đặt lịch trên booking subdomain mà không cần tài khoản, sau đó tra cứu bằng booking code và số điện thoại hoặc gửi yêu cầu hủy theo rule Phase 1.

## Tại sao cần feature này?

Đây là customer-facing flow cốt lõi của sản phẩm. Luồng phải dùng dữ liệu published, giữ Tenant isolation và không để lookup endpoint tiết lộ booking tồn tại.

## Scope

### Bao gồm

- Resolve Tenant/Business từ subdomain.
- Kiểm tra Tenant, Business, domain và template publication status.
- Hiển thị public profile, Category, Service và Staff active.
- Chọn một hoặc nhiều Services theo thứ tự.
- Chọn Staff cụ thể hoặc `any staff`.
- Date/time picker dùng WP-06.
- Guest information, review, confirm và success page.
- Booking code không đoán được.
- Lookup bằng booking code + normalized phone.
- Guest cancel request theo policy đã khóa.
- Responsive, localized và accessible flow.

### Không bao gồm

- Customer login/account.
- Guest OTP.
- Custom domain.
- Customer deposit/payment.
- Waitlist.

## Dependencies

- WP-05: Customer find-or-create.
- WP-06: Availability và slot conflict control.
- WP-02/WP-03/WP-04 cung cấp public Business/catalog/Staff data.
- WP-12 mở rộng template management; WP-07 dùng published default frame ban đầu.

## Actors & Access Control

| Actor                           | Khả năng                                  |
| ------------------------------- | ----------------------------------------- |
| Public visitor                  | Xem catalog, query slot và tạo booking    |
| Guest with booking code + phone | Xem booking summary và gửi cancel request |
| Business Admin                  | Nhận Appointment được tạo từ public flow  |

## Data / Domain

### Read models

- Public Business profile.
- Active Category/Service catalog.
- Eligible Staff summary.
- Availability slots.

### Write models

- Guest contact input.
- Customer find-or-create result.
- Appointment và ordered AppointmentServices.
- Public booking code và guest cancel request/history.

## Business Rules

- Public API chỉ trả records active/published thuộc Business đã resolve.
- Một Staff phải phục vụ toàn bộ ordered Service sequence.
- Slot phải được validate lại khi confirm.
- Booking code phải có đủ entropy và không chứa sequential database ID.
- Lookup sai code hoặc phone trả response không giúp enumerate booking.
- Internal notes, cost fields và private Customer data không xuất hiện public.
- Tenant suspended, domain invalid hoặc template unavailable không nhận booking.

## Main Flows

### Flow 1: Guest booking

`Resolve host → chọn Services → chọn Staff/any → chọn slot → nhập guest info → review → confirm transaction → success + booking code`.

### Flow 2: Guest lookup

`Nhập booking code + phone → normalize → lookup trong resolved Tenant → trả public summary hoặc generic not-found`.

### Flow 3: Guest cancel request

`Lookup booking → kiểm tra trạng thái/cutoff → nhập reason → create request hoặc cancel theo policy → gửi event`.

## API Contract

| Method | Endpoint                                 | Trạng thái   | Mục đích                        |
| ------ | ---------------------------------------- | ------------ | ------------------------------- |
| GET    | `/api/v1/public/business`                | Target       | Public profile theo hostname    |
| GET    | `/api/v1/public/catalog`                 | Target       | Active Category/Service catalog |
| GET    | `/api/v1/public/staff`                   | Target       | Eligible public Staff summaries |
| GET    | `/api/v1/public/availability`            | WP-06 target | Query slots                     |
| POST   | `/api/v1/public/bookings`                | Target       | Confirm guest booking           |
| POST   | `/api/v1/public/bookings/lookup`         | Target       | Lookup bằng code + phone        |
| POST   | `/api/v1/public/bookings/cancel-request` | Target       | Request cancellation            |

## UI / Routes

| Route                        | Màn hình                      |
| ---------------------------- | ----------------------------- |
| `{tenant}.{domain}/{locale}` | Public Business/booking entry |
| `/{locale}/book/services`    | Chọn Service sequence         |
| `/{locale}/book/staff`       | Chọn Staff hoặc any           |
| `/{locale}/book/time`        | Chọn date/time                |
| `/{locale}/book/details`     | Guest information             |
| `/{locale}/book/review`      | Review và confirm             |
| `/{locale}/book/success`     | Booking code và next actions  |
| `/{locale}/booking/lookup`   | Guest lookup/cancel request   |

Route cụ thể có thể được rút gọn thành wizard route; URL cuối phải được chốt trong WP-00 trước khi implementation.

## Implementation Guide

| Layer    | Vị trí / Công việc                                                                           |
| -------- | -------------------------------------------------------------------------------------------- |
| Shared   | Public catalog, availability, booking và lookup contracts                                    |
| Backend  | Public controllers trong booking/customer/business modules; không reuse private DTO tùy tiện |
| Database | Appointment models thuộc WP-08 được tạo sớm nếu cần vertical slice                           |
| Web      | Tạo public booking views dưới `apps/web/src/views/booking`                                   |
| Security | Rate limit, generic lookup errors và public response allowlist                               |

## Use Cases

### UC-WP07-01: Guest đặt nhiều Services

- **Tác nhân:** Public visitor.
- **Luồng chính:** Chọn ordered Services → any Staff → slot → guest info → confirm.
- **Ngoại lệ:** Slot vừa bị chiếm, Service inactive hoặc Business unavailable.

### UC-WP07-02: Guest tra cứu booking

- **Tác nhân:** Guest có code và phone.
- **Luồng chính:** Nhập credentials → hệ thống normalize/scope → hiển thị public summary.
- **Ngoại lệ:** Sai một trong hai giá trị trả generic not-found.

### UC-WP07-03: Guest yêu cầu hủy

- **Tác nhân:** Guest đã lookup thành công.
- **Luồng chính:** Chọn cancel → nhập reason → kiểm tra cutoff/status → ghi request/event.

## Checklists

### Planning / Design

- [ ] Chốt wizard route và progress persistence.
- [ ] Chốt booking code format/entropy.
- [ ] Chốt cancellation cutoff và auto-cancel/request policy.
- [ ] Chốt public response allowlist và rate limits.

### Implementation

| Task ID  | Layer    | Task                                         | Trạng thái |
| -------- | -------- | -------------------------------------------- | ---------- |
| WP07-001 | Shared   | Public booking, lookup và cancel contracts   | Todo       |
| WP07-002 | BE       | Public Business/catalog/Staff read endpoints | Todo       |
| WP07-003 | BE       | Guest booking transaction endpoint           | Todo       |
| WP07-004 | BE       | Secure lookup và cancel-request endpoints    | Todo       |
| WP07-005 | FE       | Responsive booking wizard                    | Todo       |
| WP07-006 | FE       | Success, lookup và cancel UI                 | Todo       |
| WP07-007 | Security | Rate limit và enumeration tests              | Todo       |
| WP07-008 | E2E      | Booking happy path và unavailable states     | Todo       |

### Review & Testing

- [ ] Flow không yêu cầu Customer account hoặc OTP.
- [ ] Slot conflict hiển thị retry UX rõ ràng.
- [ ] Lookup không tiết lộ booking khi code/phone sai.
- [ ] Public page không bootstrap Admin session hoặc private query cache.
- [ ] Flow dùng được trên mobile, tablet và desktop.

## Acceptance Criteria

- Guest hoàn tất booking end-to-end và nhận booking code.
- Appointment xuất hiện trong Business Admin data source.
- Guest lookup chỉ thành công với code + normalized phone đúng.
- Business unavailable không nhận booking mới.
- Public API, concurrency, E2E, accessibility và build pass.

## Labels

`feature` `public-booking` `guest` `backend` `frontend` `critical` `week-6`
