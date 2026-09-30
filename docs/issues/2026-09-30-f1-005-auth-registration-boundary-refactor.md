# [F1-005-R] - Tối giản Auth registration và Tenant provisioning boundary

## Problem Statement

Phase hiện tại chỉ có một public registration flow: người dùng đăng ký để trở thành `OWNER`, đồng thời hệ thống tạo Tenant, default Business và BusinessMembership. Sau khi xác thực email, Owner đăng nhập Business Admin và quản lý Staff bằng invitation.

Code hiện tại biểu diễn cùng một registration concern ở hai nơi:

- Auth có generic user registration, chủ yếu tạo một user mặc định.
- Tenant có public tenant signup nhưng đồng thời hash password, tạo verification session, phát OTP và gửi email.
- Tenant phụ thuộc ngược vào Auth để hoàn thành signup.
- Public Web gọi Tenant signup trong khi email verification và login lại thuộc Auth.

Cấu trúc này khiến developer phải tìm một registration flow qua nhiều module, dễ tạo thêm use case trùng lặp và làm ranh giới Auth/Tenant khó mở rộng.

## Solution

Giữ kiến trúc tối giản với một public owner-registration flow trong Auth và không tạo thêm Onboarding module.

Public contract cuối cùng:

- `POST /auth/register` là public registration endpoint duy nhất.
- Registration luôn tạo `OWNER`; không nhận role từ client.
- Request chứa thông tin Owner, Tenant và optional default Business/domain settings.
- Response trả Tenant, default Business, Owner chưa xác thực và email-verification `sessionId`.
- Registration không cấp access/refresh token. Owner phải xác thực email rồi đăng nhập bằng Admin Auth.
- Không duy trì public Customer registration trong phase này.
- Staff không dùng public registration; Staff tham gia Tenant qua invitation do Owner tạo.
- Super Admin tiếp tục dùng platform provisioning/login riêng.

Auth sở hữu registration workflow: credential validation, identity uniqueness, password hashing, verification session, OTP và email. Tenant chỉ cung cấp một operation sâu để provision Tenant, default Business, Owner record và membership trong một database transaction. Tenant không import Auth.

## Commits

### Commit 1 - Khóa behavior hiện tại bằng characterization tests

- Giữ test cho happy path owner registration.
- Khẳng định Owner luôn có role `OWNER`, status `ACTIVE`, `is_verified = false`.
- Khẳng định default Business và Owner membership được tạo cùng transaction.
- Khẳng định email được normalize trước khi lưu.
- Khẳng định transaction lỗi sẽ cleanup verification session.
- Khẳng định email queue lỗi không làm mất workspace đã tạo.
- Chạy tenant/auth tests trước khi di chuyển code.

Codebase phải tiếp tục pass mà chưa đổi endpoint hoặc behavior.

### Commit 2 - Tạo operation Tenant provisioning có interface hẹp

- Tách phần kiểm tra Tenant slug/domain và phần transaction khỏi public signup workflow.
- Đặt tên operation theo hành vi Tenant, ví dụ `CreateTenantWorkspace` thay vì `Signup` hoặc `Register`.
- Input nhận dữ liệu Owner đã được Auth validate và hash password.
- Operation tạo Tenant, TenantSettings, optional primary domain, default Business, Owner record và BusinessMembership.
- Operation không tạo OTP, không tạo verification session, không gửi email và không phụ thuộc HTTP DTO.
- Giữ facade signup hiện tại tạm thời gọi operation mới để endpoint cũ vẫn hoạt động trong commit này.

Codebase phải tiếp tục pass với API behavior không đổi.

### Commit 3 - Đảo dependency về đúng chiều

- Tenant export operation provisioning vừa tách.
- Xóa dependency Tenant → Auth.
- Auth được phép import public operation của Tenant.
- Verification session tiếp tục thuộc Auth vì nó là auth state.
- Email và OTP chỉ được gọi từ Auth registration workflow.
- Thêm module wiring test hoặc application bootstrap test để phát hiện circular/missing provider.

