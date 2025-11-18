import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Portal - University Attendance System",
  description: "Student portal for viewing attendance records and academic standing",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
