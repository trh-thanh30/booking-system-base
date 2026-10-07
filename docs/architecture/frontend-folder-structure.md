# Frontend Folder Structure

Tài liệu này mô tả đầy đủ vai trò, chức năng và rule sử dụng folder cho các client frontend trong monorepo, hiện áp dụng cho:

- `apps/web`: Landing + Business Admin tại `/{locale}/admin/*`.
- `apps/platform-admin`: Super Admin riêng.

Mục tiêu là giữ cấu trúc đủ rõ để làm boilerplate cho nhiều dự án Next.js khác, đồng thời tránh việc code UI, API, type và helper bị trộn lẫn.

Quy ước màu sắc, typography, theme và shared UI primitives được định nghĩa tại
[`frontend-design-system.md`](./frontend-design-system.md). Mọi frontend phải dùng
token từ `@repo/ui/styles.css`, không duy trì brand palette riêng trong từng app.

## Cây Folder Chuẩn

### Web sau ARCH-001

- `app/[locale]/(marketing)`: Landing/signup, localized SEO metadata.
- `app/[locale]/admin/(auth)`: public Owner auth/Google onboarding screens.
- `AuthenticationLayout` trong `src/components/layout` dùng chung cho đăng ký và Auth.
  Header dùng `src/components/layout/site-header.tsx`; Home chỉ compose navigation,
  Auth dùng cùng header không navigation. Không tạo một logo/header riêng cho Auth.
  `PasswordInput` và Leaflet `LocationPickerMap` ở `src/components/common`;
  Business wizard cùng field compose vị trí nằm ở `src/views/admin/auth/components`.
  Google redirect hook dùng chung ở `src/hooks`;
  marketing không import Admin AuthProvider hoặc private API client để khởi tạo OAuth.
- Form địa chỉ đa quốc gia lưu mã quốc gia ISO alpha-2 và contract trung lập gồm
  `addressLine1/2`, `locality`, `administrativeAreaLevel1/2`, `postalCode`,
  `formattedAddress`, `location`. Tên quốc gia và nhãn hành chính được dịch ở UI;
  không lưu tên quốc gia đã dịch hoặc ép mọi quốc gia vào `ward/district/state`.
- `app/[locale]/admin/(dashboard)`: protected dashboard shell/routes.
- `app/[locale]/admin/layout.tsx`: một AuthProvider và private QueryClient dùng chung xuyên suốt Admin; marketing không bootstrap Admin.
- `src/views/admin/<feature>`: các màn hình Admin, giữ role folders như rule dưới đây.
- `src/lib/admin`, `src/services/admin`, `src/app/providers/admin`, `src/app/stores/admin`: session/context riêng, không trộn public client.
- `src/components/layout/admin`: shell/navigation; common FormField và LanguageSwitcher tái sử dụng cho Landing/Admin.
- Font, NextIntl provider, theme, CSS và Toaster chỉ mount một lần tại locale root. Private query cache của Admin độc lập với public cache.
- `/admin` là segment URL thật, route groups chỉ phân layout. Platform Admin vẫn là service riêng.
- URL FE sử dụng `/admin/*`; API vẫn `/auth/admin/*`, `/users`, `/businesses`, không tự thêm `/admin` vào API routes.

```txt
apps/<client>/
├── app/
├── src/
│   ├── app/
│   │   └── providers/
│   ├── components/
│   ├── config/
│   ├── constants/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── views/
├── Dockerfile
├── next.config.js
├── package.json
└── tsconfig.json
```

`apps/<client>` có thể là `apps/web`, `apps/platform-admin` hoặc client Next.js khác được thêm sau này.

## Vai Trò Cấp App Root

### `app/`

Đây là folder của Next.js App Router.

Chỉ đặt các file framework-level tại đây:

- `layout.tsx`
- `page.tsx`
- `loading.tsx`
- `error.tsx`
- `not-found.tsx`
- route groups như `(dashboard)`, `(auth)`, `(marketing)`

Rule:

- `app/**/page.tsx` phải là file mỏng.
- Không đặt `"use client"` trong `page.tsx` nếu không có lý do cực kỳ đặc biệt.
- Không viết business logic, table columns, mock data, form state hoặc API call trực tiếp trong `page.tsx`.
- `page.tsx` chỉ import view từ `src/views`.

Ví dụ:

```tsx
import { BookingsView } from "@/src/views/bookings/bookings.view";

export default function BookingsPage() {
  return <BookingsView />;
}
```

