# Tổng quan

Docs app này là một trang HTML tĩnh, chạy riêng ở port `8000`, dùng để đọc nội dung từ các file Markdown trong `apps/docs/public/content`.

Hiện tại docs app dùng để ghi lại các module nền tảng đã triển khai và cách FE/BE dùng chung contract. F0 đã có trang riêng cho phần SaaS foundation, tenant resolution và health endpoints.

## Runtime

| Hạng mục      | Giá trị                                      |
| ------------- | -------------------------------------------- |
| App           | `@repo/docs`                                 |
| Port          | `8000`                                       |
| Static root   | `apps/docs/public`                           |
| Markdown path | `apps/docs/public/content/*.md`              |
| CSS           | Tailwind build ra `public/assets/styles.css` |

## Cấu trúc hiện tại

- `index.html` là shell giao diện, có sidebar bên trái và vùng đọc Markdown.
- `assets/docs.js` chịu trách nhiệm load file `.md`, render heading, list, bảng và code block.
- `content/overview.md` là nội dung tổng quan.
- `content/f0.md` mô tả Core Infrastructure & SaaS Foundation.
- `src/styles.css` là nguồn Tailwind, build ra `public/assets/styles.css`.

## Base API dự kiến

API NestJS dùng global prefix:

```txt
/api/v1
```

Health endpoints không dùng prefix này:

```txt
/health
/health/live
/health/liveness
/health/readiness
/health/debug-sentry
```

## Cách chạy

```bash
pnpm dev:docs
```

Sau khi chạy, mở:

```txt
http://localhost:8000
```

## Cách thêm tài liệu module sau này

1. Tạo file Markdown mới trong `apps/docs/public/content`, ví dụ `booking.md`.
2. Thêm item vào mảng `docs` trong `apps/docs/public/assets/docs.js`.
3. Chạy lại `pnpm build:docs` nếu đã chỉnh style Tailwind.

Ví dụ:

```js
{
  id: "booking",
  title: "Booking",
  eyebrow: "module",
  file: "./content/booking.md",
}
```
