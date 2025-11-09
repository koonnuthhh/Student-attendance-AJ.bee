import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function debugStudentClasses() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🔍 Debugging Student Classes Database State');
    console.log('='.repeat(50));

    // Check Users table
    console.log('\n1. 👥 USERS TABLE:');
    const users = await dataSource.query(`
      SELECT id, email, name, student_code, status 
      FROM users 
      ORDER BY email
    `);
    console.table(users);

    // Check Students table
    console.log('\n2. 👨‍🎓 STUDENTS TABLE:');
    const students = await dataSource.query(`
      SELECT id, "firstName", "lastName", "studentId", email 
      FROM students 
      ORDER BY "studentId"
    `);
    console.table(students);

    // Check Classes table
    console.log('\n3. 📚 CLASSES TABLE:');
    const classes = await dataSource.query(`
      SELECT id, name, subject, "teacherId"
      FROM classes
    `);
    console.table(classes);

    // Check Enrollments table
    console.log('\n4. 📋 ENROLLMENTS TABLE:');
    const enrollments = await dataSource.query(`
      SELECT e.id, e."classId", e."studentId", e.status,
             c.name as class_name,
             s."firstName" || ' ' || s."lastName" as student_name,
             s."studentId" as student_code
      FROM enrollments e
      LEFT JOIN classes c ON e."classId" = c.id
      LEFT JOIN students s ON e."studentId" = s.id
    `);
    console.table(enrollments);

    // Check User-Roles relationship
    console.log('\n5. 👤 USER ROLES:');
    const userRoles = await dataSource.query(`
      SELECT u.email, u.name, r.name as role
      FROM users u
      JOIN user_roles ur ON u.id = ur."usersId"
      JOIN roles r ON ur."rolesId" = r.id
      ORDER BY u.email
    `);
    console.table(userRoles);

    // Test the exact logic that the API uses for a specific student
    console.log('\n6. 🧪 TESTING API LOGIC FOR 12345:');
    console.log('Step 1: Find user with studentCode 12345');
    const userResult = await dataSource.query(`
      SELECT id, email, name, student_code
      FROM users
      WHERE student_code = '12345'
    `);
    console.table(userResult);

    if (userResult.length > 0) {
      console.log('Step 2: Find student record with studentId 12345');
      const testStudent = await dataSource.query(`
        SELECT id, "firstName", "lastName", "studentId", email
        FROM students 
        WHERE "studentId" = '12345'
      `);
      console.table(testStudent);

      if (testStudent.length > 0) {
        console.log('Step 3: Find enrollments for this student');
        const testEnrollments = await dataSource.query(`
          SELECT e.id, e."classId", e."studentId", e.status,
                 c.name as class_name, c.subject,
                 t.name as teacher_name, t.email as teacher_email
          FROM enrollments e
          JOIN classes c ON e."classId" = c.id
          JOIN users t ON c."teacherId" = t.id
          WHERE e."studentId" = $1
        `, [testStudent[0].id]);
        console.table(testEnrollments);

        if (testEnrollments.length === 0) {
          console.log('❌ NO ENROLLMENTS FOUND! This is the problem.');
          console.log('📝 SOLUTION: You need to:');
          console.log('   1. Login as teacher (teacher@school.com)');
          console.log('   2. Create a class');
          console.log('   3. Add student 12345 to the class');
        }
      } else {
        console.log('❌ NO STUDENT RECORD FOUND with studentId 12345');
      }
    } else {
      console.log('❌ NO USER FOUND with studentCode 12345');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 SUMMARY: Check if student needs to be enrolled in classes');

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await app.close();
  }
}

debugStudentClasses()
  .then(() => {
    console.log('\n✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });
