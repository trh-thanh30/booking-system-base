# Auth API

Auth module xử lý đăng ký, đăng nhập, refresh access token bằng httpOnly cookie, lấy current user, cập nhật profile, avatar, đổi mật khẩu, email verification, forgot/reset password và invitation flow cho nhân sự nội bộ.

Backend module:

```txt
apps/api/src/modules/auth
```

FE Platform Admin dùng module này cho:

- Login/logout platform app bằng `SUPER_ADMIN`.
- Bootstrap current user bằng `GET /auth/me`.
- Refresh access token khi access token hết hạn.

FE Business Admin dùng module này cho:

- Login/logout admin app.
- Bootstrap current user bằng `GET /auth/me`.
- Refresh access token khi access token hết hạn.
- User menu và profile settings.
- Forgot/reset password.
- Accept invitation cho nhân sự được mời.

FE Web dùng module này cho:

- Customer register/login.
- Email verification.
- Forgot/reset password.

## Trạng thái triển khai

Status: `partial`

Đã hỗ trợ:

- Register user thường.
- Login platform/admin/client theo `x-auth-context`.
- Refresh access token bằng refresh cookie.
- Logout và revoke `User.refresh_token`.
- Current user profile kèm tenant và permissions.
- Update profile.
- Upload avatar.
- Change password và clear refresh token.
- Forgot/reset password qua verification session.
- Email verification.
- Create/get/accept invitation.

Chưa hỗ trợ:

- Không có `Session` model riêng.
- Không có danh sách session hoặc logout-all.
- Invitation hiện trả raw token trong response, chưa gửi email invitation tự động.

## Base route

```txt
/api/v1/auth
```

## Auth context

Platform admin app gửi:

```txt
x-auth-context: platform
```

Business admin app gửi:

```txt
x-auth-context: admin
```

Customer web gửi:

```txt
x-auth-context: client
```

Nếu không gửi header, backend mặc định là `client`.

Refresh cookie theo context:

| Context  | Refresh cookie           | JS-visible flag   |
| -------- | ------------------------ | ----------------- |
| platform | `platform_refresh_token` | `platform_has_rt` |
| admin    | `admin_refresh_token`    | `admin_has_rt`    |
| client   | `client_refresh_token`   | `client_has_rt`   |

Access token gửi qua header:

```txt
Authorization: Bearer <access_token>
```

## Role theo auth context

| Context  | Role được phép   |
| -------- | ---------------- |
| platform | `SUPER_ADMIN`    |
| admin    | `OWNER`, `STAFF` |
| client   | `CUSTOMER`       |

Nếu token hợp lệ nhưng role không đúng context, API trả:

```txt
401 Invalid session for this app
```

## AuthUser response

`GET /auth/me`, login response và profile update trả user theo shape:

```ts
type AuthUser = {
  id: string;
  tenant_id: string | null;
  email: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "SUPER_ADMIN" | "OWNER" | "STAFF" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE";
  is_verified: boolean;
  tenant: {
    id: string;
    slug: string;
    name: string;
    status: "ACTIVE" | "INACTIVE";
    timezone: string;
    locale: string;
  } | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
};
```

Permission behavior:

- `SUPER_ADMIN` và `OWNER` nhận `["*"]`.
- `STAFF` nhận danh sách quyền từ `UserPermission` theo `user_id + tenant_id`.
- `CUSTOMER` thường nhận `permissions: []` trừ khi sau này có flow cấp quyền theo tenant riêng.
- User không có tenant nhận `permissions: []`.

## POST /api/v1/auth/register

Dùng cho: Customer/web register.

Auth: public.

Body:

```ts
type RegisterBody = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};
```

Validation:

- `username`: required.
- `email`: email hợp lệ.
- `password`: tối thiểu 6 ký tự.
- `confirmPassword`: phải khớp `password`.

Response chính:

```ts
type RegisterResponse = {
  user: {
    id: string;
    email: string;
    username: string;
    is_verified: boolean;
  };
  sessionId: string;
};
```

BE behavior:

- Kiểm tra email/username chưa tồn tại.
- Hash password.
- Tạo user chưa verified.
- Tạo verification session trong Redis.
- Gửi verification code qua email.

Error thường gặp:

- `409 An account with this email already exists`.
- `409 Username is already taken`.

FE states:

- Success: chuyển tới verification screen và giữ `sessionId`.
- Error: hiển thị message từ API.
- Không tự login sau register vì user chưa verified.

