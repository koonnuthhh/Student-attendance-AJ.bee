# Student Attendance System

A full-stack attendance management application for schools and organizations. Built with **React Native (Expo)** + **NestJS** + **Supabase PostgreSQL**.

## 📋 Documentation
- **[Constitution](docs/speckit.constitution.md)** — Project vision, goals, scope, success metrics
- **[Specification](.specify/speckit.specify.md)** — Detailed functional requirements, API contracts, data models
- **[Delivery Plan](.specify/speckit.plan.md)** — Milestones, WBS, quality gates, rollout strategy
- **[Task Backlog](.specify/speckit.tasks.md)** — Actionable WBS-aligned tasks with priorities

## 🚀 Features (MVP)
1. **Authentication** — JWT-based login, email verification, password reset
2. **Classes & Students** — Manage classes, rosters, enrollments
3. **Sessions** — Schedule class sessions with date/time
4. **Attendance Marking**
   - Bulk mark default Present, quick toggles
   - QR code scanning with rotating tokens (60s validity)
   - Optional geolocation capture
   - Manual override (Admin/Teacher)
5. **Leave Management** — Submit/approve/reject leave requests; auto-update attendance
6. **Exports** — CSV/XLSX with filters (date, class, student)
7. **Realtime Updates** — (Planned) WebSocket for live attendance changes
8. **Offline Mode** — (Planned) Local capture + sync with LWW conflict resolution

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native (Expo), TypeScript, Axios, AsyncStorage |
| **Backend** | NestJS, TypeScript, TypeORM, JWT, Argon2 |
| **Database** | Supabase (PostgreSQL) |
| **QR/Geo** | expo-barcode-scanner, expo-location |
| **Exports** | ExcelJS, csv-writer |

## 📦 Project Structure
```
Student-attendance/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── modules/     # Auth, Users, Classes, Students, Sessions, Attendance, Leave, Exports
│   │   ├── config/      # TypeORM config
│   │   └── main.ts
│   ├── package.json
│   └── .env.example
├── mobile/               # React Native (Expo)
│   ├── src/
│   │   ├── screens/     # Login, Classes, Sessions, Attendance, QRScan
│   │   └── api/         # API client (axios)
│   ├── App.tsx
│   ├── package.json
│   └── .env.example
├── docs/
└── .specify/
```

## 🏁 Quick Start

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL (or Supabase account)
- Expo CLI: `npm install -g expo-cli`
- (Optional) Android Studio / Xcode for device emulators

### 1. Backend Setup

```cmd
cd backend
npm install
```

**Configure environment:**
- Copy `.env.example` to `.env`
- Update `DATABASE_URL` with your Supabase connection string:
  ```
  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  ```
- Set `JWT_SECRET` and `JWT_REFRESH_SECRET` to secure random strings
- Configure SMTP (Gmail example):
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  ```

**Run migrations** (creates tables):
```cmd
npm run migration:generate -- src/migrations/InitialSchema
npm run migration:run
```

**Seed roles** (optional):
```cmd
node -e "const db = require('./dist/config/typeorm.config').default; db.initialize().then(async ds => { const roleRepo = ds.getRepository('Role'); await roleRepo.save([{name:'Admin'},{name:'Teacher'},{name:'Student'},{name:'Employee'}]); console.log('Roles seeded'); await ds.destroy(); });"
```

**Start server:**
```cmd
npm run start:dev
```
Server runs at `http://localhost:3000/api`

### 2. Mobile Setup

```cmd
cd mobile
npm install
```

**Configure environment:**
- Copy `.env.example` to `.env`
- Set `API_BASE_URL`:
  - For local dev on same machine: `http://localhost:3000/api`
  - For testing on physical device: `http://YOUR_LOCAL_IP:3000/api` (e.g., `http://192.168.1.100:3000/api`)

**Start Expo:**
```cmd
npm start
```
- Scan QR code with Expo Go app (iOS/Android)
- Or press `a` for Android emulator, `i` for iOS simulator

