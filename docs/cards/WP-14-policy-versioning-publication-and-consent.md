# [Feature] WP-14: Policy Versioning, Publication & Consent

| Thuộc tính | Giá trị                           |
| ---------- | --------------------------------- |
| Trạng thái | Not started                       |
| Giai đoạn  | Tuần 11                           |
| Ưu tiên    | High                              |
| Bề mặt     | API, Platform Admin, Landing/Auth |

## Goal

Quản lý Policy theo version và locale, publish immutable content và lưu bằng chứng consent cho registration/onboarding hoặc các hành trình bắt buộc.

## Tại sao cần feature này?

Consent chỉ có giá trị khi tham chiếu đúng version mà người dùng đã xem. Lưu boolean hoặc liên kết động tới “latest policy” sẽ làm mất lịch sử.

## Scope

### Bao gồm

- Policy type, locale, version, draft, published, archived và effective date.
- Draft, preview, publish và archive workflow.
- Published Policy immutable; sửa đổi tạo version mới.
- Public Policy pages theo locale.
- Consent record gồm subject, policy type/version, time và context tối thiểu.
- Registration/onboarding enforce Policy bắt buộc.
- Platform Admin list, editor, preview và publication UI.

### Không bao gồm

- Legal document collaboration.
- E-signature.
- Arbitrary multi-level approval workflow.

## Dependencies

- WP-01: registration/onboarding identity và context.
- WP-11: Platform Admin access foundation.

## Actors & Access Control

| Actor          | Khả năng                                     |
| -------------- | -------------------------------------------- |
| Super Admin    | Draft, preview, publish và archive Policy    |
| Guest Owner    | Xem effective Policy và gửi required consent |
| Public visitor | Đọc published effective Policy theo locale   |

## Data / Domain

### Entities cần có

- `Policy`: stable identity/type.
- `PolicyVersion`: locale, version, content, status, effective date và immutable publication metadata.
- `ConsentRecord`: subject, PolicyVersion ID, context, acceptedAt và evidence fields đã chốt.

## Business Rules

- Chỉ một effective published version hợp lệ theo type/locale tại một thời điểm.
- Published version không được sửa trực tiếp.
- Consent luôn tham chiếu concrete PolicyVersion ID.
- Draft/archived content không xuất hiện public.
- Registration thiếu required consent bị từ chối ở server.
- Publication/archive ghi actor và timestamp.

## Main Flows

### Flow 1: Publish Policy

`Create draft → edit localized content → preview → set effective date → publish immutable version`.

### Flow 2: Registration consent

`Load required effective versions → render links/checkboxes → submit version IDs → server validate → persist consent with registration`.

### Flow 3: Public policy page

`Resolve type/locale/date → return effective published version → fallback locale theo policy`.

## API Contract

| Method    | Endpoint                                                    | Trạng thái         | Mục đích                     |
| --------- | ----------------------------------------------------------- | ------------------ | ---------------------------- |
| GET/POST  | `/api/v1/platform/policies`                                 | Target             | Platform list/create Policy  |
| GET/PATCH | `/api/v1/platform/policies/:id/versions/:versionId`         | Target             | Draft detail/edit            |
| POST      | `/api/v1/platform/policies/:id/versions/:versionId/publish` | Target             | Publish                      |
| POST      | `/api/v1/platform/policies/:id/versions/:versionId/archive` | Target             | Archive                      |
| GET       | `/api/v1/public/policies/:type`                             | Target             | Effective Policy theo locale |
| POST      | Registration/onboarding contract                            | Target integration | Persist required consents    |

## UI / Routes

| Surface                 | Route / Màn hình                                         |
| ----------------------- | -------------------------------------------------------- |
| Platform Admin          | `/{locale}/policies`, editor, preview và version history |
| Landing/Web             | `/{locale}/policies/[type]`                              |
| Registration/Onboarding | Required consent controls với version IDs                |

## Implementation Guide

| Layer          | Vị trí / Công việc                                         |
| -------------- | ---------------------------------------------------------- |
| Shared         | Policy type/version/status và consent schemas              |
| Database       | Policy, PolicyVersion và ConsentRecord models              |
| Backend        | New policies module with platform/public/consent use cases |
| Platform Admin | Policy list/editor/preview/publication views               |
| Web/Auth       | Public page và registration/onboarding integration         |

## Use Cases

### UC-WP14-01: Platform publish Terms version

- **Tác nhân:** Super Admin.
- **Luồng chính:** Soạn draft → preview → publish effective version → version cũ được giữ lịch sử.

### UC-WP14-02: Owner chấp nhận Policy khi đăng ký

- **Tác nhân:** Guest Owner.
- **Luồng chính:** Xem Policy links → chọn required consents → submit → ConsentRecord gắn đúng versions.

### UC-WP14-03: Public visitor đọc Policy

- **Tác nhân:** Public visitor.
- **Luồng chính:** Mở localized route → hệ thống trả effective published version.

## Checklists

### Planning / Design

- [ ] Chốt Policy types và locale fallback.
- [ ] Chốt effective-date collision policy.
- [ ] Chốt consent evidence fields và retention.
- [ ] Chốt content format/sanitization.

### Implementation

| Task ID  | Layer       | Task                                                  | Trạng thái |
| -------- | ----------- | ----------------------------------------------------- | ---------- |
| WP14-001 | Shared/DB   | Policy/version/consent contracts và models            | Todo       |
| WP14-002 | BE          | Draft/version/publish/archive use cases               | Todo       |
| WP14-003 | BE          | Public effective-policy query                         | Todo       |
| WP14-004 | BE          | Registration/onboarding consent enforcement           | Todo       |
| WP14-005 | FE Platform | List/editor/preview/version UI                        | Todo       |
| WP14-006 | FE Web      | Public Policy pages và consent controls               | Todo       |
| WP14-007 | Test        | Immutability, effective date, locale và consent tests | Todo       |

### Review & Testing

- [ ] Published version không sửa trực tiếp được.
- [ ] Consent không thay đổi khi version mới được publish.
- [ ] Draft/archived version không lộ public.
- [ ] Missing required consent bị server từ chối.
- [ ] Public locale route trả đúng effective version.

## Acceptance Criteria

- Platform quản lý đầy đủ Policy lifecycle.
- Public pages hiển thị đúng version theo locale/effective date.
- Registration/onboarding lưu consent gắn concrete version.
- Publication history có actor/time.
- API/Web/Platform tests, typecheck và build pass.

## Labels

`feature` `policies` `consent` `platform-admin` `backend` `frontend` `high` `week-11`
