# Phase 1 Feature Cards Index

Thư mục này chuyển [`phase-1-implementation-plan.md`](../implementation/phase-1-implementation-plan.md) thành các feature card có thể dùng để phân tích, chia task, triển khai và nghiệm thu.

## Source of Truth

Thứ tự ưu tiên khi tài liệu mâu thuẫn:

1. Báo giá hoặc change request đã được phê duyệt.
2. `phase-1-implementation-plan.md`.
3. Feature card trong thư mục này.
4. Issue/task con được tách từ feature card.

Card không tự mở rộng phạm vi Phase 1. Mọi thay đổi scope phải cập nhật implementation plan trước khi sửa card liên quan.

## Cách sử dụng Feature Card

Mỗi file `WP-xx-*.md` đại diện cho một feature hoặc một release foundation có output người dùng/hệ thống rõ ràng.

Card phải trả lời được:

- Feature giải quyết vấn đề gì và dành cho actor nào?
- Bao gồm và không bao gồm những gì?
- Phụ thuộc feature/domain nào?
- Entity, business rule, flow, API và UI route mục tiêu là gì?
- Code hiện có nằm ở đâu và phần nào chưa triển khai?
- Các task BE/FE/DB/Test cần thực hiện theo thứ tự nào?
- Điều kiện nào chứng minh feature hoàn thành?

Task triển khai dùng mã `<WP>-<số thứ tự>`, ví dụ `WP04-003`. Khi cần giao độc lập, task có thể được tách thành issue nhưng vẫn phải liên kết về card gốc.

## Quy ước trạng thái

| Trạng thái | Ý nghĩa                                               |
| ---------- | ----------------------------------------------------- |
| `Done`     | Đã có code và verification phù hợp                    |
| `Partial`  | Có foundation hoặc một phần flow, chưa đạt acceptance |
| `Todo`     | Chưa triển khai hoặc chưa có evidence                 |
| `Blocked`  | Có dependency thực sự chưa hoàn thành                 |

`Current` trong bảng API nghĩa là endpoint đã tồn tại trong codebase. `Target` nghĩa là contract dự kiến của feature và chỉ được coi là chính thức sau Planning/Design.

## Delivery Principles

- Làm theo vertical slice; không hoàn thành toàn bộ backend rồi mới nối frontend.
- Business logic nằm trong use case/domain, không nằm trong controller hoặc view.
- API dùng chung giữa frontend phải có schema/type trong `packages/shared`.
- Tenant/Business isolation, permission và negative tests là acceptance bắt buộc.
- UI không được dùng mock data trong flow được đánh dấu hoàn thành.
- `page.tsx` là thin server component; feature UI nằm trong `src/views`.

## Feature Cards

### Foundation & Business Setup — Tuần 1 đến 4

| Card                                                                              | Feature                                                      | Trạng thái      | Phụ thuộc                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------- | ------------------------------ |
| [WP-00](./WP-00-phase-1-baseline-and-scope-governance.md)                         | Phase 1 Baseline & Scope Governance                          | In progress     | None                           |
| [WP-01](./WP-01-owner-authentication-staff-invitation-and-business-onboarding.md) | Owner Authentication, Staff Invitation & Business Onboarding | Partial         | WP-00                          |
| [WP-02](./WP-02-business-profile-operating-hours-and-booking-subdomain.md)        | Business Profile, Operating Hours & Booking Subdomain        | Partial         | WP-01                          |
| [WP-03](./WP-03-service-category-and-catalog-management.md)                       | Service Category & Catalog Management                        | Backend partial | WP-02                          |
| [WP-04](./WP-04-staff-management-and-work-scheduling.md)                          | Staff Management & Work Scheduling                           | Not started     | WP-01, WP-02; integrates WP-03 |
| [WP-05](./WP-05-customer-records-notes-and-booking-history.md)                    | Customer Records, Notes & Booking History                    | Not started     | WP-01                          |

### Booking Core — Tuần 5 đến 8

