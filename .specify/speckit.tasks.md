# SpecKit — Tasks Backlog (Student Attendance)

- Version: 1.0
- Date: 2025-11-04
- Owner: Delivery Lead / Tech Lead
- Status: Draft

This backlog translates the Plan into actionable tasks. IDs follow WBS codes from the plan (e.g., 02.01). Use the checkboxes to track progress. Priorities: P0 (Must), P1 (Should), P2 (Could). Estimates are rough and will be refined during sprint planning.

Legend per task:
- Format: [ ] TASK-<WBS> — Title (Owner, Priority, Est, Depends)

## Week 0 — Foundations (WBS-01)
- [X] TASK-01-01 — Author ADRs (stack, DB, auth hashing, token TTLs) (TL, P0, 0.5d)
- [X] TASK-01-02 — Repo setup: lint/format, commit hooks, CI skeleton (DevOps, P0, 1d)
- [X] TASK-01-03 — DB migrations + seed framework (Backend, P0, 1d)
- [X] TASK-01-04 — Base error handling and structured logging (Backend, P1, 0.5d)

## Week 1 — Auth & RBAC (WBS-02)
- [X] TASK-02-01 — User model + password hashing (Argon2/bcrypt) (Backend, P0, 1d, Depends: 01-03)
- [X] TASK-02-02 — Email verification + reset flows (Backend, P0, 1d, Depends: 02-01)
- [X] TASK-02-03 — JWT issue/refresh/revoke + route guards (Backend, P0, 1d, Depends: 02-01)
- [X] TASK-02-04 — Roles/permissions matrix + ownership checks (Backend, P0, 1d, Depends: 02-03)
- [ ] TASK-02-05 — Auth tests (unit/integration) (QA, P0, 0.5d, Depends: 02-03)

## Week 1 — Core Entities (WBS-03)
- [X] TASK-03-01 — Classes CRUD + import (CSV) (Backend, P0, 1d, Depends: 01-03)
- [X] TASK-03-02 — Students CRUD + import (CSV) (Backend, P0, 1d, Depends: 01-03)
- [X] TASK-03-03 — Enrollments CRUD; unique (classId, studentId) (Backend, P0, 0.5d, Depends: 03-01, 03-02)

## Week 2 — Sessions & Attendance (WBS-03/04)
- [X] TASK-03-04 — Sessions entity + APIs (create/list) (Backend, P0, 0.5d, Depends: 03-01)
- [X] TASK-03-05 — AttendanceRecord model + APIs (Backend, P0, 1d, Depends: 03-04)
- [X] TASK-04-01 — Bulk default Present + per-student quick toggles (Frontend, P0, 1d, Depends: 03-05)
- [X] TASK-04-02 — Notes per student + edit history (Frontend, P1, 0.5d, Depends: 03-05)
- [X] TASK-03-06 — AuditLog for attendance changes (Backend, P0, 0.5d, Depends: 03-05)
- [X] TASK-04-03 — Filters/pagination on attendance list (Frontend, P1, 0.5d)
- [ ] TASK-03-07 — Attendance integration tests (QA, P0, 0.5d, Depends: 03-05)

## Week 3 — QR, Geo, Realtime (WBS-05/06)
- [X] TASK-05-01 — Session QR rotating token issuer (Backend, P0, 0.75d, Depends: 03-04)
- [X] TASK-05-02 — QR scan endpoint (idempotent) (Backend, P0, 0.75d, Depends: 05-01)
- [X] TASK-05-03 — Geo capture fields + policy flag (Backend, P1, 0.5d)
- [X] TASK-05-04 — Teacher display QR + student scan UI (Frontend, P0, 1d, Depends: 05-02)
- [X] TASK-06-01 — SSE/WebSocket stream for attendance changes (Backend, P1, 0.75d, Depends: 03-05)
- [X] TASK-06-02 — Dashboard tiles (today sessions, counts) (Frontend, P1, 0.75d, Depends: 06-01)

