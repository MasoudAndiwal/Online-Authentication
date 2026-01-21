import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Fetch all teachers from the database
    const { data: teachers, error } = await supabase
      .from("teachers")
      .select("id, teacher_id, first_name, last_name, email, departments")
      .order("first_name", { ascending: true });

    if (error) {
      console.error("Error fetching teachers:", error);
      return NextResponse.json(
        { error: "Failed to fetch teachers", details: error.message },
        { status: 500 }
      );
    }

    // Format the data for the frontend
    const formattedTeachers = (teachers || []).map((teacher) => {
      // Handle departments - can be string or array
      let department = "N/A";
      if (teacher.departments) {
        if (Array.isArray(teacher.departments)) {
          department = teacher.departments.join(", ");
        } else if (typeof teacher.departments === "string") {
          department = teacher.departments;
        }
      }

      return {
        id: teacher.id,
        teacherId: teacher.teacher_id,
        name: `${teacher.first_name} ${teacher.last_name}`,
        email: teacher.email,
        department,
        type: "teacher" as const,
      };
    });

    return NextResponse.json({ teachers: formattedTeachers }, { status: 200 });
  } catch (error) {
    console.error("Error in teachers list API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
