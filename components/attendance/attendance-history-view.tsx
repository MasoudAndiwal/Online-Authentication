"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue, } from "@/components/ui/select";
import {Calendar,Download,Search,Users,TrendingUp,CheckCircle,AlertTriangle,BarChart3, } from "lucide-react";
import { useResponsive } from "@/lib/hooks/use-responsive";
import { useHapticFeedback } from "@/lib/hooks/use-touch-gestures";
import type { Class } from "@/types/attendance";

interface AttendanceHistoryViewProps {
  classId: string;
  classData?: Class;
  className?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  markedAt: string;
  markedBy: string;
}

interface DailyStats {
  date: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;
}

export function AttendanceHistoryView({
  classId,
  classData,
  className,
}: AttendanceHistoryViewProps) {
  const { isMobile, isTouch } = useResponsive();
  const { lightTap } = useHapticFeedback();
  
  // State management
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [dailyStats, setDailyStats] = React.useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateRange, setDateRange] = React.useState("30"); // days
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"records" | "stats">("stats");

  // Fetch real data from API
  React.useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!classId) return;
      
      setIsLoading(true);
      
      try {
        const response = await fetch(
          `/api/attendance/history?classId=${classId}&dateRange=${dateRange}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance history');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setRecords(result.data.records || []);
          setDailyStats(result.data.dailyStats || []);
        }
      } catch (error) {
        console.error('Error fetching attendance history:', error);
        // Set empty data on error
        setRecords([]);
        setDailyStats([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceHistory();
  }, [classId, dateRange]);

  // Filter records based on search and filters
  const filteredRecords = React.useMemo(() => {
    return records.filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           record.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || record.status.toLowerCase() === statusFilter;
      const matchesDateRange = true; // Simplified for demo
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [records, searchQuery, statusFilter]);

  // Calculate overall statistics
  const overallStats = React.useMemo(() => {
    const totalRecords = filteredRecords.length;
    const presentCount = filteredRecords.filter(r => r.status === 'PRESENT').length;
    const absentCount = filteredRecords.filter(r => r.status === 'ABSENT').length;
    const lateCount = filteredRecords.filter(r => r.status === 'LATE').length;
    const excusedCount = filteredRecords.filter(r => r.status === 'EXCUSED').length;
    
    return {
      total: totalRecords,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      excused: excusedCount,
      rate: totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0,
    };
  }, [filteredRecords]);

  const handleExport = () => {
    if (isTouch) lightTap();
    
    // Create a printable HTML document with all records
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export the report');
      return;
    }

    const className = classData?.name || 'Class';
    const dateRangeText = dateRange === '7' ? 'Last 7 days' : dateRange === '30' ? 'Last 30 days' : 'Last 3 months';
    const currentDate = new Date().toLocaleDateString();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance History - ${className}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 1200px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #333;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .stats {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .stat-card {
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .stat-card.total { background: #e3f2fd; }
            .stat-card.present { background: #e8f5e9; }
            .stat-card.absent { background: #ffebee; }
            .stat-card.rate { background: #fff3e0; }
            .stat-card h3 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .stat-card p {
              margin: 5px 0 0 0;
              font-size: 14px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              color: #333;
            }
            tr:hover {
              background-color: #f9f9f9;
            }
            .status {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .status.present { background: #e8f5e9; color: #2e7d32; }
            .status.absent { background: #ffebee; color: #c62828; }
            .status.late { background: #fff3e0; color: #f57c00; }
            .status.excused { background: #e3f2fd; color: #1565c0; }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Attendance History Report</h1>
            <p><strong>${className}</strong></p>
            <p>${dateRangeText} • Generated on ${currentDate}</p>
          </div>

          <div class="stats">
            <div class="stat-card total">
              <h3>${overallStats.total}</h3>
              <p>Total Records</p>
            </div>
            <div class="stat-card present">
              <h3>${overallStats.present}</h3>
              <p>Present</p>
            </div>
            <div class="stat-card absent">
              <h3>${overallStats.absent}</h3>
              <p>Absent</p>
            </div>
            <div class="stat-card rate">
              <h3>${overallStats.rate}%</h3>
              <p>Attendance Rate</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Marked By</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map((record, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${new Date(record.date).toLocaleDateString()}</td>
                  <td>${record.studentId}</td>
                  <td>${record.studentName}</td>
                  <td><span class="status ${record.status.toLowerCase()}">${record.status}</span></td>
                  <td>${record.markedBy}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This report contains ${filteredRecords.length} attendance records</p>
            <p>University Attendance Management System</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600 bg-green-50';
      case 'ABSENT': return 'text-red-600 bg-red-50';
      case 'LATE': return 'text-yellow-600 bg-yellow-50';
      case 'EXCUSED': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-0 shadow-lg animate-pulse">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-slate-200 rounded-lg sm:rounded-xl flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"></div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-6 sm:h-8 bg-slate-200 rounded w-12"></div>
                    <div className="h-3 sm:h-4 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Content Skeleton */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg animate-pulse">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-slate-100 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* Header Controls - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/60 backdrop-blur-sm border-0 shadow-sm rounded-lg sm:rounded-xl min-h-[44px] touch-manipulation"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 sm:gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 sm:w-40 bg-white/60 backdrop-blur-sm border-0 shadow-sm rounded-lg sm:rounded-xl min-h-[44px] touch-manipulation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28 sm:w-32 bg-white/60 backdrop-blur-sm border-0 shadow-sm rounded-lg sm:rounded-xl min-h-[44px] touch-manipulation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="excused">Excused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Export Button */}
        <Button
          onClick={handleExport}
          variant="outline"
          size={isMobile ? "sm" : "default"}
          className="bg-white/60 backdrop-blur-sm border-0 shadow-sm rounded-lg sm:rounded-xl hover:bg-white/80 min-h-[44px] touch-manipulation"
        >
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline ml-2">Export</span>
        </Button>
      </div>

      {/* Statistics Cards - Mobile Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700">{overallStats.total}</p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Total Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700">{overallStats.present}</p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Present</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700">{overallStats.absent}</p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Absent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-700">{overallStats.rate}%</p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Avg Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* View Mode Toggle - Mobile Responsive */}
      <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 border-0 shadow-sm">
        <Button
          variant={viewMode === "stats" ? "default" : "ghost"}
          onClick={() => {
            setViewMode("stats");
            if (isTouch) lightTap();
          }}
          size="sm"
          className={cn(
            "rounded-lg transition-all duration-200 min-h-[44px] touch-manipulation flex-1 sm:flex-none",
            viewMode === "stats"
              ? "bg-orange-600 text-white shadow-sm"
              : "hover:bg-orange-50 text-slate-700"
          )}
        >
          <BarChart3 className="h-4 w-4 sm:mr-2" />
          <span className="ml-2">Daily Stats</span>
        </Button>
        <Button
          variant={viewMode === "records" ? "default" : "ghost"}
          onClick={() => {
            setViewMode("records");
            if (isTouch) lightTap();
          }}
          size="sm"
          className={cn(
            "rounded-lg transition-all duration-200 min-h-[44px] touch-manipulation flex-1 sm:flex-none",
            viewMode === "records"
              ? "bg-orange-600 text-white shadow-sm"
              : "hover:bg-orange-50 text-slate-700"
          )}
        >
          <Users className="h-4 w-4 sm:mr-2" />
          <span className="ml-2">Records</span>
        </Button>
      </div>

      {/* Content based on view mode */}
      {viewMode === "stats" ? (
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-bold">Daily Attendance Statistics</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {dailyStats.slice(0, 10).map((stat, index) => (
                <motion.div
                  key={stat.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-lg sm:rounded-xl border-0 shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                      <Calendar className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm sm:text-base">
                        {new Date(stat.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {stat.present}/{stat.total} students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className={cn(
                      "px-2 py-1 rounded-lg text-xs sm:text-sm font-medium",
                      stat.rate >= 90 ? "bg-green-100 text-green-700" :
                      stat.rate >= 75 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {stat.rate}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-bold">Individual Records</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {filteredRecords.slice(0, 50).map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-lg sm:rounded-xl border-0 shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                        {record.studentName}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {record.studentId} • {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-xs sm:text-sm font-medium",
                      getStatusColor(record.status)
                    )}>
                      {record.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}