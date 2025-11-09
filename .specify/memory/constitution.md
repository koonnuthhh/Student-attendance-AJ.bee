<!--
Sync Impact Report:
- Version change: 0.0.1 → 1.0.0
- Modified principles: All principles newly defined
- Added sections: Student ID Management, Data Integrity, User Experience, Security & Privacy, Governance
- Removed sections: None (initial version)
- Templates requiring updates: ✅ All templates will be reviewed for alignment
- Follow-up TODOs: None
-->

# Student Attendance System Constitution

## Core Principles

### I. Student-Centric ID Management
Students MUST register using their existing institutional student ID. Teachers add students to classes by searching and selecting from registered student IDs in the system. No teacher-generated codes or external enrollment mechanisms allowed. This ensures institutional data consistency and prevents duplicate or invalid enrollments.

**Rationale**: Maintains institutional integrity, prevents enrollment confusion, and ensures students use consistent identity across all systems.

### II. Real-Time Data Integrity
All attendance data, class enrollments, and user information MUST be stored with immediate consistency. No optimistic updates without server confirmation. All state changes must be verified against current database state before acceptance. Offline data capture allowed but requires conflict resolution on sync.

**Rationale**: Attendance records are critical institutional data that require accuracy and auditability for academic and legal compliance.

### III. Role-Based Access Control (NON-NEGOTIABLE)
Four distinct roles: Admin, Teacher, Student, Employee. Each role has explicitly defined permissions. Students can only view their own data and mark their attendance. Teachers can manage their assigned classes only. Admins have system-wide access. Cross-role data access strictly forbidden.

**Rationale**: Protects student privacy, ensures data security, and maintains institutional hierarchy and responsibilities.

### IV. Mobile-First Experience
Primary interface MUST be React Native mobile app optimized for phones and tablets. All features must work smoothly on mobile devices with proper touch interfaces, offline capabilities, and responsive design. Web interfaces are secondary and optional.

**Rationale**: Primary users (students and teachers) access the system in classrooms and on-the-go, requiring mobile-optimized interfaces.

### V. QR Code & Geolocation Integration
Attendance marking MUST support QR code scanning for quick check-ins and optional geolocation capture for location verification. QR tokens rotate every 60 seconds for security. Geolocation data stored with attendance records when enabled by institution.

**Rationale**: Enables efficient attendance marking while providing location verification to prevent attendance fraud.

## Student ID Management

Students register accounts using their pre-existing institutional student ID. The system validates student ID format and uniqueness during registration. Teachers can search registered students by student ID, name, or email to add them to classes. No manual student creation by teachers - all students must self-register first.

**Workflow**: Student registration → Teacher class creation → Teacher adds students via search → Automatic enrollment confirmation.

## Data Integrity

All database operations use transactions and foreign key constraints. Audit logging captures all attendance modifications with user attribution and timestamps. Data exports maintain referential integrity. Backup and recovery procedures ensure 99.9% data availability.

**Critical Data**: Attendance records, student enrollments, class assignments, user authentication data.

## User Experience

Interface design prioritizes simplicity and speed. Common actions (attendance marking, class navigation) require minimal taps. Error messages are clear and actionable. Loading states and progress indicators for all network operations. Pull-to-refresh for data updates.

**Performance Targets**: App launch < 3 seconds, attendance marking < 1 second, class loading < 2 seconds.

## Security & Privacy

Student data protected according to FERPA and institutional privacy policies. All API communications over HTTPS. JWT tokens with short expiration (15 minutes) and refresh rotation. Password hashing with Argon2. Input validation and SQL injection prevention. Rate limiting on authentication endpoints.

**Data Retention**: Attendance records retained per institutional policy. User accounts archived, not deleted. Audit logs retained for minimum 7 years.

## Governance

Constitution supersedes all other development practices and decisions. All feature development and architectural changes must align with core principles. Any conflicts between principles and implementation requirements require constitutional amendment.

**Amendment Process**: Proposed changes documented with rationale → Team review → Stakeholder approval → Implementation plan → Version increment.

**Compliance Verification**: Every pull request must verify constitutional compliance. Code reviews must validate principle adherence. Performance and security standards must be measured and reported.

**Version**: 1.0.0 | **Ratified**: 2025-11-09 | **Last Amended**: 2025-11-09
