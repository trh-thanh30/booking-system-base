# Notifications API

Notification module cung cấp notification inbox cho user hiện tại và admin broadcast cho Owner. Tài liệu này mô tả endpoint đã có thật trong `apps/api/src/modules/notification`.

## Status

Status: `implemented`

Đã hỗ trợ:

- User list notifications.
- User unread count.
- User notification detail.
- Mark one notification as read.
- Mark all notifications as read.
- Owner tạo admin notification.
- Owner/Staff xem admin notification list.
- Owner publish scheduled admin notifications.

Chưa hỗ trợ:

- Chưa có business-specific notification context bằng `x-business-id`.
- Chưa có booking event notification vì booking module chưa triển khai.
- Chưa có realtime websocket/SSE.

## Backend Module

```txt
apps/api/src/modules/notification
```

Controller:

```txt
apps/api/src/modules/notification/notification.controller.ts
```

Base route:

```txt
/api/v1/notifications
```

## App Usage

| App            | Mục đích                                         |
| -------------- | ------------------------------------------------ |
| Admin          | Notification bell, list, unread count, mark read |
| Platform Admin | Chưa dùng riêng                                  |
| Web            | Có thể dùng cho customer inbox sau này           |

## Auth & Headers

Tất cả endpoint notification hiện yêu cầu JWT, trừ khi sau này controller đổi public riêng.

Admin app gửi:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
x-tenant-id: <tenant_id>
```

Hiện controller chưa dùng `@RequireTenant()`, nhưng FE admin vẫn nên gửi `x-tenant-id` theo convention chung.

## Roles

| Endpoint group                  | Role               |
| ------------------------------- | ------------------ |
| User inbox endpoints            | Authenticated user |
| Admin create notification       | `OWNER`            |
| Admin list notification         | `OWNER`, `STAFF`   |
| Publish scheduled notifications | `OWNER`            |

## Query Types

```ts
type ListNotificationsQuery = {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  status?: "READ" | "UNREAD";
};

type ListAdminNotificationsQuery = {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  source?: string;
  scope?: string;
  delivery_status?: string;
};
```

Default pagination:

```txt
page = 1
limit = 10
max limit = 100
```

## Create Admin Notification Body

```ts
type CreateAdminNotificationInput = {
  title: string;
  content: string;
  type: string;
  scope: "ALL" | "ROLE" | "USER";
  target_roles?: Array<"SUPER_ADMIN" | "OWNER" | "STAFF" | "CUSTOMER">;
  target_user_ids?: string[];
  scheduled_at?: string;
  metadata?: Record<string, unknown>;
};
```

Validation:

- `title`, `content`, `type`, `scope` là bắt buộc.
- Nếu `scope = ROLE`, `target_roles` là bắt buộc và không rỗng.
- Nếu `scope = USER`, `target_user_ids` là bắt buộc và không rỗng.
- `scheduled_at` nếu có phải là ISO date string.

## Endpoints

| Method | Endpoint                                        | Role         | Dùng cho                            |
| ------ | ----------------------------------------------- | ------------ | ----------------------------------- |
| GET    | `/api/v1/notifications`                         | Auth user    | List notification của user hiện tại |
| GET    | `/api/v1/notifications/unread-count`            | Auth user    | Badge unread count                  |
| GET    | `/api/v1/notifications/:id`                     | Auth user    | Detail notification                 |
| PATCH  | `/api/v1/notifications/:id/read`                | Auth user    | Mark one read                       |
| PATCH  | `/api/v1/notifications/read-all`                | Auth user    | Mark all read                       |
| GET    | `/api/v1/notifications/admin`                   | OWNER, STAFF | Admin list broadcast notifications  |
| POST   | `/api/v1/notifications/admin`                   | OWNER        | Create admin notification           |
| POST   | `/api/v1/notifications/admin/scheduled/publish` | OWNER        | Publish scheduled notifications     |

## GET /api/v1/notifications

List notifications của user hiện tại.

Query:

```ts
type Query = ListNotificationsQuery;
```

Response dùng paginated wrapper:

```ts
type Response = {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
```

FE notes:

- Dùng cho notification center/dropdown.
- Query key nên có `page`, `limit`, `status`, `type`, `q`.
- Sau mark read, invalidate unread count.

## GET /api/v1/notifications/unread-count

Trả số notification chưa đọc của user hiện tại.

Response:

```ts
type Response = {
  unread: number;
};
```

FE notes:

- Dùng cho badge trên header.
- Có thể refetch định kỳ nếu chưa có realtime.

## GET /api/v1/notifications/:id

Lấy chi tiết notification của user hiện tại.

Rules:

- Chỉ trả notification mà user hiện tại được nhận.
- Nếu notification không thuộc user, trả not found/forbidden theo service behavior.

## PATCH /api/v1/notifications/:id/read

Mark một notification là read.

Response:

```ts
type Response = Notification;
```

FE notes:

- Có thể optimistic update item `read_at`.
- Sau success, invalidate unread count.

## PATCH /api/v1/notifications/read-all

Mark toàn bộ notification của user hiện tại là read.

FE notes:

- Optimistic update list hiện tại thành read.
- Invalidate list và unread count sau success.

## POST /api/v1/notifications/admin

Owner tạo admin notification.

Body:

```ts
type Body = CreateAdminNotificationInput;
```

Behavior:

- Nếu `scheduled_at` không có, notification có thể được publish ngay theo service behavior.
- Nếu có `scheduled_at`, notification chờ endpoint publish scheduled xử lý.
- Target được resolve theo scope.

## GET /api/v1/notifications/admin

Owner/Staff xem danh sách admin notifications.

Query:

```ts
type Query = ListAdminNotificationsQuery;
```

Response:

```ts
type Response = PaginatedResponse<AdminNotification>;
```

## POST /api/v1/notifications/admin/scheduled/publish

Owner kích hoạt publish các scheduled notifications đã đến hạn.

FE notes:

- Endpoint này thường dùng cho admin action/manual retry.
- Production nên chạy bằng scheduler service thay vì FE gọi thường xuyên.

## Error Cases

| Status | Trường hợp                                        |
| ------ | ------------------------------------------------- |
| 400    | Query/body sai validation                         |
| 401    | Thiếu hoặc sai access token                       |
| 403    | Role không đủ, ví dụ STAFF tạo admin notification |
| 404    | Notification không tồn tại hoặc không thuộc user  |

## FE Checklist

- Header bell gọi `GET /notifications/unread-count`.
- Dropdown/list gọi `GET /notifications`.
- Click item có thể gọi detail rồi mark read.
- Mark all dùng `PATCH /notifications/read-all`.
- Admin broadcast form chỉ hiện cho Owner.
