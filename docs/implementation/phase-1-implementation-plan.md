# Kế hoạch triển khai Booking System Base - Phase 1

> Tài liệu nội bộ dành cho đội phát triển. Nội dung được lập từ mã nguồn `booking-system-base` tại nhánh `develop` và phạm vi trong `Bao-gia-Booking-System-Base.md`.
>
> Ngày rà soát: 29/09/2026  
> Thời lượng mục tiêu: 13 tuần  
> Trạng thái tài liệu: Kế hoạch thực thi ban đầu

## 1. Mục tiêu

Hoàn thiện Phase 1 của nền tảng SaaS quản lý đặt lịch cho các doanh nghiệp dịch vụ. Phiên bản bàn giao phải có bốn miền sử dụng độc lập:

1. Landing page công khai trên tên miền chính.
2. Business Admin cho chủ cơ sở, quản lý, lễ tân và nhân viên.
3. Trang đặt lịch công khai theo tên miền phụ của doanh nghiệp.
4. Platform Admin cho đơn vị vận hành toàn bộ nền tảng.

Kế hoạch này không coi dự án bắt đầu từ số 0. Những thành phần đã có trong repository được tái sử dụng, kiểm tra và hoàn thiện trước khi phát triển các domain còn thiếu.

## 2. Giả định nguồn lực và cách tính timeline

- Timeline 13 tuần bám theo báo giá và giả định tối thiểu có **02 developer** làm song song:
  - Dev A: Backend/domain, database, worker và tích hợp Stripe.
  - Dev B: Web, Business Admin, Platform Admin và tích hợp API.
- Cả hai developer cùng chịu trách nhiệm viết test, review chéo, sửa lỗi tích hợp và cập nhật tài liệu.
- PO/BA hoặc người đại diện nghiệp vụ phải phản hồi trong vòng 01 ngày làm việc đối với câu hỏi chặn tiến độ.
- Nếu chỉ có 01 developer toàn thời gian, cần ước lượng lại; không nên giữ nguyên cam kết 13 tuần mà không giảm phạm vi.
- Tuần trong tài liệu là tuần tương đối tính từ ngày kickoff chính thức.

## 3. Kiến trúc và ranh giới hệ thống hiện tại

