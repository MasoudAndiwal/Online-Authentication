/**
 * Test API call to debug login issue
 */

const { default: fetch } = require('node-fetch');

async function testApiCall() {
  try {
    console.log('🌐 Testing API call...');
    
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
    console.log('📊 Response status text:', response.statusText);
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);

    try {
      const responseJson = JSON.parse(responseText);
      console.log('📋 Parsed response:', JSON.stringify(responseJson, null, 2));
    } catch (e) {
      console.log('❌ Could not parse response as JSON');
    }

  } catch (error) {
    console.error('❌ API call error:', error);
  }
}

testApiCall();