Codebase phải build và Nest dependency injection phải resolve thành công.

### Commit 4 - Chuẩn hóa owner-registration contract

- Đổi shared contract từ tenant-signup terminology sang owner-registration terminology.
- Contract chứa ba nhóm dữ liệu rõ ràng: owner identity/credential, tenant account và default Business options.
- Password tối thiểu 8 ký tự và confirm password được giữ nguyên.
- Email được normalize tại backend; client normalization chỉ hỗ trợ UX.
- Response bắt buộc có Tenant, default Business, Owner và verification `sessionId`.
- Không cho client truyền `role`, `is_verified`, `status`, `tenant_id` hoặc `is_default`.
- Có thể giữ type alias deprecated trong một commit để các consumer chưa migrate vẫn build; alias phải được xóa ở commit cleanup.

Codebase phải typecheck trước khi chuyển endpoint.

### Commit 5 - Thêm `RegisterOwner` workflow trong Auth

- Auth kiểm tra email, username và optional phone uniqueness.
- Auth kiểm tra confirm password và hash password.
- Auth tạo purpose-bound `email_verification` session.
- Auth gọi Tenant provisioning operation với Owner role cố định và password đã hash.
- Nếu provisioning thất bại, Auth cleanup verification session và trả lỗi gốc.
- Sau khi workspace được tạo, Auth phát OTP 6 chữ số với TTL/rate-limit hiện có và queue email.
- Nếu queue email thất bại, registration vẫn trả workspace cùng session để người dùng có thể resend.
- Không phát access token hoặc refresh cookie khi registration thành công.
- Thêm use-case tests qua public `execute` interface, không test private helper.

Codebase phải pass cả test mới lẫn endpoint cũ.

### Commit 6 - Chuyển public endpoint sang Auth

- `POST /auth/register` gọi `RegisterOwner` workflow và nhận owner-registration DTO mới.
- Xóa dependency vào generic user registration khỏi Auth controller.
- Giữ `/tenants/signup` dưới dạng compatibility delegate trong đúng một giai đoạn chuyển tiếp nếu cần để Web không gãy giữa các commit.
- Hai endpoint tạm thời phải trả cùng response contract và cùng security behavior.
- Cập nhật controller tests để xác nhận registration không đặt cookie/token và không nhận role từ client.

Codebase phải build và cả endpoint mới/lớp compatibility phải hoạt động.

### Commit 7 - Chuyển Public Web sang Auth registration

- Web service gọi `/auth/register` thay vì `/tenants/signup`.
- Đổi naming trong service/view từ tenant signup sang owner registration.
- Giữ form tạo workspace hiện tại; không tạo một form Customer riêng.
- Success state tiếp tục dẫn tới Admin verify-email bằng `sessionId` và locale hiện tại.
- Nội dung UI nói rõ workspace/default Business đã tạo nhưng Owner phải verify email trước khi login.
- Giữ loading, field validation và API error state hiện tại.

API và Web phải typecheck/build trước khi xóa endpoint cũ.

### Commit 8 - Xóa registration implementation trùng lặp

- Xóa `/tenants/signup` compatibility endpoint.
- Xóa Tenant signup controller dependency, DTO và public signup use case cũ.
- Xóa generic Customer `RegisterUser` workflow vì Customer registration ngoài phạm vi phase này.
- Xóa shared tenant-signup aliases sau khi không còn consumer.
- Tenant controller chỉ giữ các Tenant endpoint thực sự thuộc Tenant.
- Tenant module không import Auth, Verification hoặc Email chỉ để phục vụ registration.
- Rà toàn repo để không còn `SignupTenant`, generic `RegisterUser` hoặc `/tenants/signup` runtime reference.

Codebase phải lint, typecheck, test và build sau khi cleanup.

