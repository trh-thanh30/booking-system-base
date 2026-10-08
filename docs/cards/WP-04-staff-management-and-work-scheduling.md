# [Feature] WP-04: Staff Management & Work Scheduling

| Thuộc tính | Giá trị                               |
| ---------- | ------------------------------------- |
| Trạng thái | Not started as a domain               |
| Giai đoạn  | Tuần 3–4                              |
| Ưu tiên    | Critical                              |
| Bề mặt     | API, Business Admin, Shared contracts |

## Goal

Cho Owner quản lý toàn bộ vòng đời nhân viên vận hành: hồ sơ Staff, tài khoản, Business access, dịch vụ phụ trách, lịch làm việc, ngày nghỉ và lịch cá nhân.

## Tại sao cần feature này?

`User` chỉ mô tả danh tính đăng nhập, không đủ đại diện cho người thực hiện dịch vụ. Availability cần Staff Profile và schedule riêng, kể cả khi nhân viên chưa có tài khoản.

## Scope

### Bao gồm

- Staff Profile CRUD và soft delete.
- Liên kết tùy chọn giữa Staff Profile và User account.
- Role nghiệp vụ tối thiểu: Manager, Receptionist và Staff.
- BusinessMembership cho Staff có tài khoản.
- Gán một hoặc nhiều Service cho Staff.
- Weekly working hours với nhiều interval nếu được chốt.
- Staff day off hoặc exception schedule.
- Personal calendar read model.
- Business Admin list, detail, form, assignment và schedule editor.
- Excel import/export Staff nếu còn trong scope data operations đã khóa.

### Không bao gồm

- Payroll, commission và attendance.
- Một shift trải qua nhiều Business.
- Staff tự đăng ký public.
- Business-specific permission chi tiết ngoài membership Phase 1.

## Dependencies

- WP-01: invitation, User, permission và BusinessMembership foundation.
- WP-02: Business timezone và operating hours.
- WP-03 cung cấp Service để assignment; Staff CRUD/schedule có thể bắt đầu song song.

## Actors & Access Control

| Actor                 | Khả năng                                                       |
| --------------------- | -------------------------------------------------------------- |
| Owner                 | Full Staff CRUD, account invitation, assignment và schedule    |
| Manager có permission | Quản lý Staff trong Business được cấp                          |
| Receptionist          | Đọc Staff/calendar để vận hành booking                         |
| Staff                 | Xem profile, schedule và Appointment của chính mình theo quyền |

## Data / Domain

### Entities cần có

- `StaffProfile`: hồ sơ người thực hiện dịch vụ, tách khỏi credential.
- `StaffService`: N-N giữa Staff và Service trong cùng Business.
- `StaffWorkingHour`: weekly intervals theo Business timezone.
- `StaffDayOff` hoặc `StaffScheduleException`: ngày nghỉ/ngoại lệ.
- `BusinessMembership`: giới hạn User account theo Business.

### Quan hệ chính

- Business 1-N StaffProfile.
- User 0..1-1 StaffProfile trong scope Business/Tenant đã chốt.
- StaffProfile N-N Service.
- StaffProfile 1-N WorkingHour và ScheduleException.

## Business Rules

- Staff Profile có thể tồn tại mà chưa có User account.
- User được link phải thuộc cùng Tenant và có membership phù hợp.
- Working intervals cùng ngày không overlap.
- Staff chỉ được gán active Service cùng Business.
- Day off loại Staff khỏi Availability trong khoảng áp dụng.
- Không hard delete Staff có Appointment lịch sử hoặc tương lai.
- Invitation accept không được tạo Staff/membership dở dang.

## Main Flows

### Flow 1: Tạo Staff chưa có tài khoản

`Owner mở Staff → nhập profile → chọn Services → đặt weekly schedule → lưu active Staff`.

### Flow 2: Mời Staff đăng nhập

`Chọn Staff Profile → nhập email/permissions/Business → gửi invitation → Staff accept → link User + membership`.

### Flow 3: Điều chỉnh lịch làm việc

`Mở schedule → sửa weekly intervals hoặc thêm day off → validate → lưu → Availability dùng revision mới`.

## API Contract

