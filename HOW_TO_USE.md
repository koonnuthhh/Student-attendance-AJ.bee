# 📱 How to Use the Student Attendance System

## Getting Started

### 1. Start the Backend Server
```powershell
cd "d:\Aj.bee ptoject\Student-attendance\backend"
npm run start:dev
```
Server will run on: **http://localhost:3000/api**

### 2. Start the Mobile App
```powershell
cd "d:\Aj.bee ptoject\Student-attendance\mobile"
npx expo start
```
Then press `w` to open in web browser, or scan QR code with Expo Go app.

---

## Step-by-Step Guide

### 📝 Step 1: Register an Account

1. Open the mobile app
2. You'll see the Login screen
3. Click **"Register"** or **"Sign Up"** (if available)
4. Fill in:
   - **Email**: teacher@test.com
   - **Name**: Test Teacher
   - **Password**: Test1234!
   - **Role**: TEACHER (for testing)

**OR** Register via API:
```powershell
$body = @{
    email = "teacher@test.com"
    password = "Test1234!"
    name = "Test Teacher"
    roleNames = @("TEACHER")
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' -Method POST -Body $body -ContentType 'application/json'
```

### 🔐 Step 2: Login

1. Enter your email and password
2. Click **"Login"**
3. You'll be redirected to the Classes screen

### 📚 Step 3: Create a Class

1. On the **Classes** screen, click the **"+ Create Class"** button
2. Fill in the form:
   - **Class Name**: Math 101 (required)
   - **Subject**: Mathematics (optional)
3. Click **"Create"**
4. Your new class will appear in the list!

### 📅 Step 4: Create a Session (Attendance Period)

1. Click on a class from your list
2. You'll see the **Sessions** screen
3. Click **"+ New Session"** or **"Create Session"**
4. Fill in:
   - **Date**: Select today's date
   - **Start Time**: e.g., 9:00 AM (optional)
   - **End Time**: e.g., 10:30 AM (optional)
5. Click **"Create"**

### 👥 Step 5: Add Students to Class

**Option A: Via Mobile App** (if AddStudents screen exists):
1. Go to Class Details
2. Click "Add Students"
3. Enter student information

**Option B: Via API** (for testing):
```powershell
# You'll need the classId and auth token
$token = "your-access-token-here"
$classId = "your-class-id-here"

$body = @{
    studentId = "STU001"
    name = "John Doe"
    email = "john@student.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/classes/$classId/students" -Method POST -Body $body -ContentType 'application/json' -Headers @{Authorization = "Bearer $token"}
```

### ✅ Step 6: Mark Attendance

1. Go to Sessions screen (click on a class)
2. Click on a session
3. You'll see the **Attendance** screen with list of students
4. For each student, you can:
   - ✅ Mark as **Present**
   - ❌ Mark as **Absent**
   - 🕐 Mark as **Late**
   - 📋 Mark as **Excused**
5. Changes are saved automatically or click "Save"

### 📱 Step 7: QR Code Attendance (Optional)

**For Teachers:**
1. Open a session
2. Generate QR code
3. Display it to students

**For Students:**
1. Open the app
2. Go to QR Scan screen
3. Scan the teacher's QR code
4. Attendance is marked automatically!

---

## 🔍 Check Your Attendance

### As a Teacher:
1. Go to **Classes** → Select a class
2. Go to **Sessions** → Select a session
3. View attendance records:
   - See who's present/absent/late
   - Export to CSV/Excel for reports

### As a Student:
1. Go to **My Attendance** (if screen exists)
2. View your attendance history
3. Submit leave requests if needed

---

## 📊 Export Attendance Reports

### Via API:
```powershell
# Export as CSV
Invoke-RestMethod -Uri "http://localhost:3000/api/exports/attendance.csv?classId=$classId&startDate=2025-01-01&endDate=2025-12-31" -Headers @{Authorization = "Bearer $token"} -OutFile "attendance.csv"

# Export as Excel
Invoke-RestMethod -Uri "http://localhost:3000/api/exports/attendance.xlsx?classId=$classId&startDate=2025-01-01&endDate=2025-12-31" -Headers @{Authorization = "Bearer $token"} -OutFile "attendance.xlsx"
```

