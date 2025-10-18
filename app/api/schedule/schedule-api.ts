import supabase from "@/lib/supabase";
import { Class, ScheduleEntry } from "@/lib/data/schedule-data";

// ================================================
// Schedule API Functions
// ================================================

// ================================================
// Classes CRUD Operations
// ================================================

/**
 * Fetch all classes with their schedule entries
 */
export async function fetchClasses(): Promise<Class[]> {
  try {
    const { data: classes, error: classError } = await supabase
      .from("classes")
      .select("*")
      .order("name", { ascending: true })
      .order("session", { ascending: true });

    if (classError) throw classError;

    if (!classes || classes.length === 0) {
      return [];
    }

    // Fetch schedule entries for all classes
    const { data: entries, error: entriesError } = await supabase
      .from("schedule_entries")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (entriesError) throw entriesError;

    // Group entries by class_id
    const entriesByClass: Record<string, ScheduleEntry[]> = {};
    entries?.forEach((entry) => {
      if (!entriesByClass[entry.class_id]) {
        entriesByClass[entry.class_id] = [];
      }
      entriesByClass[entry.class_id].push({
        id: entry.id,
        teacherName: entry.teacher_name,
        subject: entry.subject,
        hours: entry.hours,
        dayOfWeek: entry.day_of_week,
        startTime: entry.start_time,
        endTime: entry.end_time,
      });
    });

    // Combine classes with their entries
    return classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      session: cls.session as "MORNING" | "AFTERNOON",
      schedule: entriesByClass[cls.id] || [],
    }));
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
}

/**
 * Create a new class
 */
export async function createClass(data: {
  name: string;
  session: "MORNING" | "AFTERNOON";
}): Promise<Class> {
  try {
    const { data: newClass, error } = await supabase
      .from("classes")
      .insert({
        name: data.name,
        session: data.session,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: newClass.id,
      name: newClass.name,
      session: newClass.session,
      schedule: [],
    };
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
}

/**
 * Update a class
 */
export async function updateClass(
  classId: string,
  data: { name: string }
): Promise<void> {
  try {
    const { error } = await supabase
      .from("classes")
      .update({ name: data.name })
      .eq("id", classId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
}

/**
 * Delete a class (and all its schedule entries via CASCADE)
 */
export async function deleteClass(classId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", classId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
}

// ================================================
// Schedule Entries CRUD Operations
// ================================================

/**
 * Create a new schedule entry
 */
export async function createScheduleEntry(
  classId: string,
  data: Omit<ScheduleEntry, "id">
): Promise<ScheduleEntry> {
  try {
    const { data: newEntry, error } = await supabase
      .from("schedule_entries")
      .insert({
        class_id: classId,
        teacher_name: data.teacherName,
        subject: data.subject,
        hours: data.hours,
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: newEntry.id,
      teacherName: newEntry.teacher_name,
      subject: newEntry.subject,
      hours: newEntry.hours,
      dayOfWeek: newEntry.day_of_week,
      startTime: newEntry.start_time,
      endTime: newEntry.end_time,
    };
  } catch (error) {
    console.error("Error creating schedule entry:", error);
    throw error;
  }
}

/**
 * Update a schedule entry
 */
export async function updateScheduleEntry(
  entryId: string,
  data: Omit<ScheduleEntry, "id">
): Promise<void> {
  try {
    const { error } = await supabase
      .from("schedule_entries")
      .update({
        teacher_name: data.teacherName,
        subject: data.subject,
        hours: data.hours,
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime,
      })
      .eq("id", entryId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating schedule entry:", error);
    throw error;
  }
}

/**
 * Delete a schedule entry
 */
export async function deleteScheduleEntry(entryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("schedule_entries")
      .delete()
      .eq("id", entryId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting schedule entry:", error);
    throw error;
  }
}

// ================================================
// Statistics Functions
// ================================================

/**
 * Get schedule statistics
 */
export async function getScheduleStats() {
  try {
    const { data: summary, error } = await supabase
      .from("v_classes_summary")
      .select("*");

    if (error) throw error;

    const morningClasses = summary?.filter(s => s.session === "MORNING").length || 0;
    const afternoonClasses = summary?.filter(s => s.session === "AFTERNOON").length || 0;
    const totalEntries = summary?.reduce((sum, s) => sum + (s.total_entries || 0), 0) || 0;

    return {
      totalClasses: summary?.length || 0,
      morningClasses,
      afternoonClasses,
      totalEntries,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
}
