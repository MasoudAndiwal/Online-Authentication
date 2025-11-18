"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileDown, FileText, FileSpreadsheet, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "@/types/types";

interface AttendanceHistoryExportProps {
  records: AttendanceRecord[];
  studentName?: string;
  className?: string;
}

type ExportFormat = "pdf" | "csv";
type ExportStatus = "idle" | "exporting" | "success" | "error";

/**
 * Attendance History Export Component
 * Provides export to PDF and CSV functionality with progress animation
 * Requirements: 8.4
 */
export function AttendanceHistoryExport({
  records,
  studentName = "Student",
  className,
}: AttendanceHistoryExportProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    setExportStatus("exporting");
    setExportFormat("csv");
    setExportProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Generate CSV content
    setTimeout(() => {
      const headers = ["Date", "Day", "Course", "Period", "Status", "Notes"];
      const csvRows = [headers.join(",")];

      records.forEach((record) => {
        const row = [
          formatDate(record.date),
          record.dayOfWeek,
          `"${record.courseName}"`,
          record.period.toString(),
          record.status.charAt(0).toUpperCase() + record.status.slice(1),
          `"${record.notes || ""}"`,
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${studentName.replace(/\s+/g, "_")}_Attendance_History_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      clearInterval(progressInterval);
      setExportProgress(100);
      setExportStatus("success");

      // Reset after 3 seconds
      setTimeout(() => {
        setExportStatus("idle");
        setExportProgress(0);
        setExportFormat(null);
      }, 3000);
    }, 1000);
  };

  const exportToPDF = () => {
    setExportStatus("exporting");
    setExportFormat("pdf");
    setExportProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Generate PDF content (simplified HTML-based approach)
    setTimeout(() => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setExportStatus("error");
        clearInterval(progressInterval);
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Attendance History - ${studentName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #1e293b;
            }
            h1 {
              color: #10b981;
              border-bottom: 3px solid #10b981;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            .header {
              margin-bottom: 30px;
            }
            .info {
              color: #64748b;
              margin-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #10b981;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .status {
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: 500;
              display: inline-block;
            }
            .status-present {
              background-color: #dcfce7;
              color: #15803d;
            }
            .status-absent {
              background-color: #fee2e2;
              color: #991b1b;
            }
            .status-sick {
              background-color: #fef3c7;
              color: #92400e;
            }
            .status-leave {
              background-color: #dbeafe;
              color: #1e40af;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Attendance History Report</h1>
            <p class="info"><strong>Student:</strong> ${studentName}</p>
            <p class="info"><strong>Generated:</strong> ${new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p class="info"><strong>Total Records:</strong> ${records.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Course</th>
                <th>Period</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${records
                .map(
                  (record) => `
                <tr>
                  <td>${formatDate(record.date)}</td>
                  <td>${record.dayOfWeek}</td>
                  <td>${record.courseName}</td>
                  <td>${record.period}</td>
                  <td>
                    <span class="status status-${record.status}">
                      ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td>${record.notes || "-"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is an official attendance record generated from the University Attendance System.</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        clearInterval(progressInterval);
        setExportProgress(100);
        setExportStatus("success");

        // Reset after 3 seconds
        setTimeout(() => {
          setExportStatus("idle");
          setExportProgress(0);
          setExportFormat(null);
        }, 3000);
      };
    }, 1000);
  };

  const isExporting = exportStatus === "exporting";
  const isSuccess = exportStatus === "success";

  return (
    <Card className={cn("rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0", className)}>
      <CardContent className="p-4 sm:p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileDown className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Export Records</h3>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Download your attendance history in your preferred format.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Export to PDF Button */}
          <Button
            onClick={exportToPDF}
            disabled={isExporting || records.length === 0}
            className={cn(
              "min-h-[44px] touch-manipulation transition-all duration-300",
              isSuccess && exportFormat === "pdf"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            )}
          >
            {isExporting && exportFormat === "pdf" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : isSuccess && exportFormat === "pdf" ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Exported!
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Export to PDF
              </>
            )}
          </Button>

          {/* Export to CSV Button */}
          <Button
            onClick={exportToCSV}
            disabled={isExporting || records.length === 0}
            className={cn(
              "min-h-[44px] touch-manipulation transition-all duration-300",
              isSuccess && exportFormat === "csv"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            )}
          >
            {isExporting && exportFormat === "csv" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : isSuccess && exportFormat === "csv" ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Exported!
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to CSV
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {isExporting && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Generating {exportFormat?.toUpperCase()} file...
              </span>
              <span className="font-medium text-emerald-600">{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Your {exportFormat?.toUpperCase()} file has been generated successfully!
            </p>
          </div>
        )}

        {/* No Records Message */}
        {records.length === 0 && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-600">
              No records available to export. Filters may be hiding all records.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
