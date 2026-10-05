# [ARCH-001] - Gộp Web và Business Admin thành một frontend service

Branch: `refactor/arch-001-merge-web-admin`

Loại: AFK cho code và kiểm tra local; HITL cho cutover môi trường đã deploy.

Blocked by: DS-002, F1-009, F1-010, F1-011.

## Goal

Gộp Landing Page và Business Admin vào `apps/web`, chỉ chạy/build/push/deploy
một frontend service cho hai phạm vi này. Giữ Platform Admin và API riêng.
Không làm mất các luồng Owner Auth đã hoàn thiện hoặc thay đổi nội dung/UI marketing.

## Input

- Web hiện có Landing, signup-business, i18n vi/en và DS-002.
- Admin hiện có Owner login, verification, recovery, Google onboarding,
  session/bootstrap, Auth Profile, Business context và dashboard routes.
- API có `/auth/admin/*`, `/auth/register`, email verification/recovery,
  Google callback và cấu hình URL trả về frontend.
- Root scripts, pnpm workspace, Turbo, Dockerfile/Compose, CI/publish/deploy
  đang xử lý Web và Admin như hai app/image/service riêng.
- Quy tắc frontend, Design System, shared hooks và ADR locale-prefixed routes.

## Phạm vi

- Giữ `apps/web` làm app đích; chuyển các route/view/logic Admin vào đó.
- Phân tách Marketing, Admin Auth và Admin Dashboard bằng layout/route groups.
- Hợp nhất cấu hình Next.js, dependencies, messages và styles theo shared packages.
- Giữ ranh giới public request và Admin-authenticated request.
- Chuyển toàn bộ dashboard routes hiện có, không chỉ trang login/dashboard.
- Cập nhật signup handoff, OAuth redirect, email/invitation links và safe returnTo.
- Cập nhật scripts, images, Compose, CI/CD và tài liệu; loại bỏ app Admin cũ
  sau khi app gộp được kiểm tra thành công.
- Chuyển và chạy tests trong cùng task, không tạo task E2E riêng.

## Implementation notes

### 1. Route contract

Route groups không thêm segment URL; prefix `/admin` phải là segment thật.

| Phạm vi               | Route mới                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Landing               | `/{locale}`                                                                                                            |
| Đăng ký Business      | `/{locale}/signup-business`                                                                                            |
| Owner login           | `/{locale}/admin/login`                                                                                                |
| Email verification    | `/{locale}/admin/verify-email`                                                                                         |
| Forgot/reset password | `/{locale}/admin/forgot-password`, `/{locale}/admin/reset-password`                                                    |
| Google onboarding     | `/{locale}/admin/onboarding/business`                                                                                  |
| Invitation            | `/{locale}/admin/invitations/{token}`                                                                                  |
| Dashboard             | `/{locale}/admin/dashboard`                                                                                            |
| Dashboard còn lại     | `/{locale}/admin/businesses`, `/admin/bookings`, `/admin/users`, `/admin/settings`, `/admin/system` cùng locale prefix |

- `/{locale}/admin` điều hướng tới dashboard hoặc login theo session hợp lệ.
- Landing vẫn truy cập được khi đã đăng nhập; không redirect root Web thành dashboard.
- Admin auth/onboarding/invitation là public routes về mặt truy cập HTTP;
  mỗi flow vẫn xác minh session/ticket/quyền bằng API.
- Dashboard routes phải được bảo vệ; cookie marker chỉ là gợi ý điều hướng,
  không phải bằng chứng xác thực hoặc thay thế backend authorization.

### 2. Layout và tổ chức code

- Chỉ một root locale layout nạp font, messages, global CSS và một Toaster.
- Marketing layout không mount Admin AuthProvider hoặc bootstrap `/auth/me`.
- Admin Auth và Dashboard dùng chung Admin session/provider boundary để callback
  bootstrap được và navigation giữa hai layout không tạo session store trùng.
