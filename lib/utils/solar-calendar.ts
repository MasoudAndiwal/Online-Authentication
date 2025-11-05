/**
 * Solar (Hijri Shamsi / Jalali) Calendar Utilities
 * Converts Gregorian dates to Persian Solar calendar
 */

const PERSIAN_MONTHS = [
  "حمل", // Hamal
  "ثور", // Sawr
  "جوزا", // Jawza
  "سرطان", // Saratan
  "اسد", // Asad
  "سنبله", // Sonbola
  "میزان", // Mizan
  "عقرب", // Aqrab
  "قوس", // Qaws
  "جدی", // Jadi
  "دلو", // Dalvæ
  "حوت", // Hut
];

const PERSIAN_WEEKDAYS = [
  "یکشنبه", // Sunday
  "دوشنبه", // Monday
  "سه‌شنبه", // Tuesday
  "چهارشنبه", // Wednesday
  "پنجشنبه", // Thursday
  "جمعه", // Friday
  "شنبه", // Saturday
];

/**
 * Convert Gregorian date to Solar Hijri (Jalali) calendar
 * Algorithm based on Kazimierz M. Borkowski's conversion
 */
export function gregorianToSolar(date: Date): {
  year: number;
  month: number;
  day: number;
  weekDay: number;
} {
  let gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  let jy: number, jm: number, jd: number;

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

/**
 * Convert Solar Hijri (Jalali) date to Gregorian date
 */
export function solarToGregorian(jy: number, jm: number, jd: number): Date {
  let gy: number, gm: number, gd: number;

  const j_d_m = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336, 365];

  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }

  const jy2 = jm < 10 ? jy - 1 : jy;
  let days = 365 * jy + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4) + 78 + jd;

  if (jm < 10) days += j_d_m[jm - 1];
  else days += j_d_m[jm - 1] - 1;

  gy += 400 * Math.floor(days / 146097);
  days %= 146097;

  let leap = true;
  if (days >= 36525) {
    days--;
    gy += 100 * Math.floor(days / 36524);
    days %= 36524;
    if (days >= 365) days++;
    else leap = false;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days >= 366) {
    leap = false;
    days--;
    gy += Math.floor(days / 365);
    days = days % 365;
  }

  if (days === 0) {
    gd = 31;
    gm = 12;
    gy--;
  } else {
    const sal_a = leap ? [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366] : [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    gm = 0;
    while (gm < 13 && days >= sal_a[gm]) gm++;
    if (gm > 1) {
      gd = days - sal_a[gm - 1];
      gm--;
    } else {
      gd = days;
    }
  }

  return new Date(gy, gm - 1, gd);
}

/**
 * Format Solar date to readable string
 */
export function formatSolarDate(
  date: Date,
  format: "short" | "long" = "long"
): string {
  const solar = gregorianToSolar(date);
  const weekDay = PERSIAN_WEEKDAYS[solar.weekDay];
  const month = PERSIAN_MONTHS[solar.month - 1];

  if (format === "short") {
    return `${solar.year}/${solar.month}/${solar.day}`;
  }

  return `${weekDay}، ${solar.day} ${month} ${solar.year}`;
}

/**
 * Get Solar month name
 */
export function getSolarMonthName(monthIndex: number): string {
  return PERSIAN_MONTHS[monthIndex - 1] || "";
}

/**
 * Get Solar weekday name
 */
export function getSolarWeekdayName(weekDayIndex: number): string {
  return PERSIAN_WEEKDAYS[weekDayIndex] || "";
}

/**
 * Get current Solar Hijri date
 */
export function getCurrentSolarDate(): {
  year: number;
  month: number;
  day: number;
  weekDay: number;
} {
  return gregorianToSolar(new Date());
}

/**
 * Check if a date is today in Solar calendar
 */
export function isSolarToday(date: Date): boolean {
  const today = getCurrentSolarDate();
  const checkDate = gregorianToSolar(date);
  
  return (
    today.year === checkDate.year &&
    today.month === checkDate.month &&
    today.day === checkDate.day
  );
}

/**
 * Format Solar date for display in calendar
 */
export function formatSolarDateForCalendar(date: Date): {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  monthName: string;
  formattedDate: string;
} {
  const solar = gregorianToSolar(date);
  const monthName = PERSIAN_MONTHS[solar.month - 1];
  const formattedDate = `${solar.day} ${monthName} ${solar.year}`;
  
  return {
    solarYear: solar.year,
    solarMonth: solar.month,
    solarDay: solar.day,
    monthName,
    formattedDate,
  };
}
