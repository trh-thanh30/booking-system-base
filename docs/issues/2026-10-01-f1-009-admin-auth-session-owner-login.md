# [F1-009] - Hoàn thiện Admin Auth Session và đăng nhập Owner

Branch: `feat/f1-009-admin-auth-session`

## Mục tiêu

Owner đăng nhập Business Admin bằng mật khẩu, khôi phục session khi reload,
truy cập đúng Tenant/Business và đăng xuất an toàn trên backend F1-008.

## Triển khai

- Login dùng `/auth/admin/login`; `/auth/me` là nguồn Auth Profile duy nhất.
- Token và Tenant ID giữ trong memory; xóa credential localStorage từ phiên bản cũ.
- HttpOnly refresh cookie và marker `admin_has_rt=1` tiếp tục dùng contract backend.
- Bootstrap và interceptor chia sẻ một refresh promise, retry request tối đa một lần.
- Session version ngăn refresh cũ ghi đè session mới sau logout/login.
- Bảo vệ dashboard, chờ bootstrap, hỗ trợ safe local `returnTo` và query filters.
- Public auth routes bao gồm verify-email và đường dẫn Google onboarding dự phòng.
- Profile phải thuộc OWNER/STAFF ACTIVE, verified và Tenant ACTIVE hợp lệ.
- Chọn default Business, giữ selection hợp lệ, loại membership ngoài Tenant.
- BusinessSwitcher kiểm tra selection; đổi Business reset query cache.
- User menu dùng profile thật; logout và session expired xóa token/profile/cache/context.
- Navigation và truy cập route dùng permissions; Owner bypass theo contract backend.
- Form login có pending state, lỗi inline, field accessibility và bản dịch vi/en.
- AuthShell dùng shared Blue Brand semantic tokens và nội dung được dịch.
- Thêm `pnpm test:admin` và chạy trong CI job Admin.

## Kiểm tra

- `pnpm lint:admin`: pass, không error/warning.
- `pnpm --filter @repo/shared lint`: pass.
- `pnpm typecheck:admin`: pass.
- `pnpm test:admin`: 20 tests pass.
- Shared HTTP/session specs: 12 tests pass.
- `pnpm build:admin`: production Turbopack build pass.
- `git diff --check`: pass.
- Production HTTP smoke check: guest Booking redirect giữ locale/filter,
  verify-email public trả 200, login nhận returnTo. Server tạm đã dừng.

Specs được viết trong cùng task cho bootstrap, manual login, logout failure,
late responses, profile isolation, Business fallback, permissions, safe returnTo,
error mapping và memory-only credentials. Axios specs sử dụng client/interceptor
thật với adapter mô phỏng: concurrent 401, refresh failure, headers và refresh
response sau logout. Shared specs kiểm tra single-flight và retry behavior.

## Ngoài phạm vi

Email registration/verification/recovery UI hoàn chỉnh thuộc F1-010. Google login
và onboarding UI thuộc F1-011. Task này không triển khai Platform Admin login.

## Ghi chú vận hành

Lượt chuẩn hóa tiếp theo chuyển 23 file hỗ trợ trong Admin/Web vào folder theo
vai trò, thay 12 component dùng Sonner trực tiếp bằng `useToast`, và thêm ESLint
rule chặn import Sonner trong app source. Xem danh mục từng file tại
[`f1-009-file-inventory.md`](../implementation/f1-009-file-inventory.md).

Cookie marker không phải bằng chứng xác thực; frontend luôn xác nhận session với API.
Logout API lỗi vẫn xóa session ở thiết bị hiện tại, nhưng không thể bảo đảm revoke
cookie/session phía server khi không kết nối được. UI hiển thị thông báo cụ thể.