- Dashboard shell/sidebar chỉ xuất hiện trong dashboard layout.
- Trang route tiếp tục là server component mỏng render view.
- View Admin được tổ chức theo namespace rõ, chẳng hạn `src/views/admin/<feature>`;
  Marketing giữ namespace riêng. Supporting files ở role folders theo AGENTS.md.
- Hợp nhất component thực sự dùng chung; không copy Button/Input/Card/Toast
  từ shared UI hoặc duy trì hai FormField tương đương không có lý do.
- Giữ message namespaces rõ; tránh ghi đè keys khi hợp nhất vi/en.
- Landing metadata giữ SEO; Admin/Auth routes `noindex` và không kế thừa
  canonical của Landing.

### 3. API client, session và cache

- API endpoints và auth context `admin` không đổi vì tên frontend app thay đổi.
- Tái sử dụng shared Axios infrastructure và interceptors đã có.
- Public registration/recovery/onboarding request không tự gắn JWT,
  Tenant/Business headers hoặc tự refresh Admin khi session onboarding hết hạn.
- Admin giữ memory-only access token, HttpOnly refresh cookie, single-flight
  refresh, session generation, logout cleanup và Business access validation.
- Không tạo Auth store/provider thứ hai cho cùng Admin session.
- Query cache phải phân tách public/private và Tenant/Business đúng; logout hoặc
  đổi session không làm lộ dữ liệu private sang tài khoản tiếp theo.
- Logout về Admin login; Landing vẫn hoạt động bình thường.

### 4. Redirect, cookies và cấu hình

- Signup manual chuyển verification trên cùng frontend origin, không tự login.
- Google Owner hiện có về Admin dashboard/returnTo; Owner mới về Admin onboarding.
- Giữ locale vi/en và query/sessionId cần thiết; không yêu cầu user copy session ID.
- Safe returnTo chỉ cho local destination hợp lệ thuộc Admin, không cho URL ngoài,
  protocol-relative URL hoặc vòng lặp về auth/onboarding. Có fallback dashboard mới.
- Cập nhật resolver URL của backend: không chỉ đổi `ADMIN_URL` sang chuỗi có `/admin`,
  vì locale và segment Admin phải được ghép đúng thứ tự `/{locale}/admin/...`.
- Rà Google success/error callback, onboarding completion, email/invitation URL,
  login EMAIL_NOT_VERIFIED và các link dashboard/sidebar.
- Google redirect URI tới API callback giữ nguyên nếu API origin/path không đổi;
  chỉ thay frontend destination. Thay URI trong Google Console chỉ khi callback thật sự đổi.
- Cookie Path/Secure/SameSite/Domain và CORS credentials được rà theo deployment
  mới; không mở rộng cookie Domain hoặc giảm bảo mật chỉ để migration hoạt động.
- Hợp nhất public-origin config/env; bỏ Admin-origin env không còn cần thiết,
  hoặc giữ compatibility có thời hạn được ghi rõ.

### 5. Deployment và tương thích

- Một Web Dockerfile/image/container phục vụ Landing + Business Admin.
- Bỏ Admin khỏi build/publish/scan/deploy matrix, Compose và health checks;
  giữ API, worker, Platform Admin và hạ tầng khác nguyên phạm vi.
- Root dev/build/lint/typecheck/test/start scripts trỏ đúng app mới; xử lý
  các lệnh `*:admin` bằng compatibility alias hoặc bỏ và cập nhật toàn bộ caller/docs.
- Cập nhật dependency lockfile bằng pnpm sau khi hợp nhất dependencies.
- Không giữ hai app chứa cùng implementation hoặc một Admin service không còn dùng.
- Nếu Admin domain cũ đã được sử dụng: lập mapping redirect ở ingress/proxy sang
  URL mới, giữ query/sessionId, tránh redirect loop và xác nhận cookie/session migration.
