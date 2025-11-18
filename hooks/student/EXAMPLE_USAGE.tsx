/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Example Usage of Student Dashboard Hooks
 * 
 * This file demonstrates how to use all the student dashboard hooks together
 * in a real component. This is for documentation purposes only.
 * 
 * Requirements: 1.2, 3.1, 5.1, 11.1, 13.5
 */

"use client";

import { useState } from "react";
import {
  // Data Fetching
  useStudentDashboardMetrics,
  useStudentAttendance,
  useAttendanceHistory,
  useStudentClass,
  useAcademicStatus,
  useStudentConversations,
  useConversationMessages,
  useSendMessage,
  
  // State Management
  useStudentDashboardStore,
  useStudentDashboardSelectors,
  useShouldAnimate,
  
  // Real-time Updates
  useStudentRealtime,
  useConnectionStatus,
  useOptimisticUpdates,
} from "@/hooks/student";

/**
 * Example: Complete Student Dashboard Component
 */
export function StudentDashboardExample() {
  const studentId = "student-123"; // In real app, get from auth context
  
  // ========================================================================
  // Data Fetching Hooks
  // ========================================================================
  
  // Fetch dashboard metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useStudentDashboardMetrics(studentId);

  // Fetch weekly attendance
  const weekOffset = useStudentDashboardStore((state) => state.currentWeekOffset);
  const {
    data: weeklyAttendance,
    isLoading: attendanceLoading,
  } = useStudentAttendance(studentId, weekOffset);

  // Fetch class information
  const {
    data: classInfo,
    isLoading: classLoading,
  } = useStudentClass(studentId);

  // Fetch academic status
  const {
    data: academicStatus,
    isLoading: statusLoading,
  } = useAcademicStatus(studentId);

  // ========================================================================
  // State Management
  // ========================================================================
  
  const {
    sidebarCollapsed,
    toggleSidebar,
    activeView,
    setActiveView,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  } = useStudentDashboardStore();

  const {
    unreadNotificationsCount,
    notifications,
    isCurrentWeek,
  } = useStudentDashboardSelectors();

  const shouldAnimate = useShouldAnimate();

  // ========================================================================
  // Real-time Updates
  // ========================================================================
  
  const { isConnected, connectionError, reconnect } = useStudentRealtime(studentId, {
    onAttendanceMarked: (event) => {
      console.log("Attendance marked:", event);
      // Show toast notification
      alert(`Attendance marked as ${event.status}`);
      // Refetch data
      refetchMetrics();
    },
    onMessageReceived: (event) => {
      console.log("New message:", event);
      alert(`New message from ${event.senderName}`);
    },
    onStatusChanged: (event) => {
      console.log("Status changed:", event);
      alert(`Status changed: ${event.reason}`);
    },
  });

  const { status: connectionStatus } = useConnectionStatus(studentId);

  // ========================================================================
  // Render
  // ========================================================================

  if (metricsLoading || attendanceLoading || classLoading || statusLoading) {
    return <div>Loading...</div>;
  }

  if (metricsError) {
    return <div>Error: {metricsError.message}</div>;
  }

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <button onClick={toggleSidebar}>
          {sidebarCollapsed ? "☰" : "✕"}
        </button>
        
        <h1>Student Dashboard</h1>
        
        <div className="connection-status">
          Status: {connectionStatus}
          {connectionError && (
            <button onClick={reconnect}>Reconnect</button>
          )}
        </div>
        
        <div className="notifications">
          🔔 {unreadNotificationsCount > 0 && (
            <span className="badge">{unreadNotificationsCount}</span>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className={sidebarCollapsed ? "collapsed" : "expanded"}>
        <nav>
          <button
            onClick={() => setActiveView("dashboard")}
            className={activeView === "dashboard" ? "active" : ""}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView("attendance")}
            className={activeView === "attendance" ? "active" : ""}
          >
            My Attendance
          </button>
          <button
            onClick={() => setActiveView("class-info")}
            className={activeView === "class-info" ? "active" : ""}
          >
            Class Information
          </button>
          <button
            onClick={() => setActiveView("messages")}
            className={activeView === "messages" ? "active" : ""}
          >
            Messages
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main>
        {activeView === "dashboard" && (
          <DashboardView
            metrics={metrics}
            academicStatus={academicStatus}
            shouldAnimate={shouldAnimate}
          />
        )}

        {activeView === "attendance" && (
          <AttendanceView
            weeklyAttendance={weeklyAttendance}
            weekOffset={weekOffset}
            isCurrentWeek={isCurrentWeek}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onCurrentWeek={goToCurrentWeek}
          />
        )}

        {activeView === "class-info" && (
          <ClassInfoView classInfo={classInfo} />
        )}

        {activeView === "messages" && (
          <MessagesView studentId={studentId} />
        )}
      </main>
    </div>
  );
}

