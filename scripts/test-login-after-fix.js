/**
 * Test login after removing audit logging
 */

const { default: fetch } = require('node-fetch');

async function testLoginAfterFix() {
  try {
    console.log('🧪 Testing login after audit logging removal...\n');

    // Test Student Login with new test user
    console.log('👨‍🎓 Testing Student Login...');
    const studentResponse = await fetch('http://localhost:3000/api/auth/login/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'teststudent',
        studentId: '999888',
        password: 'password123'
      })
    });
    
    console.log(`   Status: ${studentResponse.status}`);
    const studentResult = await studentResponse.text();
    console.log(`   Response: ${studentResult}`);
    
    if (studentResponse.status === 200) {
      console.log('🎉 STUDENT LOGIN WORKS!');
    } else {
      console.log('❌ Student login still failing');
    }

    // Test with existing users too
    console.log('\n👨‍🎓 Testing with existing student (ahmadjoxoto)...');
    const existingStudentResponse = await fetch('http://localhost:3000/api/auth/login/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ahmadjoxoto',
        studentId: '54234',
        password: 'password123'
      })
    });
    
    console.log(`   Status: ${existingStudentResponse.status}`);
    const existingResult = await existingStudentResponse.text();
    console.log(`   Response: ${existingResult}`);

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testLoginAfterFix();