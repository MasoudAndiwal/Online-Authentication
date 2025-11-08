import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Portal - University Attendance System",
  description: "Teacher portal for university attendance management",
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}