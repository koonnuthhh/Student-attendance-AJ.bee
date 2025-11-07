# Student Code Flow - Technical Plan

## Architecture Overview
Implement a student identification system using unique alphanumeric codes that connect student accounts to their assigned classes during registration.

## Tech Stack (Existing)
- **Backend**: NestJS, TypeScript, TypeORM, PostgreSQL
- **Frontend**: React Native with Expo
- **Authentication**: JWT tokens with role-based access
- **Database**: PostgreSQL with TypeORM entities

## Key Components

### 1. Database Schema Changes
```sql
-- Add studentCode column to users table
ALTER TABLE users ADD COLUMN student_code VARCHAR(8) UNIQUE;
CREATE UNIQUE INDEX idx_users_student_code ON users(student_code) WHERE student_code IS NOT NULL;
```

### 2. Entity Updates
```typescript
// User entity addition
@Column({ unique: true, nullable: true, length: 8 })
studentCode?: string;
```

### 3. API Endpoints

#### New Endpoints
- `POST /auth/register-with-code` - Register student with student code
- `GET /student-codes/validate/:code` - Validate student code exists
- `POST /student-codes/generate` - Generate new student code (teacher only)
- `GET /students/my-classes` - Get classes for logged-in student

#### Updated Endpoints
- `POST /classes/:id/students` - Add student using student code
- `POST /auth/register` - Enhanced to accept optional student code

### 4. Business Logic

#### Student Code Format
- 8-character alphanumeric code (uppercase)
- Format: XXXX-XXXX (with hyphen for display, stored without)
- Example: ABCD-1234, STUD-2025

#### Registration Flow
1. Student receives code from teacher
2. Student registers account with code
3. System validates code exists and is unassigned
4. Student is automatically enrolled in associated classes
5. Student redirected to class dashboard

#### Teacher Workflow
1. Teacher creates class
2. Teacher generates student codes for class
3. Teacher distributes codes to physical students
4. Students register using codes
5. Teacher sees students appear in class automatically

### 5. Frontend Changes

#### Registration Screen Updates
- Add student code input field
- Add real-time validation
- Show code format helper text
- Handle registration success/failure

#### Teacher Interface Updates
- Add "Generate Student Code" button
- Show student codes in student list
- Add "Add Student by Code" option
- Display code status (assigned/unassigned)

#### Student Interface Updates
- Create student dashboard showing assigned classes only
- Hide teacher-specific navigation items
- Show class information and attendance status
- Direct navigation to attendance/QR scan

### 6. Security Considerations
- Student codes are one-time use (assigned to first registering student)
- Codes expire after 30 days if unused
- Role-based access control for code generation
- Validation to prevent code manipulation

### 7. Data Model Relationships
```
User (Student)
├── studentCode (unique, optional)
├── enrollments (many-to-many via Enrollment entity)
└── attendanceRecords

Class
├── teacher (User with Teacher role)
├── enrollments (students via Enrollment entity)
└── sessions

Enrollment
├── student (User)
├── class (Class)
├── enrolledAt (timestamp)
└── status (active/inactive)
```

## File Structure Changes

### Backend Files
```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts (updated)
│   │   └── auth.controller.ts (updated)
│   ├── users/
│   │   └── user.entity.ts (updated)
│   ├── student-codes/
│   │   ├── student-codes.service.ts (new)
│   │   ├── student-codes.controller.ts (new)
│   │   └── student-codes.module.ts (new)
│   └── students/
│       ├── students.service.ts (updated)
│       └── students.controller.ts (updated)
└── migrations/
    └── AddStudentCodeToUsers.ts (new)
```

### Frontend Files
```
src/
├── screens/
│   ├── LoginScreen.tsx (updated)
│   ├── StudentDashboardScreen.tsx (new)
│   ├── StudentClassesScreen.tsx (new)
│   └── ClassDetailsScreen.tsx (updated)
├── components/
│   ├── StudentCodeInput.tsx (new)
│   └── CodeGenerator.tsx (new)
└── api/
    └── index.ts (updated)
```

## Implementation Strategy
1. **Database First**: Add student code fields and constraints
2. **Backend Services**: Implement code generation and validation
3. **API Layer**: Add endpoints for code operations
4. **Frontend Components**: Create reusable code input/display components
5. **Integration**: Wire frontend to backend APIs
6. **Testing**: Comprehensive testing of code flows
7. **Documentation**: Update user guides and API docs

## Migration Strategy
- Existing users continue to work normally
- New student code system is additive
- Teachers can still manually add students (existing flow)
- Student code system provides streamlined alternative