/**
 * Example: Dashboard View Component
 */
function DashboardView({ metrics, academicStatus, shouldAnimate }: any) {
  return (
    <div className="dashboard-view">
      <h2>Dashboard Overview</h2>
      
      {/* Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Classes"
          value={metrics?.totalClasses}
          animate={shouldAnimate}
        />
        <MetricCard
          title="Attendance Rate"
          value={`${metrics?.attendanceRate}%`}
          animate={shouldAnimate}
        />
        <MetricCard
          title="Present Days"
          value={metrics?.presentDays}
          animate={shouldAnimate}
        />
        <MetricCard
          title="Absent Days"
          value={metrics?.absentDays}
          animate={shouldAnimate}
        />
      </div>

      {/* Academic Status Alert */}
      {academicStatus && (
        <div className={`alert alert-${academicStatus.status}`}>
          <h3>{academicStatus.message}</h3>
          <p>Remaining absences: {academicStatus.remainingAbsences}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Attendance View Component
 */
function AttendanceView({
  weeklyAttendance,
  weekOffset,
  isCurrentWeek,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
}: any) {
  return (
    <div className="attendance-view">
      <h2>Weekly Attendance</h2>
      
      {/* Week Navigation */}
      <div className="week-navigation">
        <button onClick={onPreviousWeek}>← Previous Week</button>
        <span>Week Offset: {weekOffset}</span>
        <button onClick={onNextWeek}>Next Week →</button>
        {!isCurrentWeek && (
          <button onClick={onCurrentWeek}>Current Week</button>
        )}
      </div>

      {/* Weekly Calendar */}
      <div className="weekly-calendar">
        {weeklyAttendance?.map((day: any) => (
          <div key={day.date.toISOString()} className="day-card">
            <h3>{day.dayName}</h3>
            <p>{day.date.toLocaleDateString()}</p>
            <span className={`status-badge status-${day.status}`}>
              {day.status}
            </span>
            
            {/* Sessions */}
            <div className="sessions">
              {day.sessions.map((session: any) => (
                <div key={session.sessionNumber} className="session">
                  <p>Session {session.sessionNumber}</p>
                  <p>{session.time}</p>
                  <span className={`status-${session.status}`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Class Info View Component
 */
function ClassInfoView({ classInfo }: any) {
  return (
    <div className="class-info-view">
      <h2>Class Information</h2>
      
      {classInfo && (
        <>
          <div className="class-details">
            <h3>{classInfo.name}</h3>
            <p>Code: {classInfo.code}</p>
            <p>Semester: {classInfo.semester}</p>
            <p>Credits: {classInfo.credits}</p>
            <p>Room: {classInfo.room}, {classInfo.building}</p>
          </div>

          <div className="teacher-info">
            <h3>Teacher</h3>
            <p>{classInfo.teacher.name}</p>
            <p>Email: {classInfo.teacher.email}</p>
            <p>Office Hours: {classInfo.teacher.officeHours}</p>
            <p>Office: {classInfo.teacher.officeLocation}</p>
          </div>

          <div className="schedule">
            <h3>Schedule</h3>
            {classInfo.schedule.map((item: any, index: number) => (
              <div key={index} className="schedule-item">
                <p>{item.day}</p>
                <p>{item.startTime} - {item.endTime}</p>
                <p>Room: {item.room}</p>
                <p>Type: {item.sessionType}</p>
              </div>
            ))}
          </div>

          <div className="attendance-policy">
            <h3>Attendance Policy</h3>
            <p>Max Absences: {classInfo.attendancePolicy.maxAbsences}</p>
            <p>محروم Threshold: {classInfo.attendancePolicy.mahroomThreshold}</p>
            <p>تصدیق طلب Threshold: {classInfo.attendancePolicy.tasdiqThreshold}</p>
            <p>{classInfo.attendancePolicy.policyText}</p>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Example: Messages View Component
 */
function MessagesView({ studentId }: { studentId: string }) {
  const [activeConversation, setActiveConversation] = useState<string>();
  const [messageContent, setMessageContent] = useState("");

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } =
    useStudentConversations(studentId);

  // Fetch messages for active conversation
  const { data: messages, isLoading: messagesLoading } =
    useConversationMessages(activeConversation);

  // Send message mutation
  const sendMessage = useSendMessage();

  const handleSendMessage = async () => {
    if (!activeConversation || !messageContent.trim()) return;

    await sendMessage.mutateAsync({
      conversationId: activeConversation,
      recipientId: "teacher-123", // Get from conversation
      recipientType: "teacher",
      content: messageContent,
      category: "general",
      attachments: [],
    });

    setMessageContent("");
  };

  if (conversationsLoading) {
    return <div>Loading conversations...</div>;
  }

  return (
    <div className="messages-view">
      <h2>Messages</h2>
      
      <div className="messages-layout">
        {/* Conversation List */}
        <div className="conversation-list">
          {conversations?.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={activeConversation === conv.id ? "active" : ""}
            >
              <h4>{conv.recipientName}</h4>
              <p>{conv.lastMessage}</p>
              {conv.unreadCount > 0 && (
                <span className="unread-badge">{conv.unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="message-thread">
          {messagesLoading ? (
            <div>Loading messages...</div>
          ) : (
            <>
              <div className="messages">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message message-${msg.senderRole}`}
                  >
                    <p className="sender">{msg.senderName}</p>
                    <p className="content">{msg.content}</p>
                    <p className="timestamp">
                      {msg.timestamp.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Compose */}
              <div className="compose">
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message..."
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendMessage.isPending}
                >
                  {sendMessage.isPending ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Metric Card Component
 */
function MetricCard({ title, value, animate }: any) {
  return (
    <div
      className="metric-card"
      style={{
        transform: animate ? "scale(1)" : "none",
        transition: animate ? "transform 0.3s" : "none",
      }}
    >
      <h3>{title}</h3>
      <p className="value">{value}</p>
    </div>
  );
}

/**
 * Example: Using Optimistic Updates
 */
export function OptimisticUpdateExample() {
  const studentId = "student-123";
  const { updateAttendanceOptimistically } = useOptimisticUpdates();

  const handleMarkAttendance = (status: string) => {
    // Update UI immediately
    updateAttendanceOptimistically(studentId, {
      studentId,
      status: status as any,
      date: new Date().toISOString(),
      sessionNumber: 1,
      markedBy: "teacher-123",
      markedAt: new Date().toISOString(),
    });

    // Send to server (simulated)
    fetch("/api/attendance/mark", {
      method: "POST",
      body: JSON.stringify({ studentId, status }),
    });
  };

  return (
    <div>
      <button onClick={() => handleMarkAttendance("present")}>
        Mark Present
      </button>
      <button onClick={() => handleMarkAttendance("absent")}>
        Mark Absent
      </button>
    </div>
  );
}

/**
 * Example: Using Filters
 */
export function FiltersExample() {
  const {
    attendanceFilters,
    setAttendanceFilters,
    resetAttendanceFilters,
  } = useStudentDashboardStore();

  const studentId = "student-123";
  const { data: history } = useAttendanceHistory(studentId, attendanceFilters);

  return (
    <div>
      <h2>Attendance History</h2>
      
      {/* Filters */}
      <div className="filters">
        <input
          type="date"
          value={attendanceFilters.startDate?.toISOString().split("T")[0]}
          onChange={(e) =>
            setAttendanceFilters({ startDate: new Date(e.target.value) })
          }
        />
        <input
          type="date"
          value={attendanceFilters.endDate?.toISOString().split("T")[0]}
          onChange={(e) =>
            setAttendanceFilters({ endDate: new Date(e.target.value) })
          }
        />
        <button onClick={resetAttendanceFilters}>Reset Filters</button>
      </div>

      {/* History */}
      <div className="history">
        {history?.map((record) => (
          <div key={record.id} className="record">
            <p>{record.date.toLocaleDateString()}</p>
            <p>Session {record.sessionNumber}</p>
            <span className={`status-${record.status}`}>{record.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