## POST /api/v1/auth/login-platform

Dùng cho: Platform Admin app login.

Auth: public.

Body:

```ts
type LoginBody = {
  usernameOrEmail: string;
  password: string;
};
```

Response chính:

```ts
type LoginResponse = {
  access_token: string;
  user: AuthUser;
};
```

BE behavior:

- Chỉ cho role `SUPER_ADMIN`.
- Verify password.
- Check account `ACTIVE`.
- Check email verified.
- Generate access token và refresh token.
- Lưu refresh token vào `User.refresh_token`.
- Set `platform_refresh_token` và `platform_has_rt`.
- Trả `AuthUser` kèm permissions.

## POST /api/v1/auth/login-admin

Dùng cho: Admin app login.

Auth: public.

Body:

```ts
type LoginBody = {
  usernameOrEmail: string;
  password: string;
};
```

Response chính:

```ts
type LoginResponse = {
  access_token: string;
  user: AuthUser;
};
```

BE behavior:

- Chỉ cho role `OWNER` hoặc `STAFF`.
- Verify password.
- Check account `ACTIVE`.
- Check email verified.
- Generate access token và refresh token.
- Lưu refresh token vào `User.refresh_token`.
- Set `admin_refresh_token` và `admin_has_rt`.
- Trả `AuthUser` kèm permissions.

Error thường gặp:

- `401 Invalid email/username or password`.
- `400 Please verify your email before logging in`.
- `400 Account is inactive. Please contact support`.

FE states:

- Loading: disable submit và hiển thị progress.
- Success: lưu access token vào auth state, gọi hoặc dùng user response để hydrate current user.
- Verification required: chuyển tới verification flow nếu error details có `requiresVerification`.
- Error: hiển thị message.

## POST /api/v1/auth/login

Dùng cho: Customer web login.

Auth: public.

Body giống `login-admin`.

Response giống `login-admin`.

BE behavior:

- Chỉ cho role `CUSTOMER`.
- Set `client_refresh_token` và `client_has_rt`.

FE states:

- Web app luôn gửi `x-auth-context: client` cho request sau login.
- Không dùng endpoint này cho admin app.

## POST /api/v1/auth/refresh

Dùng cho: Admin/Web refresh access token.

Auth: public nhưng cần refresh cookie đúng context.

Headers:

```ts
type Headers = {
  "x-auth-context"?: "admin" | "client";
};
```

Response chính:

```ts
type RefreshResponse = {
  access_token: string;
};
```

BE behavior:

- Đọc refresh cookie theo auth context.
- Verify refresh token.
- Tìm user theo token payload.
- So sánh refresh token với `User.refresh_token`.
- Check role hợp lệ theo context.
- Phát access token mới.
- Giữ refresh token cũ ổn định.
- Nếu refresh fail, clear refresh cookie.

Error thường gặp:

- `401 Refresh token is missing`.
- `401 Invalid or expired refresh token`.
- `401 Invalid refresh token for this app`.

FE states:

- Khi request bị `401`, thử refresh một lần.
- Nếu refresh success, retry request gốc.
- Nếu refresh fail, clear auth state và redirect login.

## POST /api/v1/auth/logout

Dùng cho: Logout app hiện tại.

Auth: public nhưng nên gọi khi user đang đăng nhập.

Headers:

```txt
x-auth-context: platform | admin | client
```

BE behavior:

- Đọc refresh cookie theo context.
- Verify token nếu có.
- Nếu token khớp `User.refresh_token`, set `refresh_token = null`.
- Clear refresh cookie và flag cookie.
- Clear legacy cookies `refresh_token` và `has_rt`.

Response chính:

```ts
type Response = void;
```

FE states:

- Gọi logout best-effort.
- Dù API fail hay success vẫn clear local access token.
- Redirect về login screen.

## GET /api/v1/auth/me

Dùng cho: Bootstrap current session.

Auth: required.

Headers:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin | client
```

Response chính:

```ts
type Response = AuthUser;
```

BE behavior:

- Verify access token bằng `JwtAuthGuard`.
- Check role khớp auth context.
- Load auth profile từ users service.
- Include tenant summary.
- Resolve permissions:
  - `SUPER_ADMIN` -> `["*"]`
  - `OWNER` -> `["*"]`
  - `STAFF` -> `UserPermission`
  - `CUSTOMER` -> thường là `[]`

Error thường gặp:

- `401 Access token not found in Authorization header`.
- `401 Invalid or expired access token`.
- `401 Invalid session for this app`.
- `404 User not found`.

FE states:

- Loading: app shell skeleton.
- Success: hydrate current user store.
- Error: clear auth state và redirect login.
- Navigation/action visibility dùng `permissions` từ response.

## PATCH /api/v1/auth/me

Dùng cho: Profile settings.

Auth: required.

Body:

```ts
type UpdateProfileBody = {
  username?: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};