- Không tự bật redirect `/{locale}/login` trên Web nếu route đó có thể dành cho
  Customer Auth; old Admin host phải được xử lý đúng host boundary.
- Nếu chưa có môi trường cũ: ghi rõ không cần compatibility host thay vì thêm
  một app/service redirect không cần thiết.
- Cutover production/Google Console/ingress cần người phụ trách môi trường xác nhận.
  Task không tự deploy, sửa secret hoặc xóa container/image đang chạy.
- Có rollback về cấu hình/image frontend cũ trước cutover; không xóa image
  release trước đó chỉ vì source Admin đã được gộp.

### 6. Dọn code và tài liệu

- Kiểm tra import/script/CI/Compose không còn tham chiếu app Admin bị xóa.
- Không xóa Platform Admin hay đổi business/domain permissions.
- Cập nhật AGENTS.md, frontend folder/design-system docs, Auth route docs,
  env examples, README, onboarding hướng dẫn join repo và deployment docs liên quan.
- Ghi nhận quyết định hợp nhất frontend bằng ADR, gồm route contract,
  provider boundary, trade-off release cùng nhau và rollback/cutover.

## Output

- `apps/web` là frontend duy nhất cho Landing + Business Admin, một image/service.
- Public/Marketing, Admin Auth và Dashboard có layout/provider boundaries rõ.
- Email và Google Owner flows tiếp tục hoạt động trên route mới.
- Toàn bộ màn hình Admin hiện có được chuyển, tests và CI/CD được cập nhật.
- Platform Admin và API tiếp tục chạy độc lập, không đổi role/auth-context contract.

## Acceptance criteria

- [x] Một lệnh dev Web mở được Landing, signup và Business Admin; không cần chạy `@repo/admin`.
- [x] Landing `/{locale}` không bị session guard redirect và không gọi Admin bootstrap trên mỗi public page load.
- [x] Owner password login, reload/refresh, expired session, logout và Business context hoạt động đúng.
- [x] Signup → verification → login, resend OTP và forgot/reset password hoạt động trên route mới.
- [x] Google existing Owner → session/dashboard; new Owner → onboarding → default Business hoạt động đúng.
- [x] Google cancel/error/session-expired và EMAIL_NOT_VERIFIED đi đúng locale/route, không redirect loop.
- [x] returnTo không mở URL ngoài và không đưa user vào auth loop; query/sessionId không bị mất khi redirect.
- [x] Toàn bộ dashboard routes/sidebar links chuyển đúng, không thất lạc màn hình hoặc tạo route collision.
- [x] Landing có SEO metadata đúng; Admin/Auth `noindex`, không dùng Landing canonical.
- [x] Token của Platform/Client không trở thành Admin session; API vẫn kiểm tra role, Tenant, Business và permission.
- [x] Public request không mang Tenant/Business/JWT của Admin; logout/session switch không rò private cache.
- [x] Chỉ một Web image/container được build/publish/scan/deploy cho hai phạm vi.
- [x] Source/runtime không còn phụ thuộc `apps/admin`; Platform Admin không bị xóa hoặc đổi flow.
- [x] Web/UI token validation, lint, typecheck, tests và Web production build pass.
- [x] Auth API regression tests pass cho các thay đổi frontend redirect URL.
- [ ] Có browser smoke cho route/layout/locale và các flow chuyển đổi; Google Account thật được kiểm thử HITL trước cutover.
- [x] Compose/CI/deployment configuration được kiểm tra; old-host compatibility và rollback được ghi rõ nếu cần.
- [x] Documentation/ADR phản ánh trạng thái sau merge, không còn hướng dẫn chạy Admin service riêng.

## Verification

Sau implementation:

```bash
pnpm lint:web
pnpm typecheck:web
pnpm test:web
pnpm build:web
pnpm --filter @repo/ui validate:tokens
```

Rà script `test:web` và smoke hiện có để bao gồm tests chuyển từ Admin;
chạy thêm Auth API regression suite, Platform Admin checks, Compose validation
và browser smoke theo scripts thực tế khi triển khai.

