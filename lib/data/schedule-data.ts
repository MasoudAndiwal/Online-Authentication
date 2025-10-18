// Schedule Data Structure
export type TimeSession = "MORNING" | "AFTERNOON" | "ALL";

// Individual schedule entry for a class
export interface ScheduleEntry {
  id: string;
  teacherName: string;
  subject: string;
  hours: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

// Class information
export interface Class {
  id: string;
  name: string; // e.g., "Class A", "Class B", "Class C"
  session: TimeSession; // MORNING or AFTERNOON
  schedule: ScheduleEntry[];
}

// Days of the week (Saturday to Thursday - Afghanistan/Middle East schedule)
export const DAYS = [
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
];

// Sample Classes Data
export const SAMPLE_CLASSES: Class[] = [
  // Morning Classes
  {
    id: "class-a-morning",
    name: "Class A",
    session: "MORNING",
    schedule: [
      // Saturday
      { id: "1", teacherName: "Prof. Ahmad", subject: "Mathematics", hours: 2, dayOfWeek: "saturday", startTime: "08:00", endTime: "10:00" },
      { id: "2", teacherName: "Dr. Karimi", subject: "Physics", hours: 2, dayOfWeek: "saturday", startTime: "10:00", endTime: "12:00" },
      // Sunday - Multiple teachers
      { id: "3", teacherName: "Prof. Rahimi", subject: "Chemistry", hours: 2, dayOfWeek: "sunday", startTime: "08:00", endTime: "10:00" },
      { id: "4", teacherName: "Prof. Ahmad", subject: "Mathematics", hours: 2, dayOfWeek: "sunday", startTime: "10:00", endTime: "12:00" },
      // Monday
      { id: "5", teacherName: "Dr. Hassan", subject: "Biology", hours: 2, dayOfWeek: "monday", startTime: "08:00", endTime: "10:00" },
      { id: "6", teacherName: "Prof. Naseri", subject: "English", hours: 2, dayOfWeek: "monday", startTime: "10:00", endTime: "12:00" },
      // Tuesday
      { id: "7", teacherName: "Dr. Karimi", subject: "Physics", hours: 2, dayOfWeek: "tuesday", startTime: "08:00", endTime: "10:00" },
      { id: "8", teacherName: "Prof. Rahimi", subject: "Chemistry", hours: 2, dayOfWeek: "tuesday", startTime: "10:00", endTime: "12:00" },
      // Wednesday
      { id: "9", teacherName: "Prof. Ahmad", subject: "Mathematics", hours: 2, dayOfWeek: "wednesday", startTime: "08:00", endTime: "10:00" },
      { id: "10", teacherName: "Prof. Naseri", subject: "English", hours: 2, dayOfWeek: "wednesday", startTime: "10:00", endTime: "12:00" },
      // Thursday
      { id: "11", teacherName: "Dr. Hassan", subject: "Biology", hours: 2, dayOfWeek: "thursday", startTime: "08:00", endTime: "10:00" },
      { id: "12", teacherName: "Dr. Karimi", subject: "Physics", hours: 2, dayOfWeek: "thursday", startTime: "10:00", endTime: "12:00" },
    ]
  },
  {
    id: "class-a-afternoon",
    name: "Class A",
    session: "AFTERNOON",
    schedule: [
      // Saturday
      { id: "13", teacherName: "Dr. Ahmadi", subject: "Computer Science", hours: 2, dayOfWeek: "saturday", startTime: "13:00", endTime: "15:00" },
      { id: "14", teacherName: "Prof. Sultani", subject: "History", hours: 2, dayOfWeek: "saturday", startTime: "15:00", endTime: "17:00" },
      // Sunday
      { id: "15", teacherName: "Dr. Ahmadi", subject: "Computer Science", hours: 2, dayOfWeek: "sunday", startTime: "13:00", endTime: "15:00" },
      { id: "16", teacherName: "Prof. Faizi", subject: "Dari", hours: 2, dayOfWeek: "sunday", startTime: "15:00", endTime: "17:00" },
      // Monday
      { id: "17", teacherName: "Prof. Sultani", subject: "History", hours: 2, dayOfWeek: "monday", startTime: "13:00", endTime: "15:00" },
      { id: "18", teacherName: "Dr. Ahmadi", subject: "Computer Science", hours: 2, dayOfWeek: "monday", startTime: "15:00", endTime: "17:00" },
      // Tuesday
      { id: "19", teacherName: "Prof. Faizi", subject: "Dari", hours: 2, dayOfWeek: "tuesday", startTime: "13:00", endTime: "15:00" },
      { id: "20", teacherName: "Prof. Sultani", subject: "History", hours: 2, dayOfWeek: "tuesday", startTime: "15:00", endTime: "17:00" },
      // Wednesday
      { id: "21", teacherName: "Dr. Ahmadi", subject: "Computer Science", hours: 2, dayOfWeek: "wednesday", startTime: "13:00", endTime: "15:00" },
      { id: "22", teacherName: "Prof. Faizi", subject: "Dari", hours: 2, dayOfWeek: "wednesday", startTime: "15:00", endTime: "17:00" },
      // Thursday
      { id: "23", teacherName: "Prof. Sultani", subject: "History", hours: 2, dayOfWeek: "thursday", startTime: "13:00", endTime: "15:00" },
      { id: "24", teacherName: "Dr. Ahmadi", subject: "Computer Science", hours: 2, dayOfWeek: "thursday", startTime: "15:00", endTime: "17:00" },
    ]
  },
  {
    id: "class-b-morning",
    name: "Class B",
    session: "MORNING",
    schedule: [
      // Saturday
      { id: "25", teacherName: "Prof. Samadi", subject: "Mathematics", hours: 2, dayOfWeek: "saturday", startTime: "08:00", endTime: "10:00" },
      { id: "26", teacherName: "Dr. Mohammadi", subject: "Physics", hours: 2, dayOfWeek: "saturday", startTime: "10:00", endTime: "12:00" },
      // Sunday
      { id: "27", teacherName: "Prof. Amiri", subject: "Chemistry", hours: 2, dayOfWeek: "sunday", startTime: "08:00", endTime: "10:00" },
      { id: "28", teacherName: "Dr. Wali", subject: "Biology", hours: 2, dayOfWeek: "sunday", startTime: "10:00", endTime: "12:00" },
      // Monday
      { id: "29", teacherName: "Prof. Samadi", subject: "Mathematics", hours: 2, dayOfWeek: "monday", startTime: "08:00", endTime: "10:00" },
      { id: "30", teacherName: "Prof. Naimi", subject: "English", hours: 2, dayOfWeek: "monday", startTime: "10:00", endTime: "12:00" },
      // Tuesday
      { id: "31", teacherName: "Dr. Mohammadi", subject: "Physics", hours: 2, dayOfWeek: "tuesday", startTime: "08:00", endTime: "10:00" },
      { id: "32", teacherName: "Prof. Amiri", subject: "Chemistry", hours: 2, dayOfWeek: "tuesday", startTime: "10:00", endTime: "12:00" },
      // Wednesday
      { id: "33", teacherName: "Dr. Wali", subject: "Biology", hours: 2, dayOfWeek: "wednesday", startTime: "08:00", endTime: "10:00" },
      { id: "34", teacherName: "Prof. Naimi", subject: "English", hours: 2, dayOfWeek: "wednesday", startTime: "10:00", endTime: "12:00" },
      // Thursday
      { id: "35", teacherName: "Prof. Samadi", subject: "Mathematics", hours: 2, dayOfWeek: "thursday", startTime: "08:00", endTime: "10:00" },
      { id: "36", teacherName: "Dr. Mohammadi", subject: "Physics", hours: 2, dayOfWeek: "thursday", startTime: "10:00", endTime: "12:00" },
    ]
  },
  {
    id: "class-b-afternoon",
    name: "Class B",
    session: "AFTERNOON",
    schedule: [
      // Saturday
      { id: "37", teacherName: "Dr. Zazai", subject: "Computer Science", hours: 2, dayOfWeek: "saturday", startTime: "13:00", endTime: "15:00" },
      { id: "38", teacherName: "Prof. Hashimi", subject: "History", hours: 2, dayOfWeek: "saturday", startTime: "15:00", endTime: "17:00" },
      // Sunday
      { id: "39", teacherName: "Prof. Majid", subject: "Dari", hours: 2, dayOfWeek: "sunday", startTime: "13:00", endTime: "15:00" },
      { id: "40", teacherName: "Dr. Zazai", subject: "Computer Science", hours: 2, dayOfWeek: "sunday", startTime: "15:00", endTime: "17:00" },
      // Monday
      { id: "41", teacherName: "Prof. Hashimi", subject: "History", hours: 2, dayOfWeek: "monday", startTime: "13:00", endTime: "15:00" },
      { id: "42", teacherName: "Prof. Majid", subject: "Dari", hours: 2, dayOfWeek: "monday", startTime: "15:00", endTime: "17:00" },
      // Tuesday
      { id: "43", teacherName: "Dr. Zazai", subject: "Computer Science", hours: 2, dayOfWeek: "tuesday", startTime: "13:00", endTime: "15:00" },
      { id: "44", teacherName: "Prof. Hashimi", subject: "History", hours: 2, dayOfWeek: "tuesday", startTime: "15:00", endTime: "17:00" },
      // Wednesday
      { id: "45", teacherName: "Prof. Majid", subject: "Dari", hours: 2, dayOfWeek: "wednesday", startTime: "13:00", endTime: "15:00" },
      { id: "46", teacherName: "Dr. Zazai", subject: "Computer Science", hours: 2, dayOfWeek: "wednesday", startTime: "15:00", endTime: "17:00" },
      // Thursday
      { id: "47", teacherName: "Prof. Hashimi", subject: "History", hours: 2, dayOfWeek: "thursday", startTime: "13:00", endTime: "15:00" },
      { id: "48", teacherName: "Prof. Majid", subject: "Dari", hours: 2, dayOfWeek: "thursday", startTime: "15:00", endTime: "17:00" },
    ]
  },
  {
    id: "class-c-morning",
    name: "Class C",
    session: "MORNING",
    schedule: [
      // Saturday - example with 3 teachers on same day
      { id: "49", teacherName: "Prof. Noori", subject: "Mathematics", hours: 1, dayOfWeek: "saturday", startTime: "08:00", endTime: "09:00" },
      { id: "50", teacherName: "Dr. Sahak", subject: "Physics", hours: 2, dayOfWeek: "saturday", startTime: "09:00", endTime: "11:00" },
      { id: "51", teacherName: "Prof. Habibi", subject: "Chemistry", hours: 1, dayOfWeek: "saturday", startTime: "11:00", endTime: "12:00" },
      // Sunday
      { id: "52", teacherName: "Dr. Rahmat", subject: "Biology", hours: 2, dayOfWeek: "sunday", startTime: "08:00", endTime: "10:00" },
      { id: "53", teacherName: "Prof. Amin", subject: "English", hours: 2, dayOfWeek: "sunday", startTime: "10:00", endTime: "12:00" },
      // Monday
      { id: "54", teacherName: "Prof. Noori", subject: "Mathematics", hours: 2, dayOfWeek: "monday", startTime: "08:00", endTime: "10:00" },
      { id: "55", teacherName: "Dr. Sahak", subject: "Physics", hours: 2, dayOfWeek: "monday", startTime: "10:00", endTime: "12:00" },
      // Tuesday
      { id: "56", teacherName: "Prof. Habibi", subject: "Chemistry", hours: 2, dayOfWeek: "tuesday", startTime: "08:00", endTime: "10:00" },
      { id: "57", teacherName: "Dr. Rahmat", subject: "Biology", hours: 2, dayOfWeek: "tuesday", startTime: "10:00", endTime: "12:00" },
      // Wednesday
      { id: "58", teacherName: "Prof. Amin", subject: "English", hours: 2, dayOfWeek: "wednesday", startTime: "08:00", endTime: "10:00" },
      { id: "59", teacherName: "Prof. Noori", subject: "Mathematics", hours: 2, dayOfWeek: "wednesday", startTime: "10:00", endTime: "12:00" },
      // Thursday
      { id: "60", teacherName: "Dr. Sahak", subject: "Physics", hours: 2, dayOfWeek: "thursday", startTime: "08:00", endTime: "10:00" },
      { id: "61", teacherName: "Prof. Habibi", subject: "Chemistry", hours: 2, dayOfWeek: "thursday", startTime: "10:00", endTime: "12:00" },
    ]
  },
  {
    id: "class-c-afternoon",
    name: "Class C",
    session: "AFTERNOON",
    schedule: [
      // Saturday
      { id: "62", teacherName: "Dr. Basir", subject: "Computer Science", hours: 2, dayOfWeek: "saturday", startTime: "13:00", endTime: "15:00" },
      { id: "63", teacherName: "Prof. Jamil", subject: "History", hours: 2, dayOfWeek: "saturday", startTime: "15:00", endTime: "17:00" },
      // Sunday
      { id: "64", teacherName: "Prof. Aziz", subject: "Dari", hours: 2, dayOfWeek: "sunday", startTime: "13:00", endTime: "15:00" },
      { id: "65", teacherName: "Dr. Basir", subject: "Computer Science", hours: 2, dayOfWeek: "sunday", startTime: "15:00", endTime: "17:00" },
      // Monday
      { id: "66", teacherName: "Prof. Jamil", subject: "History", hours: 2, dayOfWeek: "monday", startTime: "13:00", endTime: "15:00" },
      { id: "67", teacherName: "Prof. Aziz", subject: "Dari", hours: 2, dayOfWeek: "monday", startTime: "15:00", endTime: "17:00" },
      // Tuesday
      { id: "68", teacherName: "Dr. Basir", subject: "Computer Science", hours: 2, dayOfWeek: "tuesday", startTime: "13:00", endTime: "15:00" },
      { id: "69", teacherName: "Prof. Jamil", subject: "History", hours: 2, dayOfWeek: "tuesday", startTime: "15:00", endTime: "17:00" },
      // Wednesday
      { id: "70", teacherName: "Prof. Aziz", subject: "Dari", hours: 2, dayOfWeek: "wednesday", startTime: "13:00", endTime: "15:00" },
      { id: "71", teacherName: "Dr. Basir", subject: "Computer Science", hours: 2, dayOfWeek: "wednesday", startTime: "15:00", endTime: "17:00" },
      // Thursday
      { id: "72", teacherName: "Prof. Jamil", subject: "History", hours: 2, dayOfWeek: "thursday", startTime: "13:00", endTime: "15:00" },
      { id: "73", teacherName: "Prof. Aziz", subject: "Dari", hours: 2, dayOfWeek: "thursday", startTime: "15:00", endTime: "17:00" },
    ]
  },
];
