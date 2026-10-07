# F1 - Authentication & Permissions

## Overview

Xây dựng đăng nhập, refresh token đơn giản và phân quyền chi tiết theo user trong tenant.

## Business Goal

Bảo vệ dữ liệu doanh nghiệp, cho phép mỗi nhóm người dùng chỉ xem và thao tác đúng phần việc của họ.

## User Stories

- Là Business Admin, tôi muốn đăng nhập để quản lý cơ sở của mình.
- Là Staff, tôi chỉ muốn xem lịch được phân công cho mình.
- Là Super Admin, tôi muốn truy cập portal nội bộ để quản lý tenant.

## Functional Requirements

- Đăng nhập bằng email/số điện thoại và mật khẩu.
- Refresh token/session management.
- Role-based access control thô bằng `user_role`: `SUPER_ADMIN`, `OWNER`, `STAFF`, `CUSTOMER`.
- Permission engine: định nghĩa quyền, gán quyền trực tiếp cho user và kiểm tra quyền theo tenant.
- Guard theo tenant và role.
- Guard theo permission cho từng API/action.
- Đổi mật khẩu, quên mật khẩu qua email.
- Invite user nội bộ cho doanh nghiệp.
- Logout và revoke refresh token hiện tại trên `User.refresh_token_hash`.

## API Endpoints

