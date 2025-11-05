/**
 * Test script to verify Solar Hijri calendar conversion
 * Run this in browser console to test the conversion
 */

// Test function to convert Gregorian to Solar Hijri
function gregorianToSolar(date) {
  let gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  let jy, jm, jd;

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }

  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;

  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return {
    year: jy,
    month: jm,
    day: jd,
    weekDay: date.getDay(),
  };
}

// Test current date
const today = new Date();
const solarToday = gregorianToSolar(today);

console.log('=== Solar Calendar Test ===');
console.log('Gregorian Date:', today.toDateString());
console.log('Solar Hijri Date:', `${solarToday.year}/${solarToday.month}/${solarToday.day}`);

// Test specific dates
const testDates = [
  new Date(2025, 0, 1),  // January 1, 2025
  new Date(2025, 2, 21), // March 21, 2025 (Nowruz)
  new Date(2024, 2, 20), // March 20, 2024 (Nowruz)
];

testDates.forEach((date, index) => {
  const solar = gregorianToSolar(date);
  console.log(`Test ${index + 1}:`);
  console.log(`  Gregorian: ${date.toDateString()}`);
  console.log(`  Solar: ${solar.year}/${solar.month}/${solar.day}`);
});

// Expected results:
// - January 1, 2025 should be around 1403/10/11 (11 Jadi 1403)
// - March 21, 2025 should be 1404/1/1 (1 Hamal 1404) - New Year
// - March 20, 2024 should be 1403/1/1 (1 Hamal 1403) - New Year

console.log('=== Expected Results ===');
console.log('January 1, 2025 ≈ 1403/10/11 (11 Jadi 1403)');
console.log('March 21, 2025 = 1404/1/1 (1 Hamal 1404) - New Year');
console.log('March 20, 2024 = 1403/1/1 (1 Hamal 1403) - New Year');