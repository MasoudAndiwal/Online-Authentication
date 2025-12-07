/**
 * Test login with correct credentials
 */

const { default: fetch } = require('node-fetch');

async function testCorrectLogins() {
  console.log('🧪 Testing with correct credentials...\n');

  // Test Student Login
  console.log('👨‍🎓 Testing Student Login...');
  try {
    const studentResponse = await fetch('http://localhost:3000/api/auth/login/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ahmadjoxoto',
        studentId: '54234',
        password: 'password123'
      })
    });
    
    console.log(`   Status: ${studentResponse.status}`);
    const studentResult = await studentResponse.text();
    console.log(`   Response: ${studentResult}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test Teacher Login
  console.log('👨‍🏫 Testing Teacher Login...');
  try {
    const teacherResponse = await fetch('http://localhost:3000/api/auth/login/teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'MasoudA',
        password: 'password123'
      })
    });
    
    console.log(`   Status: ${teacherResponse.status}`);
    const teacherResult = await teacherResponse.text();
    console.log(`   Response: ${teacherResult}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test Office Login
  console.log('🏢 Testing Office Login...');
  try {
    const officeResponse = await fetch('http://localhost:3000/api/auth/login/office', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'JamilShirzad',
        password: 'password123'
      })
    });
    
    console.log(`   Status: ${officeResponse.status}`);
    const officeResult = await officeResponse.text();
    console.log(`   Response: ${officeResult}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }
}

testCorrectLogins();