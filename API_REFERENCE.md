# API Endpoints Reference

This document provides a comprehensive reference for all available API endpoints in the Student Attendance System.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123",
  "role": "student"  // Optional: admin, teacher, student, employee
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "pending_verification"
  },
  "verificationToken": "uuid"  // For testing; not sent in production
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "accessToken": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["student"]
  }
}
```

### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}

Response: 200 OK
{
  "success": true
}
```

### Request Password Reset
```http
POST /auth/request-reset
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "success": true
}
```

### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword456"
}

Response: 200 OK
{
  "success": true
}
```

---

## Class Management Endpoints

### Create Class
```http
POST /classes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mathematics 101",
  "subject": "Mathematics",
  "teacherId": "teacher-uuid"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Mathematics 101",
  "subject": "Mathematics",
  "teacherId": "teacher-uuid",
  "createdAt": "2025-11-07T...",
  "updatedAt": "2025-11-07T..."
}
```

### Get Classes by Teacher
```http
GET /classes/teacher/:teacherId
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Mathematics 101",
    "subject": "Mathematics",
    "enrollments": [...]
  }
]
```

### Get Single Class
```http
GET /classes/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "name": "Mathematics 101",
  "subject": "Mathematics",
  "enrollments": [
    {
      "id": "uuid",
      "student": {
        "id": "uuid",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  ]
}
```

---

## Student Management Endpoints

### Create Student
```http
POST /students
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "studentId": "STU2025001",
  "email": "jane.smith@school.edu"
}

Response: 201 Created
{
  "id": "uuid",
  "firstName": "Jane",
  "lastName": "Smith",
  "studentId": "STU2025001",
  "email": "jane.smith@school.edu"
}
```

### Get All Students
```http
GET /students
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "studentId": "STU2025001"
  }
]
```

### Enroll Student in Class
```http
POST /students/enroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "classId": "class-uuid",
  "studentId": "student-uuid"
}

Response: 201 Created
{
  "id": "uuid",
  "classId": "class-uuid",
  "studentId": "student-uuid",
  "status": "active"
}
```

---

## Session Management Endpoints

### Create Session
```http
POST /sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "classId": "class-uuid",
  "date": "2025-11-07",
  "startTime": "09:00",
  "endTime": "10:30"
}

Response: 201 Created
{
  "id": "uuid",
  "classId": "class-uuid",
  "date": "2025-11-07",
  "startTime": "09:00",
  "endTime": "10:30",
  "qrMode": "off"
}
```

### Get Sessions by Class
```http
GET /sessions/class/:classId
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "classId": "class-uuid",
    "date": "2025-11-07",
    "startTime": "09:00",
    "endTime": "10:30"
  }
]
```

### Generate QR Token for Session
```http
POST /sessions/:sessionId/qr
Authorization: Bearer <token>

Response: 200 OK
{
  "sessionId": "uuid",
  "token": "qr-token-string",
  "expiresAt": "2025-11-07T10:01:00Z",
  "rotatedAt": "2025-11-07T10:00:00Z"
}
```

### Verify QR Token
```http
POST /sessions/verify-qr
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "qr-token-string"
}

Response: 200 OK
{
  "sessionId": "uuid"
}
```

---

## Attendance Endpoints

### Mark Attendance (Bulk)
```http
POST /attendance/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-uuid",
  "defaultStatus": "Present",
  "markedBy": "teacher-uuid",
  "overrides": [
    {
      "studentId": "student1-uuid",
      "status": "Present"
    },
    {
      "studentId": "student2-uuid",
      "status": "Absent",
      "note": "Sick"
    }
  ]
}

Response: 201 Created
[
  {
    "id": "uuid",
    "sessionId": "session-uuid",
    "studentId": "student1-uuid",
    "status": "Present",
    "markedAt": "2025-11-07T..."
  }
]
```

### Mark Attendance via QR Scan
```http
POST /attendance/qr
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "qr-token-string",
  "studentId": "student-uuid",
  "lat": 40.7128,      // Optional
  "long": -74.0060,    // Optional
  "accuracy": 10.5     // Optional
}

Response: 201 Created
{
  "id": "uuid",
  "sessionId": "session-uuid",
  "studentId": "student-uuid",
  "status": "Present",
  "source": "qr",
  "lat": 40.7128,
  "long": -74.0060
}
```

### Get Attendance by Session
```http
GET /attendance/session/:sessionId
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "sessionId": "session-uuid",
    "status": "Present",
    "student": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "markedAt": "2025-11-07T..."
  }
]
```

### Update Attendance Record
```http
PATCH /attendance/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Late",
  "note": "Arrived 10 minutes late",
  "updatedBy": "teacher-uuid"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "Late",
  "note": "Arrived 10 minutes late"
}
```

---

## Leave Management Endpoints

### Create Leave Request
```http
POST /leave
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "type": "Sick",
  "start": "2025-11-10",
  "end": "2025-11-12",
  "reason": "Medical appointment"
}

