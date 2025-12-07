/**
 * Test teacher login to see if same audit issue exists
 */

const { default: fetch } = require('node-fetch');

async function testTeacherLogin() {
  try {
    console.log('🧑‍🏫 Testing teacher login...');
    
    // Test with existing teacher: masoudandiwal
    const response = await fetch('http://localhost:3000/api/auth/login/teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'masoudandiwal',
        password: 'password123'  // Assuming same password pattern
      })
    });

    console.log('📊 Teacher login response status:', response.status);
    const responseText = await response.text();
    console.log('📄 Teacher login response:', responseText);

    if (response.status === 401) {
      console.log('❌ Teacher login also fails - same audit logging issue');
    } else {
      console.log('✅ Teacher login works - different issue for students');
    }

  } catch (error) {
    console.error('❌ Teacher login test error:', error);
  }
}

async function testOfficeLogin() {
  try {
    console.log('\n🏢 Testing office login...');
    
    // Test with existing office staff: masoudandiwal
    const response = await fetch('http://localhost:3000/api/auth/login/office', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'masoudandiwal',
        password: 'password123'  // Assuming same password pattern
      })
    });

    console.log('📊 Office login response status:', response.status);
    const responseText = await response.text();
    console.log('📄 Office login response:', responseText);

    if (response.status === 401) {
      console.log('❌ Office login also fails - same audit logging issue');
    } else {
      console.log('✅ Office login works - different issue for students');
    }

  } catch (error) {
    console.error('❌ Office login test error:', error);
  }
}

async function runAllTests() {
  await testTeacherLogin();
  await testOfficeLogin();
  
  console.log('\n🎯 CONCLUSION:');
  console.log('If both teacher and office logins also return 401 with the same error message,');
  console.log('then the issue is definitely the audit logging foreign key constraint.');
  console.log('The audit_logs table is trying to reference user IDs that may not exist');
  console.log('or the constraint is too restrictive.');
}

runAllTests();