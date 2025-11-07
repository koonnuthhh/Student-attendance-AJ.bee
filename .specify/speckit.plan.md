# SpecKit — Delivery Plan (Student Attendance)

- Version: 1.0
- Date: 2025-11-04
- Owner: Delivery Lead / Tech Lead
- Status: Draft

This plan turns the Constitution and Specification into an executable roadmap. It defines phases, milestones, roles, WBS, environments, quality gates, and risks for the MVP and beyond.

## 1) Assumptions & Constraints
- Stack fixed: React Native (Expo or bare) + NestJS (TypeScript) + Supabase (PostgreSQL). ORM: TypeORM.
- Single-tenant MVP (one school/organization) with basic RBAC (Admin, Teacher, Student/Employee).
- Windows-friendly developer setup.
- Backend can deploy to AWS/GCP/Azure/Render/Fly.io; DB is managed by Supabase; CI/CD via GitHub Actions.

## 2) Roles & Responsibilities (RACI)
- Product Owner (PO): scope, priorities, acceptance.
- Tech Lead (TL): architecture, standards, code reviews.
- Backend Dev: APIs, DB schema/migrations, security.
- Frontend Dev: UI flows, state, offline support.
- QA/Tester: test plans, automation, exploratory testing.
- DevOps: CI/CD, infra templates, env config.

## 3) Milestones & Timeline (MVP ~6 weeks)
- Week 0: Kickoff & Foundations
  - Initialize RN app (Expo recommended), NestJS project, CI workflows; configure TypeORM; create Supabase project and capture connection string/credentials; create migration scaffolding; set coding standards and lint/format tools.
  - Deliverables: Repos scaffolded (RN + NestJS), CI green, Supabase connected from local NestJS, base migrations.
- Week 1: Auth + RBAC + Core Entities
  - JWT auth (register/login/refresh), email verification & reset; roles/permissions; CRUD for Class, Student, Enrollment.
  - Deliverables: Auth endpoints, RBAC middleware, CRUD APIs, seed data, unit tests.
- Week 2: Sessions + Attendance (Manual + Bulk)
  - Session creation; bulk mark default Present then edits; AuditLog for changes; basic attendance UI.
  - Deliverables: Sessions/Attendance APIs + UI; audit trail; integration tests.
- Week 3: QR + Geolocation (basic) + Realtime
  - Rotating session QR token; scan endpoint; optional geo capture; SSE/WebSocket updates to dashboard.
  - Deliverables: QR flow, geo fields, realtime stream, dashboard tiles (counts).
- Week 4: Leave Management + Email Notifications
  - Leave requests, approvals, balances; auto-update attendance to Leave/Excused; email via SMTP provider; user notification prefs.
  - Deliverables: Leave APIs/UI, email notifications, rules integration, tests.
- Week 5: Exports + Offline Mode (Local-first)
  - CSV/XLSX exports with filters; offline capture with IndexedDB/local store; sync with LWW conflict rule.
  - Deliverables: Export endpoints, offline UI state, sync engine, e2e happy-path tests.
- Week 6: Hardening, Docs, Pilot
  - Perf pass (indexes), security review, role tests; user docs; pilot with sample data; issue triage.
  - Deliverables: DoD checklist met; pilot feedback report; release notes.

## 4) Work Breakdown Structure (WBS)
- WBS-01 Foundations
  - 01.01 Decision records (ADR): stack, DB, auth hashing, token lifetimes
  - 01.02 Repo setup: lint/format, commit hooks, CI
  - 01.03 DB migrations/seed framework
  - 01.04 Base error handling and logging
- WBS-02 Authentication & RBAC
  - 02.01 User model, password hashing (Argon2/bcrypt)
  - 02.02 Email verification + reset flows
  - 02.03 JWT issue/refresh/revoke; route guards
  - 02.04 Roles/permissions matrix; ownership checks
- WBS-03 Core Data
  - 03.01 Classes, Students, Enrollments CRUD + import
  - 03.02 Sessions entity and scheduling metadata
  - 03.03 AttendanceRecord + AuditLog
- WBS-04 Attendance UX
  - 04.01 Bulk mark + quick toggles; keyboard shortcuts
  - 04.02 Notes per student; edit history
  - 04.03 List filters and pagination
