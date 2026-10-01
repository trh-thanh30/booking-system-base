# [F1-008] - Chuẩn hóa Auth Profile và Business Access

## Mục tiêu

Hoàn thiện contract backend cho các client khởi tạo phiên đăng nhập từ `/auth/me`, đồng thời bảo đảm Tenant và Business được chọn luôn nằm trong phạm vi truy cập của Owner hoặc Staff.

Task này chỉ triển khai backend API; không thay đổi `apps/admin`, `apps/web` hoặc `apps/platform-admin`.

## Phạm vi triển khai

### Auth profile

- `SUPER_ADMIN` nhận `tenant_id=null`, `tenant=null`, `businesses=[]` và quyền toàn cục.
- `OWNER` nhận Tenant của tài khoản, toàn bộ Business trong Tenant và quyền toàn cục trong Tenant.
- `STAFF` nhận Tenant của tài khoản, chỉ Business có `BusinessMembership` hợp lệ trong cùng Tenant và permission keys được cấp.
- Business summaries giữ `is_default` để client xác định default Business mà không hard-code.

### JWT tenant binding

- Access token và refresh token chứa `tenant_id` cùng `auth_context`.
- Login bằng password, Google login, Google onboarding và refresh đều phát hành token với `tenant_id` hiện tại từ database.
- Refresh token bị từ chối và revoke nếu `tenant_id` trong token khác Tenant hiện tại của tài khoản.

### Tenant access

- Các route có `@RequireTenant()` chỉ chấp nhận token `admin` của `OWNER` hoặc `STAFF`.
- `x-tenant-id` phải trùng `tenant_id` đã ký trong access token.
- Token `client`, Platform Super Admin hoặc Admin thuộc Tenant khác không thể dùng header để giả mạo Tenant context.
- Tenant phải ở trạng thái `ACTIVE`.

### Business access

- `GET /businesses` trả toàn bộ Business trong Tenant cho Owner.
- `GET /businesses` chỉ trả Business có membership cùng Tenant cho Staff.
- `x-business-id` tiếp tục được `BusinessGuard` kiểm tra theo Tenant, user membership và trạng thái Business.
- Repository query ràng buộc đồng thời `business.tenant_id` và `membership.tenant_id` để ngăn membership dữ liệu sai làm lộ Business chéo Tenant.

## API contract liên quan

- `GET /auth/me`
- `GET /businesses`
- `GET /businesses/current`
- Mọi endpoint có `@RequireTenant()` hoặc `@RequireBusiness()`.

Không thêm endpoint mới trong task này.

## Kiểm thử

- JWT chứa đúng `tenant_id` và `auth_context`.
- Admin login phát hành token gắn với Tenant.
- Refresh token cũ bị từ chối sau khi tài khoản đổi Tenant.
- Staff profile không trả Business của Tenant khác.
- Platform profile không trả Tenant/Business context.
- TenantGuard từ chối cross-tenant và client-context access.
- Business list phân biệt Owner và Staff membership.

## Ngoài phạm vi

- UI AuthProvider, Business switcher và permission-based navigation.
- Staff invitation tự động gán BusinessMembership.
- Customer auth và public booking context.
- Thay đổi schema hoặc migration database.

## Acceptance criteria

- `/auth/me` trả đúng Tenant, Business và permissions theo role.
- Platform Super Admin không nhận Tenant context từ auth profile.
- Owner xem được toàn bộ Business thuộc Tenant của mình.
- Staff chỉ xem/chọn được Business có membership hợp lệ.
- Header `x-tenant-id` hoặc `x-business-id` giả mạo bị từ chối.
- Token client không truy cập được Business Admin tenant routes.
- Refresh token không được tiếp tục sử dụng sau khi account đổi Tenant.
- API typecheck, unit tests và production build pass.
