/**
 * Test login and capture detailed logs
 */

const { default: fetch } = require('node-fetch');

async function testLoginWithLogs() {
  try {
    console.log('🌐 Testing login with detailed logging...');
    
    const response = await fetch('http://localhost:3000/api/auth/login/student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'student',
        studentId: '888999',
        password: 'password123'
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);

    if (response.status === 401) {
      console.log('\n🔍 DEBUGGING TIPS:');
      console.log('1. Check your Next.js server terminal for error logs');
      console.log('2. The issue is likely in the audit logging foreign key constraint');
      console.log('3. Try the login in the browser and check browser dev tools Network tab');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testLoginWithLogs();