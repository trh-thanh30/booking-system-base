# [F1-012] - Hiển thị Tenant slug trên domain Business Admin

Branch: `feat/f1-012-admin-tenant-vanity-subdomain`

Loại: AFK cho source code và kiểm tra local; HITL cho wildcard DNS/TLS ở môi trường deploy.

Blocked by: F1-009, ARCH-001

## Goal

Sau khi Owner đăng nhập hoặc hoàn tất onboarding, Business Admin sử dụng URL có
Tenant slug để người dùng dễ nhận biết workspace đang mở, ví dụ:

```text
http://acme.localhost:3001/en/admin/dashboard
https://acme.app.bookingbase.com/en/admin/dashboard
```

Tenant slug trên hostname chỉ phục vụ nhận diện và làm URL rõ ràng hơn. Hostname
không phải nguồn xác định Tenant, không thay thế session, không cấp quyền và không
được dùng để chọn dữ liệu. Tenant/Business context tiếp tục lấy từ Auth Profile đã
xác thực và được gửi bằng `x-tenant-id`/`x-business-id` theo contract hiện tại.

## Trạng thái hiện tại

Đã có:

- Business Admin chạy trong `apps/web` tại `/{locale}/admin/*`.
- Owner login/onboarding trả hoặc bootstrap được Auth Profile có Tenant slug.
- Admin API client dùng Tenant ID và Business ID từ session/context đã xác thực.
- Backend kiểm tra Tenant/Business access; hostname không phải bằng chứng phân quyền.
- Public booking domain và Tenant domain model đã tồn tại cho các use case riêng.

Còn thiếu:

- Cấu hình base domain riêng cho Admin workspace vanity URL.
- Helper tạo URL Admin an toàn từ Tenant slug, locale và local path.
- Redirect sang Tenant hostname sau login/onboarding thành công.
- Canonical redirect khi Owner đã đăng nhập nhưng đang ở base host hoặc hostname có
  slug không khớp Tenant trong Auth Profile.
- CORS, wildcard DNS/TLS và tài liệu môi trường cho Admin subdomain.
- Tests bảo đảm hostname không tham gia chọn Tenant hoặc cấp quyền dữ liệu.

## Input

- Tenant slug từ onboarding response hoặc Auth Profile đã được backend xác thực.
- Locale hiện tại, chỉ hỗ trợ `vi` và `en`.
- Local Admin destination hợp lệ, mặc định `/{locale}/admin/dashboard`.
- Cấu hình public cho Admin workspace base domain theo môi trường.
- Admin session, active Business và request headers hiện có.

## Phạm vi

- Dùng URL `{tenantSlug}.{adminWorkspaceBaseDomain}/{locale}/admin/*` cho các trang
  Admin private sau khi đã biết Tenant từ session.
- Development dùng `{tenantSlug}.localhost:3001`.
- Production dùng base domain cấu hình riêng, ví dụ
  `{tenantSlug}.app.bookingbase.com`.
- Sau login thành công, chuyển full-page navigation sang Tenant hostname và giữ
  locale cùng safe local `returnTo` nếu có.
- Sau onboarding thành công, chuyển sang Tenant hostname tại Admin dashboard.
- Khi bootstrap session trên base host hoặc sai Tenant slug, canonical redirect về
  hostname được tạo từ `profile.tenant.slug`.
- Giữ các route chưa biết Tenant như login, verification, recovery và onboarding
  hoạt động trên base host; không ép hostname trước khi có Auth Profile hợp lệ.
- Giữ nguyên cơ chế chọn active Business trong một Tenant. Đổi Business không đổi
  hostname vì slug đại diện Tenant, không đại diện Business.
- Bổ sung cấu hình CORS/origin và hướng dẫn wildcard DNS/TLS cần thiết để trình
  duyệt có thể mở Admin trên subdomain.
- Thêm unit/integration tests cho URL builder, redirect và tenant isolation.

## Implementation notes

### URL contract

- Tenant slug phải lấy từ response/profile đáng tin cậy, không lấy trực tiếp từ
  query string, `returnTo`, form input hoặc hostname hiện tại để tạo canonical URL.
- Helper chỉ nhận local Admin path đã được kiểm tra; không cho external URL,
  protocol-relative URL hoặc hostname tùy ý.
- Giữ locale và query cần thiết khi chuyển host, nhưng không giữ query chứa token
  hoặc onboarding credential sau khi flow đã consume thành công.
- Dùng full-page navigation khi đổi hostname; router navigation chỉ dùng khi vẫn
  cùng origin.
- Không dùng public booking domain config cho Admin nếu hai loại domain có lifecycle
  hoặc hạ tầng khác nhau; khai báo Admin workspace base domain riêng.

### Tenant và security boundary

- Auth Profile/session là nguồn Tenant duy nhất cho Admin sau đăng nhập.
- API client tiếp tục gửi `x-tenant-id` và `x-business-id` từ authenticated context.
- Backend tiếp tục kiểm tra user thuộc Tenant và có quyền truy cập Business.
- Nếu hostname slug không khớp `profile.tenant.slug`, frontend chỉ canonical redirect;
  tuyệt đối không đổi Tenant context theo hostname.
