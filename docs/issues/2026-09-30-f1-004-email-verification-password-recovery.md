# [F1-004] - Hoàn thiện email verification và password recovery

**Branch:** `feat/f1-004-email-verification-password-recovery`

**Blocked by:** F1-001, F1-002, F1-003

## Phạm vi

- Hoàn thiện request, resend và verify email bằng mã OTP 6 chữ số.
- Hoàn thiện forgot/reset password và tự động chuyển `sessionId` giữa các màn hình.
- Không tiết lộ email có tồn tại hoặc đã được xác thực qua request công khai.
- Cô lập session theo mục đích `email_verification` và `password_reset`.
- Chỉ consume OTP và xóa session sau khi cập nhật database thành công.
- Revoke refresh session hiện tại sau khi reset mật khẩu.
- Chuẩn hóa mật khẩu tối thiểu 8 ký tự ở shared schema và API DTO.
- Giữ domain error code/details qua Axios để UI xử lý `EMAIL_NOT_VERIFIED`.
- Bổ sung màn hình verify email cho Business Admin.
- Bổ sung unit/regression tests cho các luồng bảo mật trên.

## Kết quả triển khai

- Verification session được lưu bằng key có purpose và TTL 15 phút.
- Email được normalize trước khi tạo session và gửi mã.
- Request email verification và forgot password trả phản hồi đồng nhất cho email không tồn tại.
- OTP không bị mất nếu cập nhật user/password trong database thất bại.
- Reset password xóa `refresh_token_hash` để buộc đăng nhập lại.
- Login Admin chuyển tới `/verify-email` khi API trả `EMAIL_NOT_VERIFIED`.
- Forgot password chuyển trực tiếp tới `/reset-password?sessionId=...`; người dùng không phải sao chép Session ID.
- Form OTP dùng input numeric, `one-time-code`, giới hạn đúng 6 ký tự và có trạng thái loading/error.

## Acceptance criteria

- [x] Email verification và password reset không dùng chung session.
- [x] OTP gồm đúng 6 chữ số và session hết hạn sau 15 phút.
- [x] Public request không tiết lộ trạng thái tồn tại/xác thực của email.
- [x] OTP chỉ bị consume sau khi database update thành công.
- [x] Reset password revoke refresh session hiện tại.
- [x] Password validation tối thiểu 8 ký tự thống nhất giữa frontend/backend.
- [x] Admin có màn hình request, resend và verify email.
- [x] Admin forgot/reset password truyền session tự động qua URL.
- [x] Nested API error giữ được code và details cho frontend.
- [x] Unit/regression tests cho auth flow pass.

## Ngoài phạm vi

- OAuth Google.
- Customer Auth UI trên `apps/web`.
- Thay đổi email provider hoặc template email.
- Multiple-device refresh session.