| Method                | Endpoint                          | Trạng thái              | Mục đích                     |
| --------------------- | --------------------------------- | ----------------------- | ---------------------------- |
| GET/POST              | `/api/v1/staff`                   | Target                  | List/create Staff Profile    |
| GET/PATCH/DELETE      | `/api/v1/staff/:id`               | Target                  | Detail/update/archive Staff  |
| GET/PUT               | `/api/v1/staff/:id/services`      | Target                  | Service assignment           |
| GET/PUT               | `/api/v1/staff/:id/working-hours` | Target                  | Weekly schedule              |
| GET/POST/PATCH/DELETE | `/api/v1/staff/:id/days-off`      | Target                  | Schedule exceptions          |
| GET                   | `/api/v1/staff/:id/calendar`      | Target                  | Personal calendar read model |
| POST                  | `/api/v1/auth/invitations`        | Current, cần hoàn thiện | Invite account cho Staff     |

## UI / Routes

| Route                                 | Màn hình                             |
| ------------------------------------- | ------------------------------------ |
| `/{locale}/admin/staff`               | Staff list, filters và status        |
| `/{locale}/admin/staff/new`           | Create Staff Profile                 |
| `/{locale}/admin/staff/[id]`          | Profile, account, services và access |
| `/{locale}/admin/staff/[id]/schedule` | Weekly hours và days off             |
| `/{locale}/admin/staff/[id]/calendar` | Personal calendar                    |

## Implementation Guide

| Layer          | Vị trí / Công việc                                                       |
| -------------- | ------------------------------------------------------------------------ |
| Shared         | Staff profile, assignment, schedule và calendar contracts                |
| Database       | StaffProfile, StaffService, WorkingHour và ScheduleException models      |
| Backend        | Tạo `apps/api/src/modules/staff` theo controller → use case → repository |
| Integration    | Auth invitation, permission, BusinessMembership và Service modules       |
| Business Admin | Tạo `apps/web/src/views/admin/staff` và thin route pages                 |

## Use Cases

### UC-WP04-01: Owner tạo và gán dịch vụ cho Staff

- **Tác nhân:** Owner/Manager có permission.
- **Luồng chính:** Tạo profile → chọn active Services → đặt schedule → activate.
- **Ngoại lệ:** Service khác Business, interval overlap hoặc profile trùng theo policy.

### UC-WP04-02: Owner cấp tài khoản cho Staff

- **Tác nhân:** Owner.
- **Luồng chính:** Chọn Staff → tạo invitation → Staff accept → link User và membership.
- **Ngoại lệ:** Email tồn tại ở Tenant khác hoặc invitation bị replay.

### UC-WP04-03: Staff xem lịch cá nhân

- **Tác nhân:** Staff đã đăng nhập.
- **Luồng chính:** Mở calendar → hệ thống scope theo Staff hiện tại → hiển thị schedule và Appointment được phép.

## Checklists

### Planning / Design

- [ ] Chốt StaffProfile–User cardinality.
- [ ] Chốt schedule interval và exception model.
- [ ] Chốt Staff status/archive policy.
- [ ] Chốt permission matrix Owner/Manager/Receptionist/Staff.

### Implementation

| Task ID  | Layer     | Task                                            | Trạng thái |
| -------- | --------- | ----------------------------------------------- | ---------- |
| WP04-001 | Shared/DB | Staff, assignment và schedule contracts/models  | Todo       |
| WP04-002 | BE        | Staff Profile CRUD và archive use cases         | Todo       |
| WP04-003 | BE        | Service assignment use cases                    | Todo       |
| WP04-004 | BE        | Working hours và days-off use cases             | Todo       |
| WP04-005 | BE        | Invitation/account linking integration          | Todo       |
| WP04-006 | FE        | Staff list/create/detail UI                     | Todo       |
| WP04-007 | FE        | Assignment và schedule editor                   | Todo       |
| WP04-008 | FE/BE     | Personal calendar read model/UI                 | Todo       |
| WP04-009 | Test      | Permission, isolation, overlap và day-off tests | Todo       |

### Review & Testing

- [ ] Staff không có account vẫn được gán Service và xuất hiện trong Availability.
- [ ] Staff có account chỉ truy cập Business qua membership.
- [ ] Interval overlap và Service khác Business bị từ chối.
- [ ] Day off loại đúng Staff khỏi slot.
- [ ] Archive không phá Appointment history.

## Acceptance Criteria

- Owner tạo, sửa và archive Staff Profile.
- Owner gán Staff vào active Services cùng Business.
- Weekly hours và days off lưu đúng Business timezone.
- Invitation có thể link account vào đúng Staff Profile và BusinessMembership.
- Staff personal calendar chỉ trả dữ liệu được phép.
- API/Web tests, typecheck và build pass.

## Labels

`feature` `staff-management` `scheduling` `backend` `frontend` `critical` `week-3`
