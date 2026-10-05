# Shared Frontend Design System

Tài liệu này quy định nền tảng giao diện dùng chung cho `apps/web` (Landing + Business Admin), `apps/platform-admin` và các frontend được thêm sau này.

Mục tiêu của DS-001 là tạo cùng một ngôn ngữ thiết kế, không dựng lại layout
hoặc màn hình. Hướng hình ảnh là booking SaaS sáng, sạch, tin cậy; tham khảo
tinh thần của SimplyBook.me nhưng không sao chép component hay bố cục của họ.

## Nguồn Token

Design token nằm trong `packages/ui/src/styles`:

```txt
styles/
├── colors.css       # primitive color scales
├── semantic.css     # token theo vai trò và light/dark mode
├── typography.css   # font family và type scale
├── components.css   # radius, shadow, motion
├── base.css         # global reset, focus, reduced motion
└── index.css        # public entry point
```

Mỗi app chỉ import một entry point sau trong `app/globals.css`:

```css
@import "tailwindcss";
@import "@repo/ui/styles.css";
```

Không định nghĩa lại brand palette trong từng app.

## Color Scales

Các nhóm màu đều có đủ cấp `50`, `100`, `200`, `300`, `400`, `500`, `600`,
`700`, `800`, `900`, `950`:

- `primary`: xanh dương thương hiệu; `primary-600` là `#006aff`.
- `neutral`: nền, chữ, border và surface trung tính.
- `success`: trạng thái hoàn thành hoặc thành công.
- `warning`: trạng thái cần chú ý.
- `danger`: lỗi, destructive action hoặc trạng thái nguy hiểm.
- `info`: thông tin bổ trợ không mang ý nghĩa thành công/thất bại.

Tailwind utility được sinh trực tiếp từ token:

```tsx
<section className="bg-primary-50 text-primary-900" />
<button className="bg-primary-600 hover:bg-primary-700" />
<p className="text-danger-700 dark:text-danger-300" />
<div className="border-neutral-200 dark:border-neutral-800" />
```

### Khi nào dùng numbered token

Dùng numbered token khi sắc độ là một phần có chủ đích của biểu đạt, ví dụ
status badge, data visualization hoặc decorative brand section.

Không dùng `blue-*`, `slate-*`, `red-*`, `emerald-*` trực tiếp trong shared
component. Các tên đó gắn UI với palette của Tailwind thay vì brand system.

## Semantic Tokens

Component nền tảng phải ưu tiên semantic utility để tự thích nghi light/dark:

| Vai trò            | Utility điển hình                            |
| :----------------- | :------------------------------------------- |
| App canvas         | `bg-background text-foreground`              |
| Surface/card       | `bg-surface`, `bg-card text-card-foreground` |
| Brand action       | `bg-primary text-primary-foreground`         |
| Hover/active       | `bg-primary-hover`, `bg-primary-active`      |
| Secondary action   | `bg-secondary text-secondary-foreground`     |
| Supporting content | `bg-muted text-muted-foreground`             |
| Boundary/input     | `border-border`, `border-input`              |
| Keyboard focus     | `ring-ring`                                  |
| Destructive action | `bg-danger text-danger-foreground`           |
| Disabled state     | `bg-disabled text-disabled-foreground`       |

Ở light mode, `bg-primary` ánh xạ đến `primary-600`. Ở dark mode, semantic
primary chuyển sang `primary-500` để giữ độ nổi trên nền tối. Nếu yêu cầu sắc độ
cố định bất kể theme, dùng `bg-primary-600` một cách rõ ràng.

Dark mode được kích hoạt bằng class `.dark` ở root. Không tự thêm media query
`prefers-color-scheme` trong feature vì theme cần được app kiểm soát nhất quán.

Các utility `bg-brand-blue`, `bg-bg-primary`, `text-text-primary` theo vocabulary cũ của
Landing hiện chỉ là lớp tương thích trong giai đoạn migration. Không dùng chúng
cho code mới; chúng sẽ được loại bỏ sau khi Landing đã chuyển hết sang semantic
token chuẩn.

