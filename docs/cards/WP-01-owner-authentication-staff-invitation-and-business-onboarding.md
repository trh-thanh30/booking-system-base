# [Feature] WP-01: Owner Authentication, Staff Invitation & Business Onboarding

| Thuộc tính | Giá trị                                         |
| ---------- | ----------------------------------------------- |
| Trạng thái | Partially complete                              |
| Giai đoạn  | Tuần 2–4                                        |
| Ưu tiên    | Critical                                        |
| Bề mặt     | API, Web Auth, Business Admin, Shared contracts |

## Goal

Hoàn thiện hành trình Owner từ đăng ký hoặc Google OAuth đến Tenant/default Business sẵn sàng, đồng thời cho phép mời Staff vào đúng Business và permission.

Feature hoàn thành khi Platform, Admin và Client auth contexts tách biệt; onboarding và invitation có transaction, idempotency và kiểm thử đầy đủ.

## Tại sao cần feature này?

Mọi feature Business Admin phụ thuộc danh tính, Tenant context và Business access. Sai ở đây có thể gây lộ dữ liệu chéo Tenant hoặc tạo workspace dở dang.

## Scope

### Bao gồm

- Owner email registration, verification, login, refresh, logout và password recovery.
- Owner Google OAuth với state, nonce, PKCE và identity linking.
- Business onboarding tạo Tenant, Owner và default Business.
- Chọn Business Category trong onboarding.
- Ghi nhận policy consent bắt buộc qua contract của WP-14.
- Chọn hoặc bỏ qua SaaS Plan theo cấu hình của WP-13.
- Staff invitation vào ít nhất một active Business.
- Gán tenant-level permissions và BusinessMembership khi accept invitation.
- Access token trong memory; refresh token trong HttpOnly cookie theo auth context.

### Không bao gồm

- Customer account hoặc guest OTP.
- Chuyển quyền sở hữu Tenant.
- Mời thêm Owner.
- Business-specific permission ngoài membership Phase 1.

## Dependencies

- WP-00: Phase 1 Baseline & Scope Governance.
- Tích hợp consent với WP-14 và Plan với WP-13 qua contract ổn định; hai module không chặn auth foundation.

## Actors & Access Control

| Actor         | Khả năng                                                   |
| ------------- | ---------------------------------------------------------- |
| Guest Owner   | Đăng ký, xác minh email, đăng nhập và hoàn tất onboarding  |
| Owner         | Mời Staff và quản lý quyền trong Tenant                    |
| Invited Staff | Xem invitation và chấp nhận một lần                        |
| Platform User | Chỉ dùng `platform` auth context, không nhận Admin session |

## Data / Domain

### Entities hiện có

- `User`, `UserIdentity` và refresh-session foundation.
- `Tenant`, `Business` và `BusinessMembership`.
- `Permission`, `UserPermission` và `UserInvitation`.
- `BusinessCategory`, `TenantDomain` và `TenantSettings`.

### Quan hệ chính

- Một Owner thuộc một Tenant và truy cập mọi Business trong Tenant đó.
- Một Staff thuộc một Tenant nhưng chỉ truy cập Business qua `BusinessMembership`.
- Invitation lưu token hash, Business targets và permissions; raw token chỉ tồn tại trong delivery flow.

## Business Rules

- Email được normalize trước khi kiểm tra trùng.
- Pending Owner không nhận Admin session trước khi đủ điều kiện.
- Concurrent onboarding chỉ tạo một Tenant workspace.
- Invitation chỉ hỗ trợ role `STAFF` và phải có ít nhất một active Business cùng Tenant.
- Accept invitation tạo User, permission, membership và trạng thái accepted trong một transaction.
- Token hết hạn, revoked hoặc consumed không thể dùng lại.
- Raw invitation token không được log hoặc trả trong production response.

## Main Flows

### Flow 1: Owner email onboarding

`Register → verify email → login/onboarding session → business information → business address → create Tenant/default Business → Admin dashboard`.

### Flow 2: Google-first onboarding

`Start OAuth → Google callback → validate state/nonce/PKCE → find/link identity → onboarding nếu chưa có Tenant → Admin session`.

### Flow 3: Staff invitation

`Owner chọn Businesses/permissions → issue hashed token → queue email → Staff mở invitation → set password → transaction accept → Admin login`.

## API Contract

| Method   | Endpoint                                   | Trạng thái               | Mục đích                      |
| -------- | ------------------------------------------ | ------------------------ | ----------------------------- |
| POST     | `/api/v1/auth/admin/onboarding/register`   | Current                  | Đăng ký Owner email           |
| POST     | `/api/v1/auth/admin/onboarding/verify`     | Current                  | Xác minh email                |
| GET/POST | `/api/v1/auth/admin/onboarding`            | Current                  | Đọc/hoàn tất onboarding       |
| GET      | `/api/v1/auth/admin/onboarding/check-slug` | Current                  | Kiểm tra Business/Tenant slug |
| GET      | `/api/v1/auth/admin/google`                | Current                  | Khởi tạo Google OAuth         |
| GET      | `/api/v1/auth/admin/google/callback`       | Current                  | Xử lý callback                |
| POST     | `/api/v1/auth/admin/login`                 | Current                  | Owner/Staff login             |
| POST     | `/api/v1/auth/admin/refresh`               | Current                  | Refresh Admin session         |
| POST     | `/api/v1/auth/invitations`                 | Current, cần hoàn thiện  | Tạo Staff invitation          |
| GET      | `/api/v1/auth/invitations/:token`          | Current, cần harden      | Preview invitation            |
| POST     | `/api/v1/auth/invitations/accept`          | Current, cần transaction | Accept invitation             |