- Không gọi Tenant resolve API để chọn Admin Tenant từ subdomain.
- Không tạo/cập nhật `TenantDomain`, `primary_domain` hoặc domain verification vì
  vanity Admin hostname không phải public booking/custom domain.
- Người dùng sửa hostname thủ công không thể xem dữ liệu của Tenant khác.

### Auth và navigation

- Login/onboarding thành công phải hoàn tất hoặc bootstrap được profile trước khi
  dựng Tenant hostname.
- `returnTo` chỉ được áp dụng sau khi qua validation hiện có và phải nằm trong
  `/{locale}/admin/*`.
- Reload trực tiếp trên Tenant hostname phải khôi phục Admin session bình thường.
- Logout về Admin login trên base host hoặc một canonical auth host thống nhất;
  không phụ thuộc slug của session vừa bị xóa.
- Session expired giữ hành vi hiện có và không gây redirect loop giữa base host với
  Tenant host.

### Environment và deployment

- Document biến môi trường cho Admin workspace base domain ở local, preview và
  production.
- Production cần wildcard DNS và wildcard TLS cho Admin workspace domain.
- API CORS chỉ chấp nhận base origin và Tenant subdomain khớp suffix cấu hình; không
  mở `*` khi dùng credentials.
- Rà cookie `Domain`, `SameSite`, `Secure` và API origin. Không mở rộng cookie sang
  toàn bộ subdomain nếu cookie hiện chỉ cần gửi tới API host.
- Wildcard hostname phải được cấu hình cho platform/ingress trước production cutover.

## Modules dự kiến liên quan

- Web site/public environment config.
- Admin auth provider/session bootstrap.
- Login success redirect.
- Owner business onboarding success redirect.
- Admin route guard/canonical host redirect.
- Safe `returnTo` và URL utilities.
- API CORS/cookie configuration nếu origin allowlist hiện chỉ hỗ trợ một Web origin.
- Web/Auth tests và environment/deployment documentation.

## Output

- Owner sau login/onboarding thấy Tenant slug trên URL Admin.
- URL Admin có dạng `{tenantSlug}.{adminWorkspaceBaseDomain}/{locale}/admin/*`.
- URL thể hiện workspace hiện tại nhưng không quyết định Tenant hoặc Business data.
- Đổi Business trong cùng Tenant không đổi hostname.
- Base-host/sai-slug được canonicalize theo Tenant trong Auth Profile.
- Tenant isolation và authorization hiện tại không thay đổi.

## Acceptance criteria

- [ ] Sau password login thành công, Owner được đưa đến Tenant hostname đúng slug.
- [ ] Sau Google login/onboarding thành công, Owner được đưa đến Tenant hostname đúng slug.
- [ ] Redirect giữ đúng locale `vi`/`en` và safe local `returnTo`.
- [ ] Development hoạt động với `{tenantSlug}.localhost:3001`.
- [ ] Production URL được dựng từ Admin workspace base domain cấu hình, không hardcode.
- [ ] Reload trực tiếp một Admin private route trên Tenant hostname khôi phục session.
- [ ] Truy cập Admin private route trên base host khi đã đăng nhập được canonical
      redirect về slug trong Auth Profile.
- [ ] Slug hostname sai không đổi authenticated Tenant; hệ thống redirect về slug
      đúng hoặc từ chối an toàn, không hiển thị dữ liệu Tenant khác.
- [ ] Sửa hostname thủ công không làm thay đổi `x-tenant-id`, `x-business-id` hoặc
      active Business trong session.
- [ ] Đổi active Business trong cùng Tenant không đổi hostname.
- [ ] Public auth/onboarding routes vẫn mở được trên canonical base host trước khi
      biết Tenant.
- [ ] Logout/session-expired không tạo redirect loop giữa base host và Tenant host.
- [ ] Không tạo TenantDomain, không gọi tenant resolver và không thay schema/database
      cho vanity Admin subdomain.
- [ ] CORS chỉ cho phép origin hợp lệ thuộc Admin workspace base domain; không dùng
      wildcard `*` với credentials.
- [ ] Wildcard DNS/TLS và biến môi trường production được document rõ để HITL setup.
- [ ] Web/Auth tests, lint, typecheck và build pass.

## Verification

```bash
pnpm lint:web
pnpm typecheck:web
pnpm test:web
pnpm build:web
pnpm lint:api
pnpm typecheck:api
pnpm test:api -- --runInBand
pnpm build:api
```

Browser smoke cần xác nhận:

- Login trên base host → Tenant hostname.
- Onboarding trên base host → Tenant hostname.
- Reload deep link trên Tenant hostname.
- Sai slug → canonical slug từ Auth Profile.
- Đổi Business không đổi hostname.
- Logout và session-expired không redirect loop.

## Ngoài phạm vi

- Resolve Tenant hoặc truy vấn dữ liệu dựa trên Admin hostname.
- Thay đổi authorization, RBAC, Tenant/Business headers hoặc membership rules.
- Public booking subdomain và custom domain management thuộc F10.
- Ghi Admin vanity hostname vào `tenant_domains`.
- Domain verification, custom domain, DNS automation hoặc cấp TLS certificate tự động.
- Dùng Business slug trên hostname.
- Thay đổi mô hình một Tenant có nhiều Business.