## Typography

Font chung là **Plus Jakarta Sans**, được nạp bởi Next.js layout và truyền qua
CSS variable `--font-plus-jakarta-sans`. Fallback luôn có system sans-serif.

Type utilities dùng chung:

- `text-display`
- `text-heading-1`, `text-heading-2`, `text-heading-3`
- `text-heading-4`, `text-heading-5`, `text-heading-6`
- `text-body`
- `text-label`
- `text-caption`

Feature có thể dùng type scale mặc định của Tailwind khi phù hợp, nhưng không tự
khai báo font family hoặc một bộ heading scale khác trong app.

## Shape, Elevation Và Motion

- Radius: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` dùng shared
  radius tokens.
- Elevation: `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`.
- Motion: nhanh `120ms`, chuẩn `200ms`, chậm `320ms` với easing chung.
- Mọi animation phải tôn trọng `prefers-reduced-motion`; base stylesheet đã có
  fallback toàn cục.

Không dùng transition dài cho hover/focus thông thường. Trạng thái tương tác cần
rõ ràng nhưng không làm chậm thao tác trong dashboard.

## Toast Notifications

Mỗi app mount một `Toaster` từ shared UI trong root layout:

```tsx
import { Toaster } from "@repo/ui/sonner";

<Toaster />;
```

Trong client component, dùng shared hook thay vì import Sonner trực tiếp cho code mới:

```tsx
import { useToast } from "@repo/hooks/toast";

const { toast } = useToast();
toast.success("Đã lưu thay đổi");
toast.error("Không thể lưu", { description: "Vui lòng thử lại." });
```

Hook giữ nguyên toàn bộ Sonner API, bao gồm `promise`, `loading`, `dismiss`, action
và custom toast. `Toaster` dùng semantic status token nên tự thích nghi light/dark mode.
Component và feature hook phải lấy `toast` qua `useToast`; chỉ shared wrapper và
Toaster primitive được import Sonner trực tiếp. Nhờ đó frontend dùng một API
notification thống nhất và có thể thay provider tại shared package.

## Component Rules

- Shared primitive nằm ở `packages/ui` và dùng semantic token làm mặc định.
- API public hiện tại của component phải được giữ ổn định khi chỉ đổi styling.
- Mọi interactive component phải có `focus-visible` rõ ràng.
- Disabled state cần đồng thời có visual state và behavior (`disabled` hoặc
  `aria-disabled`) đúng.
- Không chỉ dùng màu để truyền đạt lỗi hoặc trạng thái; luôn có text, icon hoặc
  label phù hợp.
- Text và control thông thường phải đạt WCAG AA. Cặp brand mặc định
  `primary-600`/white đạt tỷ lệ tương phản tối thiểu 4.5:1.
- Không đưa business rule hoặc feature-specific variant vào `packages/ui`.

## Migration Rule

DS-001 chỉ chuẩn hóa foundation và shared primitives. Không bulk-rewrite toàn bộ
feature UI trong cùng task.

Khi sửa một màn hình về sau:

1. Thay màu hard-code hoặc palette Tailwind trực tiếp bằng semantic token.
2. Chỉ dùng numbered token khi cần kiểm soát sắc độ cụ thể.
3. Tái sử dụng primitive từ `@repo/ui` trước khi tạo component tương đương trong
   app.
4. Giữ component riêng của feature tại `src/views/<feature>/components`.
5. Kiểm tra light mode, dark mode, keyboard focus và disabled state.

Chạy kiểm tra token của shared UI bằng:

```bash
pnpm --filter @repo/ui validate:tokens
```

## Landing Page — DS-002

Web dùng Blue Brand Theme từ shared tokens; không định nghĩa lại palette trong
`apps/web/app/globals.css`. Trang mặc định Light. Semantic stylesheet vẫn hỗ trợ
`.dark` và được kiểm tra riêng. ARCH-001 dùng một theme provider chung mặc định Light; Admin theme toggle áp dụng cùng theme cho Landing, không tự chọn system theme.

Composition marketing nằm tại `apps/web/src/components/common/landing-compositions.tsx`:

- `LandingContainer`: `max-w-landing` (80rem), mobile gutters 16px → 24px → 32px.
- `LandingSection`: nhịp section 48px mobile / 80px desktop.
- Breakpoint dùng Tailwind mobile-first chuẩn: sm 40rem, md 48rem, lg 64rem, xl 80rem, 2xl 96rem; không tạo breakpoint riêng theo từng section.
- `SectionHeading`: eyebrow, h2 và mô tả theo shared typography; không chứa wording.
- `MarketingButton`: compose shared Button, control tối thiểu 44px, variant primary/secondary/outline/ghost.
- `FeatureCard`, `PricingCard`, `TestimonialCard`: compose shared Card; featured pricing dùng border/ring primary. Testimonial có figure/blockquote/figcaption; không thêm testimonial giả.
- Motion utility shared: `duration-fast`, `duration-normal`, `duration-slow` (120/200/320ms); reduced motion override ở base stylesheet.

```tsx
<LandingSection id="features">
  <LandingContainer>
    <SectionHeading
      title="Features"
      description="Booking tools for your team"
    />
    <FeatureCard>...</FeatureCard>
    <MarketingButton asChild>
      <Link href="/signup-business">Start</Link>
    </MarketingButton>
  </LandingContainer>
