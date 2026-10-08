# [Feature] WP-13: SaaS Plan, Subscription & Stripe Billing

| Thuộc tính | Giá trị                                              |
| ---------- | ---------------------------------------------------- |
| Trạng thái | Not started                                          |
| Giai đoạn  | Tuần 11                                              |
| Ưu tiên    | Critical                                             |
| Bề mặt     | API, Platform Admin, Business Admin, Landing, Stripe |

## Goal

Quản lý gói SaaS mà Tenant trả cho nền tảng bằng Stripe-hosted Checkout và Customer Portal, với webhook idempotent làm nguồn sự thật cho Subscription state.

## Tại sao cần feature này?

Subscription trong Phase 1 là phí doanh nghiệp dùng nền tảng, không phải tiền khách đặt lịch. Tách đúng boundary tránh trộn billing platform với customer payment.

## Scope

### Bao gồm

- Plan CRUD: monthly/yearly price, currency, trial, featured, benefits và limits.
- Publish/unpublish Plan cho Landing và onboarding.
- Tenant Subscription list, detail, assign và change.
- Stripe Customer mapping.
- Stripe Checkout và Customer Portal.
- Webhook signature verification, idempotency và event audit tối thiểu.
- Mapping `trialing`, `active`, `past_due`, `grace`, `cancelled` và `suspended`.
- Configurable grace/expiry behavior.
- Email sắp hết hạn; mặc định trước một ngày.

### Không bao gồm

- Customer booking deposit/payment.
- Coupon, automatic refund và tax invoice.
- Usage-based billing.
- Multi-provider payment abstraction.

## Dependencies

- WP-01: Tenant/Owner onboarding và auth.
- WP-11: Platform Tenant management.

## Actors & Access Control

| Actor           | Khả năng                                          |
| --------------- | ------------------------------------------------- |
| Super Admin     | CRUD/publish Plan và quản lý Tenant Subscription  |
| Owner           | Chọn Plan, mở Checkout/Portal và xem Subscription |
| Stripe          | Gửi signed webhook events                         |
| Landing visitor | Chỉ xem published Plans                           |

## Data / Domain

### Entities cần có

- `SaasPlan`: price, interval, trial, benefits, limits và publication state.
- `TenantSubscription`: Tenant, Plan, Stripe IDs, status và period dates.
- `StripeWebhookEvent`: event ID/type, processing status và minimal audit.
- Optional status history cho grace/suspend transitions.

## Business Rules

- Không lưu card/payment credentials.
- Webhook là nguồn sự thật; success URL không tự activate Subscription.
- Stripe event ID phải unique để chống replay.
- Plan unpublished không xuất hiện cho đăng ký mới nhưng Subscription cũ vẫn tham chiếu được.
- Trial/grace/suspend policy phải deterministic và có test.
- Bỏ qua Plan trong onboarding phải tạo trạng thái theo cấu hình đã chốt.

## Main Flows

### Flow 1: Owner subscribe

`Chọn Plan → API tạo Checkout Session → Stripe hosted checkout → return pending UI → webhook update Subscription → Admin refresh status`.

### Flow 2: Manage billing

`Owner request Portal Session → Stripe portal → change/cancel → webhook đồng bộ state`.

### Flow 3: Platform manages Plan

`Create/edit draft → publish → Landing/onboarding đọc published Plans → impact existing subscriptions được bảo toàn`.

## API Contract

| Method   | Endpoint                         | Trạng thái | Mục đích                    |
| -------- | -------------------------------- | ---------- | --------------------------- |
| GET/POST | `/api/v1/platform/plans`         | Target     | Platform list/create Plan   |
| PATCH    | `/api/v1/platform/plans/:id`     | Target     | Update/publish Plan         |
| GET      | `/api/v1/public/plans`           | Target     | Published pricing           |
| GET      | `/api/v1/subscription`           | Target     | Current Tenant Subscription |
| POST     | `/api/v1/subscription/checkout`  | Target     | Create Checkout Session     |
| POST     | `/api/v1/subscription/portal`    | Target     | Create Portal Session       |
| POST     | `/api/v1/webhooks/stripe`        | Target     | Signed Stripe webhook       |
| GET      | `/api/v1/platform/subscriptions` | Target     | Platform subscription list  |

## UI / Routes

| Surface        | Route / Màn hình                             |
| -------------- | -------------------------------------------- |
| Landing        | Pricing section từ published Plans           |
| Business Admin | `/{locale}/admin/settings/billing`           |
| Platform Admin | `/{locale}/plans`, `/{locale}/subscriptions` |
| Onboarding     | Plan selection hoặc skip theo config         |

## Implementation Guide

| Layer        | Vị trí / Công việc                                        |
| ------------ | --------------------------------------------------------- |
| Shared       | Plan, Subscription, status và Checkout response contracts |
| Database     | Plan, TenantSubscription, webhook event và status history |
| Backend      | New subscription/billing module và Stripe adapter/config  |
| Security     | Raw-body signature verification và secret isolation       |
| Frontends    | Platform Plan UI, Business billing UI và Landing pricing  |
| Worker/Email | Expiry reminders và bounded retry                         |

## Use Cases

### UC-WP13-01: Owner mua gói qua Stripe

- **Tác nhân:** Owner.
- **Luồng chính:** Chọn Plan → Checkout → webhook active/trialing → xem billing status.
- **Ngoại lệ:** Checkout abandoned hoặc webhook đến trước return page.

### UC-WP13-02: Stripe replay webhook

- **Tác nhân:** Stripe/retry.
- **Luồng chính:** Event ID đã xử lý → API trả success idempotently → không đổi state lần hai.

### UC-WP13-03: Platform publish Plan

- **Tác nhân:** Super Admin.
- **Luồng chính:** Tạo Plan → cấu hình price/benefits/limits → publish → Landing cập nhật.

## Checklists

### Planning / Design

- [ ] Chốt Plan limits và enforcement points.
- [ ] Chốt trial/grace/suspend transitions.
- [ ] Chốt Stripe product/price ownership và environment mapping.
- [ ] Chốt skip-plan behavior trong onboarding.

### Implementation

| Task ID  | Layer     | Task                                           | Trạng thái |
| -------- | --------- | ---------------------------------------------- | ---------- |
| WP13-001 | Shared/DB | Plan/Subscription/webhook contracts và models  | Todo       |
| WP13-002 | BE        | Platform Plan CRUD/publication                 | Todo       |
| WP13-003 | BE        | Checkout/Portal session use cases              | Todo       |
| WP13-004 | BE        | Signature/idempotent webhook processing        | Todo       |
| WP13-005 | BE/Ops    | Grace/suspend scheduler và expiry email        | Todo       |
| WP13-006 | FE        | Platform Plan/Subscription UI                  | Todo       |
| WP13-007 | FE        | Business billing và Landing pricing            | Todo       |
| WP13-008 | Test      | Stripe CLI/test-mode, replay và status mapping | Todo       |

### Review & Testing

- [ ] Invalid signature bị từ chối.
- [ ] Event replay không áp dụng thay đổi hai lần.
- [ ] Return URL không tự activate Subscription.
- [ ] Landing chỉ hiển thị published Plans.
- [ ] Customer booking không đi qua billing module này.

## Acceptance Criteria

- Super Admin quản lý và publish Plans.
- Owner dùng Stripe Checkout/Portal và xem status đồng bộ.
- Webhook signature/idempotency được kiểm thử.
- Grace/suspend/expiry behavior đúng policy.
- API/Web/Platform Admin tests, typecheck và build pass.

## Labels

`feature` `saas-billing` `stripe` `subscription` `backend` `frontend` `critical` `week-11`