### Commit 9 - Đồng bộ tài liệu và architecture decision

- Ghi rõ public registration duy nhất tạo Owner + Tenant + default Business.
- Ghi rõ registration, verification và login là ba bước khác nhau.
- Ghi rõ Owner/Staff dùng Admin Auth; Staff chỉ tham gia qua invitation.
- Ghi rõ Super Admin không có public registration.
- Xóa tài liệu Customer registration và `/tenants/signup` trong phase hiện tại.
- Ghi dependency direction Auth → Tenant provisioning và cấm Tenant → Auth.
- Cập nhật F1 card, API docs và local issue status.

Không thay đổi runtime behavior trong commit tài liệu.

## Decision Document

- Không tạo `OnboardingModule`.
- Chỉ có một public registration flow trong phase hiện tại.
- Public registration tạo Owner, Tenant và default Business.
- Endpoint cuối cùng là `POST /auth/register`.
- `/tenants/signup` bị xóa sau giai đoạn migration nội bộ.
- Generic Customer registration bị xóa khỏi phase hiện tại.
- Owner role do server cố định; client không được chọn role.
- Owner mới là `ACTIVE` nhưng chưa verified.
- Registration không tự login và không cấp token.
- Owner và Staff đăng nhập bằng Admin Auth sau khi account hợp lệ.
- Staff chỉ được tạo qua invitation.
- Auth sở hữu credential, password hashing, identity checks, OTP, verification session và email verification workflow.
- Tenant sở hữu Tenant/default Business/domain/settings và transaction provisioning.
- Tenant provisioning có interface hẹp và không biết OTP/email/HTTP DTO.
- Auth phụ thuộc Tenant provisioning; Tenant không phụ thuộc Auth.
- Default Business và BusinessMembership là invariant bắt buộc của owner registration.
- Không thay đổi Prisma schema trong refactor này.

## Testing Decisions

- Tests kiểm tra behavior qua controller/use-case/repository public interface, không gọi private helper.
- Auth tests kiểm tra identity uniqueness, password mismatch, Owner role cố định, verification session, OTP/email và cleanup behavior.
- Tenant tests kiểm tra atomic transaction, default Business invariant và Owner membership.
- Controller tests kiểm tra `/auth/register` contract, không trả token/cookie và không nhận role từ client.
- Web được kiểm tra bằng lint, TypeScript và production build; nếu thêm UI test, ưu tiên kiểm tra endpoint được gọi và verification URL được tạo đúng.
- Giữ các tenant/auth tests hiện có làm prior art; đổi tên theo behavior mới thay vì chỉ sửa import để test pass.
- Mỗi commit chạy test phạm vi bị chạm; trước cleanup và bàn giao chạy full shared/API tests, API/Web lint, typecheck và production build.

## Out of Scope

- Customer registration/login trong public Web.
- Google OAuth.
- Subscription/package selection và Stripe checkout.
- Thay đổi Platform Admin login/provisioning.
- Thay đổi refresh-token/session policy.
- Thêm Business assignment vào Staff invitation.
- Migration lưu `business_ids` trên invitation hoặc tạo invitation-business join table.
- UI quản lý Staff/BusinessMembership mới.

Staff invitation hiện chưa tạo BusinessMembership khi accept. Đây là khoảng trống nghiệp vụ cần một task riêng sau refactor, không nên trộn vào việc di chuyển owner registration boundary.

## Further Notes

- Kế hoạch ưu tiên compatibility ngắn hạn giữa các commit nhưng trạng thái cuối không giữ hai registration endpoint hoặc hai contract alias.
- Không dùng từ “login” cho bước tạo tài khoản. Luồng chuẩn là Register → Verify email → Admin login.
- Nếu Customer auth được bổ sung ở phase sau, tạo `RegisterCustomer` workflow riêng; không mở rộng `RegisterOwner` bằng role switch hoặc condition phức tạp.
