# SpecKit — Student Attendance: Functional Specification

- Version: 1.0
- Date: 2025-11-04
- Owner: Product + Engineering
- Status: Draft

This specification details end-to-end functional requirements, user stories, API contracts, data shapes, and acceptance criteria for the Student Attendance system. It maps requested capabilities into phased delivery (MVP → Phase 2 → Phase 3) to balance time-to-value and complexity.

## Tech stack requirement (fixed)
- Frontend: React Native (Expo or bare React Native) for Android and iOS.
- Backend: NestJS (Node.js), using TypeScript.
- Database: Supabase (managed PostgreSQL). Application connects via standard Postgres connection string.
- ORM: TypeORM (NestJS integration) mapping to Supabase Postgres.
- Auth: Application-managed JWT in NestJS; optional future integration with Supabase Auth if required.
- Realtime: NestJS WebSocket gateway or Server-Sent Events; compatible with React Native client.
- Storage/Files: If needed, prefer Supabase Storage.

Acceptance: Build and run RN app on Android emulator/device; NestJS API boots and connects to Supabase; .env contains SUPABASE_URL/DB connection vars; core flows (auth, classes, attendance) work end-to-end.

## 0) Release Plan by Phase
- MVP (Phase 1): 1, 2 (manual + QR basic + geolocation capture), 3 (basic), 4 (basic), 5 (email), 6 (RBAC core), 7 (CSV/XLSX export), 9 (offline capture local + simple LWW), NFRs core
- Phase 2: 2 (biometric integration optional), 5 (SMS/push), 7 (PDF + scheduled exports), 8 (calendar sync), 10 (analytics baseline)
- Phase 3: 1 (SSO/OAuth2 enterprise), 3 (rich live dashboards and charts), 10 (predictive models)

Notes: The stack is fixed to React Native + NestJS + Supabase (PostgreSQL). Backend uses JWT over HTTPS. Replace RN/Nest specifics only if explicitly re-scoped later.

## 1) User Authentication

### User Stories
- As a user, I can sign in securely to access my permitted features.
- As an Admin, I can invite users, assign roles (Admin, Teacher, Student, Employee).
- As a user, I can reset my password and verify my email.
- [Later] As an IT admin, I can enable SSO (OAuth2/OpenID Connect with Google/Microsoft/ADFS).

### Functional Requirements
- Email/username + password login using JWT (access + refresh) with rotation.
- Email verification on registration/invite.
- Password reset via time-bound token (15–60 minutes).
- Account status flags: active, suspended, pending-verification.
- SSO/OAuth2 optional feature flag per environment.

### API (example)
- POST /auth/register { email, name, password }
- POST /auth/login { email, password } → { accessToken, refreshToken }
- POST /auth/refresh { refreshToken } → rotated tokens
- POST /auth/logout
- POST /auth/forgot-password { email }
- POST /auth/reset-password { token, newPassword }
- POST /auth/verify-email { token }
- GET  /auth/me → current user

### Data Model
- User { id, name, email (unique), passwordHash, emailVerifiedAt?, status, locale?, createdAt, updatedAt }
- Role { id, name in [Admin, Teacher, Student, Employee], description }
- UserRole { userId, roleId }
- VerificationToken { id, userId, type in [email, reset], token, expiresAt, usedAt? }

### Security
- Hash passwords with Argon2id or bcrypt (cost ≥ 12), store salted hashes only.
- Enforce strong passwords and rate-limit login.
- JWT: short-lived access (≤ 15 min), refresh (≤ 7 days) with rotation & revocation list.

### Acceptance Criteria
- Email verification required before access to protected endpoints unless role=Admin bypass (configurable).
- Successful login returns tokens; invalid credentials receive 401 without revealing which field failed.

## 2) Attendance Marking

### User Stories
- As a Teacher, I can create a session for a class and quickly mark Present/Absent/Late.
- As a Student/Employee, I can check in via QR scan (if enabled by teacher/session).
- As an Admin, I can manually override or correct attendance with an audit log.
- As a Teacher, I can capture geolocation with attendance (optional) to confirm presence.
- [Later] Biometric device integration via vendor API.

