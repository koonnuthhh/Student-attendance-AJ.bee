import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function testMobileAPICall() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🔍 Testing Mobile App API Call Simulation');
    console.log('='.repeat(50));

    // First, let's get a valid JWT token by simulating login
    console.log('\n1. 🔐 Simulating login to get JWT token...');
    
    const user = await dataSource.query(`
      SELECT id, email, name, student_code, "passwordHash"
      FROM users 
      WHERE email = 'student1@school.com'
    `);
    
    if (user.length === 0) {
      console.log('❌ Student user not found');
      return;
    }
    
    console.log('✅ Found user:', {
      id: user[0].id,
      email: user[0].email,
      studentCode: user[0].student_code
    });
    
    // Check what's in AsyncStorage equivalent (token key from config)
    console.log('\n2. 📱 Mobile App Configuration:');
    console.log('   - API Base URL: http://localhost:3000/api');
    console.log('   - Token Storage Key: @attendance_token');
    console.log('   - Expected API Call: GET /students/my-classes');
    console.log('   - Full URL: http://localhost:3000/api/students/my-classes');
    
    // Check if backend has the /api prefix
    console.log('\n3. 🌐 Backend API Endpoints Analysis:');
    console.log('   - The mobile app expects: http://localhost:3000/api/students/my-classes');
    console.log('   - But the backend might be at: http://localhost:3000/students/my-classes');
    console.log('   - This could be the URL mismatch!');
    
    console.log('\n4. 🧪 JWT Token Format Check:');
    console.log('   - The API expects JWT with user.sub = user.id');
    console.log('   - User ID should be:', user[0].id);
    
    console.log('\n5. 📊 Expected API Response:');
    console.log('   Based on our previous test, the API should return:');
    console.log('   [');
    console.log('     {');
    console.log('       "id": "84f2531a-5dfe-4467-a980-1120f6219af0",');
    console.log('       "name": "Math 101",');
    console.log('       "subject": "math",');
    console.log('       "teacher": {');
    console.log('         "name": "John Teacher",');
    console.log('         "email": "teacher@school.com"');
    console.log('       },');
    console.log('       "enrollmentStatus": "active",');
    console.log('       "sessionsToday": 0,');
    console.log('       "attendanceRate": 0,');
    console.log('       "totalSessions": 0,');
    console.log('       "attendedSessions": 0');
    console.log('     }');
    console.log('   ]');
    
    console.log('\n🎯 DEBUGGING CHECKLIST:');
    console.log('1. ✅ User exists with studentCode 12345');
    console.log('2. ✅ Student record exists with studentId 12345');
    console.log('3. ✅ Enrollment exists in Math 101');
    console.log('4. ❓ Check if backend is running on port 3000');
    console.log('5. ❓ Check if backend has /api prefix');
    console.log('6. ❓ Check if mobile app has valid JWT token');
    console.log('7. ❓ Check if mobile app can reach the backend');
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('1. Check backend server port and URL');
    console.log('2. Check if JWT token is being sent correctly');
    console.log('3. Look for CORS issues in browser/mobile logs');
    console.log('4. Check network connectivity between mobile and backend');

  } catch (error) {
    console.error('❌ Error during mobile API test:', error);
  } finally {
    await app.close();
  }
}

testMobileAPICall()
  .then(() => {
    console.log('\n✅ Mobile API test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Mobile API test failed:', error);
    process.exit(1);
  });