- WBS-05 QR & Geolocation
  - 05.01 Rotating token issuer; scan endpoint (idempotent)
  - 05.02 Student vs Session QR modes
  - 05.03 Geo capture (lat/long/accuracy); privacy notice
- WBS-06 Realtime Dashboard
  - 06.01 SSE/WebSocket gateway
  - 06.02 Dashboard summaries and tiles
- WBS-07 Leave & Notifications
  - 07.01 Leave requests/approvals/balances
  - 07.02 Rules to override attendance to Leave/Excused
  - 07.03 Email notifications + preferences
- WBS-08 Exports & Reports
  - 08.01 CSV/XLSX exports with filters
  - 08.02 Report layouts (per-class, per-student)
- WBS-09 Offline & Sync
  - 09.01 Local store schema; offline marking UX
  - 09.02 Sync orchestration; conflict LWW; audit of conflicts
- WBS-10 Non-Functional & Ops
  - 10.01 Security hardening: headers, rate limits, input validation
  - 10.02 Indexes, query optimization, pagination
  - 10.03 Observability: structured logs, health endpoints, metrics
  - 10.04 CI pipelines: lint, build, tests, DAST/SAST (basic)

## 5) Environments & Tooling
- Local: .env templates, SQLite/PostgreSQL; seed scripts; mock SMTP.
- Dev/QA: Managed Postgres, real SMTP sandbox; feature flags for QR/geo/offline.
- CI/CD: GitHub Actions (lint, unit, integration, e2e suites; artifact build; deploy on tag).

## 6) Quality Gates (per merge & per release)
- Build: passes lint/format/type-check.
- Tests: unit ≥ 70% core modules; integration happy paths; e2e smoke for auth + attendance + export.
- Security: dependencies scan; basic OWASP checks; JWT/refresh rotation tests; rate limiting validated.
- Performance: p95 API < 300ms for core endpoints on small data; export ≤ 10s for 10k rows.
- Docs: updated API docs; README and user guide.

## 7) Data & Migrations
- Entities: User, Role, UserRole, Class, Student, Enrollment, Session, AttendanceRecord, AuditLog, QRToken, LeaveRequest, LeaveBalance, Notification, Preference.
- Strategy: forward-only migrations; seed data for demo.
- Indexes: (AttendanceRecord sessionId, studentId), (Session classId, date), (User email unique), (Enrollment classId, studentId unique).

## 8) Security & Privacy Plan
- Password hashing: Argon2id/bcrypt; token TTLs; refresh rotation.
- HTTPS everywhere; HSTS; secure cookies (if used); CORS policy.
- RBAC enforced in middleware and DB queries where applicable.
- PII minimization; configurable data retention for audit/geo.

## 9) Rollout & Pilot
- Pilot scope: 1–2 classes, 25–40 students each; 2-week run.
- Success metrics: speed to mark, error rate, export reliability, user satisfaction (NPS-like survey).
- Rollback plan: toggle back to manual method; export data snapshot for continuity.

## 10) Risks & Mitigations
- R1 Stack indecision delays start → Timebox decision (Week 0) with ADR.
- R2 Performance with large rosters → Virtualized lists, pagination, indexes.
- R3 Security gaps in auth → Use battle-tested libs, add rate limits, pen-test checklist.
- R4 Offline conflict surprises → LWW with audit + user-facing conflict banner.
- R5 QR replay/spoof → Rotate tokens, short validity, grace window, signature.

## 11) Backlog by Phase
- MVP (must-have): Auth, RBAC, Classes/Students, Sessions/Attendance (manual/bulk), QR basic, Geo optional, Dashboard counts, Leave basic, Email, Exports CSV/XLSX, Offline capture + sync LWW.
- Phase 2: SMS/push, PDF exports + scheduled exports, Calendar sync, Analytics baseline.
- Phase 3: SSO/OIDC enterprise, rich dashboards, predictive analytics.

## 12) Definition of Done (DoD)
- Feature has unit/integration tests; docs updated; API contract stable; permissions enforced; telemetry in place; performance budgets met; feature flag documented if applicable.

## 13) Open Questions
- Final stack choice and ORM (Prisma/JPA).
- Preferred cloud & email/SMS providers.
- Geo radius/policy per class; data retention periods.
- Biometric vendor feasibility and schedule.
