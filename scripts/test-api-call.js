/**
 * Test the actual API endpoints
 */

const https = require('https');
const http = require('http');

async function testTeacherAPI() {
  console.log('🧪 TESTING TEACHER API ENDPOINT');
  console.log('===============================');

  const url = 'http://localhost:3000/api/auth/login/teacher';
  const payload = {
    username: 'MasoudA',
    password: 'password123'
  };

  console.log('📡 Making API call to:', url);
  console.log('📦 Payload:', payload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Status Text:', response.statusText);

    const responseData = await response.json();
    console.log('📋 Response Data:', JSON.stringify(responseData, null, 2));

    if (response.status === 200) {
      console.log('✅ API CALL SUCCESSFUL!');
    } else {
      console.log('❌ API CALL FAILED!');
      console.log('🔍 Check the response data above for details');
    }

  } catch (error) {
    console.error('❌ API call error:', error.message);
    console.log('🔍 Make sure your development server is running on http://localhost:3000');
  }
}

async function testStudentAPI() {
  console.log('\n🧪 TESTING STUDENT API ENDPOINT');
  console.log('===============================');

  const url = 'http://localhost:3000/api/auth/login/student';
  const payload = {
    username: 'teststudent',
    studentId: '999888',
    password: 'password123'
  };

  console.log('📡 Making API call to:', url);
  console.log('📦 Payload:', payload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Status Text:', response.statusText);

    const responseData = await response.json();
    console.log('📋 Response Data:', JSON.stringify(responseData, null, 2));

    if (response.status === 200) {
      console.log('✅ API CALL SUCCESSFUL!');
    } else {
      console.log('❌ API CALL FAILED!');
      console.log('🔍 Check the response data above for details');
    }

  } catch (error) {
    console.error('❌ API call error:', error.message);
    console.log('🔍 Make sure your development server is running on http://localhost:3000');
  }
}

async function testOfficeAPI() {
  console.log('\n🧪 TESTING OFFICE API ENDPOINT');
  console.log('==============================');

  const url = 'http://localhost:3000/api/auth/login/office';
  const payload = {
    username: 'JamilShirzad',
    password: 'password123'
  };

  console.log('📡 Making API call to:', url);
  console.log('📦 Payload:', payload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Status Text:', response.statusText);

    const responseData = await response.json();
    console.log('📋 Response Data:', JSON.stringify(responseData, null, 2));

    if (response.status === 200) {
      console.log('✅ API CALL SUCCESSFUL!');
    } else {
      console.log('❌ API CALL FAILED!');
      console.log('🔍 Check the response data above for details');
    }

  } catch (error) {
    console.error('❌ API call error:', error.message);
    console.log('🔍 Make sure your development server is running on http://localhost:3000');
  }
}

async function runAllTests() {
  await testTeacherAPI();
  await testStudentAPI();
  await testOfficeAPI();
  
  console.log('\n🎯 SUMMARY:');
  console.log('If all API calls show ✅ SUCCESSFUL, then the login should work in the browser!');
  console.log('If any show ❌ FAILED, check the error details above.');
}

runAllTests();