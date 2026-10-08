# [Feature] WP-16: Landing Page Dynamic Content Integration

| Thuộc tính | Giá trị                          |
| ---------- | -------------------------------- |
| Trạng thái | Static Landing UI exists         |
| Giai đoạn  | Tuần 12                          |
| Ưu tiên    | High                             |
| Bề mặt     | Public Web, public API contracts |

## Goal

Nối Landing page với Plans, Policies và Contact modules đã publish mà không kéo Admin/Platform session hoặc private query cache vào marketing routes.

## Tại sao cần feature này?

Landing đã có visual content nhưng pricing, policies và contact chưa dùng dữ liệu thật. Đây là integration card, không sở hữu lại business rules của các module nguồn.

## Scope

### Bao gồm

- Pricing section đọc published Plans từ WP-13.
- Policy links/pages đọc effective Policies từ WP-14.
- Contact form gửi vào WP-15.
- Auth navigation phản ánh Owner journey đúng.
- Loading, empty, error và unavailable states cho public data.
- Localized metadata, canonical và hreflang.
- Public clients không gửi Admin/Platform credentials hoặc headers.

### Không bao gồm

- CMS tổng quát.
- Marketing automation, loyalty và reviews.
- A/B testing hoặc personalization.

## Dependencies

- WP-13: published SaaS Plans.
- WP-14: published effective Policies.
- WP-15: public Contact Message endpoint.

## Actors & Access Control

| Actor                  | Khả năng                                       |
| ---------------------- | ---------------------------------------------- |
| Public visitor         | Xem pricing/policies và gửi contact form       |
| Guest Owner            | Đi từ Landing tới signup/login flow            |
| Admin/Platform session | Không được bootstrap chỉ vì mở marketing route |

## Data / Domain

Feature này không sở hữu Plan, Policy hoặc Contact entities. Nó chỉ dùng public DTO allowlist và cache policy của module nguồn.

Public query keys/cache phải tách khỏi Admin private clients. Locale chỉ hỗ trợ `vi` và `en` theo route hiện tại.

## Business Rules

- Chỉ published Plan được hiển thị.
- Policy link mở đúng locale và effective version.
- Contact submission dùng server validation/rate limit của WP-15.
- Marketing routes không gọi Admin refresh hoặc private endpoints.
- Public errors không hiển thị internal stack/provider data.
- Metadata/canonical origin lấy từ app config, không hard-code trong component.

## Main Flows

### Flow 1: Render Landing

`Resolve locale → fetch public Plans/metadata → render sections → dùng empty/error fallback nếu public module unavailable`.

### Flow 2: Policy navigation

`Click Policy → locale-aware route → fetch effective version → render sanitized content`.

### Flow 3: Contact submission

`Fill form → pending → submit public endpoint → success hoặc validation/rate-limit error`.

## API Contract

| Method | Endpoint                          | Owner | Mục đích                   |
| ------ | --------------------------------- | ----- | -------------------------- |
| GET    | `/api/v1/public/plans`            | WP-13 | Published pricing          |
| GET    | `/api/v1/public/policies/:type`   | WP-14 | Effective localized Policy |
| POST   | `/api/v1/public/contact-messages` | WP-15 | Contact submission         |

## UI / Routes

| Route                       | Màn hình                 |
| --------------------------- | ------------------------ |
| `/{locale}`                 | Dynamic Landing          |
| `/{locale}/policies/[type]` | Public Policy page       |
| `/{locale}/signup-business` | Owner registration entry |
| `/{locale}/admin/login`     | Admin login entry        |

## Implementation Guide

| Layer      | Vị trí / Công việc                                                 |
| ---------- | ------------------------------------------------------------------ |
| Config     | Public origin/API settings trong `apps/web/src/config`             |
| Services   | Public-only clients trong `apps/web/src/services`                  |
| Views      | `apps/web/src/views/home`, marketing/signup views                  |
| Components | Landing compositions từ app/shared UI; không copy primitives       |
| Tests      | Session isolation, rendering states, metadata và locale navigation |

## Use Cases

### UC-WP16-01: Visitor xem pricing hiện hành

- **Tác nhân:** Public visitor.
- **Luồng chính:** Mở Landing → thấy published Plans → chọn CTA tới signup.

### UC-WP16-02: Visitor đọc Policy đúng locale

- **Tác nhân:** Public visitor.
- **Luồng chính:** Click Policy → locale route → effective content được render.

### UC-WP16-03: Visitor gửi contact form

- **Tác nhân:** Public visitor.
- **Luồng chính:** Submit → pending → success hoặc mapped error state.

## Checklists

### Planning / Design

- [ ] Chốt public cache/revalidation policy.
- [ ] Chốt empty state khi chưa có published Plan/Policy.
- [ ] Chốt SEO metadata/canonical behavior theo environment.

### Implementation

| Task ID  | Layer | Task                                                | Trạng thái |
| -------- | ----- | --------------------------------------------------- | ---------- |
| WP16-001 | FE    | Public-only Plan service và dynamic pricing section | Todo       |
| WP16-002 | FE    | Public Policy routes/rendering                      | Todo       |
| WP16-003 | FE    | Contact form API integration                        | Todo       |
| WP16-004 | FE    | Auth navigation và localized routes                 | Partial    |
| WP16-005 | SEO   | Metadata/canonical/hreflang validation              | Todo       |
| WP16-006 | Test  | Public/private session isolation và UI states       | Todo       |

### Review & Testing

- [ ] Landing không gọi Admin refresh hoặc private endpoints.
- [ ] Pricing chỉ hiển thị published Plans.
- [ ] Policy locale/version chính xác.
- [ ] Contact có pending/success/error/rate-limit states.
- [ ] Mobile, tablet, desktop và keyboard navigation đạt baseline.

## Acceptance Criteria

- Landing không còn mock pricing/contact/policy data.
- Public module failure có fallback rõ ràng và không phá toàn trang.
- Marketing route giữ tách biệt với Admin authentication.
- Metadata và locale navigation không regression.
- Web rendering, accessibility, typecheck và build pass.

## Labels

`feature` `landing` `integration` `seo` `frontend` `high` `week-12`
