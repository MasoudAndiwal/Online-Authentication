// Teaching Time Slots Configuration

export interface TimeSlot {
  period: number;
  startTime: string;
  endTime: string;
  label: string;
}

// Morning Session: 6 teaching periods
export const MORNING_TIME_SLOTS: TimeSlot[] = [
  { period: 1, startTime: "08:30", endTime: "09:10", label: "Period 1 (08:30 - 09:10)" },
  { period: 2, startTime: "09:10", endTime: "09:50", label: "Period 2 (09:10 - 09:50)" },
  { period: 3, startTime: "09:50", endTime: "10:30", label: "Period 3 (09:50 - 10:30)" },
  // Break: 10:30 - 10:45
  { period: 4, startTime: "10:45", endTime: "11:25", label: "Period 4 (10:45 - 11:25)" },
  { period: 5, startTime: "11:25", endTime: "12:05", label: "Period 5 (11:25 - 12:05)" },
  { period: 6, startTime: "12:05", endTime: "12:45", label: "Period 6 (12:05 - 12:45)" },
];

// Afternoon Session: 6 teaching periods
export const AFTERNOON_TIME_SLOTS: TimeSlot[] = [
  { period: 1, startTime: "13:15", endTime: "13:55", label: "Period 1 (01:15 PM - 01:55 PM)" },
  { period: 2, startTime: "13:55", endTime: "14:35", label: "Period 2 (01:55 PM - 02:35 PM)" },
  { period: 3, startTime: "14:35", endTime: "15:15", label: "Period 3 (02:35 PM - 03:15 PM)" },
  // Break: 15:15 - 15:30 (3:15 PM - 3:30 PM)
  { period: 4, startTime: "15:30", endTime: "16:10", label: "Period 4 (03:30 PM - 04:10 PM)" },
  { period: 5, startTime: "16:10", endTime: "16:50", label: "Period 5 (04:10 PM - 04:50 PM)" },
  { period: 6, startTime: "16:50", endTime: "17:30", label: "Period 6 (04:50 PM - 05:30 PM)" },
];

export const BREAK_TIMES = {
  MORNING: { startTime: "10:30", endTime: "10:45", label: "Break (10:30 - 10:45)" },
  AFTERNOON: { startTime: "15:15", endTime: "15:30", label: "Break (03:15 PM - 03:30 PM)" },
};

// Helper function to get time slots based on session
export function getTimeSlotsBySession(session: "MORNING" | "AFTERNOON"): TimeSlot[] {
  return session === "MORNING" ? MORNING_TIME_SLOTS : AFTERNOON_TIME_SLOTS;
}

// Helper function to check if two time slots overlap
export function doTimeSlotsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const startTime1 = timeToMinutes(start1);
  const endTime1 = timeToMinutes(end1);
  const startTime2 = timeToMinutes(start2);
  const endTime2 = timeToMinutes(end2);

  return (startTime1 < endTime2 && endTime1 > startTime2);
}

// Convert time string (HH:MM) to minutes for comparison
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Format time to display format (e.g., "08:30" -> "08:30 AM")
export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
}