</LandingSection>
```

`MotionButton` tái sử dụng `buttonVariants`; `MotionCard` bọc FeatureCard. Animation
hiện có được giữ lại, có reduced-motion fallback. Mockup dashboard/phone có thể
dùng type size nhỏ để minh họa; chữ hướng dẫn, form và CTA thật không lấy size đó
làm mặc định. Shared tokens là foundation, utility theo ngữ cảnh vẫn được phép.

Header dùng shared DropdownMenu/Sheet cho keyboard navigation, Escape và focus
management. Locale selector native dùng ở header/mobile/footer; chỉ Việt/Anh,
lấy locale từ route và giữ path/query/hash qua `next-intl`. Chỉ navigation/form
và metadata được localized trong DS-002; marketing copy tiếng Anh hiện có không
được dịch lại trong task này.

Modal feedback và bảng so sánh dùng shared Dialog cho focus trap/Escape, thay
overlay tự dựng. `cn` của UI khai báo custom font-size groups để `text-label`,
`text-body`, `text-heading-*` không bị hiểu nhầm là màu và xóa semantic text color.

`/signup-business` tiếp tục dùng Input/Label/Button và RegistrationField; lỗi có
label association, aria-invalid, aria-describedby và role alert. Không đổi Auth flow.

Metadata có title/description/OG/Twitter/canonical/hreflang cho vi/en, signup
noindex; public origin từ `NEXT_PUBLIC_WEB_URL`, Admin login từ `NEXT_PUBLIC_WEB_URL`.
Chưa khai báo OG image/social handle khi chưa có asset/tài khoản chính thức.

### Token guard và ngoại lệ

```bash
pnpm --filter @repo/web validate:tokens
pnpm lint:web
```

Web lint chạy guard dùng chung với UI: kiểm tra source/app, màu HEX/RGB/HSL,
palette Tailwind (gồm gradient stops) và tên token Landing cũ.
Ngoại lệ duy nhất có whitelist hẹp: `COLOR_INPUT_DEFAULT = "#006aff"` trong
`views/home/constants/color-input.constants.ts`, vì native input[type=color]
cần literal hex. Đây là initial primary-600 cho demo chọn màu Business, không
phải palette UI mới. Màu do người dùng nhập là dữ liệu tùy biến, không phải brand
token hệ thống. Opacity của CSS variable/custom hex dùng `withColorAlpha`, không
ghép suffix hex vào chuỗi `var(...)`. SVG download resolve token thành màu trước
khi xuất vì file độc lập không có stylesheet ứng dụng.

Kiểm tra contrast tự động hiện bao phủ cặp canvas, body/muted, primary và status
surface ở Light/Dark; kiểm tra trình duyệt cần chạy thêm để xác nhận responsive,
focus, menu và trạng thái interactive thực tế.