### Concepts & Rules
- Session: A scheduled occurrence of a class/date/time.
- AttendanceRecord: status ∈ { Present, Absent, Late, Excused, Leave }.
- Default bulk-set to Present, adjust exceptions.
- Geolocation capture optional; store lat/long/accuracy.
- QR Mode options:
  - Session QR (displayed in class): rotating token every 30–60s; student scans and self-checks in.
  - Student QR (teacher scans): student-specific code encoded with studentId; validated against open session.
- Manual override: Admin-only or Teacher-with-reason (configurable) with audit trail.

### API (example)
- POST /classes { name, subject }
- POST /classes/:id/students (bulk) { students: [{ name, studentId, email? }, ...] }
- POST /classes/:id/sessions { date, startTime?, endTime? }
- GET  /sessions/:sid/attendance → list records
- POST /sessions/:sid/attendance/bulk { defaultStatus, overrides: [{ studentId, status, note? }] }
- PATCH /attendance/:id { status, note? }
- POST /sessions/:sid/attendance/qr-scan { code, lat?, long?, accuracy? }
- GET  /sessions/:sid/qr-token → { token, expiresAt } (teacher-only)

### Data Model
- Class { id, name, subject?, teacherId, timezone?, createdAt }
- Student { id, firstName, lastName, studentId, email?, createdAt }
- Enrollment { id, classId, studentId, status }
- Session { id, classId, date, startTime?, endTime?, qrMode in [session, student, off], geoRequired? }
- AttendanceRecord { id, sessionId, studentId, status, note?, lat?, long?, accuracy?, markedBy, markedAt, source in [manual, qr, api, biometric] }
- AuditLog { id, entity, entityId, action, changedBy, changes, createdAt }
- QRToken { id, sessionId, token, expiresAt, rotatedAt }

### Acceptance Criteria
- Can mark full class within 60s using bulk + quick toggles.
- QR verification prevents replay: token rotation and per-session validation.
- Geolocation stored only if provided; privacy notice displayed if enabled.

## 3) Real-time Dashboard & Reporting

### User Stories
- As a Teacher/Admin, I can see live counts of Present/Absent/Late for ongoing sessions.
- As an Admin, I can view summaries by class/department/date and simple charts.

### Functional Requirements
- Real-time updates via WebSocket or SSE when attendance records change.
- Dashboard tiles: Today’s sessions, counts, late %, absentee %, trend sparkline (last 7 days).
- Filters: class, department, date range.

### API & Events
- GET /dashboard/summary?dateRange&classId&deptId
- Stream: /stream/attendance (SSE) broadcasting record changes { sessionId, studentId, status, markedAt }.

### Acceptance Criteria
- Dashboard updates within ≤ 2s of a change.

## 4) Leave & Absence Management

### User Stories
- As a Student/Employee, I request leave for a date/time range with reason.
- As a Teacher/Admin, I approve or reject requests.
- Approved leave auto-updates attendance to Leave/Excused.

### Workflow
- States: draft → submitted → approved | rejected | cancelled.
- Balance tracking per leave type (e.g., annual, sick) configurable.

### API
- POST /leave { userId, type, start, end, reason }
- GET  /leave?userId&status
- PATCH /leave/:id { action: approve|reject|cancel, approverComment? }

### Data Model
- LeaveRequest { id, userId, type, start, end, reason?, status, approverId?, decidedAt?, createdAt }
- LeaveBalance { id, userId, type, remaining }

### Acceptance Criteria
- When approved, overlapping sessions’ attendance becomes Leave (or Excused).

## 5) Notifications

### Functional Requirements
- Channels: Email (MVP), SMS (Phase 2), Web Push (Phase 2).
- Trigger events: attendance marked Absent/Late, leave status changes, reminders.
- User notification preferences per channel and event type.

### API
- POST /notifications/test (admin only)
- PUT  /users/:id/preferences { notifications: {...} }

### Data Model
- Notification { id, userId, type, channel, payload, status in [queued, sent, failed], createdAt }
- Preference { id, userId, channels: { email: true, sms: false, push: false }, events: {...} }

### Integration Notes
- Email: SMTP provider (e.g., SES, SendGrid).
- SMS: Twilio or similar.
- Push: Web Push (VAPID).

## 6) Role-based Access Control (RBAC)

### Roles & Permissions (core)
- Admin: manage users/roles, classes, global settings, override attendance, exports, reports.
- Teacher: manage assigned classes, take attendance, view reports for own classes.
- Student/Employee: self-view attendance history, request leave.