Response: 201 Created
{
  "id": "uuid",
  "userId": "user-uuid",
  "type": "Sick",
  "start": "2025-11-10",
  "end": "2025-11-12",
  "status": "submitted"
}
```

### Get Leave Requests by User
```http
GET /leave/user/:userId
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "type": "Sick",
    "start": "2025-11-10",
    "end": "2025-11-12",
    "status": "submitted"
  }
]
```

### Get Pending Leave Requests
```http
GET /leave/pending
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "userId": "user-uuid",
    "type": "Sick",
    "start": "2025-11-10",
    "status": "submitted"
  }
]
```

### Approve Leave Request
```http
POST /leave/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approverId": "approver-uuid",
  "comment": "Approved. Get well soon."
}

Response: 200 OK
{
  "id": "uuid",
  "status": "approved",
  "approverId": "approver-uuid",
  "decidedAt": "2025-11-07T...",
  "approverComment": "Approved. Get well soon."
}
```

### Reject Leave Request
```http
POST /leave/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "approverId": "approver-uuid",
  "comment": "Need more details"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "rejected",
  "approverId": "approver-uuid",
  "approverComment": "Need more details"
}
```

---

## Export Endpoints

### Export to CSV
```http
POST /exports/csv
Authorization: Bearer <token>
Content-Type: application/json

{
  "classId": "class-uuid",           // Optional
  "sessionId": "session-uuid",       // Optional
  "studentId": "student-uuid",       // Optional
  "status": ["Present", "Late"],     // Optional
  "startDate": "2025-11-01",         // Optional
  "endDate": "2025-11-07",           // Optional
  "limit": 1000                      // Optional
}

Response: 200 OK
{
  "filePath": "/path/to/attendance_1699372800000.csv",
  "recordCount": 250
}
```

### Export to XLSX
```http
POST /exports/xlsx
Authorization: Bearer <token>
Content-Type: application/json

{
  "classId": "class-uuid",
  "startDate": "2025-11-01",
  "endDate": "2025-11-07",
  "limit": 5000
}

Response: 200 OK
{
  "filePath": "/path/to/attendance_1699372800000.xlsx",
  "recordCount": 250
}
```

---

## WebSocket Events

### Connect to WebSocket
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  auth: {
    token: 'your-jwt-token'  // Optional, depending on your setup
  }
});
```

### Subscribe to Session Updates
```javascript
// Subscribe to a session
socket.emit('subscribe:session', 'session-uuid');

// Listen for subscription confirmation
socket.on('subscribed', (data) => {
  console.log('Subscribed to:', data.sessionId);
});
```

### Listen for Attendance Updates
```javascript
socket.on('attendance:update', (update) => {
  console.log('Attendance updated:', update);
  // {
  //   sessionId: 'uuid',
  //   studentId: 'uuid',
  //   status: 'Present',
  //   markedBy: 'uuid',
  //   markedAt: '2025-11-07T...'
  // }
});
```

### Listen for Session Statistics
```javascript
socket.on('session:stats', (stats) => {
  console.log('Session stats:', stats);
  // Custom stats object with counts, percentages, etc.
});
```

### Unsubscribe from Session
```javascript
socket.emit('unsubscribe:session', 'session-uuid');

socket.on('unsubscribed', (data) => {
  console.log('Unsubscribed from:', data.sessionId);
});
```

---

## Status Codes

### Success Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content to return

### Client Error Codes
- `400 Bad Request` - Invalid request format or parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate entry)
- `422 Unprocessable Entity` - Validation error

### Server Error Codes
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

---

## Error Response Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## Rate Limiting

*Note: To be implemented in TASK-10-01*

Planned rate limits:
- Authentication endpoints: 5 requests per minute
- General API: 100 requests per minute
- Export endpoints: 10 requests per hour

---

## Testing with cURL

### Example: Register and Login

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Use the token from login response
TOKEN="your-jwt-token-here"

# Get classes
curl -X GET http://localhost:3000/classes \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notes

1. **Date Format:** ISO 8601 format (`YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:mm:ssZ` for timestamps)
2. **UUID:** All entity IDs use UUID v4 format
3. **Pagination:** Not yet implemented for list endpoints (planned for TASK-10-02)
4. **Filtering:** Implemented for exports, to be added to list endpoints
5. **Real-time:** WebSocket connection required for live updates

For detailed implementation notes, see `IMPLEMENTATION_SUMMARY.md`.
