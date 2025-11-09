import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';

async function clearDataAndSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🗑️ Clearing existing data...');
    
    // For PostgreSQL, we can use TRUNCATE with CASCADE to handle foreign keys
    // Clear data from all tables (order matters due to foreign keys)
    const tablesToClear = [
      'attendance_records',
      'qr_codes',
      'enrollments',
      'sessions',
      'leave_requests',
      'leave_balances',
      'notifications',
      'student_codes',
      'classes',
      'user_roles',  // Junction table for many-to-many
      'users',
      'roles',
      'audit_logs'
    ];

    for (const table of tablesToClear) {
      try {
        await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE`);
        console.log(`✅ Cleared ${table}`);
      } catch (error) {
        console.log(`⚠️ Could not clear ${table} (table might not exist): ${error.message}`);
      }
    }

    console.log('🌱 Creating roles...');
    
    // Create roles
    await dataSource.query(`
      INSERT INTO roles (name, "createdAt", "updatedAt") 
      VALUES ('Teacher', NOW(), NOW())
    `);
    
    await dataSource.query(`
      INSERT INTO roles (name, "createdAt", "updatedAt") 
      VALUES ('Student', NOW(), NOW())
    `);

    // Get role IDs
    const teacherRole = await dataSource.query(`SELECT id FROM roles WHERE name = 'Teacher'`);
    const studentRole = await dataSource.query(`SELECT id FROM roles WHERE name = 'Student'`);
    
    const teacherRoleId = teacherRole[0].id;
    const studentRoleId = studentRole[0].id;

    console.log('👨‍🏫 Creating teacher account...');
    
    // Create teacher account
    const hashedTeacherPassword = await argon2.hash('teacher123');
    await dataSource.query(`
      INSERT INTO users (email, name, "passwordHash", status, "createdAt", "updatedAt") 
      VALUES ('teacher@school.com', 'John Teacher', $1, 'active', NOW(), NOW())
    `, [hashedTeacherPassword]);

    // Get teacher user ID and assign role
    const teacherUser = await dataSource.query(`SELECT id FROM users WHERE email = 'teacher@school.com'`);
    const teacherUserId = teacherUser[0].id;
    
    await dataSource.query(`
      INSERT INTO user_roles ("usersId", "rolesId") 
      VALUES ($1, $2)
    `, [teacherUserId, teacherRoleId]);

    console.log('👨‍🎓 Creating student accounts...');
    
    // Create first student account
    const hashedStudent1Password = await argon2.hash('student123');
    await dataSource.query(`
      INSERT INTO users (email, name, "passwordHash", status, student_code, "createdAt", "updatedAt") 
      VALUES ('student1@school.com', 'Alice Student', $1, 'active', '12345', NOW(), NOW())
    `, [hashedStudent1Password]);

    // Get student1 user ID and assign role
    const student1User = await dataSource.query(`SELECT id FROM users WHERE email = 'student1@school.com'`);
    const student1UserId = student1User[0].id;
    
    await dataSource.query(`
      INSERT INTO user_roles ("usersId", "rolesId") 
      VALUES ($1, $2)
    `, [student1UserId, studentRoleId]);

    // Create second student account
    const hashedStudent2Password = await argon2.hash('student123');
    await dataSource.query(`
      INSERT INTO users (email, name, "passwordHash", status, student_code, "createdAt", "updatedAt") 
      VALUES ('student2@school.com', 'Bob Student', $1, 'active', '67890', NOW(), NOW())
    `, [hashedStudent2Password]);

    // Get student2 user ID and assign role
    const student2User = await dataSource.query(`SELECT id FROM users WHERE email = 'student2@school.com'`);
    const student2UserId = student2User[0].id;
    
    await dataSource.query(`
      INSERT INTO user_roles ("usersId", "rolesId") 
      VALUES ($1, $2)
    `, [student2UserId, studentRoleId]);

    console.log('👤 Creating corresponding Student records for class enrollment...');
    
    // Create Student record for Alice (student1)
    await dataSource.query(`
      INSERT INTO students ("firstName", "lastName", "studentId", "email", "createdAt", "updatedAt") 
      VALUES ('Alice', 'Student', '12345', 'student1@school.com', NOW(), NOW())
    `);

    // Create Student record for Bob (student2)
    await dataSource.query(`
      INSERT INTO students ("firstName", "lastName", "studentId", "email", "createdAt", "updatedAt") 
      VALUES ('Bob', 'Student', '67890', 'student2@school.com', NOW(), NOW())
    `);

    console.log('✅ Database cleared and seeded successfully!');
    console.log('\n📋 Created accounts:');
    console.log('👨‍🏫 Teacher: teacher@school.com / teacher123');
    console.log('👨‍🎓 Student 1: student1@school.com / student123 (12345)');
    console.log('👨‍🎓 Student 2: student2@school.com / student123 (67890)');

  } catch (error) {
    console.error('❌ Error during database operations:', error);
    throw error;
  } finally {
    await app.close();
  }
}

clearDataAndSeed()
  .then(() => {
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });