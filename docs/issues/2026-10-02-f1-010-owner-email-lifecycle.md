# [F1-010] - Hoàn thiện vòng đời tài khoản Owner bằng email

Blocked by: F1-009

## Phạm vi đã triển khai

- Web `/{locale}/signup-business` dùng `registerOwnerSchema`, chuẩn hóa chuỗi và optional fields, gửi Owner/Tenant/default Business qua `POST /auth/register`.
- Đăng ký không tạo session đăng nhập. Thành công tự chuyển sang Admin `/{locale}/verify-email?sessionId=...`; giữ CTA dự phòng nếu trình duyệt không chuyển trang.
- `NEXT_PUBLIC_ADMIN_URL` được kiểm tra trước khi tạo tài khoản; phải là HTTP(S) URL của Business Admin.
- Form đăng ký có pending state, fieldset khóa gửi trùng, lỗi inline, label/accessibility và bản dịch vi/en; dùng semantic design tokens hiện có, không dựng lại landing layout.
- Admin verification nhận session từ URL, hoặc yêu cầu mã bằng email khi chưa có/session hết hạn. OTP đúng 6 chữ số; verify thành công về login và giữ safe `returnTo`.
- `EMAIL_NOT_VERIFIED` khi login được đưa vào cùng helper chuyển hướng verification.
- Resend có pending state và cooldown 60 giây sau khi gửi. HTTP 429 hiển thị thông báo và thời gian chờ; nếu API không cung cấp `details.retryAfter`, fallback UI là 60 giây (không thay quota phía server).
- Forgot password dùng response trung tính, truyền session nội bộ qua URL sang reset. Không có ô nhập, nút sao chép hoặc nội dung hiển thị session ID.
- Reset yêu cầu OTP, password tối thiểu 8 ký tự và confirm password trùng nhau; thành công về login. Session thiếu/hết hạn có CTA yêu cầu mã mới.
- Public account-lifecycle Axios client không mang access token, Tenant/Business headers hoặc tự refresh khi session OTP trả 401. Các request vẫn có timeout và dùng shared error normalization.
- Backend request/forgot/resend áp cùng quota cho email có thật/không tồn tại/đã verified; chỉ gửi email cho tài khoản phù hợp. Resend không trả `User not found` hoặc `Account is already verified`.
- Session/OTP giả của email không tồn tại cũng ngắn hạn và không thể tạo tài khoản hay đăng nhập. Không sửa schema database, provisioning transaction hoặc OAuth flow.

## Kiểm thử trong task

- Admin specs: shared OTP/password validation, safe session handoff, unverified-email login redirect, error classification, Axios endpoint contracts và isolation khỏi refresh.
- Render specs dùng component thật cùng Query Client và locale provider: request form, OTP form, reset form và missing-session recovery. Không kiểm thử tương tác browser bằng render tĩnh.
- Middleware specs xác nhận verify-email, forgot-password và reset-password public ở cả vi/en; F1-009 đã có rule phù hợp nên không cần sửa middleware.
- Web specs: registration schema/normalization, localized Admin URL, HTTP contract đăng ký không login và render form.
- API use-case specs: uniform public response/quota, resend, invalid sessions và email eligibility.
- Thêm `pnpm test:web` ở root và trong CI job Web; giữ `pnpm test:admin` hiện có.
- Bổ sung Web `QueryProvider` trong locale layout: HTTP production smoke bắt được lỗi
  `No QueryClient set` tại signup-business dù build và isolated render specs trước đó pass.
  Render regression spec hiện dùng provider thật của Web thay vì tự tạo provider trong test.
- `pnpm test:auth:smoke` khởi chạy Web/Admin production tạm trên cổng 3101/3102,
  kiểm tra public auth forms qua HTTP rồi tự dừng. Chạy sau `pnpm build:web` và `pnpm build:admin`.

## Kiểm tra vận hành còn cần

- Kiểm tra SMTP/worker/Redis thực tế trên staging để xác nhận email đến hộp thư.
- Kiểm tra browser handoff giữa Web/Admin với domain, CORS và `NEXT_PUBLIC_ADMIN_URL` thực tế.
- Không triển khai Google UI, Staff invitation UI hay Super Admin login trong task này.

## Kết quả kiểm tra

- `pnpm --filter @repo/admin lint` và `pnpm --filter @repo/web lint`: pass, không warnings.
- ESLint các API use case thay đổi: pass, không warnings. Các API spec hiện có vẫn dùng mock `as any`, nên lint spec có warnings theo rule hiện tại.
- `pnpm typecheck:api`, `pnpm typecheck:admin`, `pnpm typecheck:web`: pass.
- `pnpm --filter @repo/admin test`: 28 tests pass.
- `pnpm --filter @repo/web test`: 4 tests pass.
- API Auth suite (`jest --runInBand --testPathPatterns=modules/auth/tests`): 25 suites, 100 tests pass; đây không phải toàn bộ API test suite.
- `pnpm build:api`, `pnpm build:admin`, `pnpm build:web`: pass; FE vẫn dùng Turbopack.
- `pnpm test:auth:smoke`: 5 HTTP checks pass (200), server tạm được dừng.
- `git diff --check`: pass.

Sandbox chặn bind port của Turbopack/Supertest; build FE và HTTP tests được chạy lại với quyền phù hợp. Smoke dùng Next CLI với build hiện có; khi deploy vẫn dùng standalone entrypoint theo Dockerfile, không thay deployment setup trong task này.
