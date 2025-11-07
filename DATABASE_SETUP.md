# Database Setup Guide

## Overview
Your Student Attendance system uses **PostgreSQL** (via Supabase) with **TypeORM** for migrations. All constraints, foreign keys, and relationships are defined in your entity files and will be automatically created by TypeORM migrations.

## Constraints Already Defined in Entities

### ✅ Unique Constraints
- **User**: `email` must be unique
- **Role**: `name` must be unique (Admin, Teacher, Student, Employee)
- **Student**: `studentId` must be unique
- **Enrollment**: Combination of `classId + studentId` must be unique (prevents duplicate enrollments)
- **Class**: No duplicates enforced at application level

### ✅ Foreign Key Constraints
- **Class** → User (teacherId)
- **Enrollment** → Class, Student
- **Session** → Class
- **QRToken** → Session (one-to-one)
- **AttendanceRecord** → Session, Student, User (markedBy)
- **LeaveRequest** → User (userId), User (approverId)
- **LeaveBalance** → User
- **Notification** → User
- **AuditLog** → User (userId), User (performedBy)

### ✅ Enums (Check Constraints)
- **User.status**: 'active' | 'suspended' | 'pending'
- **Role.name**: 'Admin' | 'Teacher' | 'Student' | 'Employee'
- **Enrollment.status**: 'active' | 'archived'
- **Session.qrMode**: 'session' | 'student' | 'off'
- **AttendanceRecord.status**: 'Present' | 'Absent' | 'Late' | 'Excused' | 'Leave'
- **AttendanceRecord.source**: 'manual' | 'qr' | 'api' | 'biometric'
- **LeaveRequest.status**: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled'
- **LeaveRequest.type**: 'sick' | 'vacation' | 'personal' | 'other'
- **Notification.channel**: 'email' | 'sms' | 'push' | 'in-app'
- **Notification.status**: 'pending' | 'sent' | 'failed'

### ✅ Nullable/Required Fields
- All `@Column()` without `nullable: true` are required (NOT NULL)
- Examples of nullable fields:
  - User: `emailVerifiedAt`, `phoneNumber`, `firstName`, `lastName`
  - AttendanceRecord: `note`, `latitude`, `longitude`, `accuracy`
  - LeaveRequest: `approverId`, `decidedAt`, `approverComment`

### ✅ Cascade Behaviors
- **Class deletion** → Cascades to Enrollments and Sessions
- **Student deletion** → Cascades to Enrollments and AttendanceRecords
- **Session deletion** → Cascades to AttendanceRecords and QRToken
- **User deletion** → Cascades to Classes, LeaveRequests, etc.

---

## Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `student-attendance` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
5. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get Database Connection String

1. In your Supabase project dashboard, go to:
   - **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **"URI"** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 3: Update Environment Variables

