import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Fetch all students from the database
    const { data: students, error } = await supabase
      .from("students")
      .select("id, student_id, first_name, last_name, email")
      .order("first_name", { ascending: true });

    if (error) {
      console.error("Error fetching students:", error);
      return NextResponse.json(
        { error: "Failed to fetch students", details: error.message },
        { status: 500 }
      );
    }

    // Format the data for the frontend
    const formattedStudents = (students || []).map((student) => ({
      id: student.id,
      studentId: student.student_id,
      name: `${student.first_name} ${student.last_name}`,
      email: student.email,
      type: "student" as const,
    }));

    return NextResponse.json({ students: formattedStudents }, { status: 200 });
  } catch (error) {
    console.error("Error in students list API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