## Week 4 — Leave & Email Notifications (WBS-07)
- [X] TASK-07-01 — LeaveRequest CRUD + workflow (submit/approve/reject/cancel) (Backend, P0, 1d)
- [ ] TASK-07-02 — LeaveBalance model + update rules (Backend, P1, 0.5d)
- [X] TASK-07-03 — Auto-update attendance to Leave/Excused on approval (Backend, P0, 0.5d, Depends: 07-01)
- [X] TASK-07-04 — Email provider integration + templates (Backend, P0, 0.75d)
- [ ] TASK-07-05 — Notification preferences per user (Backend, P1, 0.5d)
- [X] TASK-07-06 — Leave UI (request list/form, approvals) (Frontend, P0, 1d, Depends: 07-01)

## Week 5 — Exports & Offline (WBS-08/09)
- [X] TASK-08-01 — CSV exports with filters (Backend, P0, 0.75d)
- [X] TASK-08-02 — XLSX exports with filters (Backend, P1, 0.75d)
- [ ] TASK-09-01 — Local store schema & offline UX (Frontend, P0, 1d)
- [ ] TASK-09-02 — Sync engine + LWW conflict handling (Frontend, P0, 1d)
- [ ] TASK-09-03 — Conflict audit + basic banner (Frontend, P1, 0.5d)

## Additional Features (Custom)
- [X] CUSTOM-01 — Add Student to Class UI (Frontend, P0, 0.5d)
- [X] CUSTOM-02 — Class Details Screen with tabs (Frontend, P0, 1d)
- [X] CUSTOM-03 — Check-in to Class functionality (Frontend, P0, 0.5d)
- [X] CUSTOM-04 — Student list view in Class Details (Frontend, P0, 0.5d)
- [X] CUSTOM-05 — Dashboard Screen integration (Frontend, P1, 0.25d)

## Week 6 — Hardening, Docs, Pilot (WBS-10)
- [ ] TASK-10-01 — Security hardening: headers, rate limits, input validation (Backend, P0, 1d)
- [ ] TASK-10-02 — Indexes + performance pass (Backend, P0, 0.75d)
- [ ] TASK-10-03 — Observability: logs, health, metrics (Backend, P1, 0.5d)
- [ ] TASK-10-04 — CI pipelines: lint/build/tests + basic SAST (DevOps, P0, 0.75d)
- [ ] TASK-10-05 — User docs + release notes (PO/QA, P0, 0.5d)
- [ ] TASK-10-06 — Pilot run + feedback triage (Team, P0, 1d)

## Phase 2 (Selected)
- [ ] TASK-05-05 — Biometric device API integration spike (Backend, P2, 2d)
- [ ] TASK-07-07 — SMS + Web Push channels (Backend, P1, 1.5d)
- [ ] TASK-08-03 — PDF exports + scheduled exports (Backend, P1, 1.5d)
- [ ] TASK-08-04 — Calendar sync (Google/Outlook OAuth2) (Backend, P1, 2d)
- [ ] TASK-10-07 — Analytics baseline endpoints (Backend, P1, 1d)

## Phase 3 (Selected)
- [ ] TASK-02-06 — Enterprise SSO (OpenID Connect) (Backend, P2, 2d)
- [ ] TASK-06-03 — Rich dashboards & charting (Frontend, P2, 2d)
- [ ] TASK-10-08 — Predictive analytics spike (Backend, P2, 2d)

## Cross-cutting QA Tasks
- [ ] TASK-QA-01 — Test plan & cases (QA, P0, 0.75d)
- [ ] TASK-QA-02 — e2e happy-path: auth → attendance → export (QA, P0, 1d)
- [ ] TASK-QA-03 — Performance tests for exports (10k rows ≤ 10s) (QA, P1, 0.5d)

## Notes
- Replace owners/estimates as the team confirms availability.
- Convert selected tasks into GitHub Issues and label with WBS codes.
- Keep this backlog in sync with changes in the Plan and Specification.