- `POST /auth/login`
- `POST /auth/admin/login`
- `POST /auth/platform/login`
- `POST /auth/platform/refresh`
- `POST /auth/platform/logout`
- `POST /auth/admin/refresh`
- `POST /auth/admin/logout`
- `POST /auth/refresh` (Client)
- `POST /auth/logout` (Client)
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`
- `POST /auth/invitations`
- `GET /auth/invitations/:token`
- `POST /auth/invitations/accept`
- `POST /auth/register`
- `POST /auth/admin/onboarding/register`
- `POST /auth/admin/onboarding/verify`
- `POST /auth/admin/onboarding/login`
- `GET /auth/admin/onboarding`
- `POST /auth/admin/onboarding`
- `GET /auth/admin/google`
- `GET /auth/admin/google/callback`
- `GET /auth/admin/google/onboarding`
- `POST /auth/admin/google/onboarding`
- `GET /platform/tenants`
- `POST /platform/tenants`

## Database Changes

### Account-first onboarding (2026-10-03)

Luồng Web mới: đăng ký Owner → xác minh email → thông tin Business → địa chỉ/
OpenStreetMap pin → tạo Tenant/default Business/membership. Giờ hoạt động được
cấu hình riêng sau onboarding.
Owner được lưu trước, tenant_id=null; không cấp Admin session khi chưa hoàn tất.
Đăng nhập lại có thể tiếp tục onboarding bằng ticket HttpOnly 30 phút. Google
Owner mới được lưu với password=null/is_verified=true trước Business setup.
Manual completion quay về login; Google completion dùng Admin session hiện có.
Business profile lưu tại Business.settings.onboarding, chưa thay thế rule availability.
`POST /auth/register` là compatibility endpoint cũ, không dùng bởi signup Web mới.
Xem [ADR 0004](../adr/0004-account-first-owner-onboarding.md).

- `users`
- `permissions`
- `user_permission`
- `user_invitations`
- `user_identity`

`User.password` nullable để hỗ trợ tài khoản OAuth-only; đăng nhập thủ công phải từ chối tài khoản chưa có password.

Không thêm `sessions` table trong F1. Refresh/session state dùng `users.refresh_token_hash`.

## Auth Contexts

ARCH-001: Business Admin nằm trong Web tại `/{locale}/admin/*`; giữ context
`admin` và API `/auth/admin/*`. Public registration/recovery dùng client riêng,
không kế thừa Admin token/headers. Platform Admin vẫn là app độc lập.

| Context    | App                   | Roles hợp lệ     | Refresh cookies                             |
| :--------- | :-------------------- | :--------------- | :------------------------------------------ |
| `platform` | `apps/platform-admin` | `SUPER_ADMIN`    | `platform_refresh_token`, `platform_has_rt` |
| `admin`    | `apps/web`            | `OWNER`, `STAFF` | `admin_refresh_token`, `admin_has_rt`       |
| `client`   | `apps/web`            | `CUSTOMER`       | `client_refresh_token`, `client_has_rt`     |

`SUPER_ADMIN` là global role, không cần `tenant_id`. `OWNER` và `STAFF` là tenant-scoped roles. Tenant là account/organization; business/branch/location nằm trong `Business`.

## Session Hardening

- Database chỉ lưu SHA-256 hash của refresh token trong `User.refresh_token_hash`; raw token chỉ tồn tại trong HttpOnly cookie.
- Mỗi user có một active refresh session. Login mới thay hash hiện tại và revoke session cũ.
- Refresh token không rotate trong F1; refresh chỉ cấp access token mới.
- JWT dùng audience theo context: `platform`, `admin` hoặc `client`.
- Refresh luôn đọc lại user để kiểm tra status, verification, role, tenant và token hash.
- Logout, đổi/reset mật khẩu và chuyển account sang `INACTIVE` đều revoke session.
- Refresh cookie dùng path riêng theo context; marker cookie không chứa token.
- `SameSite=None` bị chặn cho đến khi có CSRF protection.
- Migration sang `refresh_token_hash` đặt các giá trị raw cũ về `NULL`, vì vậy tất cả session cũ phải đăng nhập lại.

## Email Verification & Password Recovery

- Public Business signup tạo Owner chưa xác thực, default Business và membership trong một transaction.
- Signup trả `sessionId` và chuyển Owner sang Business Admin verify-email trước khi cho phép đăng nhập.

- Public request endpoints trả phản hồi đồng nhất để không tiết lộ email có tồn tại hoặc đã xác thực.
- Verification session có TTL 15 phút và được cô lập theo purpose: `email_verification` hoặc `password_reset`.
- OTP gồm đúng 6 chữ số; rate-limit trả lỗi HTTP 429 có type rõ ràng.
- OTP chỉ bị consume và session chỉ bị xóa sau khi database update thành công.
- Reset password xóa `refresh_token_hash`, buộc user đăng nhập lại bằng mật khẩu mới.
- Password tối thiểu 8 ký tự được áp dụng thống nhất ở shared schema và API DTO.
- Admin giữ domain error `EMAIL_NOT_VERIFIED` cùng `sessionId` để chuyển sang màn hình verify email.
- Forgot password tự chuyển `sessionId` sang reset password; không yêu cầu user sao chép thủ công.

## Frontend Screens

- Login.
- Forgot password.
- Reset password.
- Verify email và resend OTP.
- Accept invitation.

## Admin Screens

- Current user menu.
- Business switcher dựa trên `businesses` từ `/auth/me`.
- Session/logout flow.
- Permission-based navigation visibility.

## Validation Rules

- Email/số điện thoại phải đúng format.
- Password tối thiểu 8 ký tự.
- Invitation token chỉ dùng một lần và có hạn.
- User chỉ đăng nhập vào tenant được gán.

## Acceptance Criteria

- Đăng nhập trả token/session hợp lệ.
- User không đủ quyền bị trả `403`.
- API có thể bảo vệ action bằng permission cụ thể, ví dụ `staff:invite`, `booking:read`, `service:update`.
- UI không hardcode quyền; navigation/action visibility dựa trên permission trả về từ API.
- Staff không xem được dữ liệu tenant hoặc nhân viên khác ngoài phạm vi cho phép.
- Super Admin tách biệt khỏi Business Admin tenant flow.

## Technical Notes

- Dùng guard/decorator để lấy `currentUser` và `tenantContext`.
- Dùng `@Permissions()`/`PermissionsGuard` cho permission-level access control.
- `RolesGuard` dùng cho role-level access control thô, `PermissionsGuard` dùng cho action-level access control chi tiết.
- `SUPER_ADMIN` bypass platform-level checks.
- `OWNER` bypass permission checks trong tenant của chính họ.
- `STAFF` đọc quyền từ `UserPermission` theo `user_id + tenant_id`.
- `resource:manage` cover các action cùng resource.
- Không hardcode quyền trong UI; API vẫn là nguồn kiểm soát cuối.
- F1 triển khai permission engine dùng chung; các feature sau chỉ khai báo permission cụ thể theo module.
- Public Owner registration thuộc Auth; Auth gọi Tenant provisioning qua interface hẹp. Tenant không phụ thuộc ngược vào Auth, Verification hoặc Email.
- Access/refresh JWT mang `tenant_id` và `auth_context`; refresh bị revoke nếu account đổi Tenant.
- Route `()` chỉ nhận Admin context của `OWNER`/`STAFF` và bắt buộc Tenant header trùng JWT.
- Owner được truy cập toàn bộ Business trong Tenant; Staff chỉ truy cập Business có membership cùng Tenant.
- Google OAuth account mới được lưu là Owner đã xác minh tại callback, kèm Redis
  onboarding ticket; Tenant/Business chỉ được tạo khi hoàn tất setup (ADR 0004).
- Google onboarding token chỉ nằm trong HttpOnly cookie, không truyền qua URL; email và Google subject luôn lấy từ verified provider profile.
- Backend F1-007 cung cấp contract onboarding; UI `/{locale}/admin/onboarding/business` được triển khai trong F1-011.

## Delivery Phases

### Phase 1 - API

- Cập nhật `/auth/me` trả user, tenant và permissions.
- Tách `PlatformAuthController` với login/refresh/logout riêng cho
  `SUPER_ADMIN`.
- Tách `AdminAuthController` với login/refresh/logout riêng cho `OWNER` và
  `STAFF`; không phụ thuộc `x-auth-context` trong session flow.
- Chuẩn hóa login/refresh/logout dựa trên hash trong `User.refresh_token_hash`.
- Revoke session khi logout, đổi/reset mật khẩu hoặc account bị inactive.
- Cô lập refresh token bằng JWT audience và cookie path theo auth context.
- Chống refresh loop/storm bằng marker cookie và một shared refresh promise trên frontend.
- Gắn permission guard vào API quản trị.
- Thêm backend invitation flow.
- Bổ sung unit tests cho auth, permission và invitation use cases.

### Phase 2 - Business Admin FE

- F1-009: Owner password login/session đã nối với `/auth/me`; token chỉ giữ trong memory.
- Bootstrap/interceptor dùng chung refresh promise; session hết hạn xóa cache và Business context.
- Dashboard đợi xác thực, safe `returnTo`, permission navigation và Business selection hợp lệ.
- Specs Admin được chạy trong từng task qua `pnpm test:admin` và CI.
- F1-010: Web đăng ký Owner chuyển sang Admin verification, không tự login;
  OTP/request/resend và forgot/reset có pending, lỗi inline, rate-limit và expired-session states.
- Session ID chỉ truyền nội bộ qua URL/API, không có ô nhập hoặc nội dung yêu cầu sao chép.
- Public request/resend responses và quota không phân biệt email tồn tại/đã verified;
  Axios public auth client không refresh token khi OTP session hết hạn.
- Web registration specs chạy qua `pnpm test:web` và CI.
- F1-011: Admin Google Login và public Business onboarding đã nối OAuth backend;
  email Google read-only, không password giả, session/context dùng chung F1-009.
- OAuth/onboarding specs nằm trong task; Google Account thật cần hoàn tất HITL.

- Login, forgot password, reset password và accept invitation screens.
- Current user state đọc từ `/auth/me`.
- Sidebar/navigation/action visibility dựa trên permissions từ API.
- User menu và logout flow.

### Phase 3 - Platform Admin FE

- Platform Admin dùng `/auth/platform/login`, `/auth/platform/refresh` và
  `/auth/platform/logout` mà không phụ thuộc `x-auth-context` cho session flow.
- Tenant registry đọc `GET /platform/tenants`.
- Super Admin tạo tenant thủ công bằng `POST /platform/tenants`.
- Dashboard platform hiển thị tenant/user totals từ tenant registry API.

### Phase 4 - Public Business Signup

- Web route `/{locale}/signup-business`.
- Tạo tenant + owner account bằng `POST /auth/register`.
- Sau signup, owner đi tới Business Admin verify-email bằng `sessionId`; chỉ đăng nhập sau khi xác thực thành công.

### Phase 5 - Migration & Docs

- Thêm migration đổi `user_role`: `ADMIN -> OWNER`, `USER -> CUSTOMER`, thêm `SUPER_ADMIN`.
- Thêm migration cho `permission`, `user_permission`, `user_invitation`.
- Cập nhật docs app cho auth, permission, tenant signup và platform registry.

### Phase 6 - Hardening

- Unit tests cho auth/permission/tenant use cases.
- Typecheck API/Admin/Platform/Web.
- Lint platform admin.

## Dependencies

- F0

## Estimate

32h

## Priority

Critical
