# [DS-003] - Chuẩn hóa Business Admin Dashboard Design System

Branch: `refactor/ds-003-business-admin-dashboard`

Loại: AFK

Blocked by: DS-001, ARCH-001, F1-012

## Goal

Chuẩn hóa giao diện Business Admin tại `/{locale}/admin/*` theo semantic token
của `@repo/ui`, đồng thời cung cấp composition dùng lại cho dashboard, list,
table, form và route state trước khi các domain nghiệp vụ được triển khai sâu.

## Phạm vi

- Giữ `@repo/ui/styles.css` là nguồn màu, typography, radius, shadow và motion.
- Phân vai rõ `background`, `surface`, `card`, `popover`, `accent` và `primary`.
- Chuẩn hóa DashboardShell, sidebar, header, mobile navigation, command menu,
  Business switcher và user menu.
- Tạo Admin page header, stats grid/card, content grid, filter toolbar và table
  container dùng lại trong `apps/web/src/components/common/admin`.
- Áp dụng composition cho Dashboard, Bookings, Businesses, Users, Settings,
  System và các loading/error/not-found states.
- Chuẩn hóa keyboard focus, skip navigation, active/disabled navigation và
  responsive overflow.
- Giữ nguyên API, query, permission và business behavior hiện có.

## Output

- Business Admin có visual hierarchy nhất quán trên light/dark mode.
- Feature mới có thể compose từ layout sẵn có thay vì tự dựng spacing/surface.
- Destination chưa triển khai hiển thị disabled rõ ràng, không giả làm action.
- Table không làm tràn viewport mobile và route state dùng cùng pattern.

## Acceptance criteria

- Không dùng raw color hoặc Tailwind palette trực tiếp trong Business Admin.
- Canvas, navigation, content và overlay dùng đúng semantic surface.
- Sidebar/header responsive, active route đúng và có keyboard focus.
- Có skip link đến nội dung chính.
- Page header, stats, filter, table và state composition được tái sử dụng.
- Không có dark override trùng với semantic token.
- Không thay đổi API hoặc business rule.
- Token validation, Web test, lint, typecheck và build pass.

## Verification

```bash
pnpm --filter @repo/ui validate:tokens
pnpm --filter @repo/web validate:tokens
pnpm lint:web
pnpm typecheck:web
pnpm test:web
pnpm build:web
```

## Ngoài phạm vi

- Platform Admin.
- Admin Auth và Business onboarding.
- Public booking template/Template Platform.
- Thay mock data bằng API hoặc bổ sung domain behavior.
