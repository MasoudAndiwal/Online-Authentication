/**
 * Simple API test using curl commands
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testAPI(endpoint, payload, name) {
  console.log(`\n🧪 TESTING ${name} API`);
  console.log('='.repeat(30 + name.length));
  
  const curlCommand = `curl -X POST http://localhost:3000${endpoint} ` +
    `-H "Content-Type: application/json" ` +
    `-d '${JSON.stringify(payload)}' ` +
    `-w "\\nHTTP_STATUS:%{http_code}\\n" ` +
    `-s`;

  console.log('📡 Endpoint:', endpoint);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const { stdout, stderr } = await execAsync(curlCommand);
    
    if (stderr) {
      console.error('❌ Error:', stderr);
      return;
    }

    const lines = stdout.trim().split('\n');
    const statusLine = lines.find(line => line.startsWith('HTTP_STATUS:'));
    const status = statusLine ? statusLine.split(':')[1] : 'unknown';
    
    const responseBody = lines.filter(line => !line.startsWith('HTTP_STATUS:')).join('\n');
    
    console.log('📊 HTTP Status:', status);
    
    if (responseBody) {
      try {
        const jsonResponse = JSON.parse(responseBody);
        console.log('📋 Response:', JSON.stringify(jsonResponse, null, 2));
      } catch (e) {
        console.log('📋 Response (raw):', responseBody);
      }
    }

    if (status === '200') {
      console.log('✅ SUCCESS!');
    } else {
      console.log('❌ FAILED!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('🔍 Make sure your development server is running on http://localhost:3000');
  }
}

async function runTests() {
  console.log('🚀 TESTING ALL LOGIN API ENDPOINTS');
  console.log('==================================');

  // Test Teacher Login
  await testAPI('/api/auth/login/teacher', {
    username: 'MasoudA',
    password: 'password123'
  }, 'TEACHER');

  // Test Student Login
  await testAPI('/api/auth/login/student', {
    username: 'teststudent',
    studentId: '999888',
    password: 'password123'
  }, 'STUDENT');

  // Test Office Login
  await testAPI('/api/auth/login/office', {
    username: 'JamilShirzad',
    password: 'password123'
  }, 'OFFICE');

  console.log('\n🎯 SUMMARY:');
  console.log('If all tests show ✅ SUCCESS, then login should work in browser!');
  console.log('If any show ❌ FAILED, check the error details above.');
  console.log('\n💡 To test in browser:');
  console.log('1. Make sure server is running: npm run dev');
  console.log('2. Go to: http://localhost:3000/login');
  console.log('3. Try the credentials above');
}

runTests();