| Card                                                               | Feature                                      | Trạng thái        | Phụ thuộc           |
| ------------------------------------------------------------------ | -------------------------------------------- | ----------------- | ------------------- |
| [WP-06](./WP-06-booking-availability-and-slot-conflict-control.md) | Booking Availability & Slot Conflict Control | Not started       | WP-02, WP-03, WP-04 |
| [WP-07](./WP-07-public-booking-flow-and-guest-booking-lookup.md)   | Public Booking Flow & Guest Booking Lookup   | Not started       | WP-05, WP-06        |
| [WP-08](./WP-08-appointment-calendar-and-booking-operations.md)    | Appointment Calendar & Booking Operations    | Mock UI only      | WP-05, WP-06, WP-07 |
| [WP-09](./WP-09-booking-email-and-in-app-notifications.md)         | Booking Email & In-App Notifications         | Foundation exists | WP-08               |
| [WP-10](./WP-10-business-dashboard-reporting-and-excel-export.md)  | Business Dashboard, Reporting & Excel Export | Mock UI only      | WP-08               |

### Platform & Publication — Tuần 9 đến 12

| Card                                                                 | Feature                                        | Trạng thái       | Phụ thuộc           |
| -------------------------------------------------------------------- | ---------------------------------------------- | ---------------- | ------------------- |
| [WP-11](./WP-11-platform-tenant-and-business-category-management.md) | Platform Tenant & Business Category Management | Partial          | WP-01               |
| [WP-12](./WP-12-booking-page-template-management-and-publication.md) | Booking Page Template Management & Publication | Not started      | WP-02, WP-11        |
| [WP-13](./WP-13-saas-plan-subscription-and-stripe-billing.md)        | SaaS Plan, Subscription & Stripe Billing       | Not started      | WP-01, WP-11        |
| [WP-14](./WP-14-policy-versioning-publication-and-consent.md)        | Policy Versioning, Publication & Consent       | Not started      | WP-01, WP-11        |
| [WP-15](./WP-15-public-contact-form-and-platform-inbox.md)           | Public Contact Form & Platform Inbox           | Not started      | WP-11               |
| [WP-16](./WP-16-landing-page-dynamic-content-integration.md)         | Landing Page Dynamic Content Integration       | Static UI exists | WP-13, WP-14, WP-15 |

### Release — Tuần 13

| Card                                                   | Feature                           | Trạng thái  | Phụ thuộc       |
| ------------------------------------------------------ | --------------------------------- | ----------- | --------------- |
| [WP-17](./WP-17-phase-1-hardening-uat-and-handover.md) | Phase 1 Hardening, UAT & Handover | Not started | WP-00 đến WP-16 |

## Dependency Graph

```text
WP-00 → WP-01

WP-01 → WP-02
WP-01 + WP-02 → WP-04
WP-01 → WP-05
WP-02 → WP-03
WP-02 + WP-03 + WP-04 → WP-06
WP-05 + WP-06 → WP-07
WP-05 + WP-06 + WP-07 → WP-08
WP-08 → WP-09 + WP-10

WP-01 → WP-11
WP-02 + WP-11 → WP-12
WP-01 + WP-11 → WP-13 + WP-14
WP-11 → WP-15
WP-13 + WP-14 + WP-15 → WP-16

WP-00..WP-16 → WP-17
```

WP-03 và WP-04 có thể triển khai song song. Staff assignment được hoàn tất khi cả Service Catalog và Staff Management đã có stable contracts.

## Explicitly Excluded from Phase 1

- Customer account và guest OTP.
- Multi-branch operations UI.
- Combo/package, waitlist và SMS.
- Custom domain và free-form Template builder.
- Customer deposit/payment, coupon, automatic refund và tax invoice.
- Marketing automation, loyalty, membership và reviews.
- Live chat, sales CRM, workflow SLA và advanced audit portal.
- Multi-region, Kubernetes và auto-scaling.

## Naming & Branches

- Card: `WP-<number>-<descriptive-feature-name>.md`.
- Task ID: `WP<number>-<sequence>`.
- Feature branch: `feat/BKG-<id>-<short-name>`.
- Fix branch: `fix/BKG-<id>-<short-name>`.
- Workflow status: `Backlog`, `Ready`, `In Progress`, `Review`, `QA`, `Blocked`, `Done`.

## Definition of Done

Một feature chỉ được coi là hoàn thành khi:

- Scope và business rules đã được thực thi ở backend, không chỉ ở UI.
- Shared contract, migration và environment được cập nhật nếu cần.
- UI có loading, empty, error, forbidden và responsive states phù hợp.
- Permission và Tenant/Business isolation có negative tests.
- Unit/integration/browser tests phù hợp đã pass.
- Lint, typecheck và build của các app/package bị ảnh hưởng đã pass.
- Tài liệu, checklist task và trạng thái trong card được cập nhật.
