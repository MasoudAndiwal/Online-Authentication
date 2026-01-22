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
      .from("teachers")
      .select("id, teacher_id, first_name, last_name, phone, departments, subjects", { count: "exact" })
      .order("first_name", { ascending: true });

    // Add search filter if provided
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,teacher_id.ilike.%${search}%`
      );
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: teachers, error, count } = await query;

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

      // Handle subjects - can be string or array
      let subjects = "N/A";
      if (teacher.subjects) {
        if (Array.isArray(teacher.subjects)) {
          subjects = teacher.subjects.join(", ");
        } else if (typeof teacher.subjects === "string") {
          subjects = teacher.subjects;
        }
      }

      return {
        id: teacher.id,
        teacherId: teacher.teacher_id,
        name: `${teacher.first_name} ${teacher.last_name}`,
        department,
        subjects,
        type: "teacher" as const,
      };
    });

    return NextResponse.json({
      teachers: formattedTeachers,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error in teachers list API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