## UI / Routes

| Route                                 | Màn hình                                     |
| ------------------------------------- | -------------------------------------------- |
| `/{locale}/admin/login`               | Owner/Staff login và Google entry            |
| `/{locale}/admin/verify-email`        | Verify/resend email                          |
| `/{locale}/admin/forgot-password`     | Request reset password                       |
| `/{locale}/admin/reset-password`      | Set password mới                             |
| `/{locale}/admin/onboarding/business` | Business onboarding wizard                   |
| `/{locale}/admin/invitations/[token]` | Invitation preview và accept                 |
| `/{locale}/admin/users`               | Quản lý invitation, membership và permission |

## Implementation Guide

| Layer    | Vị trí / Công việc                                                                          |
| -------- | ------------------------------------------------------------------------------------------- |
| Shared   | `packages/shared/src/schemas/auth.schema.ts`, `owner-onboarding.schema.ts`, auth/user types |
| Backend  | `apps/api/src/modules/auth`, `user`, `permission`, `tenant`, `business`                     |
| Database | Auth, invitation, membership và identity models trong Prisma schema                         |
| Web      | `apps/web/src/views/admin/auth`, `views/admin/users`, Admin providers/services              |
| Email    | Invitation/verification templates và email queue worker                                     |

## Use Cases

### UC-WP01-01: Owner tạo workspace bằng email

- **Tác nhân:** Guest Owner.
- **Luồng chính:** Đăng ký → xác minh → nhập Business → hệ thống tạo Tenant/default Business → đăng nhập Admin.
- **Ngoại lệ:** Email đã tồn tại, mã hết hạn, slug bị chiếm hoặc request onboarding đồng thời.
- **Kết quả:** Một Tenant hợp lệ và một Owner active.

### UC-WP01-02: Owner đăng nhập bằng Google

- **Tác nhân:** Guest Owner.
- **Luồng chính:** OAuth → callback hợp lệ → link identity hoặc bắt đầu onboarding → cấp đúng Admin session.
- **Ngoại lệ:** State/nonce sai, email conflict hoặc Google account chưa đủ dữ liệu.

### UC-WP01-03: Owner mời Staff vào Business

- **Tác nhân:** Owner có `staff:invite`.
- **Luồng chính:** Chọn Staff email, Businesses và permissions → gửi email → Staff accept → tạo membership.
- **Ngoại lệ:** Business khác Tenant, inactive, invitation replay hoặc concurrent accept.

## Checklists

### Planning / Design

- [x] Tách Platform/Admin/Client auth contexts.
- [x] Chốt Google OAuth state, nonce và PKCE.
- [x] Chốt memory access token và HttpOnly refresh cookie.
- [ ] Chốt invitation duplicate/reissue policy.
- [ ] Chốt contract consent và Plan selection.

### Implementation

| Task ID  | Layer | Task                                                 | Trạng thái |
| -------- | ----- | ---------------------------------------------------- | ---------- |
| WP01-001 | BE    | Email auth và Admin session lifecycle                | Done       |
| WP01-002 | BE    | Google OAuth và identity linking                     | Done       |
| WP01-003 | BE/FE | Owner onboarding và slug validation                  | Done       |
| WP01-004 | FE    | Google login/onboarding browser integration          | Partial    |
| WP01-005 | BE    | Invitation Business assignment và transaction accept | Todo       |
| WP01-006 | Email | Queue invitation email, không lộ raw token           | Todo       |
| WP01-007 | FE    | Admin invitation form và accept preview              | Partial    |
| WP01-008 | Test  | Concurrent onboarding/accept và context isolation    | Todo       |

### Review & Testing

- [ ] Email và Google onboarding đều kết thúc tại đúng Admin workspace.
- [ ] Platform account không bootstrap Admin session và ngược lại.
- [ ] Invitation replay/concurrent accept chỉ có một request thành công.
- [ ] Staff chỉ thấy Business được gán trong `/auth/me`.
- [ ] Google Account thật được smoke test trên staging.

## Acceptance Criteria

- Owner email và Google hoàn tất onboarding mà không tạo Tenant trùng.
- Staff invitation bắt buộc có ít nhất một Business active thuộc Tenant hiện tại.
- Accept invitation là transaction toàn vẹn.
- Refresh/logout giữ đúng auth context và cookie policy theo environment.
- API không trả raw invitation token trong production.
- Auth, onboarding, invitation, typecheck và build pass.

## Labels

`feature` `authentication` `onboarding` `backend` `frontend` `critical` `week-2`
