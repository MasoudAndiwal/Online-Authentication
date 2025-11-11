/**
 * Test script for Teacher Schedule API endpoint
 * 
 * This script tests the /api/teachers/schedule endpoint to ensure it works correctly
 * with the existing database structure and returns properly formatted data.
 */

import { supabase } from '@/lib/supabase';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  data?: any;
}

async function testTeacherScheduleAPI(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  console.log('🧪 Testing Teacher Schedule API...\n');

  // Test 1: Get a sample teacher from database
  try {
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('id, first_name, last_name')
      .limit(1);

    if (error || !teachers || teachers.length === 0) {
      results.push({
        test: 'Database Connection - Get Sample Teacher',
        status: 'FAIL',
        message: 'Could not fetch sample teacher from database'
      });
      return results;
    }

    const sampleTeacher = teachers[0];
    results.push({
      test: 'Database Connection - Get Sample Teacher',
      status: 'PASS',
      message: `Found teacher: ${sampleTeacher.first_name} ${sampleTeacher.last_name}`,
      data: sampleTeacher
    });

    // Test 2: Get a sample class
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('id, name')
      .limit(1);

    if (classError || !classes || classes.length === 0) {
      results.push({
        test: 'Database Connection - Get Sample Class',
        status: 'FAIL',
        message: 'Could not fetch sample class from database'
      });
      return results;
    }

    const sampleClass = classes[0];
    results.push({
      test: 'Database Connection - Get Sample Class',
      status: 'PASS',
      message: `Found class: ${sampleClass.name}`,
      data: sampleClass
    });

    // Test 3: API Call - Get teacher periods for specific class
    try {
      const apiUrl = `${baseUrl}/api/teachers/schedule?teacherId=${sampleTeacher.id}&classId=${sampleClass.id}&dayOfWeek=monday`;
      const response = await fetch(apiUrl);
      const apiData = await response.json();

      if (response.ok && apiData.success) {
        results.push({
          test: 'API Call - Get Teacher Periods',
          status: 'PASS',
          message: `API returned ${apiData.data.assignedPeriods.length} assigned periods`,
          data: {
            url: apiUrl,
            response: apiData
          }
        });
      } else {
        results.push({
          test: 'API Call - Get Teacher Periods',
          status: 'FAIL',
          message: `API call failed: ${apiData.error || 'Unknown error'}`,
          data: {
            url: apiUrl,
            response: apiData
          }
        });
      }
    } catch (error) {
      results.push({
        test: 'API Call - Get Teacher Periods',
        status: 'FAIL',
        message: `API call threw error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 4: API Call - Get daily schedule
    try {
      const dailyUrl = `${baseUrl}/api/teachers/schedule?teacherId=${sampleTeacher.id}&type=daily`;
      const dailyResponse = await fetch(dailyUrl);
      const dailyData = await dailyResponse.json();

      if (dailyResponse.ok && dailyData.success) {
        results.push({
          test: 'API Call - Get Daily Schedule',
          status: 'PASS',
          message: `Daily schedule returned ${dailyData.data.totalPeriods} total periods across ${dailyData.data.classSummary.length} classes`,
          data: {
            url: dailyUrl,
            response: dailyData
          }
        });
      } else {
        results.push({
          test: 'API Call - Get Daily Schedule',
          status: 'FAIL',
          message: `Daily schedule API failed: ${dailyData.error || 'Unknown error'}`,
          data: {
            url: dailyUrl,
            response: dailyData
          }
        });
      }
    } catch (error) {
      results.push({
        test: 'API Call - Get Daily Schedule',
        status: 'FAIL',
        message: `Daily schedule API threw error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 5: API Validation - Missing teacherId
    try {
      const invalidUrl = `${baseUrl}/api/teachers/schedule?classId=${sampleClass.id}&dayOfWeek=monday`;
      const invalidResponse = await fetch(invalidUrl);
      const invalidData = await invalidResponse.json();

      if (invalidResponse.status === 400 && invalidData.error) {
        results.push({
          test: 'API Validation - Missing teacherId',
          status: 'PASS',
          message: 'API correctly rejected request with missing teacherId',
          data: {
            url: invalidUrl,
            response: invalidData
          }
        });
      } else {
        results.push({
          test: 'API Validation - Missing teacherId',
          status: 'FAIL',
          message: 'API should have returned 400 error for missing teacherId',
          data: {
            url: invalidUrl,
            response: invalidData
          }
        });
      }
    } catch (error) {
      results.push({
        test: 'API Validation - Missing teacherId',
        status: 'FAIL',
        message: `Validation test threw error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

  } catch (error) {
    results.push({
      test: 'Overall Test Setup',
      status: 'FAIL',
      message: `Test setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  return results;
}

// Print test results
function printResults(results: TestResult[]): void {
  console.log('\n📊 Test Results Summary:');
  console.log('========================\n');

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  results.forEach((result, index) => {
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${index + 1}. ${statusIcon} ${result.test}`);
    console.log(`   ${result.message}\n`);

    if (result.status === 'PASS') passed++;
    else if (result.status === 'FAIL') failed++;
    else skipped++;
  });

  console.log(`📈 Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! The Teacher Schedule API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testTeacherScheduleAPI()
    .then(printResults)
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { testTeacherScheduleAPI, printResults };