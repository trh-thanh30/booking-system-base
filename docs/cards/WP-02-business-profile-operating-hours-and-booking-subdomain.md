# [Feature] WP-02: Business Profile, Operating Hours & Booking Subdomain

| Thuộc tính | Giá trị                                                 |
| ---------- | ------------------------------------------------------- |
| Trạng thái | Partially complete                                      |
| Giai đoạn  | Tuần 2–4                                                |
| Ưu tiên    | Critical                                                |
| Bề mặt     | API, Business Admin, public consumers, Shared contracts |

## Goal

Cho Owner quản lý đầy đủ hồ sơ cơ sở, giờ hoạt động, ngày nghỉ, nhận diện và booking subdomain để Availability và public booking có một nguồn dữ liệu chuẩn.

## Tại sao cần feature này?

Business hiện đã được tạo trong onboarding nhưng chưa có module settings hoàn chỉnh. Availability không thể tính slot đúng nếu giờ mở cửa, timezone và closure chỉ tồn tại trong form hoặc dữ liệu tự do.

## Scope

### Bao gồm

- Business name, description, contact, category và địa chỉ đa quốc gia.
- Weekly operating hours với một hoặc nhiều interval theo quyết định WP-00.
- Closure hoặc ngày nghỉ bất thường của Business.
- Timezone IANA có thể chỉnh sửa; mặc định suy ra từ browser/location.
- Logo, banner và brand color trong option được hỗ trợ.
- Booking subdomain, trạng thái resolve và unavailable state.
- Business Admin settings có permission guard.
- Public Business profile contract cho booking page.

### Không bao gồm

- Custom domain.
- Vận hành nhiều chi nhánh trong UI Phase 1.
- HTML/CSS branding tùy ý.
- Template builder; thuộc WP-12.

## Dependencies

- WP-01: Owner Authentication, Staff Invitation & Business Onboarding.

## Actors & Access Control

| Actor               | Khả năng                                                          |
| ------------------- | ----------------------------------------------------------------- |
| Owner               | Xem và sửa mọi Business trong Tenant                              |
| Staff có permission | Sửa settings của Business được cấp membership                     |
| Public visitor      | Chỉ đọc profile active/published theo subdomain                   |
| Platform Operator   | Suspend Tenant; không chỉnh vận hành thay Owner trong feature này |

## Data / Domain

### Entities hiện có

- `Business`, `BusinessCategory`, `TenantDomain`, `TenantSettings` và `Asset`.

### Entities cần bổ sung hoặc chuẩn hóa

- `BusinessOperatingHour` hoặc cấu trúc tương đương có validation rõ ràng.
- `BusinessClosure` cho ngày nghỉ hoặc interval đóng cửa bất thường.
- Business branding/profile fields và asset links.

### Address contract

`countryCode`, `addressLine1`, `addressLine2`, `locality`, `administrativeAreaLevel1`, `administrativeAreaLevel2`, `postalCode`, `formattedAddress` và `location`.

## Business Rules

- Không lưu tên quốc gia đã dịch; lưu ISO alpha-2 `countryCode`.
- Giờ đóng cửa phải sau giờ mở cửa; intervals cùng ngày không overlap.
- Closure phải thuộc Business và không trùng theo rule đã chốt.
- Instant lưu UTC; schedule được diễn giải theo Business timezone.
- Tenant inactive, Business inactive hoặc domain invalid không nhận booking mới.
- Logo/banner phải qua asset validation về loại file và dung lượng.

## Main Flows

### Flow 1: Cập nhật Business profile

`Mở Settings → tải profile hiện tại → sửa thông tin/address/branding → validate → lưu → public cache được invalidate`.

### Flow 2: Thiết lập operating hours

`Chọn timezone → bật ngày làm việc → thêm intervals → validate overlap → lưu → Availability đọc schedule mới`.

### Flow 3: Resolve booking subdomain

`Request hostname → resolve TenantDomain → kiểm tra Tenant/Business/status → trả public context hoặc unavailable state`.

## API Contract

