# [Feature] WP-12: Booking Page Template Management & Publication

| Thuộc tính | Giá trị                                         |
| ---------- | ----------------------------------------------- |
| Trạng thái | Not started                                     |
| Giai đoạn  | Tuần 10                                         |
| Ưu tiên    | High                                            |
| Bề mặt     | API, Platform Admin, Business Admin, public Web |

## Goal

Cung cấp ba booking-page template frames responsive và builder giới hạn option, cho phép Platform quản lý template còn Tenant chọn, preview, publish và restore safely.

## Tại sao cần feature này?

Public booking cần giao diện theo ngành nghề và thương hiệu nhưng Phase 1 không cho phép HTML/CSS tùy ý. Versioned templates giúp publish có kiểm soát và giữ Tenant overrides.

## Scope

### Bao gồm

- Template model, version, draft và published state.
- Gán Template với Business Category.
- Ba template frames responsive ban đầu.
- Option whitelist: layout preset, colors, font, section visibility và supported modules.
- Tenant chọn Template và giữ logo/color/content override.
- Desktop/mobile preview.
- Publish và restore defaults.
- Impact count trước global publish.
- Public booking chỉ render published configuration.

### Không bao gồm

- Drag-and-drop builder.
- Custom HTML, CSS hoặc JavaScript.
- Template marketplace.
- Custom domain.

## Dependencies

- WP-02: Business branding và public profile.
- WP-11: Business Category và Platform lifecycle.

## Actors & Access Control

| Actor          | Khả năng                                                              |
| -------------- | --------------------------------------------------------------------- |
| Super Admin    | CRUD version, category assignment và global publication               |
| Owner          | Chọn template, chỉnh allowed options, preview và publish cho Business |
| Public visitor | Chỉ render published template/configuration                           |

## Data / Domain

### Entities cần có

- `BookingTemplate`: identity, key, status và compatible categories.
- `BookingTemplateVersion`: immutable schema/options/frame revision.
- `BusinessTemplateConfig`: selected version, draft overrides và published overrides.
- Optional publication/history record với actor/time.

### Merge order

`Frame defaults → published global version → allowed Business overrides → runtime Business content`.

## Business Rules

- Draft không ảnh hưởng public page.
- Published version là immutable; sửa đổi tạo version mới.
- Không hard delete Template đang được dùng.
- Tenant override chỉ chứa keys trong whitelist.
- Global publish không ghi đè Tenant override hợp lệ.
- Template unavailable phải có fallback/unavailable state rõ ràng.

## Main Flows

### Flow 1: Platform publish global version

`Edit draft → preview frames/categories → calculate impact → confirm → publish immutable version`.

### Flow 2: Owner chọn và publish

`Browse compatible templates → select → adjust allowed options → preview → publish Business config`.

### Flow 3: Public render

`Resolve Business → load published version/config → validate schema → merge overrides → render frame`.

## API Contract

| Method    | Endpoint                                  | Trạng thái | Mục đích                     |
| --------- | ----------------------------------------- | ---------- | ---------------------------- |
| GET/POST  | `/api/v1/platform/templates`              | Target     | Platform list/create         |
| GET/PATCH | `/api/v1/platform/templates/:id`          | Target     | Detail/update draft metadata |
| POST      | `/api/v1/platform/templates/:id/versions` | Target     | Create version draft         |
| GET       | `/api/v1/platform/templates/:id/impact`   | Target     | Usage/impact count           |
| POST      | `/api/v1/platform/templates/:id/publish`  | Target     | Publish version              |
| GET/PUT   | `/api/v1/businesses/:id/template`         | Target     | Business selection/config    |
| POST      | `/api/v1/businesses/:id/template/publish` | Target     | Publish Business config      |
| POST      | `/api/v1/businesses/:id/template/restore` | Target     | Restore defaults             |
| GET       | `/api/v1/public/template`                 | Target     | Published runtime config     |

## UI / Routes

| Surface        | Route / Màn hình                                            |
| -------------- | ----------------------------------------------------------- |
| Platform Admin | `/{locale}/templates`, detail/version/editor/impact         |
| Business Admin | `/{locale}/admin/settings/template`, gallery/editor/preview |
| Public Web     | Booking page rendered from published config                 |

## Implementation Guide

| Layer      | Vị trí / Công việc                                                 |
| ---------- | ------------------------------------------------------------------ |
| Shared     | Versioned option schema, frame keys và merge-safe DTOs             |
| Database   | Template/version/Business config/publication models                |
| Backend    | New template module with platform, business and public controllers |
| UI package | Chỉ generic primitives; template frames thuộc Web feature code     |
| Frontends  | Platform editor, Business selector/preview và public renderer      |

## Use Cases

### UC-WP12-01: Platform publish Template version

- **Tác nhân:** Super Admin.
- **Luồng chính:** Tạo draft → preview → xem impact → publish version.

### UC-WP12-02: Owner tùy chỉnh booking page

- **Tác nhân:** Owner.
- **Luồng chính:** Chọn compatible template → chỉnh whitelist options → preview → publish.

### UC-WP12-03: Public visitor xem published frame

- **Tác nhân:** Public visitor.
- **Luồng chính:** Resolve Business → merge published config → render responsive page.

## Checklists

### Planning / Design

- [ ] Chốt ba frame và option whitelist.
- [ ] Chốt version/publication/restore semantics.
- [ ] Chốt override merge và schema migration strategy.
- [ ] Chốt fallback khi version bị disable.

### Implementation

| Task ID  | Layer       | Task                                               | Trạng thái |
| -------- | ----------- | -------------------------------------------------- | ---------- |
| WP12-001 | Shared/DB   | Template/version/config contracts và models        | Todo       |
| WP12-002 | BE          | Platform CRUD/version/impact/publish use cases     | Todo       |
| WP12-003 | BE          | Business select/override/preview/publish use cases | Todo       |
| WP12-004 | FE Platform | Template list/editor/impact UI                     | Todo       |
| WP12-005 | FE Business | Gallery/options/preview/publish UI                 | Todo       |
| WP12-006 | FE Public   | Ba responsive template frames                      | Todo       |
| WP12-007 | Test        | Merge/version/publication/visual/browser tests     | Todo       |

### Review & Testing

- [ ] Draft không thay đổi public page.
- [ ] Global update giữ Business overrides hợp lệ.
- [ ] Option ngoài whitelist bị reject ở server.
- [ ] Ba frames đạt responsive/accessibility baseline.
- [ ] Template đang dùng không bị hard delete.

## Acceptance Criteria

- Platform quản lý được Template versions và publication.
- Owner chọn, preview, publish và restore template cho Business.
- Public booking chỉ dùng published configuration.
- Ba frames hoạt động trên mobile, tablet và desktop.
- API/Web/Platform tests, typecheck và build pass.

## Labels

`feature` `templates` `publication` `platform-admin` `business-admin` `frontend` `high` `week-10`
