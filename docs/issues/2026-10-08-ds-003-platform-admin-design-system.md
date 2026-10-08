# [DS-003] - Chuẩn hóa Platform Admin Design System

Branch: `refactor/ds-003-platform-admin-design-system`

Loại: AFK

Blocked by: DS-001

## Goal

Đưa Platform Admin về cùng shared design system với Web/Business Admin, chuẩn
hóa semantic surface, typography, spacing, component states và page composition
trước khi phát triển sâu các feature cấp nền tảng.

## Phạm vi đã triển khai

- Dùng semantic token từ `@repo/ui` cho shell, auth và các view hiện có.
- Bổ sung Platform page, actions, stats, filter, table và state compositions.
- Chuẩn hóa sidebar responsive, mobile sheet, active route, tooltip và skip link.
- Thêm light/dark theme toggle và route loading/error/not-found states.
- Chuyển notification sang `useToast()` từ `@repo/hooks`.
- Thêm token guard riêng cho `apps/platform-admin`.
- Giữ nguyên API, query, auth và business behavior.

## Verification

```bash
pnpm --filter @repo/ui validate:tokens
pnpm --filter @repo/platform-admin validate:tokens
pnpm lint:platform-admin
pnpm typecheck:platform-admin
pnpm test:platform-admin
pnpm build:platform-admin
```