| Method                | Endpoint                                 | Trạng thái | Mục đích                              |
| --------------------- | ---------------------------------------- | ---------- | ------------------------------------- |
| GET                   | `/api/v1/businesses/current`             | Current    | Business context hiện tại             |
| GET                   | `/api/v1/businesses`                     | Current    | Business list theo quyền              |
| POST                  | `/api/v1/businesses`                     | Current    | Tạo Business                          |
| PATCH                 | `/api/v1/businesses/:id`                 | Target     | Cập nhật profile/address/branding     |
| GET/PUT               | `/api/v1/businesses/:id/operating-hours` | Target     | Đọc/ghi weekly schedule               |
| GET/POST/PATCH/DELETE | `/api/v1/businesses/:id/closures`        | Target     | Quản lý closure                       |
| GET                   | `/api/v1/tenants/resolve`                | Current    | Resolve tenant/domain context         |
| GET                   | `/api/v1/public/business`                | Target     | Public Business profile theo hostname |

## UI / Routes

| Route                                 | Màn hình                                       |
| ------------------------------------- | ---------------------------------------------- |
| `/{locale}/admin/settings`            | Profile, branding, operating hours và closures |
| `/{locale}/admin/businesses`          | Business list/context switcher                 |
| `/{locale}/admin/onboarding/business` | Thu profile/address ban đầu                    |
| `{business-subdomain}/{locale}`       | Public Business context cho booking page       |

## Implementation Guide

| Layer          | Vị trí / Công việc                                                 |
| -------------- | ------------------------------------------------------------------ |
| Shared         | Mở rộng Business, address, schedule và public-profile contracts    |
| Database       | Business fields, operating hours, closures và domain constraints   |
| Backend        | `apps/api/src/modules/business`, `tenant`, `assets`                |
| Business Admin | `apps/web/src/views/admin/settings`, `views/admin/businesses`      |
| Public Web     | Tenant/domain resolver và public Business service trong `apps/web` |

## Use Cases

### UC-WP02-01: Owner cập nhật hồ sơ cơ sở

- **Tác nhân:** Owner.
- **Luồng chính:** Chọn Business → sửa profile/address → upload logo/banner → lưu.
- **Ngoại lệ:** Slug trùng, asset sai loại, địa chỉ hoặc timezone không hợp lệ.

### UC-WP02-02: Owner thiết lập giờ hoạt động và ngày nghỉ

- **Tác nhân:** Owner hoặc Staff có permission.
- **Luồng chính:** Chọn timezone → cấu hình tuần → thêm closure → lưu.
- **Kết quả:** Availability dùng đúng schedule mới.

### UC-WP02-03: Khách mở booking subdomain

- **Tác nhân:** Public visitor.
- **Luồng chính:** Host được resolve → kiểm tra status → tải public profile.
- **Ngoại lệ:** Domain không tồn tại, Tenant suspended hoặc Business inactive.

## Checklists

### Planning / Design

- [x] Chốt address contract đa quốc gia.
- [x] Chốt Tenant và Business slug dùng cho vanity/public URL.
- [ ] Chốt schema operating hours và closure.
- [ ] Chốt public-profile cache/invalidation policy.

### Implementation

| Task ID  | Layer     | Task                                               | Trạng thái |
| -------- | --------- | -------------------------------------------------- | ---------- |
| WP02-001 | BE/FE     | Thu Business profile và address trong onboarding   | Done       |
| WP02-002 | Shared/DB | Chuẩn hóa operating-hour và closure models         | Todo       |
| WP02-003 | BE        | Profile/settings/operating-hours use cases và API  | Todo       |
| WP02-004 | FE        | Business Settings form dùng dữ liệu thật           | Todo       |
| WP02-005 | Asset     | Logo/banner upload và ownership validation         | Todo       |
| WP02-006 | Public    | Resolve subdomain và public Business profile       | Partial    |
| WP02-007 | Test      | Timezone, overlap, isolation và unavailable states | Todo       |

### Review & Testing

- [ ] Operating hours và closure round-trip đúng timezone.
- [ ] Staff thiếu permission không sửa được settings.
- [ ] Public endpoint chỉ trả field được publish.
- [ ] Tenant/Business inactive hiển thị unavailable và không nhận booking.
- [ ] Mobile, tablet và desktop settings UI đều sử dụng được.

## Acceptance Criteria

- Owner cập nhật được profile, address, contact và branding.
- Operating hours không chứa interval overlap hoặc giờ đóng trước giờ mở.
- Closure được áp dụng vào Availability.
- Public Business được resolve đúng theo subdomain.
- Cross-Tenant và cross-Business update bị từ chối.
- API/Web tests, typecheck và build pass.

## Labels

`feature` `business-settings` `scheduling` `domain` `backend` `frontend` `critical` `week-2`