## Không thuộc phạm vi

- Không gộp API hoặc Platform Admin vào Next.js Web.
- Không triển khai thêm feature Booking, Customer Auth, Staff invitation hoặc provider OAuth mới.
- Không thay schema, role enum, RBAC, API endpoint hoặc nội dung marketing vì việc gộp frontend.
- Không production deploy hoặc thay external credentials trong bước tạo task.

## Trạng thái

Đã triển khai migration local. Landing và Business Admin nằm trong `apps/web`;
API/Platform Admin riêng. Đã loại 129 file source/config/test tracked của Admin
cũ sau khi chuyển và kiểm tra; có thể khôi phục từ Git history. File env/cache
ignored của người dùng và container/image đang chạy không bị xóa.

## Implementation notes

- Routes: `/{locale}/admin/*`; marketing/auth/dashboard giữ layout boundaries.
- Admin session và private QueryClient chỉ mount trong Admin layout; rời Admin
  clear local credentials/cache và hủy hiệu lực response cũ, không gọi server logout.
- API URL không đổi; dùng chung shared allowlist cho OAuth/FE returnTo.
- API redirect origin dùng `WEB_URL` → `NEXT_PUBLIC_WEB_URL` → localhost:3001.
- Font/messages/CSS/Toaster/language selector và FormField dùng chung;
  một theme provider mặc định Light, Admin toggle áp dụng theme trên cả Web.
- CI/publish/Compose/deploy còn API + Web + Platform Admin images; worker giữ nguyên.
- `*:admin` scripts là alias về Web; không chạy đồng thời với `dev:web`.
- Web Docker build nhận public URL build args và copy public Landing assets.
- Không chuyển các dependency Admin không được dùng (xlsx, print/dropzone/day-picker/virtual).
- Có `NEXT_DIST_DIR` để build kiểm tra riêng khi Next dev đang chạy; không dừng
  tiến trình dev của người dùng để giải quyết xung đột `.next`.
- [ADR 0003](../adr/0003-merge-web-business-admin.md) mô tả old-host redirect,
  cookie/CORS, production variables và rollback pre-merge bằng Compose/image/env cũ.

## Kiểm tra đã chạy

- `pnpm lint:web`, `pnpm typecheck:web` (isolated dist dir), `pnpm test:web`: 54 pass.
- Web production Turbopack build: pass, 31 static pages + dynamic invitation route.
- Web/UI `validate:tokens`: pass; UI typecheck và Shared lint: pass.
- Toàn bộ API tests: 47 suites / 185 tests pass, gồm Auth 25 suites / 105 tests.
- API typecheck/build/lint: pass; lint có 902 warning sẵn có, không có error.
- Platform Admin lint/typecheck/build: pass.
- HTTP smoke 7 Auth pages trên một Web service: pass.
- Chrome browser với API mock: public vi/en không gọi Admin bootstrap dù có marker;
  locale switch, private guest redirect, Admin noindex/no canonical, Owner login,
  `/auth/me`, refresh sau reload, mobile 375px không tràn trang, Google onboarding
  readonly email/no password và submit tới dashboard đều pass.
- `docker build --check -f apps/web/Dockerfile .`: pass, không warning.
- Compose dev/prod services/config, CI/publish/deploy YAML và Bash health script:
  parse/validation pass; không thực hiện deploy, image push hoặc Trivy run local.
- Frozen/offline pnpm install: pass. `git diff --check`: pass.

## External verification còn lại (HITL)

- Đăng nhập và onboarding bằng Google Account thật trên API/env đã cấu hình.
- Xác nhận production origins, CORS/cookie compatibility và old Admin host nếu có.
- Cutover ingress/deploy và rollback drill do người phụ trách môi trường thực hiện.
  Không tự deploy, đổi secret/Google Console hay xóa container/image cũ.
