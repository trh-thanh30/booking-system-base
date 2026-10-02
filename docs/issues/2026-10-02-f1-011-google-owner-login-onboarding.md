# [F1-011] - Hoàn thiện Google Login và onboarding cho Owner

Loại: HITL. Blocked by: F1-009.

## Triển khai

- Nút Google trên Admin login điều hướng trực tiếp tới `GET /auth/admin/google`, truyền locale vi/en và safe local `returnTo`; không theo OAuth redirect qua Axios.
- Khóa redirect đồng bộ chống double-click; `pageshow` mở lại nút khi quay lại bằng browser Back/BFCache.
- Mapping `oauthError` sang bản dịch vi/en; mã lạ không hiển thị raw message. Xóa riêng error query sau khi hiển thị, giữ query còn lại/hash và history state.
- Owner hiện có dùng Admin refresh cookie, bootstrap F1-009 gọi refresh rồi `/auth/me`, giữ cùng Tenant/Business/session flow với password login.
- Route public `/{locale}/onboarding/business` lấy email/tên/avatar đã verified qua GET onboarding. Email read-only, không nằm trong payload và không có password field.
- Form thu thập username, phone, Tenant/default Business names/slugs, timezone, locale và primary domain. Shared `completeGoogleOwnerOnboardingSchema` validate payload; normalize optional fields và kiểm tra IANA timezone.
- POST onboarding không tự retry. Form khóa pending và AuthProvider single-flight để concurrent submit chỉ gửi một request.
- Session establishment dùng Auth Profile do backend AuthProfileService trả về; validate role/status/tenant/verified, chọn default Business, clear cache cũ và giữ access token trong memory.
- Không GET thêm `/auth/me` ngay sau provisioning để lỗi request phụ không khuyến khích POST tạo workspace lần nữa. Reload/refresh vẫn dùng `/auth/me`.
- Session generation ngăn response về sau logout khôi phục tài khoản. Success redirect whitelist locale và safe `return_to`.
- Session expired/already completed/identity conflict không tiếp tục hiển thị form tạo workspace; có CTA Google để vào đúng luồng. Lỗi network/quota/details conflict có thông báo, giữ form khi có thể retry.
- Shared response types đặt trong `packages/shared`; support files trong role folders; UI dùng `useToast`, semantic tokens và accessibility states.
- Không sửa provisioning/OAuth backend, không tạo User/Tenant/Business tại frontend, không tạo password giả.

## Kiểm thử trong task

- Redirect một lần, safe locale/returnTo, callback error mapping và URL cleanup.
- Existing Owner bootstrap với refresh + `/auth/me`, không password login.
- Cookie-based public onboarding GET/POST, không refresh khi onboarding session trả 401.
- Token/profile/default Business, concurrent submit một request, response sau logout và reject Platform profile.
- Shared schema/normalization không gửi email/password giả; render read-only identity, workspace fields và disabled pending form.
- HTTP smoke thêm login với oauthError và public onboarding route vào `pnpm test:auth:smoke`.
- Backend Auth suite kiểm tra lại callback, identity/session và provisioning uniqueness. Chống trùng giữa nhiều tab/request vẫn do unique constraints và transaction backend.

## HITL Google Account thật

Người dùng xác nhận đã cấu hình credentials/test users/redirect URI. Chưa coi Google Account thật là đã kiểm thử.

1. Kiểm tra `GOOGLE_REDIRECT_URI` khớp tuyệt đối Google Console. Không commit credentials.
2. Backend `ADMIN_URL` trỏ đúng Business Admin (local app mặc định `http://localhost:3002`); Admin `NEXT_PUBLIC_API_URL` trỏ đúng API. Kiểm tra cookie domain/Secure/SameSite và CORS credentials khi khác domain.
3. Owner có email trùng Google: login vào đúng Tenant/default Business, reload giữ session, logout thành công.
4. Google Account mới: callback mở onboarding, chưa tạo workspace trước submit; email read-only và tên/avatar đúng.
5. Hoàn tất form: Owner verified, password null, đúng Tenant/default Business. Login Google lần sau không tạo dữ liệu trùng.
6. Double-click Google/double-submit form không tạo nhiều request hoặc workspace.
7. Hủy consent: có thông báo, `oauthError` biến mất khỏi URL, có thể thử lại.
8. Cookie onboarding thiếu/hết hạn: có CTA tiếp tục Google, không cho submit form cũ.
9. Kiểm tra returnTo có filter ở vi/en; URL ngoài hệ thống không trở thành redirect.

Callback lỗi hiện dùng fallback locale vi theo contract backend. Callback thành công/onboarding completion dùng locale trong OAuth state; F1-011 không thay đổi contract này.

## Ngoài phạm vi

Platform/Staff Google login, Facebook/provider khác, Google credentials provisioning và thay đổi database schema.

## Kết quả kiểm tra

- Admin tests: 39 test pass; Auth API: 25 suites / 100 test pass; Web: 4 test pass.
- Lint và typecheck của Admin/Shared pass.
- `pnpm test:auth:smoke`: 7 HTTP checks pass, bao gồm public onboarding và login với OAuth error.
- Build Admin bằng webpack (`pnpm --filter @repo/admin exec next build`) pass.
- `pnpm build:admin` bằng Turbopack chưa pass: resolver `next/font/google` của Plus Jakarta Sans báo thiếu `@vercel/turbopack-next/internal/font/google/font`. Không thay font hoặc đổi build script trong task OAuth; cần xử lý build font riêng.
- Chưa chạy đăng nhập/consent Google Account thật. Người dùng đã cấu hình Google OAuth và sẽ kiểm thử HITL theo danh sách trên.
- Không coi các kiểm tra riêng từng app ở trên là đã chạy đủ `pnpm lint`, `pnpm check-types`, `pnpm test`, `pnpm build` toàn monorepo.