`error.tsx` có thể dùng `"use client"` vì Next.js cần callback `reset()`.

### `.next/`, `.turbo/`, `node_modules/`

Đây là output/cache/dependency folder do tool sinh ra. Không viết code thủ công trong các folder này.

## Vai Trò Trong `src/`

### `src/app/`

Chứa cấu hình runtime cấp app, không phải route.

Nên dùng cho:

- Provider composition.
- Client/global store.
- App bootstrap helper.

Ví dụ:

```txt
src/app/
├── providers/
│   └── theme-provider.tsx
└── stores/
    └── ui.store.ts
```

Không đặt page, route hoặc feature UI trong `src/app`.

### `src/app/providers/`

Chứa các provider dùng ở root layout hoặc một layout lớn.

Ví dụ:

- `theme-provider.tsx`
- `query-provider.tsx`
- `auth-provider.tsx`
- `toast-provider.tsx`

Provider nên được import bởi `app/layout.tsx` hoặc route layout tương ứng.

### `src/app/stores/`

Chứa global/client store cấp app.

Ví dụ:

- UI store.
- Command menu state.
- Sidebar state.
- Auth session state nếu cần client-side store.

Không đặt store chỉ dùng riêng một feature ở đây. Store riêng của feature nên nằm trong `src/views/<feature>`.

### `src/views/`

Chứa màn hình theo route hoặc feature lớn.

Đây là nơi `page.tsx` import vào.

Ví dụ:

```txt
src/views/bookings/
├── bookings.view.tsx
├── constants/
│   └── bookings.constants.ts
├── types/
│   └── bookings.types.ts
├── utils/
│   └── bookings.utils.ts
├── columns/
│   └── bookings.columns.tsx
├── components/
│   ├── booking-status-badge.tsx
│   └── bookings-table.tsx
└── index.ts
```

Vai trò từng file:

| File                     | Vai trò                                                                 |
| :----------------------- | :---------------------------------------------------------------------- |
| `<feature>.view.tsx`     | Compose màn hình chính của route.                                       |
| `<feature>.constants.ts` | Static config của view: tabs, filters, mock data, labels.               |
| `<feature>.types.ts`     | Type chỉ phục vụ UI/view state như filter value, tab value, local mode. |
| `<feature>.utils.ts`     | Helper thuần chỉ dùng trong feature đó.                                 |
| `<feature>.columns.tsx`  | Column definition cho TanStack Table hoặc table UI.                     |
| `components/`            | Component private của feature.                                          |

Rule:

- File `*.view.tsx` nằm ở cấp feature. File hỗ trợ phải đặt trong folder theo hậu tố chức năng, kể cả khi chỉ có một file: `*.constants.ts` → `constants/`, `*.types.ts` → `types/`, `*.utils.ts` → `utils/`, `*.columns.tsx` → `columns/`, `*.data.ts` → `data/`.
- Với hậu tố khác, tạo folder theo vai trò tương ứng: `schemas/`, `services/`, `tests/`, `hooks/`. Hook giữ tên `use-*`; component riêng đặt trong `components/`, không gom component vào folder theo đuôi `.tsx`.
- Áp dụng cùng quy tắc cho feature con và section trong `views`, ví dụ `views/home/sections/features/constants/features.constants.ts`.
- `index.ts` là ngoại lệ ở cấp feature nếu có public re-export thật; cập nhật export/import sau khi di chuyển file, không giữ bản sao ở đường dẫn cũ.
- Feature component không dùng ở nơi khác thì để trong `src/views/<feature>/components`.
- Không đưa type API/domain DTO vào `<feature>.types.ts`.
- Không import trực tiếp component private của feature khác.
- Nếu logic được dùng bởi nhiều feature, cân nhắc đưa lên `src/components/common`, `src/hooks`, `src/utils`, `src/services` hoặc `packages/*`.

### `src/components/`

Chứa component dùng lại trong phạm vi app hiện tại.

Khuyến nghị chia:

```txt
src/components/
├── common/
└── layout/
```

`common/` dùng cho component app-level reusable:

- `PageHeader`
- `StatePanel`
- `FormField`
- `StatsCard`
- `EmptyState`
- `ConfirmDialog`