| Thành phần            | Vai trò Phase 1                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/api`            | NestJS API, Prisma/PostgreSQL, tenant/business isolation, Redis/BullMQ, email worker và Stripe webhook. |
| `apps/web`            | Landing page, đăng ký doanh nghiệp và trang đặt lịch công khai theo tenant/subdomain.                   |
| `apps/admin`          | Business Admin quản lý vận hành của một doanh nghiệp.                                                   |
| `apps/platform-admin` | Platform Admin quản lý tenant, ngành nghề, template, subscription, chính sách và liên hệ.               |
| `packages/shared`     | Contract, schema, type và constant dùng chung giữa API và các frontend.                                 |
| `packages/ui`         | UI primitive dùng chung, không chứa nội dung nghiệp vụ.                                                 |
| `packages/hooks`      | React hook tái sử dụng giữa các frontend.                                                               |

Các API nghiệp vụ phải giữ chuỗi phụ thuộc: `controller -> use case -> repository -> Prisma`. Business-scoped API phải nhận business context từ guard/decorator, không tin `tenant_id` hoặc `business_id` do client gửi tùy ý.

## 4. Hiện trạng repository tại thời điểm lập kế hoạch

### 4.1 Đã có nền tảng và có thể tái sử dụng

- Turborepo với API, Web, Business Admin, Platform Admin, Docs và shared packages.
- Docker Compose cho development/production; PostgreSQL, Redis, MinIO và email worker.
- CI tách theo package/app, dependency review và kiểm tra lỗ hổng dependency.
- i18n theo locale route cho các frontend.
- Xác thực email/password: đăng ký, đăng nhập theo context, refresh token, đăng xuất, xác minh email, đổi/quên/đặt lại mật khẩu.
- Tenant resolution, tenant context, business context và cô lập dữ liệu nền.
- Luồng đăng ký tạo tenant, owner và default business.
- Backend Google OAuth cho Owner hiện có và Google-first onboarding: identity linking, state/nonce/PKCE, onboarding session và admin refresh session.
- RBAC/permission core, invitation và quản lý user theo tenant.
- Asset upload qua local/MinIO.
- Notification core và email queue/worker nền.
- Backend CRUD cho business, category và service.
- Health check và Sentry foundation.
- Landing page UI, Business Admin shell và Platform Admin shell.

### 4.2 Đã có một phần nhưng chưa đủ điều kiện nghiệm thu

| Hạng mục              | Hiện trạng                                                                                         | Phần còn thiếu                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Landing page          | Có giao diện và nội dung minh họa.                                                                 | Pricing động, policy động, contact form thật và dữ liệu công bố từ Platform Admin.                    |
| Đăng ký doanh nghiệp  | Đã tạo tenant, owner, default business; backend Google login và Google-first onboarding cho Owner. | UI Google login/onboarding, ngành nghề, policy consent, subscription và trạng thái trial.             |
| Business Admin        | Có auth, dashboard, bookings, users, businesses, settings dưới dạng shell.                         | Thay mock data bằng domain/API thật; bổ sung toàn bộ màn hình vận hành.                               |
| Platform Admin        | Có auth, dashboard, tenant/users/system shell và một phần tenant API.                              | Tenant lifecycle đầy đủ, ngành nghề, template, subscription, policy, contact inbox và dashboard thật. |
| Category/Service      | API CRUD và unit test đã có.                                                                       | Admin UI, ảnh, staff assignment, Excel, quyền và public query.                                        |
| Notification          | Có model, API đọc/đánh dấu và scheduler nền.                                                       | Event từ booking, email xác nhận/thay đổi/hủy/nhắc lịch và liên kết notification với appointment.     |
| TenantDomain/Settings | Đã có model nền.                                                                                   | Quy trình kiểm tra subdomain, publish template/theme và trạng thái không khả dụng.                    |

### 4.3 Chưa có domain hoàn chỉnh

- Staff profile, service assignment, working hours và days off.
- Customer CRM, customer note và booking history.
- Availability engine và cơ chế chống double-booking.
- Appointment/booking, booking services, status history và internal note.
- Public booking flow, guest booking lookup và cancel request.
- Business report và Excel report export.
- Business category, template builder và template publication.
- SaaS plan, subscription, Stripe Checkout, Customer Portal và webhook.
- Policy version, publication và consent record.
- Contact message inbox, internal note, reply history và spam/archive status.

## 5. Phạm vi Phase 1 phải khóa trước khi code

### 5.1 Có trong Phase 1

- Một tenant có một cơ sở mặc định được sử dụng trong luồng Phase 1.
- Khách vãng lai đặt lịch không cần tài khoản.
- Khách chọn một hoặc nhiều dịch vụ; một nhân viên thực hiện toàn bộ dịch vụ theo thứ tự.
- Slot được tính từ giờ mở cửa, lịch nhân viên, ngày nghỉ, thời lượng, buffer và appointment hiện có.
- Tra cứu lịch bằng booking code và số điện thoại.
- Email xác nhận, thay đổi, hủy và một lần nhắc lịch theo cấu hình.
- Subscription là khoản doanh nghiệp trả để dùng nền tảng.
- Ba bộ khung template responsive, tùy chỉnh trong các option hệ thống cung cấp.

### 5.2 Không triển khai trong Phase 1

- Tài khoản khách hàng và lịch sử xuyên thiết bị.
- OTP khách vãng lai.
- Quản lý nhiều chi nhánh trên giao diện vận hành.
- Combo/gói dịch vụ.
- Waitlist.
- SMS, follow-up marketing và birthday automation.
- Custom domain.
- Trình kéo thả, HTML/CSS tùy ý hoặc component template tùy biến tự do.
- Thanh toán/đặt cọc dịch vụ của khách đặt lịch.
- Coupon subscription, hoàn tiền tự động, hóa đơn thuế và usage-based billing.
- Live chat, CRM sales và workflow SLA.
- Audit portal nâng cao; chỉ giữ log cần thiết cho booking, subscription, policy và contact.

> Lưu ý: Một số feature card cũ có combo, waitlist, SMS và audit nâng cao. Báo giá mới là nguồn phạm vi ưu tiên; không triển khai các phần trên trong Phase 1.

## 6. Các gói công việc chính

| Mã    | Gói công việc                  | Trạng thái đầu kỳ                 | Kết quả phải đạt                                                                          | Phụ thuộc           |
| ----- | ------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------- | ------------------- |
| WP-00 | Baseline và scope freeze       | Có nền tảng                       | Backlog khớp báo giá, baseline chạy được, seed và env thống nhất                          | Không               |
| WP-01 | Auth, OAuth và onboarding      | Có email auth/tenant signup       | Google OAuth, policy consent, chọn ngành nghề, tạo default business, chọn hoặc bỏ qua gói | WP-00               |
| WP-02 | Business settings và domain    | Có Business/TenantSettings/Domain | Hồ sơ cơ sở, giờ mở cửa, ngày nghỉ, logo/banner, subdomain status                         | WP-01               |
| WP-03 | Service catalog                | API CRUD đã có                    | Admin UI, ảnh, category, service, buffer, status, Excel, staff assignment                 | WP-02               |
| WP-04 | Staff và working hours         | Chưa có                           | Staff profile/account, service assignment, weekly shift, day off, personal calendar       | WP-01, WP-02        |
| WP-05 | Customer CRM                   | Chưa có                           | Customer CRUD/soft delete, search, note, booking history và Excel                         | WP-01               |
| WP-06 | Availability engine            | Chưa có                           | Tính slot, any staff, multi-service duration, buffer, timezone và chống trùng             | WP-02, WP-03, WP-04 |
| WP-07 | Public booking và guest lookup | Chưa có                           | Resolve subdomain, booking flow, booking code, lookup bằng phone và cancel request        | WP-05, WP-06        |
| WP-08 | Appointment operations         | UI mock                           | Calendar/list/detail, manual create, edit/reschedule, status machine, history/note        | WP-05, WP-06, WP-07 |
| WP-09 | Booking notifications          | Có notification/email nền         | In-app notification, email event, reminder scheduler, read/unread và appointment link     | WP-08               |
| WP-10 | Dashboard, reports và Excel    | UI mock                           | Booking/revenue estimate/service/staff reports và filtered Excel export                   | WP-08               |
| WP-11 | Tenant và business category    | Có tenant nền                     | Platform tenant lifecycle, manual provisioning, business category CRUD và counts          | WP-01               |
| WP-12 | Template platform              | Chưa có                           | 03 template frames, template builder theo option, preview/publish/restore và impact count | WP-02, WP-11        |
| WP-13 | SaaS subscription/Stripe       | Chưa có                           | Plan/limits, tenant subscription, Checkout, Portal, webhook, grace/suspend, expiry email  | WP-01, WP-11        |
| WP-14 | Policies và consent            | Chưa có                           | Draft/preview/publish/archive/version, public pages và consent record                     | WP-01, WP-11        |
| WP-15 | Contact inbox                  | Chưa có                           | Public form, rate limit, inbox/filter/status/note/reply/history/spam/archive              | WP-11               |
| WP-16 | Dynamic landing integration    | Static UI                         | Dynamic pricing, published policies, contact form và auth navigation                      | WP-13, WP-14, WP-15 |
| WP-17 | Hardening, UAT và handover     | Chưa thực hiện                    | E2E, security, responsive QA, deploy, runbook và acceptance evidence                      | Tất cả              |

## 7. Thứ tự phụ thuộc quan trọng

```text
Auth/Tenant/Business
  ├── Business settings ── Service ──┐
  ├── Staff + working hours ─────────┼── Availability ── Public booking ── Appointment operations
  └── Customer CRM ──────────────────┘                                      ├── Notifications
                                                                             └── Reports

