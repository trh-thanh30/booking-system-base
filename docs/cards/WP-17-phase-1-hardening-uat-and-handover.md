# [Release] WP-17: Phase 1 Hardening, UAT & Handover

| Thuộc tính | Giá trị                        |
| ---------- | ------------------------------ |
| Trạng thái | Not started as a release phase |
| Giai đoạn  | Tuần 13                        |
| Ưu tiên    | Critical                       |
| Bề mặt     | Toàn hệ thống và vận hành      |

## Goal

Chứng minh Phase 1 đạt acceptance trên staging, có thể deploy/rollback và được bàn giao kèm test evidence, runbook, environment matrix và known limitations.

## Tại sao cần feature này?

Các test riêng lẻ không chứng minh toàn bộ hành trình hoạt động trong môi trường gần production. Release cần migration rehearsal, external-service smoke test và acceptance evidence có thể truy vết.

## Scope

### Bao gồm

- Regression bốn miền: Landing, Business Admin, public booking và Platform Admin.
- E2E P0 trong implementation plan.
- Security review RBAC, Tenant leakage, public enumeration và rate limit.
- Responsive/accessibility QA trên mobile, tablet và desktop.
- Migration rehearsal trên staging copy và rollback rehearsal.
- Smoke test email worker, reminder scheduler và Stripe webhook.
- Staging/UAT deployment và closure blocker/critical/high bugs.
- Runbook, environment matrix, seed, Stripe, Policy và Contact documentation.
- Acceptance evidence theo tiêu chí báo giá.

### Không bao gồm

- Audit portal nâng cao.
- Multi-region, auto-scaling và Kubernetes.
- Phase 2: customer payment, loyalty, marketing automation và waitlist.

## Dependencies

- WP-00 đến WP-16 đạt Definition of Done hoặc có waiver được phê duyệt.

## Actors & Access Control

| Actor           | Trách nhiệm                             |
| --------------- | --------------------------------------- |
| QA/PO           | UAT và acceptance sign-off              |
| Developers      | Fix defects, migration và evidence      |
| DevOps          | Deploy, rollback, monitoring và secrets |
| Business tester | Validate Owner/Staff/Guest workflows    |
| Platform tester | Validate Super Admin workflows          |

## Data / Domain

Release không tạo business entity mới. Nó xác minh migration, dữ liệu staging, operational history và acceptance evidence của các domain đã triển khai.

### Required Operational History

- Appointment status/change history.
- Subscription webhook event audit tối thiểu.
- Policy publication và Consent history.
- Contact note/reply/status history.
- Tenant suspend/reactivate history.

## Business Rules

- Không release nếu còn blocker, critical hoặc high bug trong phạm vi Phase 1.
- Migration phải được backup/rehearse trước production deployment.
- Image tags/release artifacts phải immutable và truy được commit.
- Secrets production không nằm trong repository hoặc test logs.
- Rollback procedure phải nêu rõ giới hạn khi migration không backward-compatible.
- Known limitation phải được PO chấp nhận bằng văn bản.

## Main Flows

### Flow 1: Release candidate

`Freeze scope → build immutable artifacts → migrate staging → run P0/E2E/security/QA → triage defects → approve RC`.

### Flow 2: Deployment rehearsal

`Backup → deploy/migrate → health/smoke → verify worker/webhooks → rollback app/database theo runbook → verify recovery`.

### Flow 3: Handover

`Collect evidence → finalize runbook/env matrix/known limits → walkthrough vận hành → sign-off`.

## P0 End-to-End Scenarios

1. Owner email signup → verify → onboarding → Business Admin.
2. Owner Google OAuth → onboarding hoặc existing workspace login.
3. Owner tạo Service và Staff, gán Service, cấu hình schedule.
4. Guest đặt lịch → nhận email → lookup bằng code + phone.
5. Receptionist reschedule/cancel → history và email đúng.
6. Concurrent booking cùng slot chỉ một request thành công.
7. Super Admin suspend Tenant → public booking bị chặn.
8. Owner subscribe Stripe test mode → webhook cập nhật state.
9. Platform publish Policy → registration lưu đúng consent version.
10. Public contact → Platform inbox → reply email/history.

## Implementation Guide

| Area          | Công việc                                                     |
| ------------- | ------------------------------------------------------------- |
| CI            | Root lint/typecheck/test/build, dependency và container scans |
| E2E           | Browser suite cho P0, auth contexts và responsive breakpoints |
| Security      | Tenant/Business isolation, RBAC, rate limit và enumeration    |
| Database      | Migration/rollback rehearsal và data verification queries     |
| Operations    | Health, logs, Sentry, worker, scheduler và Stripe webhook     |
| Documentation | Deploy/rollback/runbook/env/seed/external integrations        |

## Use Cases

### UC-WP17-01: QA nghiệm thu booking end-to-end

- **Tác nhân:** QA/Business tester.
- **Luồng chính:** Setup Business → publish catalog/schedule → guest booking → Admin operation → notification/report verification.

### UC-WP17-02: DevOps rollback release candidate

- **Tác nhân:** DevOps.
- **Luồng chính:** Theo runbook rollback artifact/config/database → health check → xác minh data integrity.

### UC-WP17-03: PO ký nghiệm thu

- **Tác nhân:** PO.
- **Luồng chính:** Review evidence, known limitations và acceptance matrix → approve hoặc trả defect list.

## Checklists

### Planning / Design

- [ ] Chốt UAT environment và test data.
- [ ] Chốt acceptance evidence format và owners.
- [ ] Chốt production deployment/rollback window.
- [ ] Chốt severity policy và release gate.

### Implementation / Release

| Task ID  | Area        | Task                                       | Trạng thái |
| -------- | ----------- | ------------------------------------------ | ---------- |
| WP17-001 | QA          | Automate/run P0 E2E suite                  | Todo       |
| WP17-002 | Security    | RBAC/isolation/rate-limit review           | Todo       |
| WP17-003 | QA          | Responsive/accessibility/browser matrix    | Todo       |
| WP17-004 | DB/Ops      | Migration và rollback rehearsal            | Todo       |
| WP17-005 | Integration | Email/scheduler/Stripe staging smoke       | Todo       |
| WP17-006 | Docs        | Runbook, env matrix và known limitations   | Todo       |
| WP17-007 | Release     | UAT deployment, defect closure và sign-off | Todo       |

### Verification Commands

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Dependency/container security scans.
- [ ] Browser E2E và manual responsive/accessibility QA.
- [ ] Deployment, health check và rollback rehearsal.

## Acceptance Criteria

- Tất cả P0 scenarios pass trên staging.
- Không còn blocker, critical hoặc high bug trong phạm vi Phase 1.
- Không có known Tenant/Business data leakage.
- Migration và rollback chạy đúng runbook.
- Email, reminder và Stripe webhook có evidence test-mode thật.
- Tài liệu đủ để đội vận hành deploy và xử lý sự cố cơ bản.

## Labels

`release` `uat` `security` `operations` `documentation` `critical` `week-13`
