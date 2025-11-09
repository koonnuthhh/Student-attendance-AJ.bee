import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function testApiLogic() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🧪 Testing Exact API Logic for /students/my-classes');
    console.log('='.repeat(60));

    // Simulate the exact logic from StudentsStudentController.getMyClasses()
    const userId = 'c268e701-7127-45b0-970d-41e15d111d5f'; // Alice's user ID from debug output
    
    console.log('Step 1: Getting user record for userId:', userId);
    
    // Step 1: Fetch the full user record to get studentCode
    const user = await dataSource.query(`
      SELECT id, email, name, student_code, status 
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    if (user.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user[0]);
    
    if (!user[0].student_code) {
      console.log('❌ User has no student code');
      return;
    }
    
    console.log('✅ User has student code:', user[0].student_code);
    
    // Step 2: Find student record by the user's studentCode  
    console.log('\nStep 2: Looking for student with studentCode:', user[0].student_code);
    
    const students = await dataSource.query(`
      SELECT id, "firstName", "lastName", "studentId", email 
      FROM students 
      WHERE "studentId" = $1
    `, [user[0].student_code]);
    
    if (students.length === 0) {
      console.log('❌ Student record not found');
      return;
    }
    
    const student = students[0];
    console.log('✅ Student found:', student);
    
    // Step 3: Get enrollments with class and teacher information
    console.log('\nStep 3: Getting enrollments for student ID:', student.id);
    
    const enrollments = await dataSource.query(`
      SELECT e.id as enrollment_id, e."classId", e."studentId", e.status as enrollment_status,
             c.id as class_id, c.name as class_name, c.subject,
             c."teacherId", t.name as teacher_name, t.email as teacher_email
      FROM enrollments e
      JOIN classes c ON e."classId" = c.id  
      JOIN users t ON c."teacherId" = t.id
      WHERE e."studentId" = $1
    `, [student.id]);
    
    console.log('✅ Enrollments found:', enrollments.length);
    console.table(enrollments);
    
    // Step 4: Transform the data like the API does
    console.log('\nStep 4: Transforming data for API response...');
    
    const result = [];
    for (const enrollment of enrollments) {
      const classId = enrollment.class_id;
      
      // Get all sessions for this class (like the API does)
      const allSessions = await dataSource.query(`
        SELECT id, "classId", date, "startTime", "endTime"
        FROM sessions
        WHERE "classId" = $1
        ORDER BY date DESC
      `, [classId]);
      
      console.log(`Sessions for class ${enrollment.class_name}:`, allSessions.length);
      
      // Get attendance records for this student in this class
      const attendanceRecords = await dataSource.query(`
        SELECT ar.id, ar.status, ar."markedAt", ar.note, ar."studentId",
               s.id as session_id, s."classId"
        FROM attendance_records ar
        JOIN sessions s ON ar."sessionId" = s.id
        WHERE ar."studentId" = $1 AND s."classId" = $2
      `, [student.id, classId]);
      
      console.log(`Attendance records for ${enrollment.class_name}:`, attendanceRecords.length);
      
      // Calculate attendance rate
      let attendanceRate = 0;
      if (allSessions.length > 0) {
        const presentCount = attendanceRecords.filter(record => 
          record.status === 'PRESENT'
        ).length;
        attendanceRate = Math.round((presentCount / allSessions.length) * 100);
      }
      
      const classData = {
        id: enrollment.class_id,
        name: enrollment.class_name,
        subject: enrollment.subject || 'No subject specified',
        teacher: {
          name: enrollment.teacher_name,
          email: enrollment.teacher_email,
        },
        enrollmentStatus: enrollment.enrollment_status,
        sessionsToday: 0, // Would need to calculate for today
        attendanceRate: attendanceRate,
        totalSessions: allSessions.length,
        attendedSessions: attendanceRecords.filter(r => r.status === 'PRESENT').length,
      };
      
      result.push(classData);
    }
    
    console.log('\n📊 Final API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🎯 Expected mobile app to receive:', result.length, 'classes');
    
    if (result.length > 0) {
      console.log('✅ API should return classes! Check mobile app API call.');
      console.log('🔍 Possible issues:');
      console.log('   1. Mobile app not sending correct authentication token');
      console.log('   2. API endpoint URL incorrect');
      console.log('   3. Mobile app not parsing response correctly');
      console.log('   4. CORS or network issues');
    } else {
      console.log('❌ API would return empty array');
    }

  } catch (error) {
    console.error('❌ Error during API logic test:', error);
  } finally {
    await app.close();
  }
}

testApiLogic()
  .then(() => {
    console.log('\n✅ API logic test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 API logic test failed:', error);
    process.exit(1);
  });