Form dùng `FormField` chung. Trường bắt buộc phải truyền prop `required` để
component hiển thị dấu `*` và khai báo `aria-required`; trạng thái này phải khớp
schema/API contract. Không viết dấu `*` trực tiếp trong label/translation và
không đánh dấu trường tùy chọn là bắt buộc.

`layout/` dùng cho shell và navigation:

- `DashboardShell`
- `AppSidebar`
- `Header`
- `MobileSidebar`
- `TopNav`

Rule:

- Không đặt business-specific component vào `common`.
- Ví dụ `BookingStatusBadge` không thuộc `common`; nó thuộc `src/views/bookings/components`.
- Nếu component đủ generic cho cả admin và web, đưa lên `packages/ui`.

### `src/config/`

Chứa app config hoặc mapping từ env sang object an toàn cho app dùng.

Ví dụ:

- `app.config.ts`
- `env.config.ts`
- `feature-flags.config.ts`
- `routes.config.ts`

Không đọc env rải rác trong nhiều component. Gom cấu hình vào đây khi bắt đầu có nhiều biến.

### `src/constants/`

Chứa constant cấp app, dùng bởi nhiều view hoặc nhiều module trong client đó.

Ví dụ:

- route paths.
- query keys.
- pagination defaults.
- date formats.
- navigation constants dùng nhiều nơi.

Rule:

- Constant chỉ dùng trong một feature thì đặt trong `src/views/<feature>/constants/<feature>.constants.ts`.
- Constant dùng nhiều feature mới đưa lên `src/constants`.

### `src/hooks/`

Chứa React hooks dùng lại trong nhiều view/component.

Ví dụ:

- `use-debounce.ts`
- `use-media-query.ts`
- `use-disclosure.ts`
- `use-copy-to-clipboard.ts`

Rule:

- Hook phải bắt đầu bằng `use`.
- Hook chỉ dùng riêng một feature thì đặt trong `src/views/<feature>`.
- Hook dùng API/server state nên gọi service/query function, không hardcode request ngay trong component UI.
- Hook dùng chung giữa nhiều client nên đưa vào `packages/hooks`.
- Consumer import trực tiếp hook từ nơi sở hữu implementation (`src/hooks` hoặc
  public export của `@repo/hooks`). Không tạo file hook trong feature chỉ để
  re-export hoặc gọi lại hook chung mà không bổ sung behavior.
- Khi chuyển hook lên app/package, cập nhật toàn bộ consumer và xóa file ở vị trí
  cũ; không giữ alias tương thích trong nội bộ repo. Chỉ tạo wrapper feature khi
  có logic riêng thực sự (state, mapping, policy), đặt tên thể hiện vai trò đó.
- Quy tắc barrel cho component không yêu cầu tạo bản re-export hook trong feature.

### `src/lib/`

Chứa wrapper hoặc adapter cho thư viện/framework.

Ví dụ:

- `query-client.ts`
- `toast.ts`
- `dayjs.ts`
- `analytics.ts`
- `storage.ts`

Rule:

- `lib` không phải nơi đặt business logic.
- `lib` nên là code hạ tầng nhỏ giúp app dùng thư viện thống nhất.

### `src/services/`

Chứa API/query functions, client-side service, adapter giao tiếp backend.

Ví dụ:

```txt
src/services/
├── bookings.service.ts
├── users.service.ts
└── reports.service.ts
```

Rule:

- Dùng HTTP client từ `@repo/shared/http` khi cần gọi API.
- Không gọi API trực tiếp trong component nếu service đã tồn tại.
- Response type/domain DTO import từ `@repo/shared`.
- Với feature rất lớn, có thể tách service feature-local, nhưng phải giữ rule rõ trong docs feature đó.

### `src/types/`

Chứa type app-level chỉ có ý nghĩa trong client hiện tại.

Ví dụ:

- `navigation.types.ts`
- `theme.types.ts`
- `table.types.ts`

Rule:

- API response type, shared domain type, DTO dùng lại giữa app/API phải nằm trong `packages/shared/src/types`.
- Type chỉ phục vụ một view thì đặt trong `src/views/<feature>/types/<feature>.types.ts`.
- Không gom tất cả type vào một file lớn.

### `src/utils/`

Chứa utility function thuần, không React, không JSX, không browser side-effect khó kiểm soát.

Ví dụ:

- `format-currency.ts`
- `format-date.ts`
- `get-initials.ts`
- `parse-search-params.ts`

Rule:

- Utility chỉ dùng trong một feature thì đặt trong `src/views/<feature>/utils/<feature>.utils.ts`.
- Utility dùng nhiều app nên cân nhắc đưa vào `packages/shared/src/utils`.

## Quan Hệ Với `packages/*`

### `packages/ui`

Chứa UI primitive thật sự reusable giữa nhiều app.

Phù hợp:

- `Button`
- `Card`
- `Input`
- `Table`
- `Dialog`
- `Tabs`
- `Switch`

Không phù hợp:

- `BookingStatusBadge`
- `UserRoleBadge`
- `RevenueDashboardCard`
- Component có wording/domain cụ thể.

### `packages/shared`

Chứa contract và helper dùng chung.

Phù hợp:

- API response types.
- Domain DTO.
- Zod schemas.
- Constants dùng chung nhiều app/API.
- HTTP client/helper.
- Utility dùng chung nhiều package.

Rule quan trọng:

- Type có hình dạng dữ liệu từ API hoặc domain contract phải đặt trong `packages/shared/src/types`.
- `src/views/<feature>/types/<feature>.types.ts` chỉ chứa type phục vụ view/local UI state.
- Không đặt React hook vào `packages/shared`; hook dùng chung nằm ở `packages/hooks`.

Ví dụ:

```ts
// packages/shared/src/types/booking.types.ts
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

export type BookingSummary = {
  id: string;
  customer: string;
  status: BookingStatus;
};
```

```ts
// apps/web/src/views/admin/bookings/types/bookings.types.ts
import type { BookingStatus } from "@repo/shared";

export type BookingStatusFilter = "all" | BookingStatus;
```

## Barrel File Rule

Component được dùng ngoài folder sở hữu phải được export qua `index.ts` của
folder đó; consumer import từ folder, không import thẳng file component.
Ví dụ: view lấy EmailInput từ `@/src/components/common`, AuthShell từ `./components`.
Trong cùng folder, component dùng relative import trực tiếp tới sibling để tránh
vòng lặp qua chính barrel của mình. Lazy/dynamic import có thể trỏ trực tiếp
module cần tải để giữ ranh giới bundle. Không re-export Admin provider/private
feature qua barrel của common/layout dùng bởi marketing.

Chỉ tạo `index.ts` ở folder thật sự cần re-export module con.

Không tạo `index.ts` chỉ để giữ folder trống.

Không tạo `index.ts` ở folder cha nếu folder đó không có public export rõ ràng.

Được phép:

```txt
src/components/common/index.ts
src/views/bookings/index.ts
src/views/bookings/components/index.ts
```

Không cần:

```txt
src/index.ts
src/views/index.ts
src/hooks/index.ts
src/utils/index.ts
```

`index.ts` chỉ dùng để export:

```ts
export * from "./page-header";
export * from "./state-panel";
```

Không viết business logic, React component implementation, constant lớn hoặc helper function trong `index.ts`.

## Import Rule

- Ảnh do app Next.js render dùng `Image` từ `next/image`, có `alt` và
  `width`/`height` hoặc `fill` kèm `sizes`. SVG local vẫn dùng Image; không bật
  `dangerouslyAllowSVG` chỉ để hiển thị logo. Remote image phải cấu hình nguồn
  cụ thể, không mở wildcard rộng.
- Điều hướng route nội bộ dùng `Link` từ helper `src/i18n/navigation` của app
  (wrapper Next Link) để giữ locale; không tự thêm locale lần nữa. Nếu không
  cần locale thì dùng `next/link`. Không thay OAuth redirect đầy trang thành
  client-side Link.
- Native `<a>` chỉ dùng khi cần hành vi trình duyệt: skip-link/anchor trong
  cùng trang, URL ngoài, `mailto:`, `tel:`, download hoặc redirect khác origin.
  Giữ `rel` phù hợp khi dùng `target="_blank"`.
- Native `<img>` chỉ được giữ khi thư viện/framework-neutral primitive quản lý
  ảnh (ví dụ Avatar, Leaflet) hoặc có ngoại lệ được giải thích. Không tắt rule
  `@next/next/no-img-element` trong app chỉ để tránh dùng Next Image.
- Các view/page/component Landing hiện có được loại khỏi đợt migration này;
  không mở rộng việc sửa marketing khi task chỉ yêu cầu Admin/Auth. Ngoại lệ
  về phạm vi này không phải quy tắc cho phép code mới dùng native tag tùy ý.
