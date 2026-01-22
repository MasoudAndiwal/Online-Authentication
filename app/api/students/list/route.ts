import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-simple";

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("students")
      .select("id, student_id, first_name, last_name, phone, class_section", { count: "exact" })
      .order("first_name", { ascending: true });

    // Add search filter if provided
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_id.ilike.%${search}%`
      );
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: students, error, count } = await query;

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
      classSection: student.class_section || "N/A",
      type: "student" as const,
    }));

    return NextResponse.json({
      students: formattedStudents,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error in students list API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
