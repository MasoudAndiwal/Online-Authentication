/**
 * Test script to verify schedule API is working correctly
 * Run with: npx ts-node scripts/test-schedule-api.ts
 */

async function testScheduleAPI() {
  const baseUrl = 'http://localhost:3000';
  
  // Test with AI-301-A class on Saturday
  const params = new URLSearchParams({
    className: 'AI-301-A',
    session: 'MORNING',
    dayOfWeek: 'saturday'
  });
  
  console.log('Testing schedule API...');
  console.log('URL:', `${baseUrl}/api/schedule?${params.toString()}`);
  
  try {
    const response = await fetch(`${baseUrl}/api/schedule?${params.toString()}`);
    const data = await response.json();
    
    console.log('\n=== API Response ===');
    console.log('Status:', response.status);
    console.log('Source:', data.source);
    console.log('Total Periods:', data.totalPeriods);
    console.log('\n=== Schedule Entries ===');
    
    if (data.data && data.data.length > 0) {
      data.data.forEach((entry: any) => {
        console.log(`Period ${entry.periodNumber}: ${entry.startTime}-${entry.endTime} | ${entry.teacherName} | ${entry.subject}`);
      });
    } else {
      console.log('No schedule entries found');
    }
    
    console.log('\n=== Full Response ===');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testScheduleAPI();