```

Validation:

- `username`: 2-80 ký tự nếu gửi.
- `email`: email hợp lệ, tối đa 160 ký tự.
- `full_name`: tối đa 120 ký tự hoặc null.
- `phone`: tối đa 32 ký tự hoặc null.

Response chính:

```ts
type Response = AuthUser;
```

BE behavior:

- Check auth context.
- Check email/username/phone unique nếu đổi.
- Update user.
- Return `AuthUser` mới nhất.

FE states:

- Success: cập nhật current user cache.
- Conflict: show field-level error nếu map được.

## PATCH /api/v1/auth/me/avatar

Dùng cho: Upload avatar current user.

Auth: required.

Content-Type:

```txt
multipart/form-data
```

Body:

```ts
type Body = {
  file: File;
};
```

Response chính:

```ts
type Response = AuthUser;
```

BE behavior:

- Check auth context.
- Upload asset vào assets module với folder `avatars`.
- Update `user.avatar_url`.
- Return `AuthUser`.

Error thường gặp:

- `400 Avatar file is required`.

FE states:

- Preview local file trước khi submit.
- Success: update avatar trong user menu/header.
- Error: giữ ảnh cũ.

## PATCH /api/v1/auth/change-password

Dùng cho: User đổi mật khẩu khi đang đăng nhập.

Auth: required.

Body:

```ts
type ChangePasswordBody = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
};
```

Validation:

- `currentPassword`: required.
- `password`: tối thiểu 6 ký tự.
- `confirmPassword`: phải khớp password.

BE behavior:

- Check current password.
- New password không được trùng current password.
- Hash password mới.
- Clear `User.refresh_token`.
- Controller clear refresh cookie theo context.

Response chính:

```ts
type Response = void;
```

FE states:

- Success: logout current session và redirect login.
- Error: show message.

## POST /api/v1/auth/forgot-password

Dùng cho: Bắt đầu reset password.

Auth: public.

Body:

```ts
type ForgotPasswordBody = {
  email: string;
};
```

Response chính:

```ts
type Response = {
  sessionId: string;
};
```

BE behavior:

- Tìm user theo email.
- Tạo verification session trong Redis.
- Generate reset code namespace `password_reset`, TTL 15 phút.
- Gửi forgot password email.

Error thường gặp:

- `404 User with this email not found`.

FE states:

- Success: route sang reset password screen kèm `sessionId`.
- Error: show message.

## POST /api/v1/auth/reset-password

Dùng cho: Đặt mật khẩu mới bằng reset code.

Auth: public.

Body:

```ts
type ResetPasswordBody = {
  sessionId: string;
  code: string;
  password: string;
  confirmPassword: string;
};
```

BE behavior:

- Lấy email từ verification session.
- Verify và consume code namespace `password_reset`.
- Hash password mới.
- Update password.
- Clear `User.refresh_token`.
- Delete verification session.

Error thường gặp:

- `401 Invalid or expired password reset session`.
- `404 User not found`.
- `400 Invalid or expired verification code`.

FE states:

- Success: chuyển về login.
- Error: giữ form và show message.

## POST /api/v1/auth/verify

Dùng cho: Verify email sau register hoặc login bị chặn.

Auth: public.

Body:

```ts
type VerifyEmailBody = {
  sessionId: string;
  code: string;
};
```

BE behavior:

- Lấy email từ verification session.
- Check user tồn tại và chưa verified.
- Verify và consume code namespace `email_verification`.
- Set `is_verified = true`.
- Delete verification session.

Response chính:

```ts
type Response = void;
```

## POST /api/v1/auth/resend-verification

Dùng cho: Gửi lại email verification code.

Auth: public.

Body:

```ts
type Body = {
  sessionId: string;
};
```

BE behavior:

- Lấy email từ verification session.
- Check user tồn tại và chưa verified.
- Generate code mới.
- Extend session TTL.

Error thường gặp:

- `401 Invalid or expired verification session`.
- `400 Account is already verified`.
- `429 Too many verification requests. Please try again later.`

## POST /api/v1/auth/request-verification

Dùng cho: Tạo verification session bằng email.

Auth: public.

Body:

```ts
type Body = {
  email: string;
};
```

Response chính:

```ts
type Response = {
  sessionId: string;
};
```

BE behavior:

- Tìm user theo email.
- Reject nếu user đã verified.
- Tạo verification session.
- Gửi code verification.

## POST /api/v1/auth/invitations

Dùng cho: Admin/Staff mời user nội bộ vào tenant.

Auth: required.

Tenant: required.

Permission:

```txt
staff:invite
```

Headers:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
x-tenant-id: <tenant_id>
```

