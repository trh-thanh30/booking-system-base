# [F1-007] - Hoàn thiện Business onboarding cho Google Owner lần đầu

## Mục tiêu

Cho phép người dùng Google chưa có tài khoản hoàn tất thông tin doanh nghiệp trước khi hệ thống tạo Tenant, default Business và Owner. Phạm vi task này chỉ gồm backend; UI Business Admin được triển khai ở task frontend riêng.

## Luồng backend

1. Client mở `GET /auth/admin/google` với `locale` và `returnTo` hợp lệ.
2. Google callback xác thực Authorization Code, PKCE, state, nonce và email đã được Google xác minh.
3. Nếu Google identity hoặc email đã thuộc một Owner hợp lệ, API liên kết identity khi cần và tạo admin session như F1-006.
4. Nếu email chưa tồn tại, API tạo onboarding session ngắn hạn trong Redis, đặt token vào cookie HttpOnly và chuyển hướng tới `/{locale}/onboarding/business`.
5. UI tương lai đọc profile đã xác minh qua `GET /auth/admin/google/onboarding`.
6. UI gửi thông tin Tenant, default Business và Owner qua `POST /auth/admin/google/onboarding`.
7. API tạo Tenant, TenantSettings, default Business, Owner, BusinessMembership và Google UserIdentity; sau đó cấp admin access/refresh token.

## API contract

### `GET /auth/admin/google/onboarding`

- Đọc onboarding token từ cookie HttpOnly; không nhận token từ query hoặc body.
- Trả `email`, `full_name`, `avatar_url` lấy từ Google profile đã xác minh.
- Trả `GOOGLE_ONBOARDING_SESSION_INVALID` nếu cookie thiếu, hết hạn hoặc sai định dạng.

### `POST /auth/admin/google/onboarding`

Input dùng cùng tenant/business contract với đăng ký thủ công, ngoại trừ:

- Không nhận email, mật khẩu hoặc `is_verified` từ client.
- Chỉ nhận `owner.username` và `owner.phone` tùy chọn.
- Email, tên và avatar được lấy từ onboarding session đáng tin cậy.

Kết quả:

- Tạo Owner có `role=OWNER`, `status=ACTIVE`, `is_verified=true`, `password=null`.
- Tạo Google identity theo provider subject; không dùng email làm external identity key.
- Tạo một default Business và membership của Owner trong transaction provisioning.
- Lưu hash refresh token, xóa onboarding session sau khi thành công, đặt admin refresh cookie và trả access token cùng auth profile.
- Giữ onboarding session nếu provisioning lỗi để người dùng có thể thử lại.

## Bảo mật và tính nhất quán

- Onboarding token ngẫu nhiên 256-bit; Redis chỉ lưu key đã băm SHA-256.
- Cookie onboarding dùng `HttpOnly`, `SameSite=Lax`, TTL mặc định 900 giây và path riêng cho Google onboarding API.
- Kiểm tra trùng email, Google identity, username, phone, tenant slug và domain; unique constraint của database là lớp bảo vệ cuối.
- Manual login từ chối an toàn tài khoản `password=null`; không gọi bcrypt với giá trị null.
- Change password từ chối tài khoản chưa cấu hình mật khẩu. Luồng đặt mật khẩu lần đầu cho OAuth-only account nằm ngoài task này.
- Callback không đưa onboarding token vào URL hoặc JavaScript.

## Cấu hình và migration

- `GOOGLE_ONBOARDING_TTL_SECONDS=900`.
- Migration `20260930130000_google_owner_onboarding` cho phép `User.password` nullable để hỗ trợ tài khoản chỉ dùng OAuth.

## Ngoài phạm vi

- Không tạo màn hình Google login hoặc Business onboarding trong `apps/admin`/`apps/web`.
- Không triển khai policy consent, industry, subscription hoặc trial.
- Route frontend `/{locale}/onboarding/business` là contract handoff và chỉ hoạt động khi task frontend tương ứng được triển khai.

## Acceptance criteria

- Google Owner hiện có tiếp tục đăng nhập mà không tạo User/Tenant trùng.
- Google account mới nhận onboarding session, chưa tạo dữ liệu doanh nghiệp tại callback.
- Chỉ profile Google có `email_verified=true` mới đi tiếp.
- Hoàn tất onboarding tạo đúng một Tenant, default Business, verified Owner, membership và Google identity.
- Replay hoặc dữ liệu trùng bị từ chối bằng domain error; không lộ credential/token trong URL.
- API typecheck, Auth/Tenant unit test và production build pass.
