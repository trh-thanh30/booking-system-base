# Tổng quan

Docs app này là một trang HTML tĩnh, chạy riêng ở port `8000`, dùng để đọc nội dung từ các file Markdown trong `apps/docs/public/content`.

Hiện tại dự án chưa triển khai module API nghiệp vụ chính thức để FE tích hợp, nên docs chỉ giữ trang tổng quan. Khi API module được hoàn thiện, hãy thêm file Markdown mới cho module đó rồi khai báo thêm trong `apps/docs/public/assets/docs.js`.

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
- `content/overview.md` là nội dung duy nhất đang được hiển thị.
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
