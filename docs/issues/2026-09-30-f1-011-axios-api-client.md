# [F1-011] - Chuẩn hóa API Client bằng Axios và Axios Interceptor

**Branch:** `refactor/f1-011-axios-api-client`

**Blocked by:** F1-003

**Type:** AFK

## Phạm vi

- Loại bỏ các lệnh `fetch` còn lại trong luồng refresh session của Business Admin và Platform Admin.
- Chuẩn hóa request qua Axios instance được tạo bởi package `@repo/shared`.
- Giữ API client riêng cho từng auth context:
  - `admin` cho Business Admin.
  - `platform` cho Platform Admin.
  - `client` cho Web khi triển khai Customer Auth.
- Dùng request interceptor để tự động gắn access token và các header theo context.
- Dùng response interceptor để xử lý `401`, refresh access token và retry request gốc tối đa một lần.
- Giữ cơ chế một shared refresh promise để nhiều request `401` đồng thời không tạo refresh storm.
- Chuẩn hóa error trả cho TanStack Query bằng `HttpClientError`.
- Bổ sung test cho Axios client, interceptor và session refresh behavior.
- Không thay đổi endpoint hoặc session policy đã hoàn thành trong F1-003.

## Goal

Tạo một HTTP client thống nhất cho Admin, Platform Admin và Web, tương thích trực tiếp với TanStack Query và không còn trộn `fetch` với Axios trong cùng luồng request.

Query function và mutation function chỉ cần gọi API client, không phải tự xử lý access token, refresh token, header context hoặc chuyển đổi lỗi ở từng màn hình.

## Input

- Shared client hiện có:
  - `createHttpClient`.
  - `createApiClient`.
  - `HttpClientError`.
  - `toHttpClientError`.
- API client hiện có của:
  - `apps/admin`.
  - `apps/platform-admin`.
  - `apps/web`.
- Session behavior từ F1-003:
  - Context-specific refresh endpoint.
  - HttpOnly refresh cookie.
  - Marker cookie.
  - Một active refresh session trên mỗi user.
  - Không rotate refresh token trong mỗi request.
- TanStack Query providers và các query/mutation hiện có.

## Implementation notes

### 1. Chuẩn hóa Axios instance dùng chung

- Tiếp tục dùng `axios.create` trong `@repo/shared` làm nền tảng.
- Cấu hình thống nhất:
  - `baseURL`.
  - `withCredentials: true`.
  - `Accept: application/json`.
  - Timeout phù hợp.
- Không tạo Axios instance mới trong mỗi query hoặc mỗi component.
- Không gọi trực tiếp Axios hoặc `fetch` bên trong view nếu request có thể đi qua API client.
- Giữ API response typing cho response thường và response phân trang.

### 2. Request interceptor

- Đọc access token tại thời điểm request được gửi.
- Gắn `Authorization: Bearer <access-token>` khi có token.
- Business Admin tự động gắn:
  - `x-auth-context: admin`.
  - `x-tenant-id` khi có tenant hiện tại.
  - `x-business-id` khi có business đang chọn.
- Platform Admin tự động gắn `x-auth-context: platform`.
- Web dùng client context, nhưng task này không triển khai Customer Auth mới.
- Không gắn refresh token vào header hoặc request body.

### 3. Response interceptor và refresh session

- Khi API trả `401`, chỉ thử refresh nếu có marker cookie đúng context.
- Admin gọi `/auth/admin/refresh`.
- Platform gọi `/auth/platform/refresh`.
- Refresh request phải dùng một Axios instance không kích hoạt lại auth-refresh interceptor, hoặc có cờ nội bộ để bỏ qua refresh handling.
- Không dùng authenticated API client theo cách gây vòng lặp:
  - Request nhận `401`.
  - Interceptor gọi refresh.
  - Refresh tiếp tục nhận `401`.
  - Interceptor lại gọi refresh.
- Dùng một `refreshPromise` cho mỗi auth context để gộp các request `401` đồng thời.
- Sau khi refresh thành công:
  - Lưu access token mới.
  - Cập nhật header của request gốc.
  - Retry request gốc đúng một lần.
- Sau khi refresh thất bại:
  - Clear access token và auth state cục bộ.
  - Phát session-expired event đúng context.
  - Không retry thêm.
