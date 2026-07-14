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
- Logout và revoke refresh token hiện tại trên `User.refresh_token`.

## API Endpoints

- `POST /auth/login`
- `POST /auth/login-admin`
- `POST /auth/login-platform`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`
- `POST /auth/invitations`
- `GET /auth/invitations/:token`
- `POST /auth/invitations/accept`
- `POST /tenants/signup`
- `GET /platform/tenants`
- `POST /platform/tenants`

## Database Changes

- `users`
- `permissions`
- `user_permission`
- `user_invitations`

Không thêm `sessions` table trong F1. Refresh/session state dùng `users.refresh_token`.

## Auth Contexts

| Context    | App                   | Roles hợp lệ     | Refresh cookies                             |
| :--------- | :-------------------- | :--------------- | :------------------------------------------ |
| `platform` | `apps/platform-admin` | `SUPER_ADMIN`    | `platform_refresh_token`, `platform_has_rt` |
| `admin`    | `apps/admin`          | `OWNER`, `STAFF` | `admin_refresh_token`, `admin_has_rt`       |
| `client`   | `apps/web`            | `CUSTOMER`       | `client_refresh_token`, `client_has_rt`     |

`SUPER_ADMIN` là global role, không cần `tenant_id`. `OWNER` và `STAFF` là tenant-scoped roles.

## Frontend Screens

- Login.
- Forgot password.
- Reset password.
- Accept invitation.

## Admin Screens

- Current user menu.
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

## Delivery Phases

### Phase 1 - API

- Cập nhật `/auth/me` trả user, tenant và permissions.
- Thêm `POST /auth/login-platform` cho `SUPER_ADMIN`.
- Chuẩn hóa login/refresh/logout dựa trên `User.refresh_token`.
- Clear refresh token khi logout, đổi mật khẩu hoặc reset mật khẩu.
- Gắn permission guard vào API quản trị.
- Thêm backend invitation flow.
- Bổ sung unit tests cho auth, permission và invitation use cases.

### Phase 2 - Business Admin FE

- Login, forgot password, reset password và accept invitation screens.
- Current user state đọc từ `/auth/me`.
- Sidebar/navigation/action visibility dựa trên permissions từ API.
- User menu và logout flow.

### Phase 3 - Platform Admin FE

- Platform Admin dùng `/auth/login-platform` và `x-auth-context: platform`.
- Tenant registry đọc `GET /platform/tenants`.
- Super Admin tạo tenant thủ công bằng `POST /platform/tenants`.
- Dashboard platform hiển thị tenant/user totals từ tenant registry API.

### Phase 4 - Public Business Signup

- Web route `/{locale}/signup-business`.
- Tạo tenant + owner account bằng `POST /tenants/signup`.
- Sau signup, owner đi tới Business Admin login.

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