### 3. Create Test Account
Use Postman/curl or the app's register flow:
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "teacher@test.com",
  "name": "Test Teacher",
  "password": "password123",
  "role": "Teacher"
}
```

Then login in the mobile app with those credentials.

## 📱 Mobile Screens
1. **Login** — Email/password authentication
2. **Classes** — List teacher's classes
3. **Sessions** — View sessions for a class
4. **Attendance** — Mark/edit attendance; tap to toggle Present/Absent
5. **QRScan** — Scan QR code to mark attendance (with geolocation if enabled)

## 🔌 API Endpoints (Sample)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (returns JWT) |
| GET  | `/users/me` | Get current user |
| GET  | `/classes` | List teacher's classes |
| POST | `/classes` | Create class |
| GET  | `/classes/:id/sessions` | List sessions |
| POST | `/classes/:id/sessions` | Create session |
| GET  | `/sessions/:sid/qr-token` | Generate rotating QR token |
| POST | `/sessions/:sid/attendance/bulk` | Bulk mark attendance |
| POST | `/sessions/:sid/attendance/qr-scan` | Mark via QR |
| GET  | `/sessions/:sid/attendance` | List attendance records |
| PATCH | `/sessions/:sid/attendance/:id` | Update record |
| GET  | `/exports/attendance.csv` | Export CSV |
| GET  | `/exports/attendance.xlsx` | Export Excel |
| POST | `/leave` | Submit leave request |
| GET  | `/leave/pending` | List pending requests |
| PATCH | `/leave/:id/approve` | Approve leave |

## 🧪 Testing
**Backend unit tests:**
```cmd
cd backend
npm test
```

**Integration/e2e tests:**
```cmd
npm run test:e2e
```

**Mobile (Expo):**
- Manual testing via Expo Go
- Add Jest tests in `mobile/__tests__/` (future)

## 🐳 Deployment
**Backend** (example for Render/Fly.io/Railway):
- Set env vars (DATABASE_URL, JWT secrets, SMTP)
- Build: `npm run build`
- Start: `npm run start:prod`

**Mobile**:
- Build APK: `expo build:android`
- Build iOS: `expo build:ios`
- Or use EAS Build: `eas build --platform android`

**Database**:
- Supabase handles hosting; just configure connection pooling and backups in Supabase dashboard.

## 🛡 Security
- Passwords hashed with Argon2
- JWT with short-lived access tokens (15m) and refresh rotation
- HTTPS required in production
- Rate limiting on auth endpoints (TODO)
- Input validation via class-validator

## 📊 Data Model (Core Entities)
- **User** — email, passwordHash, status, roles (M2M)
- **Role** — Admin, Teacher, Student, Employee
- **Class** — name, subject, teacherId
- **Student** — firstName, lastName, studentId (unique)
- **Enrollment** — classId + studentId (unique)
- **Session** — classId, date, startTime, qrMode, geoRequired
- **AttendanceRecord** — sessionId, studentId, status (Present/Absent/Late/Excused/Leave), source, lat/long
- **QRToken** — sessionId, token, expiresAt (rotates every 60s)
- **LeaveRequest** — userId, type, start, end, status, approverId
- **AuditLog** — entity, entityId, action, changes (JSONB)

## 🚧 Roadmap
- [ ] **Phase 1 (MVP)** — Core features listed above ✅ (scaffolded)
- [ ] **Phase 2** — SMS/push notifications, PDF exports, Google/Outlook calendar sync, analytics baseline
- [ ] **Phase 3** — Enterprise SSO, rich dashboards, predictive analytics

## 🤝 Contributing
1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License
TBD (update when finalized)

## 📞 Support
- Issues: [GitHub Issues](https://github.com/yourorg/student-attendance/issues)
- Docs: See `.specify/` and `docs/` folders

---

**Built with ❤️ for teachers and students**