- Trong app dùng alias `@/src/...`.
- Import primitive từ `@repo/ui`.
- Import shared type/schema/helper từ `@repo/shared`.
- Notification trong component/hook frontend dùng `const { toast } = useToast()` từ `@repo/hooks`. Không import `toast` trực tiếp từ `sonner` trong Admin/Web; chỉ wrapper `packages/hooks` và Toaster primitive `packages/ui` phụ thuộc Sonner trực tiếp. Lỗi validation theo field nằm trong `FormField`; lỗi nghiệp vụ/toàn form dùng toast; banner chỉ dành cho trạng thái chặn trang hoặc cần hiển thị lâu dài. Không render đồng thời toast và banner cho cùng một thông báo.
- View được import bởi `app/**/page.tsx`.
- View có thể import `src/components/common`, `src/components/layout`, `src/hooks`, `src/services`, `src/utils`, `src/constants`.
- `src/components/common` không import ngược vào `src/views`.
- Feature này không import component private của feature khác.

## Form Draft Và Khôi Phục Dữ Liệu

Form dài hoặc có nhiều bước phải tự động lưu draft để người dùng không mất công
việc khi reload, đóng tab hoặc vô tình rời route. Không áp dụng persistence hàng
loạt cho mọi form.

### Quy Tắc Persistence

- Form dài/nhiều bước hoặc cần nhiều công sức nhập liệu dùng draft có version,
  TTL và scope theo danh tính hiện tại.
- Draft client-side không được chứa password, OTP, access/refresh token, payment
  credential hoặc secret. Form có các trường này không được persist toàn bộ.
- Dùng `localStorage` khi product yêu cầu phục hồi sau khi đóng tab; dùng
  `sessionStorage` chỉ khi dữ liệu phải kết thúc cùng tab.
- Draft phải có schema riêng chấp nhận dữ liệu đang nhập dở. Không dùng schema
  submit cuối cùng để restore vì validation nghiệp vụ đầy đủ có thể xóa nhầm
  draft chưa hoàn thiện.
- Autosave nên debounce khoảng 300–800 ms và flush khi `pagehide`. Không toast
  sau mỗi lần save; dùng status nhỏ với `aria-live="polite"`.
- Chỉ hiện cảnh báo rời trang khi save đang thất bại hoặc còn thay đổi chưa lưu.
  Không chặn điều hướng khi draft đã được lưu an toàn.
- Chỉ xóa draft khi submit thành công, người dùng chủ động xóa, draft hết hạn,
  sai version hoặc hỏng cấu trúc. Lỗi API/session tạm thời không được tự động
  xóa công việc người dùng đã nhập.
- Nếu cần khôi phục trên nhiều thiết bị, dùng draft phía server. `localStorage`
  chỉ đảm bảo trên cùng browser/profile và vẫn chịu rủi ro khi người dùng xóa
  dữ liệu trình duyệt.
- Chỉ trích xuất hook/storage abstraction dùng chung khi có ít nhất hai feature
  có cùng policy thực tế; không tạo wrapper generic trước nhu cầu.

### Phân Loại Form Hiện Tại

| Form                               | Policy                                                           |
| :--------------------------------- | :--------------------------------------------------------------- |
| Business onboarding                | Persist `localStorage`, TTL 7 ngày, restore step và dữ liệu      |
| Signup/login/forgot/reset password | Không persist vì chứa credential hoặc là form ngắn               |
| Email/OTP verification             | Không persist mã xác minh; countdown có thể giữ theo session     |
| Accept invitation                  | Không persist vì chứa password và invitation token               |
| Create Business dialog             | Không persist; cân nhắc confirm khi đóng nếu form dirty          |
| Invite User dialog                 | Không persist; form ngắn, có thể confirm nếu mất dữ liệu đáng kể |

## Test Kiểm Soát Native HTML

Mỗi frontend có native HTML spec riêng, quét `src` và `app` của chính app đó.
Web chạy `apps/web/test/native-html-policy.spec.mjs`; Platform chạy
`apps/platform-admin/test/policies/native-html-policy.spec.mjs`. Chỉ logic phân
tích TypeScript AST được chia sẻ tại `scripts/testing/native-html-policy.mjs`.
Không import spec của app khác. CI chạy từng bộ test độc lập; lỗi nêu rõ file,
dòng và tag cần sửa, không bắt nhầm comment/string.

