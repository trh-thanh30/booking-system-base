# [F1-006] - Bổ sung Google Identity và đăng nhập Google cho Owner hiện có

**Branch:** `feat/f1-006-google-owner-login`

**Blocked by:** F1-002, F1-003, F1-005

## Phạm vi backend

- Thêm `UserIdentity` để liên kết một User nội bộ với tài khoản OAuth bên ngoài.
- Google identity được nhận diện bằng cặp `provider + provider_account_id`, không
  dùng email làm định danh ổn định.
- Chỉ cho phép link và đăng nhập Google với Owner đã tồn tại, đang ACTIVE và đã
  thuộc một Tenant.
- Google `email_verified = true` được xem là bằng chứng xác minh email; Owner
  được cập nhật `is_verified = true` sau khi liên kết thành công.
- Không tạo User, Tenant hoặc Business mới trong callback F1-006.
- Dùng Authorization Code flow với state, nonce và PKCE S256.
- State được lưu Redis với TTL, tiêu thụ atomically và ràng buộc với cookie
  HttpOnly/SameSite=Lax của browser khởi tạo flow.
- Callback phát session cho auth context `admin`, chỉ đặt refresh token trong
  cookie HttpOnly và không đưa access token lên URL.
- Callback thành công redirect về Admin `returnTo` đã được kiểm tra chống open
  redirect; callback lỗi chỉ trả error code an toàn trên query string.

## API

```text
GET /api/v1/auth/admin/google
GET /api/v1/auth/admin/google/callback
```

Query bắt đầu OAuth:

- `locale`: `vi` hoặc `en`, mặc định `vi`.
- `returnTo`: path tương đối trong Admin, mặc định `/dashboard`.

## Database

`UserIdentity` có các constraint:

- Unique `(provider, provider_account_id)`: một Google account không được link
  với nhiều User.
- Unique `(user_id, provider)`: một User chỉ được link một identity cho mỗi
  provider.
- Xóa User sẽ cascade xóa identity.

Manual login tiếp tục dùng `User.email`/`User.password` và không tạo identity
`MANUAL`.

## Environment

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/admin/google/callback
GOOGLE_OAUTH_STATE_TTL_SECONDS=600
ADMIN_URL=http://localhost:3001
```

`GOOGLE_REDIRECT_URI` phải khớp tuyệt đối với Authorized redirect URI trong
Google Cloud Console.

## Acceptance criteria

- [x] Owner hiện có có thể được link với một Google identity đã xác minh.
- [x] Google login tạo refresh session thuộc auth context `admin`.
- [x] Owner chưa xác minh manual được chuyển sang `is_verified = true` sau khi
      Google xác minh thành công.
- [x] Không tạo User/Tenant/Business khi không tìm thấy Owner phù hợp.
- [x] Staff, Customer, Super Admin, Owner inactive hoặc Owner thiếu Tenant bị từ
      chối.
- [x] Một Google identity không thể link với nhiều User.
- [x] Một Owner không thể link với hai Google identity khác nhau.
- [x] State chống replay, được ràng buộc cookie và có TTL.
- [x] Nonce và PKCE S256 được kiểm tra.
- [x] Access token không xuất hiện trong callback URL.
- [x] Redirect `returnTo` không cho phép external URL.
- [x] Unit/controller tests cho OAuth provider, state, cookie, linking và redirect
      pass.

## Ngoài phạm vi

- Nút “Đăng nhập với Google” và error/loading state trên Business Admin.
- Google-first onboarding cho người chưa có Owner account; thuộc F1-007.
- Facebook/Apple OAuth.
- Google Calendar hoặc các integration API khác.