---

## 🎯 Quick Testing Workflow

### 1. Create Test Data via API

**Register Teacher:**
```powershell
$body = @{
    email = "teacher@test.com"
    password = "Test1234!"
    name = "Test Teacher"
    roleNames = @("TEACHER")
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' -Method POST -Body $body -ContentType 'application/json'
```

**Login and Get Token:**
```powershell
$body = @{
    email = "teacher@test.com"
    password = "Test1234!"
} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
$token = $loginResponse.accessToken
```

**Create a Class:**
```powershell
$body = @{
    name = "Computer Science 101"
    subject = "Programming Fundamentals"
} | ConvertTo-Json
$classResponse = Invoke-RestMethod -Uri 'http://localhost:3000/api/classes' -Method POST -Body $body -ContentType 'application/json' -Headers @{Authorization = "Bearer $token"}
$classId = $classResponse.id
```

**Create a Session:**
```powershell
$body = @{
    date = (Get-Date).ToString("yyyy-MM-dd")
    startTime = "09:00"
    endTime = "10:30"
} | ConvertTo-Json
$sessionResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/classes/$classId/sessions" -Method POST -Body $body -ContentType 'application/json' -Headers @{Authorization = "Bearer $token"}
$sessionId = $sessionResponse.id
```

### 2. Test in Mobile App

1. Login with teacher@test.com
2. See your class "Computer Science 101"
3. Click on the class
4. See the session for today
5. Click on the session to mark attendance

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Make sure backend is running on http://localhost:3000
- Check if mobile `.env` has correct `API_URL=http://localhost:3000/api`
- If on physical device, use your computer's IP address instead of localhost

### "CORS Error"
- Backend CORS is already configured for:
  - http://localhost:8081
  - exp://localhost:8081
  - http://localhost:19006
- Restart the backend server if you just changed CORS settings

### "401 Unauthorized"
- Your token might have expired
- Logout and login again
- Check if JWT_EXPIRATION in backend `.env` is set correctly

### "No classes showing up"
- Make sure you're logged in as a TEACHER
- Create a class using the "+ Create Class" button
- Check if the API is returning data (check browser console/network tab)

---

## 📱 Mobile App Screens

1. **LoginScreen** - Register and login
2. **ClassesScreen** - View all classes, create new class
3. **SessionsScreen** - View sessions for a class, create new session
4. **AttendanceScreen** - Mark student attendance for a session
5. **QRScanScreen** - Scan QR code for attendance

---

## 🎓 User Roles

- **ADMIN**: Full system access, manage all users
- **TEACHER**: Create classes, manage sessions, mark attendance
- **STUDENT**: View own attendance, submit leave requests
- **EMPLOYEE**: (Custom role for staff)

---

## 💡 Tips

1. **Testing Multiple Users**: Use different browsers or incognito mode
2. **Quick Class Creation**: Use the mobile app's new create button!
3. **Bulk Attendance**: Use the "Mark All Present" feature if available
4. **Leave Requests**: Students can submit requests which teachers approve
5. **Reports**: Export attendance regularly for record-keeping

---

## 🔗 API Endpoints

Base URL: `http://localhost:3000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /users/me` - Get current user profile

### Classes
- `GET /classes` - Get all user's classes
- `POST /classes` - Create new class
- `GET /classes/:id` - Get class details

### Sessions
- `GET /classes/:classId/sessions` - Get class sessions
- `POST /classes/:classId/sessions` - Create new session
- `GET /classes/:classId/sessions/:sid/qr-token` - Get QR code

### Attendance
- `GET /sessions/:sid/attendance` - Get session attendance
- `POST /sessions/:sid/attendance/bulk` - Mark attendance in bulk
- `POST /sessions/:sid/attendance/qr-scan` - Mark via QR scan
- `PATCH /sessions/:sid/attendance/:id` - Update attendance record

### Students
- `GET /classes/:classId/students` - Get class students
- `POST /classes/:classId/students` - Add student to class

---

**You're all set! Start by creating your first class and session! 🎉**