- `<img>` và `<a>` điều hướng nội bộ bị chặn mặc định.
- Anchor có href tĩnh cho fragment, HTTP(S), `mailto:`, `tel:` hoặc download được
  phép. Href động/spread cần ngoại lệ vì AST không xác định được đích runtime.
- Ngoại lệ gắn trực tiếp lên element bằng `data-native-reason` có lý do tĩnh,
  cụ thể (ít nhất 12 ký tự). Không dùng lý do chung chung để né Image/Link.
  Ví dụ: `<a href={oauthUrl} data-native-reason="Full-page redirect to external OAuth provider">Continue</a>`.
  Ngoại lệ không áp dụng cho element bên cạnh hay toàn bộ file. Nếu native img
  được ESLint cảnh báo, chỉ suppress đúng dòng với cùng lý do integration.
- Danh sách Landing được loại trừ nằm trong `isLandingExempt` tại
  `scripts/testing/native-html-policy.mjs`: Home, signup marketing, marketing
  routes, SiteHeader và landing compositions. Không loại trừ toàn bộ common/layout
  hay Admin. Không mở rộng danh sách này để bỏ qua lỗi từ feature mới.

Chạy guard riêng: `node --test apps/web/test/native-html-policy.spec.mjs`.

### Client Test Runners

Web và Platform Admin có `test/register.mjs` và `test/run.mjs` riêng; script
package là `node --import ./test/register.mjs ./test/run.mjs`. Runner dùng chung
helper discovery, tự chạy tất cả `*.spec.mjs` trong `test/` và folder con theo thứ
tự ổn định. Thêm spec không cần cập nhật package.json; helper/fixture không dùng
hậu tố `.spec.mjs` nếu không muốn được chạy. Loader dùng chung hỗ trợ TypeScript,
TSX và Next, nhưng alias `@/` luôn trỏ đúng app đang test.

Root scripts:

- `pnpm test:web`: toàn bộ Web/Business Admin tests.
- `pnpm test:admin`: alias của `test:web`, không có app Admin riêng.
- `pnpm test:platform-admin`: toàn bộ Platform Admin tests.
- `pnpm test:clients`: build shared một lần, chạy cả hai frontend song song.
- `pnpm test` / `pnpm test:all`: toàn bộ workspace qua Turbo.

Platform có spec local trong `test/policies/`; không đăng ký hoặc import spec của
Web và không quét source của Web. Runner/loader và hàm AST dùng chung chỉ là hạ
tầng tại `scripts/testing/`, không chứa bộ test của app. Web và Platform có
`test/register.mjs`, `test/run.mjs`, alias root và danh sách spec độc lập.

## Khi Nào Đưa Code Lên Tầng Cao Hơn?

| Tình huống                             | Nơi đặt                                                           |
| :------------------------------------- | :---------------------------------------------------------------- |
| Chỉ dùng trong một màn hình            | `src/views/<feature>`                                             |
| Dùng trong nhiều màn hình của cùng app | `src/components/common`, `src/hooks`, `src/utils`, `src/services` |
| Dùng trong cả web và admin             | `packages/ui` hoặc `packages/shared`                              |
| Là API/domain DTO                      | `packages/shared/src/types`                                       |
| Là schema validate shared              | `packages/shared/src/schemas`                                     |
| Là UI primitive không chứa domain      | `packages/ui`                                                     |
| Là React hook dùng chung nhiều client  | `packages/hooks`                                                  |

## Checklist Khi Thêm Route Mới

1. Tạo route trong `app`.
2. Tạo view trong `src/views/<feature>/<feature>.view.tsx`.
3. `page.tsx` chỉ render view.
4. Component riêng của feature đặt trong `src/views/<feature>/components`.
5. Static config/filter/tab đặt trong `constants/<feature>.constants.ts`; fixture/mock data riêng đặt trong `data/`.
6. View-only type đặt trong `types/<feature>.types.ts`.
7. API/domain type đặt trong `packages/shared/src/types`.
8. Table columns đặt trong `columns/<feature>.columns.tsx`.
9. Helper chỉ dùng trong feature đặt trong `utils/<feature>.utils.ts`.
10. Component dùng lại nhiều feature đưa vào `src/components/common`.
11. API/query function đặt trong `src/services`.
12. Chạy typecheck/lint/build trước khi hoàn tất.

Xem template chi tiết tại `docs/architecture/frontend-route-template.md`.

Xem bộ hook dùng chung tại `docs/architecture/frontend-shared-hooks.md`.