Body:

```ts
type CreateInvitationBody = {
  email: string;
  role?: "OWNER" | "STAFF";
  permission_keys?: string[];
};
```

Response chính:

```ts
type CreateInvitationResponse = {
  id: string;
  email: string;
  role: "OWNER" | "STAFF";
  permission_keys: string[];
  tenant: {
    id: string;
    slug: string;
    name: string;
  };
  token: string;
  expires_at: string;
  created_at: string;
};
```

BE behavior:

- Check tenant context.
- Check email chưa tồn tại trong `User`.
- Deduplicate `permission_keys`.
- Validate permission keys tồn tại.
- Tạo raw token ngẫu nhiên.
- Lưu `token_hash` bằng SHA-256.
- Lưu invitation TTL 7 ngày.
- Trả raw `token` trong response.

Lưu ý:

- Hiện tại API chưa gửi email invitation tự động.
- FE/Admin có thể dùng `token` để build link accept invitation.

Error thường gặp:

- `409 An account with this email already exists`.
- `400 One or more permissions are invalid`.
- `403 Access denied`.

## GET /api/v1/auth/invitations/:token

Dùng cho: Accept invitation screen preview.

Auth: public.

Path params:

```ts
type Params = {
  token: string;
};
```

Response chính:

```ts
type InvitationPreview = {
  id: string;
  email: string;
  role: "OWNER" | "STAFF";
  tenant: {
    id: string;
    slug: string;
    name: string;
  };
  accepted_at: string | null;
  expires_at: string;
  is_expired: boolean;
};
```

FE states:

- Loading: skeleton form.
- Expired: show expired invitation state.
- Accepted: show already accepted state.
- Valid: show password setup form.

## POST /api/v1/auth/invitations/accept

Dùng cho: User nhận invitation tạo account.

Auth: public.

Body:

```ts
type AcceptInvitationBody = {
  token: string;
  username: string;
  full_name?: string;
  password: string;
  confirmPassword: string;
};
```

Validation:

- `token`: required.
- `username`: required.
- `password`: tối thiểu 6 ký tự.
- `confirmPassword`: phải khớp password.

Response chính:

```ts
type AcceptInvitationResponse = {
  id: string;
  tenant_id: string | null;
  email: string;
  username: string;
  full_name: string | null;
  role: "OWNER" | "STAFF";
  status: "ACTIVE" | "INACTIVE";
  is_verified: boolean;
};
```

BE behavior:

- Hash raw token và tìm invitation.
- Reject nếu token invalid, đã accepted hoặc hết hạn.
- Check email/username chưa tồn tại.
- Hash password.
- Tạo user trong tenant của invitation.
- Set `is_verified = true`.
- Gán permission từ `permission_keys` nếu có.
- Set `accepted_at`.

Error thường gặp:

- `401 Invalid invitation token`.
- `400 Invitation has already been accepted`.
- `400 Invitation has expired`.
- `409 An account with this email already exists`.
- `409 Username is already taken`.

FE states:

- Success: route tới login admin.
- Error: show message tại form.

## Shared contracts

Shared schemas:

```txt
packages/shared/src/schemas/auth.schema.ts
```

Backend DTO:

```txt
apps/api/src/modules/auth/dto
```

Use cases:

```txt
apps/api/src/modules/auth/use-cases
```

## Tests

Auth tests:

```txt
apps/api/src/modules/auth/tests
```

Chạy:

```bash
pnpm --filter @repo/api test -- auth
```

Nên có coverage cho:

- Login role context.
- Refresh token mismatch.
- Logout/revoke refresh token.
- Change/reset password clear refresh token.
- Invitation create/get/accept.

## Changelog

- 2026-07-05: tạo docs chi tiết cho Auth API.
