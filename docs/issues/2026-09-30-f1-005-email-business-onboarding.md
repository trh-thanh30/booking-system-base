# [F1-005] - Hoàn thiện onboarding bằng email và khởi tạo default Business

**Branch:** `feat/f1-005-email-business-onboarding`

**Blocked by:** F1-004

## Phạm vi

- Hoàn thiện public Business signup qua `POST /auth/register`.
- Tạo Tenant, TenantSettings, optional primary domain, default Business, Owner và BusinessMembership trong một transaction.
- Tạo Owner với role `OWNER`, status `ACTIVE` và `is_verified = false`.
- Normalize email Owner trước khi kiểm tra uniqueness và ghi database.
- Tạo email-verification session, OTP 6 chữ số và queue verification email.
- Trả `sessionId` để Web chuyển Owner sang màn hình xác thực email của Admin.
- Không cho Owner đăng nhập Admin trước khi xác thực email.
- Giữ workspace đã tạo nếu email queue tạm thời lỗi; Owner có thể resend OTP.
- Xóa verification session nếu transaction tạo workspace thất bại.
- Đồng bộ password tối thiểu 8 ký tự giữa shared schema và API DTO.

## Output

- Public Web tạo được workspace bằng email/password.
- Mỗi Tenant mới có đúng một default Business.
- Owner được gán membership vào default Business.
- Owner phải xác thực email trước khi đăng nhập Admin.
- Signup success state dẫn tới `/verify-email?sessionId=...` theo locale hiện tại.
- API response `RegisterOwnerResult` chứa `sessionId`.
- Có test cho happy path, transaction, queue failure và session cleanup.

## Acceptance criteria

- [x] Tenant, default Business, Owner và membership được tạo trong cùng transaction.
- [x] Default Business có `is_default = true`.
- [x] Owner có role `OWNER`, status `ACTIVE` và `is_verified = false`.
- [x] Owner email được trim và lowercase.
- [x] Signup trả verification `sessionId`.
- [x] OTP dùng namespace `email_verification`, độ dài 6 và TTL 15 phút.
- [x] Database failure không để lại verification session.
- [x] Email queue failure không làm client retry tạo Tenant trùng.
- [x] Password signup tối thiểu 8 ký tự ở frontend/backend.
- [x] Web onboarding chuyển sang Admin verify-email theo locale hiện tại.
- [x] Tenant tests, API/Web typecheck và production build pass.

## Architecture decision

- `POST /auth/register` là public registration duy nhất trong phase này.
- Auth sở hữu credential, identity check, verification session, OTP và email.
- Tenant chỉ sở hữu transaction tạo workspace; chiều dependency là Auth → Tenant.
- Không tạo `OnboardingModule`; Customer registration và gán Business cho Staff được tách sang task sau.
- Chi tiết: `docs/adr/0002-owner-registration-auth-tenant-boundary.md`.

## Ngoài phạm vi

- Google OAuth onboarding.
- Subscription/package selection.
- Stripe checkout.
- Multi-location wizard sau khi xác thực email.