Open `backend/.env` and update:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Generate new secrets (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here

# Optional: Configure email (for password reset, verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 4: Generate Database Migration

Run this command to generate migration from your entities:

```bash
cd backend
npm run typeorm migration:generate src/migrations/InitialSchema
```

This will:
- Scan all your entity files (`*.entity.ts`)
- Compare with current database (empty)
- Generate SQL CREATE TABLE statements with all constraints
- Save to `src/migrations/TIMESTAMP-InitialSchema.ts`

### Step 5: Run Migration

Execute the migration to create all tables:

```bash
npm run typeorm migration:run
```

This will create 14 tables:
1. `user` (with unique email)
2. `role` (with unique name)
3. `user_roles` (many-to-many junction table)
4. `verification_token`
5. `class`
6. `student` (with unique studentId)
7. `enrollment` (with unique classId+studentId)
8. `session`
9. `qr_token`
10. `attendance_record`
11. `leave_request`
12. `leave_balance`
13. `notification`
14. `audit_log`

### Step 6: Seed Initial Roles

Create `backend/src/scripts/seed-roles.ts`:

```typescript
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../config/typeorm.config';
import { Role, RoleName } from '../modules/users/role.entity';

async function seedRoles() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  
  const roleRepo = dataSource.getRepository(Role);
  
  const roles = [
    RoleName.Admin,
    RoleName.Teacher,
    RoleName.Student,
    RoleName.Employee
  ];
  
  for (const roleName of roles) {
    const exists = await roleRepo.findOne({ where: { name: roleName } });
    if (!exists) {
      await roleRepo.save({ name: roleName });
      console.log(`✓ Created role: ${roleName}`);
    } else {
      console.log(`- Role already exists: ${roleName}`);
    }
  }
  
  console.log('\n✅ Roles seeded successfully!');
  await dataSource.destroy();
}

seedRoles().catch(console.error);
```

Run the seed script:

```bash
npx ts-node src/scripts/seed-roles.ts
```

### Step 7: Verify Database Structure

You can verify tables were created in Supabase:

1. Go to **Table Editor** in Supabase dashboard
2. You should see all 14 tables
3. Click any table to view columns, constraints, and relationships

---

## Database Schema Summary

### Core Tables

**Users & Authentication**
```
user
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── passwordHash (VARCHAR)
├── status (ENUM: active/suspended/pending)
├── emailVerifiedAt (TIMESTAMP, nullable)
└── M2M → roles
```

**Classes & Students**
```
class
├── id (UUID, PK)
├── name (VARCHAR)
├── subject (VARCHAR)
├── teacherId (UUID, FK → user)
└── timezone (VARCHAR)

student
├── id (UUID, PK)
├── studentId (VARCHAR, UNIQUE)
├── firstName (VARCHAR)
├── lastName (VARCHAR)
└── email (VARCHAR, nullable)

enrollment (junction table with unique constraint)
├── id (UUID, PK)
├── classId (UUID, FK → class)
├── studentId (UUID, FK → student)
├── status (ENUM: active/archived)
└── UNIQUE(classId, studentId)
```

**Sessions & Attendance**
```
session
├── id (UUID, PK)
├── classId (UUID, FK → class)
├── date (DATE)
├── startTime (TIME)
├── endTime (TIME)
├── qrMode (ENUM: session/student/off)
└── geoRequired (BOOLEAN)

attendance_record
├── id (UUID, PK)
├── sessionId (UUID, FK → session)
├── studentId (UUID, FK → student)
├── status (ENUM: Present/Absent/Late/Excused/Leave)
├── source (ENUM: manual/qr/api/biometric)
├── latitude/longitude/accuracy (DECIMAL, nullable)
├── markedBy (UUID, FK → user)
└── markedAt (TIMESTAMP)
```

**QR Tokens**
```
qr_token (one-to-one with session)
├── id (UUID, PK)
├── sessionId (UUID, FK → session, UNIQUE)
├── token (UUID)
├── expiresAt (TIMESTAMP)
└── rotatedAt (TIMESTAMP)
```

**Leave Management**
```
leave_request
├── id (UUID, PK)
├── userId (UUID, FK → user)
├── type (ENUM: sick/vacation/personal/other)
├── startDate/endDate (DATE)
├── reason (TEXT)
├── status (ENUM: draft/submitted/approved/rejected/cancelled)
├── approverId (UUID, FK → user, nullable)
└── decidedAt (TIMESTAMP, nullable)

leave_balance
├── id (UUID, PK)
├── userId (UUID, FK → user)
├── year (INT)
├── sickDays/vacationDays/personalDays (DECIMAL)
└── usedSickDays/usedVacationDays/usedPersonalDays (DECIMAL)
```

---

## Common Commands

```bash
# Generate migration after entity changes
npm run typeorm migration:generate src/migrations/MigrationName

# Run pending migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert

# Show migration status
npm run typeorm migration:show

# Drop all tables (DANGER!)
npm run typeorm schema:drop
```

---

## Testing Database Connection

After setup, test with:

```bash
cd backend
npm run start:dev
```

You should see:
```
[Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
```

If you see database connection errors, check:
1. DATABASE_URL is correct
2. Supabase project is active
3. IP whitelist (Supabase allows all by default)
4. Password has no special characters that need URL encoding

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Update `.env` with DATABASE_URL
3. ✅ Run migrations to create tables
4. ✅ Seed roles
5. ✅ Start backend server
6. 🧪 Test API endpoints (register, login, create class)

Need help with any step? Let me know! 🚀
