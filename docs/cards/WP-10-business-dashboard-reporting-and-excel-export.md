# [Feature] WP-10: Business Dashboard, Reporting & Excel Export

| Thuộc tính | Giá trị                                         |
| ---------- | ----------------------------------------------- |
| Trạng thái | Reporting not started; Dashboard uses mock data |
| Giai đoạn  | Tuần 8                                          |
| Ưu tiên    | High                                            |
| Bề mặt     | API, Business Admin                             |

## Goal

Thay Business Admin Dashboard mock bằng số liệu Appointment thật và cung cấp report/export tối thiểu cho vận hành Phase 1.

## Tại sao cần feature này?

Owner cần thấy tình hình booking và hiệu suất dịch vụ/nhân viên. Dashboard và file Excel phải dùng cùng filter semantics để tránh hai nguồn số liệu mâu thuẫn.

## Scope

### Bao gồm

- Tổng Appointment theo date range.
- Estimated revenue từ completed Appointment.
- Summary theo pending, confirmed, completed, cancelled và no-show.
- Top Service theo booking count.
- Top Staff theo completed count và estimated revenue.
- New/returning Customer count nếu WP-05 hỗ trợ ổn định.
- Filter theo date range và Business context.
- Excel export dùng đúng filter đang áp dụng.
- Loading, empty, error và insufficient-permission states.

### Không bao gồm

- Accounting-grade revenue.
- Tax invoice.
- Forecasting, cohort analytics hoặc BI warehouse.
- Scheduled report delivery.

## Dependencies

- WP-08: Appointment Operations.
- WP-05 và WP-04 cung cấp Customer/Staff dimensions cho các breakdown tương ứng.

## Actors & Access Control

| Actor                              | Khả năng                                            |
| ---------------------------------- | --------------------------------------------------- |
| Owner/Manager có report permission | Xem KPI, chart, ranking và export                   |
| Staff                              | Chỉ xem scope cá nhân nếu permission model cho phép |
| Platform Operator                  | Không truy cập Business report qua feature này      |

## Data / Domain

### Metrics

- Appointment counts theo status và local date range.
- Estimated revenue là tổng Service snapshot price của completed Appointment.
- Top Service/Staff dùng cùng Business/date/status filters.
- New/returning Customer có định nghĩa cố định trước khi triển khai.

### Query rules

- Mọi aggregate scope theo `tenant_id + business_id`.
- Date range được chuyển theo Business timezone trước khi query UTC Instants.
- API giới hạn maximum range và result size.

## Business Rules

- Revenue chỉ tính completed Appointment.
- Cancelled/no-show không đóng góp revenue.
- Count phải khớp Appointment list với cùng filter.
- Export phải phản ánh filter, locale và Business đang chọn.
- Không tạo snapshot/materialized view sớm nếu aggregate query còn đáp ứng Phase 1.

## Main Flows

### Flow 1: Xem dashboard

`Chọn Business/date range → fetch summary/rankings → render cards/charts → đổi filter và refetch`.

### Flow 2: Export report

`Giữ filter hiện tại → request export → server query cùng semantics → stream file → ghi tên file/localized columns`.

## API Contract

| Method | Endpoint                    | Trạng thái | Mục đích              |
| ------ | --------------------------- | ---------- | --------------------- |
| GET    | `/api/v1/reports/dashboard` | Target     | KPI và status summary |
| GET    | `/api/v1/reports/services`  | Target     | Service ranking       |
| GET    | `/api/v1/reports/staff`     | Target     | Staff ranking         |
| GET    | `/api/v1/reports/customers` | Target     | New/returning summary |
| GET    | `/api/v1/reports/export`    | Target     | Filtered Excel export |

## UI / Routes

| Route                       | Màn hình                            |
| --------------------------- | ----------------------------------- |
| `/{locale}/admin/dashboard` | KPI cards, charts và rankings       |
| `/{locale}/admin/reports`   | Detailed reports, filters và export |

## Implementation Guide

| Layer          | Vị trí / Công việc                                                     |
| -------------- | ---------------------------------------------------------------------- |
| Shared         | Report filters, metric DTOs và export request schema                   |
| Backend        | Tạo module `reports` với repositories/read queries và tests            |
| Database       | Aggregate-friendly indexes; chưa thêm snapshot nếu chưa đo tải         |
| Business Admin | Thay mock trong `apps/web/src/views/admin/dashboard`; tạo reports view |
| Excel          | Server-side workbook generation với bounded rows                       |

## Use Cases

### UC-WP10-01: Owner xem hiệu quả theo tuần

- **Tác nhân:** Owner.
- **Luồng chính:** Chọn tuần/Business → xem counts, estimated revenue, top Services và Staff.

### UC-WP10-02: Manager xuất báo cáo đang lọc

- **Tác nhân:** Manager có permission.
- **Luồng chính:** Chọn range/status → export → file khớp dữ liệu đang xem.
- **Ngoại lệ:** Range quá lớn hoặc không có permission.

## Checklists

### Planning / Design

- [ ] Chốt metric definitions và status inclusion.
- [ ] Chốt maximum date range và export row limit.
- [ ] Chốt new/returning Customer definition.
- [ ] Chốt report permission keys.

### Implementation

| Task ID  | Layer  | Task                                               | Trạng thái |
| -------- | ------ | -------------------------------------------------- | ---------- |
| WP10-001 | Shared | Report filters và metric contracts                 | Todo       |
| WP10-002 | BE     | Dashboard aggregate queries/use cases              | Todo       |
| WP10-003 | BE     | Service/Staff/Customer report queries              | Todo       |
| WP10-004 | BE     | Excel export dùng cùng filter semantics            | Todo       |
| WP10-005 | FE     | Replace Dashboard mock data                        | Todo       |
| WP10-006 | FE     | Reports view, filters và export states             | Todo       |
| WP10-007 | Test   | Aggregate correctness, isolation và export content | Todo       |

### Review & Testing

- [ ] KPI khớp Appointment list với cùng filter.
- [ ] Revenue không tính non-completed Appointment.
- [ ] Timezone boundary không lệch ngày báo cáo.
- [ ] Cross-Business aggregate bị chặn.
- [ ] Chart có text alternative và responsive behavior.

## Acceptance Criteria

- Dashboard dùng API thật và không còn mock KPI.
- Report và Excel export cho cùng kết quả với cùng filter.
- Aggregate luôn scope theo Tenant + Business.
- Date range, permission và row limit được enforce ở server.
- API/Web tests, typecheck và build pass.

## Labels

`feature` `dashboard` `reporting` `excel` `backend` `frontend` `high` `week-8`
