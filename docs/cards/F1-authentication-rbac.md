# F1 - Authentication & RBAC

## Overview

Xây dựng đăng nhập, quản lý session/token và phân quyền theo vai trò: Super Admin, Business Admin, Manager, Receptionist, Staff.

## Business Goal

Bảo vệ dữ liệu doanh nghiệp, cho phép mỗi nhóm người dùng chỉ xem và thao tác đúng phần việc của họ.

## User Stories

- Là Business Admin, tôi muốn đăng nhập để quản lý cơ sở của mình.
- Là Staff, tôi chỉ muốn xem lịch được phân công cho mình.
- Là Super Admin, tôi muốn truy cập portal nội bộ để quản lý tenant.

## Functional Requirements

- Đăng nhập bằng email/số điện thoại và mật khẩu.
- Refresh token/session management.
- Role-based access control.
- Permission engine: định nghĩa quyền, gán quyền cho role và kiểm tra quyền theo tenant.
- Guard theo tenant và role.
- Guard theo permission cho từng API/action.
- Đổi mật khẩu, quên mật khẩu qua email.
- Invite user nội bộ cho doanh nghiệp.
- Logout và revoke session.

## API Endpoints

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`
- `POST /auth/invitations`
- `POST /auth/invitations/accept`

## Database Changes

- `users`
- `roles`
- `permissions`
- `user_roles`
- `role_permissions`
- `sessions`
- `password_reset_tokens`
- `user_invitations`

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
- API có thể bảo vệ action bằng permission cụ thể, ví dụ `staff.invite`, `booking.read`, `service.update`.
- UI không hardcode quyền; navigation/action visibility dựa trên permission trả về từ API.
- Staff không xem được dữ liệu tenant hoặc nhân viên khác ngoài phạm vi cho phép.
- Super Admin tách biệt khỏi Business Admin tenant flow.

## Technical Notes

- Dùng guard/decorator để lấy `currentUser` và `tenantContext`.
- Dùng `@Permissions()`/`PermissionsGuard` cho permission-level access control.
- `RolesGuard` dùng cho role-level access control thô, `PermissionsGuard` dùng cho action-level access control chi tiết.
- Không hardcode quyền trong UI; API vẫn là nguồn kiểm soát cuối.
- F1 triển khai permission engine dùng chung; các feature sau chỉ khai báo permission cụ thể theo module.

## Dependencies

- F0

## Estimate

32h

## Priority

Critical