### Permission Matrix (examples)
- classes: read (Admin, Teacher), write (Admin, Teacher[own])
- sessions: read (Admin, Teacher[own]), write (Admin, Teacher[own])
- attendance: read (Admin, Teacher[own], Self[own history]), write (Admin, Teacher[own])
- users: read/write (Admin only)
- leave: read (Admin, Teacher[own class], Self), approve (Admin, Teacher[own class])

### Implementation
- Route guards check JWT + role + ownership of resource (teacher’s class, student=self).

## 7) Export & Reports

### Functional Requirements
- Export attendance by filters: date range, class, department, user.
- Formats: CSV, XLSX (MVP), PDF (Phase 2).
- Scheduled exports (Phase 2) delivered via email.

### API
- GET /exports/attendance.csv?from&to&classId&userId
- GET /exports/attendance.xlsx?...
- POST /exports/schedule { cron, filters, format, recipients[] }

### Acceptance Criteria
- Exports generate within ≤ 10 seconds for 10k records.

## 8) Calendar Integration

### Functional Requirements
- Sync with Google/Outlook for class sessions and holidays.
- Show upcoming sessions and school calendar in app.
- Automatic updates on changes.

### API & Integration
- OAuth2 for Google/Outlook; store refresh tokens securely.
- Webhook/polling to keep sessions in sync.
- Provide ICS feed per class as an alternative.

## 9) Offline Sync Mode

### Functional Requirements
- Mark attendance offline using local storage/indexed DB.
- Auto-sync on reconnection; show sync status.
- Conflict resolution: latest update wins (LWW) using updatedAt; keep audit log of conflicts.

### Data
- Each entity has updatedAt; client assigns temp IDs and reconciles on sync.

### Acceptance Criteria
- Offline marking produces identical end state after sync given no concurrent newer server updates.

## 10) Analytics

### Functional Requirements
- Lateness trends, attendance rates per class/user/department.
- High-absence detection rules; flag frequent absentees.
- [Phase 3] Predictive models (simple logistic baseline) with opt-out.

### API
- GET /analytics/summary?range&classId&deptId
- GET /analytics/leaderboard?metric=lateness|attendance

## 11) Non-Functional Requirements
- UI: Responsive and mobile-friendly; key flows ≤ 1s perceived latency.
- API Security: HTTPS, JWT, CSRF-safe for cookie flows, input validation, audit logging.
- Scalability: Horizontal-ready stateless API; background workers for exports/notifications.
- Observability: Structured logs, metrics (p95 latency), health endpoints.
- Data: PostgreSQL with sensible indexes; migrations; backups; PII minimization.
- Deployment: Cloud (AWS/GCP/Azure), infra as code; secrets in KMS/KeyVault.
- Internationalization: i18n-ready; English default; add locales later.

## 12) Edge Cases & Error Modes
- Duplicate check-ins (same student/session) → idempotent accept with 200 + no-op.
- Clock skew on rotating QR tokens → small grace window (≤ 30s).
- GPS denied/unavailable → attendance still allowed if policy permits; store no geo.
- Leave overlaps with already marked Present → rule: Leave overrides to Leave; audit change.
- Lost refresh token → revoke session; logout everywhere.

## 13) Minimal Data Dictionary (selected fields)
- AttendanceRecord.status: enum [Present, Absent, Late, Excused, Leave]
- LeaveRequest.status: enum [draft, submitted, approved, rejected, cancelled]
- Session.qrMode: enum [session, student, off]
- Notification.type: enum [attendanceAbsent, attendanceLate, leaveApproved, leaveRejected, reminder]

## 14) Open Questions
- Biometric vendor preference and device availability?
- Required geo radius (meters) for presence verification per class?
- SSO providers to prioritize?
- Data retention policy for audit logs and GPS data?

---

Appendix A: Example ER Sketch (textual)
- User (1..*) —(UserRole)— (1..*) Role
- User (1..*) —(teaches)— (0..*) Class —(0..*)— Enrollment —(0..*)— Student
- Class —(1..*)— Session —(1..*)— AttendanceRecord — Student
- User —(0..*)— LeaveRequest; User —(0..1)— LeaveBalance[*]
- Session —(0..1)— QRToken; AuditLog references any entity by (entity, entityId)
