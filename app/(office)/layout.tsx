import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Office Portal - University Attendance System",
  description: "Administrative portal for university attendance management",
};

export default function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}