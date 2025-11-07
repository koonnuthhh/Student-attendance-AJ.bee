# Student Attendance — Project Constitution

- Version: 1.0
- Date: 2025-11-04
- Owner: Project Team (Teacher/Coordinator, Developer)
- Status: Draft

## 1) Overview / Vision
A simple, reliable student attendance application that helps teachers take roll quickly and accurately, generates attendance summaries, and reduces manual errors. The system should work smoothly in-class (online/offline capture with later sync is a stretch goal) and make it easy to review, export, and share attendance records.

## 2) Problem Statement
Manual attendance tracking is time-consuming and error-prone. Existing tools are often bloated or not tailored for quick classroom use. Teachers need a fast, minimal-friction way to mark present/absent/late, keep records per class/subject/date, and produce reports for administration.

## 3) Goals & Success Metrics
- Speed: Mark an entire class’s attendance in under 60 seconds (typical class size 25–40).
- Accuracy: <1% data errors due to UI flow or syncing.
- Reliability: 99.5% successful saves in normal network conditions.
- Reporting: Generate a per-class monthly summary in <3 seconds.
- Adoption: At least 80% of target teachers prefer this over current method after a 2-week pilot.

## 4) Non-Goals (for MVP)
- Complex gradebook or LMS features.
- Full student information system (SIS) replacement.
- Advanced analytics and dashboards beyond basic summaries.
- Guardians/parents portal.

## 5) Users & Personas
- Primary: Teacher — needs fast roll call, minimal taps/clicks, and quick corrections.
- Secondary: Head of Department/Administrator — needs aggregated attendance reports, exports.
- Tertiary: IT/Support — needs simple deployment/config, backups.

## 6) Scope
- In-Scope (MVP):
  - Create classes and student rosters.
  - Mark attendance statuses: Present, Absent, Late (optional note per student).
  - View attendance by date, by class, and per-student history.
  - Basic reports: per-class summary by date range; export CSV.
  - Simple authentication (single teacher account or per-teacher login).
- Out-of-Scope (MVP):
  - Parent notifications; behavior or grading modules; timetable management.

## 7) Functional Requirements
- FR1: Teachers can create/manage classes (name, subject, schedule metadata optional).
- FR2: Teachers can add/import students (name, ID, optional contact info).
- FR3: Take Attendance:
  - FR3.1: For a chosen class and date/time, quickly mark status per student: Present/Absent/Late.
  - FR3.2: Bulk mark all as Present, then adjust individuals.
  - FR3.3: Optional per-student note (text up to 200 chars).
- FR4: Edit Attendance: Teachers can amend records for past sessions with audit trail (who/when, what changed).
- FR5: View & Search: Filter by class, date range, student; paginate lists.
- FR6: Reports:
  - FR6.1: Class summary by date range (counts and percentages of P/A/L).
  - FR6.2: Student summary (attendance history across dates).
  - FR6.3: Export CSV of attendance records for a range.
- FR7: Auth: Local account per teacher (email/username + password); logout.
- FR8: Backup/Restore: Export/import data (JSON or CSV) manually.

### Future (Post-MVP)
- Offline capture with later sync.
- QR code or RFID-based check-in.
- Multi-tenant school with admin roles and aggregated dashboards.
- Mobile-first native app.

## 8) Non-Functional Requirements (NFR)
- NFR1 Performance: Attendance screen renders in <1s; marking a student <100ms per action.
- NFR2 Availability: Works without page reloads; graceful handling of intermittent network.
- NFR3 Security: Hash passwords (Argon2/bcrypt), HTTPS in production, role-based access.
- NFR4 Data integrity: No duplicate student IDs per class; validated required fields.
- NFR5 Privacy: Store minimal PII; allow data export and deletion upon request.

## 9) Data Model (initial)
- Student: { id, firstName, lastName, studentId (unique per org/teacher), email?, notes? }
- Class: { id, name, subject?, teacherId, createdAt }
- Enrollment: { id, classId, studentId, status (active/archived) }
- Session: { id, classId, date (yyyy-mm-dd), startTime?, endTime? }
- AttendanceRecord: { id, sessionId, studentId, status (Present|Absent|Late), note?, markedBy, markedAt }
- User (Teacher): { id, name, email (unique), passwordHash, createdAt }

Relational or document storage can support this; MVP favors simplicity and portability.

## 10) System Architecture (high-level)
- Option A (simple desktop/web app):
  - Frontend: Lightweight web UI (React/Vue/Svelte or plain HTML+JS) optimized for fast toggling.
  - Backend: Minimal REST API (Node/Express, Python/FastAPI, or .NET) with a small DB (SQLite/PostgreSQL).
  - Storage: SQLite for MVP (file-based, easy backup/export), migratable later.
- Option B (single-user local):
  - Local-first app with embedded DB (SQLite) and export capability.

Choose Option A for multi-device access; Option B for single-machine simplicity.

## 11) Privacy, Security & Compliance
- Store only necessary PII (names, IDs). No sensitive health data.
- Strong password policy; rate limit logins; session timeout.
- Backups encrypted at rest; exports warn about sensitive data handling.

## 12) Milestones (MVP)
- M1 (Week 1–2): Project scaffold, data model, auth, classes/students CRUD.
- M2 (Week 3): Attendance UI (bulk present, quick toggles), save, edit.
- M3 (Week 4): Views and filters; per-student history.
- M4 (Week 5): Reports and CSV export.
- M5 (Week 6): Polishing, basic tests, docs, pilot.

## 13) Risks & Mitigations
- R1: Performance on large rosters — Mitigation: pagination and virtualized lists.
- R2: Data loss — Mitigation: autosave, regular backups, export feature.
- R3: Access control weaknesses — Mitigation: use proven auth library, hashed passwords, input validation.

## 14) Assumptions & Constraints
- Single-teacher instance initially; can evolve to multi-user.
- Windows-friendly deployment for early users.

## 15) Dependencies (tentative)
- Backend: Node.js 20+ (Express) or Python 3.11+ (FastAPI) or .NET 8 — decide in implementation.
- DB: SQLite (MVP), migratable to Postgres.
- Frontend: Minimal framework to keep UI snappy.

## 16) Acceptance Criteria (Definition of Done)
- Can create a class, add students, take attendance for a session, edit it, and export a CSV successfully.
- Basic auth and session management working.
- Tests covering core flows (CRUD + attendance save/edit + export).
- Documentation (README and this constitution) up to date.

## 17) Glossary
- Session: One scheduled class occurrence (date/time) for a class.
- Attendance status: Present/Absent/Late.

## 18) Open Questions
- Multi-user from day one or single-teacher MVP?
- Should we support offline-first in MVP?
- Preferred tech stack (Node/Python/.NET) for the team?
- Required reporting formats mandated by the school?