Platform tenant/category ── Template platform
                         ├── Subscription/Stripe ── Dynamic pricing
                         ├── Policies/consent ───── Dynamic policy pages
                         └── Contact inbox ──────── Public contact form
```

Availability, appointment và Stripe webhook là ba vùng có rủi ro cao; không bắt đầu UI hoàn chỉnh trước khi contract và rule cốt lõi được test.

## 8. Timeline triển khai 13 tuần

### Tuần 1 - Khóa phạm vi và ổn định baseline

**Backend/Platform**

- Chốt schema Phase 1 và migration strategy.
- Đối chiếu permission keys theo bốn auth context.
- Chuẩn hóa seed cho Super Admin, Owner, Staff, tenant và default business.
- Kiểm tra tenant/business isolation của category/service hiện có.

**Frontend/Integration**

- Xác định route map cuối cùng cho Web, Business Admin và Platform Admin.
- Đánh dấu màn hình đang dùng mock; lập danh sách API contract phải thay thế.
- Chốt UI states dùng chung: loading, empty, error, suspended, unavailable.

**Cổng qua giai đoạn**

- Scope Phase 1 được xác nhận bằng checklist.
- CI chạy lint, typecheck, unit test và build trên nhánh tích hợp.
- Không còn feature card nào mâu thuẫn với báo giá mà chưa được ghi nhận.

### Tuần 2-4 - Business Admin và dữ liệu nền

**Tuần 2: Auth/onboarding/settings**

- Google OAuth và Google-first Business onboarding (backend F1-006/F1-007 hoàn tất; frontend được tách sang task sau).
- Policy consent trong đăng ký.
- Onboarding chọn ngành nghề, tạo default business và chọn/bỏ qua gói.
- Business profile, giờ hoạt động, ngày nghỉ, logo và ảnh bìa.

**Tuần 3: Service và staff foundation**

- Hoàn thiện Service/Category contract, ảnh và public status.
- Business Admin quản lý category/service thật, bỏ mock.
- Staff profile/account, service assignment và quyền truy cập.
- Weekly working hours và days off.

**Tuần 4: Customer và data operations**

- Customer CRUD, soft delete, search, note và dedup phone/email.
- Excel import/export cho service, staff và customer.
- Personal calendar shell dùng contract thật.
- Hoàn thiện permission matrix cho Owner/Staff.

**Cổng qua giai đoạn**

- Owner tạo được dịch vụ và nhân viên, gán nhân viên vào dịch vụ.
- Giờ hoạt động và lịch nhân viên lưu đúng timezone.
- Dữ liệu không truy cập chéo tenant/business.
- File Excel lỗi trả về danh sách lỗi theo dòng, không import một phần ngoài chủ đích.

### Tuần 5-6 - Availability và trang đặt lịch công khai

**Tuần 5: Availability engine**

- Xây `AvailabilityCalculator` thuần và unit test theo bảng trường hợp.
- Tính tổng duration + buffer cho nhiều dịch vụ tuần tự.
- Lọc business closed day, staff day off và appointment blocking status.
- Hỗ trợ any staff và validate slot lại khi submit.
- Thiết kế transaction/locking hoặc constraint để chống double-booking.

**Tuần 6: Public booking + guest lookup**

- Resolve tenant từ subdomain và kiểm tra tenant/template publication status.
- Hiển thị profile, category, service, staff và slot.
- Nhập thông tin khách vãng lai, review và confirm.
- Sinh booking code không đoán được; success page.
- Lookup bằng booking code + normalized phone; yêu cầu hủy theo rule Phase 1.
- Xử lý trạng thái: tenant suspended, domain invalid, ngoài giờ và hết slot.

**Cổng qua giai đoạn**

- Hai request đồng thời không tạo được hai appointment trùng staff/time.
- Khách đặt nhiều dịch vụ đúng thứ tự và đúng tổng thời lượng.
- Guest chỉ xem được booking khi code và phone cùng khớp đúng tenant.
- Luồng chính hoạt động trên mobile, tablet và desktop.

### Tuần 7-8 - Vận hành lịch, CRM, thông báo và báo cáo

**Tuần 7: Appointment operations**

- Calendar ngày/tuần, list, filter và detail drawer.
- Tạo thủ công, chỉnh dịch vụ/nhân viên/thời gian và reschedule.
- State machine: pending, confirmed, checked-in, in-progress, completed, cancelled, no-show.
- Internal note và status history gồm actor/time/before/after.
- Customer detail hiển thị booking history.

**Tuần 8: Notifications, dashboard và reports**

- Event-driven email khi create/reschedule/cancel.
- Một reminder job trước lịch theo cấu hình.
- Notification page: list/filter/detail/read/unread/open appointment.
- Dashboard dùng dữ liệu thật.
- Report booking status, estimated revenue, top services và staff completion.
- Excel export theo filter đang áp dụng.

**Cổng qua giai đoạn**

- Mọi transition sai đều bị từ chối ở use case, không chỉ ở UI.
- Reschedule chạy lại availability validation.
- Completed appointment xuất hiện đúng trong estimated revenue.
- Cancelled/no-show/completed không nhận reminder sai.

### Tuần 9-10 - Platform Admin, ngành nghề và template

**Tuần 9: Tenant và business category**

- Platform login/context tách biệt.
- Dashboard tenant/subscription/category/template/contact dùng dữ liệu thật theo phần đã có.
- Tenant list/detail/search/filter/status history.
- Manual tenant provisioning.
- Suspend/reactivate và chặn booking mới khi suspended.
- Business category CRUD, ordering, active status và usage counts.

**Tuần 10: Template platform**

- Model template, version/publication state và category assignment.
- 03 template frames responsive.
- Builder theo option: layout preset, brand colors, font, sections và supported components.
- Tenant chọn template, preview desktop/mobile, publish và restore defaults.
- Hiển thị số tenant bị ảnh hưởng trước khi publish thay đổi global template.
- Giữ tenant logo/color/content override khi global template cập nhật.

**Cổng qua giai đoạn**

- Không cho hard delete category/template đang được dùng.
- Template draft không ảnh hưởng trang public.
- Tenant suspended hoặc template chưa publish không nhận booking mới.
- Không có đường chỉnh HTML/CSS tùy ý trong Phase 1.

### Tuần 11-12 - Subscription, chính sách, liên hệ và landing động

**Tuần 11: Subscription và Stripe**

- Plan CRUD, monthly/yearly price, currency, trial, featured, benefits và limits.
- Tenant subscription list/detail/assign/change.
- Stripe Checkout và Customer Portal.
- Webhook signature verification, idempotency và event audit tối thiểu.
- Trạng thái active, trialing, past_due, grace, cancelled và suspended mapping.
- Email sắp hết hạn; số ngày cấu hình từ Platform Admin, mặc định 01 ngày.
- Landing pricing đọc plan đã publish.

**Tuần 12: Policies và contact inbox**

- Policy type/version/draft/published/archived/effective date.
- Public policy page chỉ hiển thị phiên bản có hiệu lực.
- Consent record lưu user, policy type/version/time.
- Contact form validation, throttling và spam protection cơ bản.
- Platform inbox: unread count, search/filter/detail/status/note/reply/archive/spam/history.
- Email phản hồi contact và notification khi có message mới.
- Hoàn thiện landing integration và nội dung bàn giao.

**Cổng qua giai đoạn**

- Không lưu dữ liệu thẻ; chỉ dùng Stripe-hosted Checkout/Portal.
- Webhook gửi lặp không kích hoạt subscription hai lần.
- Có thể bỏ qua chọn gói và vẫn vào trạng thái trial/pending theo cấu hình.
- Policy đã publish không bị sửa trực tiếp; thay đổi tạo version mới.
- Business Admin không truy cập contact inbox của Platform Admin.

### Tuần 13 - Hardening, UAT, triển khai và bàn giao

- Chạy regression toàn bộ bốn miền.
- E2E các luồng P0 nêu tại mục 10.
- Responsive QA trên mobile/tablet/desktop.
- Kiểm tra RBAC, tenant leakage, rate limit và public enumeration risk.
- Kiểm tra migration trên bản sao dữ liệu staging và rehearsal rollback.
- Smoke test email worker, reminder scheduler và Stripe webhook.
- Deploy staging/UAT; sửa lỗi blocker/critical/high trong phạm vi.
- Chốt runbook, env matrix, seed, hướng dẫn Stripe, policy và contact inbox.
- Tạo acceptance evidence theo 24 tiêu chí trong báo giá.

## 9. Phân rã công việc theo vertical slice

Mỗi feature không tách thành “làm hết backend rồi mới làm frontend”. Một slice hoàn chỉnh phải đi qua contract, database/API, UI và test. Ví dụ availability được chia như sau:

1. Slot theo business hours cho một service và một staff.
2. Loại staff day off và appointment hiện có.
3. Multi-service duration + buffer.
4. Any-staff assignment.
5. Validate lại và chống race condition khi confirm.
6. Public slot picker và empty/unavailable states.

Quy ước branch đề xuất:

```text
feat/BKG-<id>-<short-name>
fix/BKG-<id>-<short-name>
```

Branch tạo từ `develop`, merge bằng pull request; `main` chỉ nhận bản release đã qua UAT.

## 10. Chiến lược kiểm thử

### 10.1 Unit test bắt buộc

- Availability: timezone, closed day, staff off, overlap, buffer, multi-service và any staff.
- Appointment status transition và reschedule.
- Customer dedup và guest lookup ownership.
- Plan limit và subscription status mapping.
- Stripe webhook idempotency/signature.
- Policy publication/version/consent.
- Contact status transition và permission.

### 10.2 Integration/API test

- Tenant/business context không bị client giả mạo.
- Tạo booking transactionally và chống trùng.
- CRUD service/staff/customer có scope đúng.
- Email job được enqueue đúng event, không kiểm thử bằng cách gửi email thật.
- Excel import validation và export filter.

### 10.3 E2E P0 trước UAT

1. Owner đăng ký email, consent policy, tạo tenant/default business và bỏ qua gói.
2. Owner đăng nhập Google, chọn gói, thanh toán Stripe test mode và subscription active qua webhook.
3. Owner tạo service/staff/schedule; guest đặt nhiều service từ subdomain và nhận code/email.
4. Hai guest chọn cùng slot; chỉ một booking được tạo thành công.
5. Guest lookup bằng code + phone và gửi yêu cầu hủy.
6. Admin reschedule/cancel/complete; history, notification và report cập nhật đúng.
7. Platform Admin suspend tenant; trang booking ngừng nhận lịch mới và hoạt động lại sau reactivate.
8. Platform Admin publish policy/template/plan; landing và tenant booking page phản ánh đúng trạng thái.
9. Contact form tạo message; Platform Admin xử lý, ghi chú và gửi email phản hồi.

## 11. Definition of Done cho mỗi ticket

Một ticket chỉ được đóng khi thỏa tất cả điều kiện áp dụng:

- Acceptance criteria được thể hiện bằng test hoặc bằng chứng kiểm tra rõ ràng.
- Không dùng mock data trong luồng được bàn giao.
- API contract dùng chung được đặt trong `packages/shared` nếu có nhiều app sử dụng.
- Backend business logic nằm trong use case/domain service, không nằm trong controller.
- Có unit test cho success, business error, permission/scope và edge case quan trọng.
- Tenant/business isolation và permission được kiểm tra.
- Loading, empty, error, forbidden và unavailable states đã xử lý.
- UI có i18n và responsive.
- Migration, seed và env example được cập nhật nếu cần.
- Logging không lộ token, password, phone đầy đủ hoặc dữ liệu nhạy cảm.
- Lint, typecheck, unit test và build của app bị ảnh hưởng đều pass.
- PR có mô tả phạm vi, ảnh/video UI nếu có và hướng dẫn kiểm thử.

## 12. Các quyết định kỹ thuật phải chốt trong Tuần 1

1. Quy tắc slot interval và cách làm tròn thời gian.
2. Buffer trước/sau được tính cho từng service hay toàn appointment.
3. Trạng thái appointment nào giữ slot.
4. Cơ chế chống trùng: transaction + advisory lock, exclusion constraint hoặc chiến lược tương đương.
5. Timezone lưu UTC, render theo business timezone; quy tắc khi timezone thay đổi.
6. Guest cancel là hủy trực tiếp hay tạo yêu cầu để Business Admin duyệt.
7. Trial duration, grace period và thời điểm suspend tenant.
8. Plan limit nào enforce trong Phase 1 và thông báo khi vượt limit.
9. Ba template frames và danh sách option được phép tùy chỉnh.
10. Danh sách policy bắt buộc consent tại signup.
11. Contact subject/status enum và địa chỉ email gửi phản hồi.
12. Tần suất reminder và cách xử lý booking tạo sát giờ hẹn.

## 13. Rủi ro và biện pháp kiểm soát

| Rủi ro                               | Ảnh hưởng                  | Kiểm soát                                                                                    |
| ------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------- |
| Availability race condition          | Double-booking             | Unit test overlap, integration concurrency test và transaction/lock tại confirm.             |
| Sai timezone                         | Slot/email sai giờ         | Lưu UTC, business timezone bắt buộc, test qua ranh giới ngày.                                |
| Stripe account/webhook chậm          | Chặn subscription          | Chốt test account Tuần 1, dùng Stripe CLI/test mode và webhook replay.                       |
| Template builder phình phạm vi       | Trễ Tuần 10                | Khóa 03 frame và option whitelist; không HTML/CSS tùy ý.                                     |
| Email vào spam hoặc provider lỗi     | Khách không nhận thông báo | Delivery log, retry giới hạn, staging mailbox và cấu hình SPF/DKIM do bên vận hành cung cấp. |
| Dữ liệu/nội dung khách cung cấp chậm | Chậm UAT                   | Dùng seed chuẩn; đặt deadline nội dung trước Tuần 11.                                        |
| Tenant leakage                       | Sự cố bảo mật nghiêm trọng | Repository scope bắt buộc và negative integration tests cho mọi domain.                      |
| Feature card cũ vượt báo giá         | Scope creep                | Báo giá là nguồn ưu tiên; mọi thay đổi đi qua change request.                                |

## 14. Theo dõi tiến độ

Mỗi tuần cập nhật bảng sau trong buổi review:

| Chỉ số           | Cách theo dõi                                            |
| ---------------- | -------------------------------------------------------- |
| Scope completion | Số acceptance criteria đạt/tổng theo gói công việc.      |
| Quality          | Test pass rate, blocker/critical/high bugs đang mở.      |
| Integration      | Số vertical slice chạy được end-to-end trên staging.     |
| Delivery risk    | Dependency ngoài đội phát triển và số ngày đang bị chặn. |
| UAT readiness    | Số tiêu chí nghiệm thu báo giá đã có evidence.           |

Trạng thái ticket chỉ dùng: `Backlog`, `Ready`, `In Progress`, `Review`, `QA`, `Blocked`, `Done`.

## 15. Sản phẩm kết thúc kế hoạch

- Bốn ứng dụng/miền Phase 1 hoạt động trên môi trường thống nhất.
- Ba template responsive ban đầu.
- Stripe Checkout, Customer Portal và webhook cho SaaS subscription.
- Email booking và reminder worker.
- Policy/version/consent và contact inbox.
- Migration, seed, env example và deployment configuration.
- Runbook vận hành, hướng dẫn nghiệp vụ và checklist rollback.
- Test report và acceptance evidence bám 24 tiêu chí của báo giá.

## 16. Kiểm tra baseline đã thực hiện khi lập tài liệu

- `git status`: working tree sạch trên nhánh `develop`.
- Lint pipeline hiện chạy hết nhưng API còn nhiều warning TypeScript/unsafe; cần quản lý dần trong các file chạm tới, không mở rộng warning mới.
- Typecheck/test trong phiên rà soát không thể kết luận pass/fail vì môi trường đọc hiện tại không cho Turborepo/TypeScript ghi cache và `packages/shared/dist`. Đội phát triển phải chạy lại trong workspace ghi được ở Tuần 1.
- Script đúng trong repository là `pnpm test:api`; README hoặc tài liệu nào còn dùng `test:be` phải được đồng bộ lại.
