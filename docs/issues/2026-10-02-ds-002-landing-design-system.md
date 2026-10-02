# [DS-002] - Hoàn thiện Design System cho Landing Page

Loại: AFK. Blocked by DS-001.

## Mục tiêu và phạm vi

Đưa Web về shared Blue Brand Theme; giữ nội dung/section/luồng Auth hiện có.
Thêm composition marketing, chuẩn hóa form style, state/focus, sửa locale selector
Việt/Anh và bổ sung metadata locale-aware.

## Triển khai

- Migrate raw palette/HEX/RGB và token Landing cũ trong Web sang shared token.
- Typography h4–h6, container/section spacing tokens bổ sung tại UI; typography,
  radius, shadow và motion dùng chung, không dựng palette riêng.
- Marketing compositions dùng Button/Card shared; MotionButton/MotionCard tái sử dụng variants/composition.
- Header desktop DropdownMenu và mobile Sheet dùng Radix qua @repo/ui; tránh hover-only navigation.
- Modal feedback/so sánh dùng shared Dialog; thêm focus-visible cho controls cũ. Shared class merger nhận biết custom type scale, không xóa semantic màu chữ.
- LanguageSwitcher native ở header/mobile/footer chỉ vi/en, route locale làm source of truth, giữ path/query/hash, disabled khi chuyển route.
- Signup dùng container/form styles shared, control ≥44px, giữ nguyên endpoint/validation/handoff.
- Metadata localized: title, description, canonical, hreflang, OG/Twitter; signup noindex. Chưa thêm social image giả.
- Web lint chạy token guard; narrow exception cho native color input đã ghi trong frontend-design-system.md.
- UI/UX Pro Max dùng để kiểm tra contrast, hierarchy, responsive, focus và reduced motion; palette gợi ý không ghi đè Blue Brand Theme đã chọn.

## Không thực hiện

Không triển khai Auth mới, thay schema/API, dịch lại marketing copy, thêm nội dung
testimonial, viết lại section/animation hoặc bật theme provider/Dark Mode switch mới.

## Kiểm tra

- `pnpm lint:web`, `pnpm typecheck:web`, `pnpm build:web` (Turbopack): pass.
- Web: 10 test pass; Admin regression sau thay shared class merger: 39 test pass.
- UI lint/token validation/typecheck/build: pass. Web token validation chạy trong lint: pass.
- Chrome production QA 375/768/1440px: không horizontal page overflow; Light/Dark canvas và CTA foreground đúng.
- Header/footer/mobile đổi vi↔en thật, giữ query/hash, canonical theo locale; không còn locale khác.
- Dropdown keyboard/ArrowDown/Escape/visible focus, mobile Sheet, comparison Dialog focus trap/Escape: pass.
- Signup mobile control ≥44px, metadata noindex, không browser runtime error: pass.
- AA contrast tự động cho cặp semantic canvas/muted/primary/status: pass; không coi đây là audit WCAG toàn bộ nội dung/preview tùy biến.
- Không chạy bộ kiểm tra toàn monorepo hoặc submit tạo Owner thật trong browser QA; giữ Auth contract và regression tests đăng ký hiện có.

Ảnh browser QA lưu tạm tại `/tmp/booking-ds-002-{375,768,1440}-{light,dark}.png`
và `/tmp/booking-ds-002-signup-mobile.png`; không đưa ảnh QA vào source assets.