- Không refresh khi request login, refresh hoặc logout bị `401`.

### 4. Error contract cho TanStack Query

- Mọi Axios error được chuyển thành `HttpClientError` thống nhất.
- Giữ các thông tin cần thiết:
  - `message`.
  - HTTP `status`.
  - Error `code`.
  - `details` đã được API trả về.
  - `isNetworkError`.
- Query/mutation có thể kiểm tra `HttpClientError` mà không phụ thuộc trực tiếp vào `AxiosError`.
- Không swallow lỗi cuối cùng sau khi refresh hoặc retry thất bại.
- Không hiển thị toast toàn cục trực tiếp trong shared interceptor; màn hình hoặc mutation callback quyết định cách hiển thị lỗi nghiệp vụ.

### 5. Tích hợp TanStack Query

- Query function trả promise từ API client và dữ liệu có type rõ ràng.
- Mutation function dùng cùng API client và error contract.
- Không tạo logic refresh riêng trong `queryFn` hoặc `mutationFn`.
- Không cấu hình TanStack Query tự retry vô hạn với lỗi `401`, `403` hoặc lỗi validation.
- Query key, cache invalidation và business behavior hiện tại không thay đổi trong task này.

### 6. Cleanup và test

- Xóa toàn bộ `fetch` khỏi các API client trong phạm vi task.
- Không duy trì song song hai implementation refresh bằng Fetch và Axios.
- Test tối thiểu:
  - Request interceptor gắn access token mới nhất.
  - Admin gắn đúng tenant/business headers.
  - Platform không nhận Admin headers.
  - `401` refresh thành công và retry request một lần.
  - Nhiều request `401` đồng thời chỉ tạo một refresh request.
  - Refresh endpoint trả `401` không tạo loop.
  - Request đã retry không được retry lần hai.
  - Không có marker cookie thì không gọi refresh.
  - Refresh thất bại clear session đúng context.
  - Axios error được chuyển thành `HttpClientError` cho TanStack Query.

## Output

- Admin và Platform Admin không còn dùng `fetch` trong API client/session refresh.
- Shared Axios client có interceptor rõ ràng và tái sử dụng được.
- Auth context, tenant và business headers được gắn tự động.
- Refresh/retry hoạt động an toàn, không loop và không tạo refresh storm.
- TanStack Query nhận response/error có type thống nhất.
- Web tiếp tục dùng cùng shared Axios abstraction, sẵn sàng cho Customer Auth sau này.
- Có unit tests cho interceptor và refresh lifecycle.

## Acceptance criteria

- [x] Không còn `fetch` trong API client của Admin và Platform Admin.
- [x] Các API request thông thường đi qua Axios instance dùng chung.
- [x] Access token được request interceptor gắn tại thời điểm gửi request.
- [x] Admin request có đúng auth context, tenant và business headers.
- [x] Platform request chỉ sử dụng Platform auth context.
- [x] Refresh request gửi HttpOnly cookie bằng `withCredentials`.
- [x] Refresh request không đi qua interceptor gây refresh đệ quy.
- [x] Request `401` chỉ được retry tối đa một lần.
- [x] Nhiều request `401` đồng thời chỉ gọi refresh một lần cho mỗi context.
- [x] Không có marker cookie thì không gọi refresh endpoint.
- [x] Refresh thất bại clear local auth state và phát đúng session-expired event.
- [x] Không lưu hoặc đọc raw refresh token trong JavaScript.
- [x] API client không trả raw `AxiosError` cho TanStack Query.
- [x] Query/mutation hiện tại tiếp tục hoạt động mà không tự cài refresh logic.
- [x] Unit tests cho Axios interceptor và refresh lifecycle pass.
- [x] Admin, Platform Admin và Web lint pass.
- [x] Admin, Platform Admin và Web TypeScript pass.
- [x] Admin, Platform Admin và Web production build pass.

## Ngoài phạm vi

- Customer login/refresh flow mới.
- Thay đổi backend authentication endpoints.
- Refresh-token rotation.
- Multiple-device session management.
- Thay đổi query key hoặc cache policy của feature.
- Thay đổi UI loading/error state của từng màn hình.
