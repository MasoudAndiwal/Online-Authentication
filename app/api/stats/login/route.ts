import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Get students count
    const { count: studentsCount, error: studentsError } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    if (studentsError) {
      console.error("Error fetching students count:", studentsError);
    }

    // Get classes count
    const { count: classesCount, error: classesError } = await supabase
      .from("classes")
      .select("*", { count: "exact", head: true });

    if (classesError) {
      console.error("Error fetching classes count:", classesError);
    }

    return NextResponse.json({
      success: true,
      data: {
        students: studentsCount || 0,
        classes: classesCount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching login stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch stats",
      },
      { status: 500 }
    );
  }
}
