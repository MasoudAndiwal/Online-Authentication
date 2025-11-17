# Student Dashboard Design Document

## Overview

The Student Dashboard is a modern, visually stunning, and highly intuitive interface designed specifically for students to monitor their attendance, academic standing, and certification status. Following the established UI design guidelines, the dashboard features a clean, borderless design with gradient backgrounds, smooth animations, and an engaging user experience that matches the quality of the existing login page.

### Key Design Principles

- **Read-Only Access**: Students can only view their own data, no modification capabilities
- **Visual Clarity**: Clear status indicators with animated badges and progress visualization
- **Motivational Design**: Gamified elements to encourage attendance and engagement
- **Mobile-First**: Optimized for mobile devices with touch-friendly interactions
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation and screen reader support
- **Performance**: Fast loading with skeleton screens and optimized animations

### Core Features

1. **Personal Attendance Overview** - Real-time attendance statistics with animated progress rings
2. **Weekly Calendar View** - Visual calendar showing attendance status for each day
3. **Status Alerts** - Clear warnings for محروم (disqualified) or تصدیق طلب (certification required) status
4. **Attendance History** - Timeline view of past attendance records
5. **Medical Certificate Upload** - Interface for submitting medical documentation when required
6. **Progress Tracking** - Visual progress indicators showing attendance percentage
7. **Motivational Messages** - Encouraging messages based on attendance performance

---

## Page Structure

### Layout Architecture

```
Student Dashboard Layout:
├── Header (Fixed)
│   ├── University Logo
│   ├── Student Name & Avatar (animated)
│   ├── Notification Bell (with badge)
│   └── Logout Button
├── Main Content Area
│   ├── Welcome Section (gradient hero)
│   ├── Status Alert Banner (if محروم or تصدیق طلب)
│   ├── Statistics Cards Grid (4 cards)
│   ├── Weekly Calendar View (interactive)
│   ├── Attendance Progress Chart
│   └── Recent Activity Timeline
└── Footer (Minimal)
    └── Help & Support Links
```

---

## Component Designs

### 1. Welcome Hero Section

**Purpose**: Personalized greeting with motivational message and quick status overview

**Design Specifications**:
```typescript
<section className="
  relative overflow-hidden
  bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500
  rounded-2xl shadow-xl shadow-orange-500/30
  border-0 p-8 mb-6
">
  {/* Animated background particles */}
  <ParticleBackground />
  
  <div className="relative z-10">
    {/* Animated greeting */}
    <motion.h1 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-3xl font-bold text-white mb-2"
    >
      Welcome back, {studentName}! 👋
    </motion.h1>
    
    {/* Motivational message */}
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-white/90 text-lg"
    >
      {getMotivationalMessage(attendancePercentage)}
    </motion.p>
    
    {/* Quick stats */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex gap-6 mt-6"
    >
      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border-0">
        <p className="text-white/80 text-sm">Attendance Rate</p>
        <p className="text-white text-2xl font-bold">
          {attendancePercentage}%
        </p>
      </div>
      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border-0">
        <p className="text-white/80 text-sm">This Week</p>
        <p className="text-white text-2xl font-bold">
          {presentDays}/{totalDays}
        </p>
      </div>
    </motion.div>
  </div>
</section>
```

**Features**:
- ✅ Gradient background (from-orange-500 to-yellow-500)
- ✅ Animated particle background for visual interest
- ✅ Staggered entrance animations (fade + slide)
- ✅ Glass morphism quick stats cards
- ✅ No borders, using shadows for depth
- ✅ Personalized greeting with emoji
- ✅ Dynamic motivational messages

**Motivational Messages Logic**:
```typescript
function getMotivationalMessage(percentage: number): string {
  if (percentage >= 95) return "Outstanding attendance! Keep up the excellent work! 🌟";
  if (percentage >= 85) return "Great job! You're doing really well! 💪";
  if (percentage >= 75) return "Good progress! Stay consistent! 📚";
  if (percentage >= 65) return "You can do better! Let's improve together! 🎯";
  return "Attendance needs attention. Let's get back on track! ⚠️";
}
```

---

### 2. Status Alert Banner

**Purpose**: Prominent warning for students approaching or exceeding absence thresholds

**Design Specifications**:

**محروم (Disqualified) Alert**:
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className="
    bg-gradient-to-r from-purple-50 to-violet-50
    border-0 rounded-2xl shadow-lg shadow-purple-500/20
    p-6 mb-6
  "
>
  <div className="flex items-start gap-4">
    {/* Animated icon */}
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, -5, 5, 0]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="
        p-3 bg-gradient-to-br from-purple-500 to-violet-500
        rounded-xl shadow-lg
      "
    >
      <AlertTriangle className="h-6 w-6 text-white" />
    </motion.div>
    
    <div className="flex-1">
      <h3 className="text-lg font-bold text-purple-900 mb-1">
        ⚠️ Disqualification Warning (محروم)
      </h3>
      <p className="text-purple-700 mb-3">
        Your absence hours have exceeded the allowed limit. You are currently 
        disqualified from taking final exams and may need to repeat this class.
      </p>
      
      {/* Progress bar showing absence hours */}
      <div className="bg-purple-100 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(absentHours / threshold) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="
            h-full bg-gradient-to-r from-purple-500 to-violet-500
            rounded-full
          "
        />
      </div>
      <p className="text-sm text-purple-600 mt-2">
        {absentHours} / {threshold} absence hours
      </p>
      
      {/* Action button */}
      <Button className="
        mt-4 bg-gradient-to-r from-purple-500 to-violet-500
        text-white border-0 shadow-md shadow-purple-500/30
        hover:shadow-lg hover:shadow-purple-500/40
        hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-200
      ">
        <FileText className="h-4 w-4 mr-2" />
        Contact Academic Office
      </Button>
    </div>
  </div>
</motion.div>
```

**تصدیق طلب (Certification Required) Alert**:
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className="
    bg-gradient-to-r from-orange-50 to-amber-50
    border-0 rounded-2xl shadow-lg shadow-orange-500/20
    p-6 mb-6
  "
>
  <div className="flex items-start gap-4">
    {/* Animated icon */}
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1]
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="
        p-3 bg-gradient-to-br from-orange-500 to-amber-500
        rounded-xl shadow-lg
      "
    >
      <FileText className="h-6 w-6 text-white" />
    </motion.div>
    
    <div className="flex-1">
      <h3 className="text-lg font-bold text-orange-900 mb-1">
        📄 Medical Certificate Required (تصدیق طلب)
      </h3>
      <p className="text-orange-700 mb-3">
        Your combined absence hours (Absent + Sick + Leave) have exceeded the threshold. 
        Please upload a medical certificate to maintain exam eligibility.
      </p>
      
      {/* Progress bar */}
      <div className="bg-orange-100 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(combinedHours / threshold) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="
            h-full bg-gradient-to-r from-orange-500 to-amber-500
            rounded-full
          "
        />
      </div>
      <p className="text-sm text-orange-600 mt-2">
        {combinedHours} / {threshold} combined absence hours
      </p>
      
      {/* Upload button */}
      <Button className="
        mt-4 bg-gradient-to-r from-orange-500 to-amber-500
        text-white border-0 shadow-md shadow-orange-500/30
        hover:shadow-lg hover:shadow-orange-500/40
        hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-200
      ">
        <Upload className="h-4 w-4 mr-2" />
        Upload Medical Certificate
      </Button>
    </div>
  </div>
</motion.div>
```

**Features**:
- ✅ Gradient backgrounds matching status severity
- ✅ Animated icons with pulse/shake effects
- ✅ Animated progress bars showing threshold proximity
- ✅ Clear explanatory text in both English and local language
- ✅ Action buttons with hover animations
- ✅ Colored shadows matching alert theme
- ✅ No borders, using shadows for elevation

---

### 3. Statistics Cards Grid

**Purpose**: Quick overview of key attendance metrics with visual appeal

**Layout**:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
  <StatCard
    title="Present Days"
    value={presentDays}
    icon={CheckCircle}
    gradient="from-green-500 to-emerald-500"
    bgGradient="from-green-50 to-emerald-50"
    shadowColor="shadow-green-500/20"
  />
  <StatCard
    title="Absent Days"
    value={absentDays}
    icon={XCircle}
    gradient="from-red-500 to-rose-500"
    bgGradient="from-red-50 to-rose-50"
    shadowColor="shadow-red-500/20"
  />
  <StatCard
    title="Sick Days"
    value={sickDays}
    icon={Heart}
    gradient="from-amber-500 to-yellow-500"
    bgGradient="from-amber-50 to-yellow-50"
    shadowColor="shadow-amber-500/20"
  />
  <StatCard
    title="Leave Days"
    value={leaveDays}
    icon={Calendar}
    gradient="from-cyan-500 to-blue-500"
    bgGradient="from-cyan-50 to-blue-50"
    shadowColor="shadow-cyan-500/20"
  />
</div>
```

**StatCard Component**:
```typescript
interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  bgGradient: string;
  shadowColor: string;
}

function StatCard({ title, value, icon: Icon, gradient, bgGradient, shadowColor }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`
        rounded-2xl shadow-lg ${shadowColor}
        border-0 bg-gradient-to-br ${bgGradient}
        hover:shadow-xl transition-all duration-300
      `}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                {title}
              </p>
              <motion.p 
                className={`
                  text-4xl font-bold 
                  bg-gradient-to-r ${gradient} 
                  bg-clip-text text-transparent
                `}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CountUp end={value} duration={1.5} />
              </motion.p>
            </div>
            
            {/* Animated icon */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`
                p-3.5 bg-gradient-to-br ${gradient}
                rounded-xl shadow-lg
              `}
            >
              <Icon className="h-7 w-7 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

**Features**:
- ✅ Gradient backgrounds (subtle for cards, vibrant for icons)
- ✅ Count-up animation for numbers
- ✅ Hover effects (scale + lift + shadow elevation)
- ✅ Icon rotation on hover
- ✅ Staggered entrance animations
- ✅ Colored shadows matching card theme
- ✅ No borders, using shadows for depth
- ✅ Responsive grid layout

---

### 4. Weekly Calendar View

**Purpose**: Visual representation of attendance status for each day of the week

**Design Specifications**:
```typescript
<Card className="rounded-2xl shadow-lg border-0 bg-white mb-6">
  <CardContent className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-slate-900">
        Weekly Attendance
      </h2>
      
      {/* Week navigation */}
      <div className="flex items-center gap-2">
        <Button className="
          bg-slate-50 hover:bg-slate-100 active:bg-slate-200
          text-slate-700 border-0 shadow-sm
          hover:scale-105 active:scale-95
          transition-all duration-200
          p-2 rounded-lg
        ">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <span className="text-sm font-medium text-slate-600 px-4">
          {weekRange}
        </span>
        
        <Button className="
          bg-slate-50 hover:bg-slate-100 active:bg-slate-200
          text-slate-700 border-0 shadow-sm
          hover:scale-105 active:scale-95
          transition-all duration-200
          p-2 rounded-lg
        ">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
    
    {/* Calendar grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {weekDays.map((day, index) => (
        <DayCard
          key={day.date}
          day={day}
          index={index}
        />
      ))}
    </div>
  </CardContent>
</Card>
```

**DayCard Component**:
```typescript
interface DayCardProps {
  day: {
    date: Date;
    dayName: string;
    status: 'PRESENT' | 'ABSENT' | 'SICK' | 'LEAVE' | 'FUTURE';
    sessions: AttendanceSession[];
  };
  index: number;
}

function DayCard({ day, index }: DayCardProps) {
  const statusConfig = {
    PRESENT: {
      bg: 'from-green-50 to-emerald-50',
      icon: CheckCircle,
      iconBg: 'from-green-500 to-emerald-500',
      text: 'text-green-700',
      shadow: 'shadow-green-500/20'
    },
    ABSENT: {
      bg: 'from-red-50 to-rose-50',
      icon: XCircle,
      iconBg: 'from-red-500 to-rose-500',
      text: 'text-red-700',
      shadow: 'shadow-red-500/20'
    },
    SICK: {
      bg: 'from-amber-50 to-yellow-50',
      icon: Heart,
      iconBg: 'from-amber-500 to-yellow-500',
      text: 'text-amber-700',
      shadow: 'shadow-amber-500/20'
    },
    LEAVE: {
      bg: 'from-cyan-50 to-blue-50',
      icon: Calendar,
      iconBg: 'from-cyan-500 to-blue-500',
      text: 'text-cyan-700',
      shadow: 'shadow-cyan-500/20'
    },
    FUTURE: {
      bg: 'from-slate-50 to-slate-100',
      icon: Clock,
      iconBg: 'from-slate-400 to-slate-500',
      text: 'text-slate-500',
      shadow: 'shadow-slate-500/10'
    }
  };
  
  const config = statusConfig[day.status];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -4 }}
    >
      <Card className={`
        rounded-xl shadow-md ${config.shadow}
        border-0 bg-gradient-to-br ${config.bg}
        hover:shadow-lg transition-all duration-300
        cursor-pointer
      `}>
        <CardContent className="p-4">
          {/* Day name */}
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            {day.dayName}
          </p>
          
          {/* Date */}
          <p className="text-lg font-bold text-slate-900 mb-3">
            {format(day.date, 'MMM d')}
          </p>
          
          {/* Status icon */}
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className={`
              inline-flex p-2 bg-gradient-to-br ${config.iconBg}
              rounded-lg shadow-md mb-3
            `}
          >
            <Icon className="h-5 w-5 text-white" />
          </motion.div>
          
          {/* Status text */}
          <p className={`text-sm font-semibold ${config.text}`}>
            {day.status === 'FUTURE' ? 'Upcoming' : day.status}
          </p>
          
          {/* Session indicators */}
          {day.status !== 'FUTURE' && (
            <div className="flex gap-1 mt-3">
              {day.sessions.map((session, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + (i * 0.05) }}
                  className={`
                    h-1.5 w-1.5 rounded-full
                    ${session.status === 'PRESENT' ? 'bg-green-500' : 
                      session.status === 'ABSENT' ? 'bg-red-500' :
                      session.status === 'SICK' ? 'bg-amber-500' :
                      'bg-cyan-500'}
                  `}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

**Features**:
- ✅ Gradient backgrounds based on attendance status
- ✅ Animated icons with rotation on hover
- ✅ Staggered entrance animations for each day card
- ✅ Hover effects (scale + lift + shadow)
- ✅ Session indicators showing individual period attendance
- ✅ Week navigation with smooth transitions
- ✅ Responsive grid layout
- ✅ No borders, using shadows for depth

---

### 5. Attendance Progress Chart

**Purpose**: Visual representation of attendance trends over time

**Design Specifications**:
```typescript
<Card className="rounded-2xl shadow-lg border-0 bg-white mb-6">
  <CardContent className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-slate-900">
        Attendance Progress
      </h2>
      
      {/* Time range selector */}
      <div className="flex gap-2">
        {['Week', 'Month', 'Semester'].map((range) => (
          <Button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`
              ${timeRange === range 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30' 
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }
              border-0 px-4 py-2 rounded-lg
              hover:scale-105 active:scale-95
              transition-all duration-200
            `}
          >
            {range}
          </Button>
        ))}
      </div>
    </div>
    
    {/* Circular progress indicator */}
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* Main progress circle */}
      <div className="relative">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-slate-100"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 88 * (1 - attendancePercentage / 100)
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
          >
            <CountUp end={attendancePercentage} duration={1.5} />%
          </motion.p>
          <p className="text-sm text-slate-600 font-medium">Attendance</p>
        </div>
      </div>
      
      {/* Breakdown stats */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        <ProgressStat
          label="Present"
          value={presentHours}
          total={totalHours}
          color="green"
          icon={CheckCircle}
        />
        <ProgressStat
          label="Absent"
          value={absentHours}
          total={totalHours}
          color="red"
          icon={XCircle}
        />
        <ProgressStat
          label="Sick"
          value={sickHours}
          total={totalHours}
          color="amber"
          icon={Heart}
        />
        <ProgressStat
          label="Leave"
          value={leaveHours}
          total={totalHours}
          color="cyan"
          icon={Calendar}
        />
      </div>
    </div>
  </CardContent>
</Card>
```

**ProgressStat Component**:
```typescript
interface ProgressStatProps {
  label: string;
  value: number;
  total: number;
  color: 'green' | 'red' | 'amber' | 'cyan';
  icon: LucideIcon;
}

function ProgressStat({ label, value, total, color, icon: Icon }: ProgressStatProps) {
  const percentage = (value / total) * 100;
  
  const colorConfig = {
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      bar: 'from-green-500 to-emerald-500'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      bar: 'from-red-500 to-rose-500'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      bar: 'from-amber-500 to-yellow-500'
    },
    cyan: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      bar: 'from-cyan-500 to-blue-500'
    }
  };
  
  const config = colorConfig[color];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${config.bg} rounded-xl p-4 border-0`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${config.text}`} />
        <p className="text-sm font-semibold text-slate-600">{label}</p>
      </div>
      
      <p className={`text-2xl font-bold ${config.text} mb-2`}>
        <CountUp end={value} duration={1} /> hrs
      </p>
      
      {/* Progress bar */}
      <div className="bg-white/50 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className={`h-full bg-gradient-to-r ${config.bar} rounded-full`}
        />
      </div>
      
      <p className="text-xs text-slate-500 mt-1">
        {percentage.toFixed(1)}% of total
      </p>
    </motion.div>
  );
}
```

**Features**:
- ✅ Animated circular progress indicator with gradient stroke
- ✅ Count-up animation for percentage
- ✅ Breakdown stats with individual progress bars
- ✅ Time range selector with active state
- ✅ Smooth animations for all elements
- ✅ Responsive layout (stacks on mobile)
- ✅ No borders, using background colors for distinction

---

### 6. Recent Activity Timeline

**Purpose**: Chronological view of recent attendance records

**Design Specifications**:
```typescript
function StatCard({ title, value, icon: Icon, gradient, bgGradient, shadowColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-2xl shadow-lg ${shadowColor}
        bg-gradient-to-br ${bgGradient}
        border-0 p-6
        hover:shadow-xl transition-all duration-300
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
            {title}
          </p>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`
              text-4xl font-bold
              bg-gradient-to-r ${gradient}
              bg-clip-text text-transparent
            `}
          >
            <CountUp end={value} duration={1.5} />
          </motion.p>
        </div>
        
        {/* Animated icon */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`
            p-3.5 bg-gradient-to-br ${gradient}
            rounded-xl shadow-lg
          `}
        >
          <Icon className="h-7 w-7 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
}
```

**Features**:
- ✅ Gradient backgrounds (subtle for card, bold for icon)
- ✅ Count-up animation for numbers
- ✅ Hover effects (scale + lift + shadow elevation)
- ✅ Icon rotation on hover
- ✅ Gradient text for numbers
- ✅ Colored shadows matching theme
- ✅ No borders, using shadows for depth
- ✅ Responsive grid layout

---

### 4. Weekly Calendar View

**Purpose**: Visual representation of attendance status for the current week

**Design Specifications**:
```typescript
<Card className="rounded-2xl shadow-lg border-0 bg-white p-6 mb-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-slate-900">
      📅 This Week's Attendance
    </h2>
    
    {/* Week navigation */}
    <div className="flex items-center gap-2">
      <Button className="
        bg-slate-50 hover:bg-slate-100 active:bg-slate-200
        text-slate-700 border-0 shadow-sm
        hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-200 p-2 rounded-lg
      ">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="text-sm font-medium text-slate-600 px-3">
        {weekRange}
      </span>
      <Button className="
        bg-slate-50 hover:bg-slate-100 active:bg-slate-200
        text-slate-700 border-0 shadow-sm
        hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-200 p-2 rounded-lg
      ">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  </div>
  
  {/* Calendar grid */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {weekDays.map((day, index) => (
      <DayCard key={day.date} day={day} index={index} />
    ))}
  </div>
</Card>
```

**DayCard Component**:
```typescript
function DayCard({ day, index }) {
  const statusConfig = {
    PRESENT: {
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      icon: CheckCircle,
      label: "Present",
      shadow: "shadow-green-500/20"
    },
    ABSENT: {
      gradient: "from-red-500 to-rose-500",
      bgGradient: "from-red-50 to-rose-50",
      icon: XCircle,
      label: "Absent",
      shadow: "shadow-red-500/20"
    },
    SICK: {
      gradient: "from-amber-500 to-yellow-500",
      bgGradient: "from-amber-50 to-yellow-50",
      icon: Heart,
      label: "Sick",
      shadow: "shadow-amber-500/20"
    },
    LEAVE: {
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
      icon: Calendar,
      label: "Leave",
      shadow: "shadow-cyan-500/20"
    },
    PENDING: {
      gradient: "from-slate-400 to-slate-500",
      bgGradient: "from-slate-50 to-slate-100",
      icon: Clock,
      label: "Pending",
      shadow: "shadow-slate-500/10"
    }
  };
  
  const config = statusConfig[day.status];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className={`
        rounded-xl shadow-md ${config.shadow}
        bg-gradient-to-br ${config.bgGradient}
        border-0 p-4
        hover:shadow-lg transition-all duration-300
        cursor-pointer
      `}
    >
      {/* Day name */}
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
        {day.dayName}
      </p>
      
      {/* Date */}
      <p className="text-2xl font-bold text-slate-900 mb-3">
        {day.date}
      </p>
      
      {/* Status icon and label */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={{
            scale: day.status === 'PRESENT' ? [1, 1.2, 1] : 1,
            rotate: day.status === 'ABSENT' ? [-5, 5, -5, 0] : 0
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`
            p-2 bg-gradient-to-br ${config.gradient}
            rounded-lg shadow-sm
          `}
        >
          <Icon className="h-4 w-4 text-white" />
        </motion.div>
        <span className={`
          text-sm font-medium
          bg-gradient-to-r ${config.gradient}
          bg-clip-text text-transparent
        `}>
          {config.label}
        </span>
      </div>
      
      {/* Session count */}
      <p className="text-xs text-slate-500 mt-2">
        {day.sessionsAttended} / {day.totalSessions} sessions
      </p>
    </motion.div>
  );
}
```

**Features**:
- ✅ Responsive grid (2 cols mobile, 3 tablet, 5 desktop)
- ✅ Staggered entrance animations
- ✅ Status-based gradient backgrounds
- ✅ Animated status icons (bounce for present, shake for absent)
- ✅ Hover effects (scale + lift + shadow)
- ✅ Week navigation with smooth transitions
- ✅ Session count display
- ✅ No borders, using shadows for depth

---

### 5. Attendance Progress Chart

**Purpose**: Visual representation of attendance trends over time

**Design Specifications**:
```typescript
<Card className="rounded-2xl shadow-lg border-0 bg-white p-6 mb-6">
  <h2 className="text-2xl font-bold text-slate-900 mb-6">
    📊 Attendance Progress
  </h2>
  
  {/* Circular progress ring */}
  <div className="flex flex-col md:flex-row items-center gap-8">
    {/* Main progress circle */}
    <div className="relative">
      <svg className="w-48 h-48 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r="88"
          stroke="#E2E8F0"
          strokeWidth="12"
          fill="none"
        />
        
        {/* Animated progress circle */}
        <motion.circle
          cx="96"
          cy="96"
          r="88"
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: "0 552" }}
          animate={{ 
            strokeDasharray: `${(attendancePercentage / 100) * 552} 552`
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
        >
          <CountUp end={attendancePercentage} duration={1.5} />%
        </motion.p>
        <p className="text-sm text-slate-600 mt-1">Attendance</p>
      </div>
    </div>
    
    {/* Stats breakdown */}
    <div className="flex-1 space-y-4">
      <ProgressBar
        label="Present"
        value={presentDays}
        total={totalDays}
        gradient="from-green-500 to-emerald-500"
        icon={CheckCircle}
      />
      <ProgressBar
        label="Absent"
        value={absentDays}
        total={totalDays}
        gradient="from-red-500 to-rose-500"
        icon={XCircle}
      />
      <ProgressBar
        label="Sick"
        value={sickDays}
        total={totalDays}
        gradient="from-amber-500 to-yellow-500"
        icon={Heart}
      />
      <ProgressBar
        label="Leave"
        value={leaveDays}
        total={totalDays}
        gradient="from-cyan-500 to-blue-500"
        icon={Calendar}
      />
    </div>
  </div>
</Card>
```

**ProgressBar Component**:
```typescript
function ProgressBar({ label, value, total, gradient, icon: Icon }) {
  const percentage = (value / total) * 100;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`} />
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        <span className="text-sm font-semibold text-slate-900">
          {value} / {total}
        </span>
      </div>
      
      <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
        />
      </div>
    </div>
  );
}
```

**Features**:
- ✅ Animated circular progress ring with gradient
- ✅ Count-up animation for percentage
- ✅ Horizontal progress bars with smooth animations
- ✅ Status icons with gradient colors
- ✅ Responsive layout (stacked on mobile, side-by-side on desktop)
- ✅ No borders, clean design
- ✅ Clear visual hierarchy

---

### 6. Recent Activity Timeline

**Purpose**: Chronological view of recent attendance records

**Design Specifications**:
```typescript
<Card className="rounded-2xl shadow-lg border-0 bg-white p-6">
  <h2 className="text-2xl font-bold text-slate-900 mb-6">
    🕐 Recent Activity
  </h2>
  
  <div className="space-y-4">
    {recentActivities.map((activity, index) => (
      <ActivityItem key={activity.id} activity={activity} index={index} />
    ))}
  </div>
  
  {/* View all button */}
  <Button className="
    w-full mt-6
    bg-gradient-to-r from-orange-500 to-amber-500
    hover:from-orange-600 hover:to-amber-600
    text-white font-semibold border-0
    shadow-lg shadow-orange-500/30
    hover:shadow-xl hover:shadow-orange-500/40
    hover:scale-[1.02] active:scale-[0.98]
    transition-all duration-300
    py-3 rounded-xl
  ">
    View Full History
    <ChevronRight className="h-4 w-4 ml-2" />
  </Button>
</Card>
```

**ActivityItem Component**:
```typescript
function ActivityItem({ activity, index }) {
  const statusConfig = {
    PRESENT: {
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      text: "text-green-700"
    },
    ABSENT: {
      icon: XCircle,
      gradient: "from-red-500 to-rose-500",
      bg: "bg-red-50",
      text: "text-red-700"
    },
    SICK: {
      icon: Heart,
      gradient: "from-amber-500 to-yellow-500",
      bg: "bg-amber-50",
      text: "text-amber-700"
    },
    LEAVE: {
      icon: Calendar,
      gradient: "from-cyan-500 to-blue-500",
      bg: "bg-cyan-50",
      text: "text-cyan-700"
    }
  };
  
  const config = statusConfig[activity.status];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors"
    >
      {/* Status icon */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`
          p-3 bg-gradient-to-br ${config.gradient}
          rounded-xl shadow-md
        `}
      >
        <Icon className="h-5 w-5 text-white" />
      </motion.div>
      
      {/* Activity details */}
      <div className="flex-1">
        <p className="font-semibold text-slate-900">
          {activity.date} - {activity.dayName}
        </p>
        <p className="text-sm text-slate-600">
          Session {activity.sessionNumber} • {activity.time}
        </p>
      </div>
      
      {/* Status badge */}
      <div className={`
        ${config.bg} ${config.text}
        px-3 py-1 rounded-lg
        text-sm font-medium
      `}>
        {activity.status}
      </div>
    </motion.div>
  );
}
```

**Features**:
- ✅ Timeline layout with staggered animations
- ✅ Status-based icons and colors
- ✅ Hover effects on items
- ✅ Clear date and time information
- ✅ Status badges with semantic colors
- ✅ "View Full History" CTA button
- ✅ No borders, using background colors for separation

---

### 7. Medical Certificate Upload Section

**Purpose**: Interface for students to upload medical documentation when flagged as تصدیق طلب

**Design Specifications**:
```typescript
<Card className="rounded-2xl shadow-lg border-0 bg-white p-6">
  <div className="flex items-center gap-3 mb-6">
    <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
      <Upload className="h-6 w-6 text-white" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        Medical Certificate Upload
      </h2>
      <p className="text-sm text-slate-600">
        Upload your medical documentation for review
      </p>
    </div>
  </div>
  
  {/* Upload zone */}
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="
      relative border-2 border-dashed border-orange-300
      rounded-2xl p-8
      bg-gradient-to-br from-orange-50/50 to-amber-50/50
      hover:border-orange-400 hover:bg-orange-50
      transition-all duration-300
      cursor-pointer
    "
    onDrop={handleDrop}
    onDragOver={handleDragOver}
  >
    <input
      type="file"
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      accept=".pdf,.jpg,.jpeg,.png"
      onChange={handleFileSelect}
    />
    
    <div className="text-center">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-block p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg mb-4"
      >
        <FileText className="h-12 w-12 text-white" />
      </motion.div>
      
      <p className="text-lg font-semibold text-slate-900 mb-2">
        Drop your file here or click to browse
      </p>
      <p className="text-sm text-slate-600">
        Supported formats: PDF, JPG, PNG (Max 5MB)
      </p>
    </div>
  </motion.div>
  
  {/* Uploaded files list */}
  {uploadedFiles.length > 0 && (
    <div className="mt-6 space-y-3">
      <h3 className="font-semibold text-slate-900">Uploaded Documents</h3>
      {uploadedFiles.map((file, index) => (
        <FileItem key={file.id} file={file} index={index} />
      ))}
    </div>
  )}
</Card>
```

**FileItem Component**:
```typescript
function FileItem({ file, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="
        flex items-center justify-between
        p-4 rounded-xl
        bg-gradient-to-r from-slate-50 to-slate-100
        border-0 shadow-sm
      "
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-slate-900">{file.name}</p>
          <p className="text-xs text-slate-600">
            {file.size} • Uploaded {file.uploadDate}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Status badge */}
        <StatusBadge status={file.status} />
        
        {/* Actions */}
        <Button className="
          bg-slate-100 hover:bg-slate-200
          text-slate-700 border-0 shadow-sm
          hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-200
          p-2 rounded-lg
        ">
          <Eye className="h-4 w-4" />
        </Button>
        <Button className="
          bg-red-50 hover:bg-red-100
          text-red-700 border-0 shadow-sm
          hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-200
          p-2 rounded-lg
        ">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    PENDING: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: Clock,
      label: "Pending Review"
    },
    APPROVED: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: CheckCircle,
      label: "Approved"
    },
    REJECTED: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: XCircle,
      label: "Rejected"
    }
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className={`
      ${config.bg} ${config.text}
      px-3 py-1 rounded-lg
      flex items-center gap-2
      text-sm font-medium
    `}>
      <Icon className="h-4 w-4" />
      {config.label}
    </div>
  );
}
```

**Features**:
- ✅ Drag-and-drop upload zone with hover effects
- ✅ Animated floating icon
- ✅ File type and size validation
- ✅ Uploaded files list with status badges
- ✅ Preview and delete actions
- ✅ Status tracking (Pending, Approved, Rejected)
- ✅ Smooth animations for file items
- ✅ Gradient backgrounds and shadows

---

## Mobile Optimization

### Mobile-Specific Design Considerations

**Responsive Breakpoints**:
```typescript
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet portrait
lg: 1024px  // Tablet landscape / Small desktop
xl: 1280px  // Desktop
```

**Mobile Layout Adjustments**:

1. **Statistics Cards**: 1 column on mobile, 2 on tablet, 4 on desktop
2. **Weekly Calendar**: 2 columns on mobile, 3 on tablet, 5 on desktop
3. **Progress Chart**: Stacked layout on mobile, side-by-side on desktop
4. **Navigation**: Hamburger menu with slide-in drawer
5. **Touch Targets**: Minimum 44px for all interactive elements

**Mobile-Specific Features**:
```typescript
// Pull-to-refresh
<div className="touch-pan-y">
  {/* Content */}
</div>

// Swipe gestures for calendar navigation
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={handleSwipe}
>
  {/* Calendar */}
</motion.div>

// Bottom sheet for actions
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6"
>
  {/* Actions */}
</motion.div>
```

---

## Accessibility Features

### WCAG 2.1 AA Compliance

**Keyboard Navigation**:
```typescript
// Focus management
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
  className="focus:ring-4 focus:ring-orange-500/20 focus:outline-none"
>
  {/* Interactive element */}
</div>
```

**Screen Reader Support**:
```typescript
// ARIA labels
<button aria-label="View attendance details for Monday, January 15">
  <Calendar className="h-5 w-5" />
</button>

// Live regions for dynamic updates
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Semantic HTML
<main role="main">
  <section aria-labelledby="attendance-heading">
    <h2 id="attendance-heading">Attendance Overview</h2>
    {/* Content */}
  </section>
</main>
```

**Color Contrast**:
- Text on backgrounds: Minimum 4.5:1 ratio
- Large text (18pt+): Minimum 3:1 ratio
- UI components: Minimum 3:1 ratio
- Focus indicators: Minimum 3:1 ratio with 3px minimum width

**Reduced Motion Support**:
```typescript
// Respect user preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationVariants = prefersReducedMotion
  ? {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    }
  : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    };
```

---

## Performance Optimization

### Loading Strategy

**Skeleton Screens**:
```typescript
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 h-48 animate-pulse" />
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 h-32 animate-pulse" />
        ))}
      </div>
      
      {/* Calendar skeleton */}
      <div className="rounded-2xl bg-white shadow-lg p-6 border-0">
        <div className="h-6 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Lazy Loading**:
```typescript
// Lazy load heavy components
const AttendanceChart = lazy(() => import('./AttendanceChart'));
const ActivityTimeline = lazy(() => import('./ActivityTimeline'));

// Use Suspense for loading states
<Suspense fallback={<ChartSkeleton />}>
  <AttendanceChart data={attendanceData} />
</Suspense>
```

**Data Fetching Optimization**:
```typescript
// React Query for caching and background updates
const { data, isLoading } = useQuery({
  queryKey: ['studentAttendance', studentId],
  queryFn: fetchStudentAttendance,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: true
});

// Prefetch related data
const queryClient = useQueryClient();
queryClient.prefetchQuery({
  queryKey: ['attendanceHistory', studentId],
  queryFn: fetchAttendanceHistory
});
```

---

## Error Handling

### Error States

**Network Error**:
```typescript
function NetworkError({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="
        bg-gradient-to-r from-red-50 to-rose-50
        border-0 rounded-2xl shadow-lg
        p-8 text-center
      "
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
        className="inline-block p-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-lg mb-4"
      >
        <WifiOff className="h-12 w-12 text-white" />
      </motion.div>
      
      <h3 className="text-xl font-bold text-red-900 mb-2">
        Connection Lost
      </h3>
      <p className="text-red-700 mb-6">
        Unable to load your attendance data. Please check your internet connection.
      </p>
      
      <Button
        onClick={onRetry}
        className="
          bg-gradient-to-r from-red-500 to-rose-500
          text-white border-0 shadow-lg
          hover:shadow-xl hover:scale-[1.02]
          transition-all duration-300
        "
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </motion.div>
  );
}
```

**No Data State**:
```typescript
function NoDataState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        bg-gradient-to-br from-slate-50 to-slate-100
        border-0 rounded-2xl shadow-lg
        p-12 text-center
      "
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-block p-6 bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl shadow-lg mb-6"
      >
        <Calendar className="h-16 w-16 text-white" />
      </motion.div>
      
      <h3 className="text-2xl font-bold text-slate-900 mb-2">
        No Attendance Records Yet
      </h3>
      <p className="text-slate-600 max-w-md mx-auto">
        Your attendance records will appear here once your teacher starts marking attendance.
      </p>
    </motion.div>
  );
}
```

**Permission Denied**:
```typescript
function PermissionDenied() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="
        bg-gradient-to-r from-amber-50 to-yellow-50
        border-0 rounded-2xl shadow-lg
        p-8 text-center
      "
    >
      <div className="inline-block p-4 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl shadow-lg mb-4">
        <Lock className="h-12 w-12 text-white" />
      </div>
      
      <h3 className="text-xl font-bold text-amber-900 mb-2">
        Access Restricted
      </h3>
      <p className="text-amber-700 mb-6">
        You don't have permission to view this information. Please contact your administrator.
      </p>
      
      <Button className="
        bg-gradient-to-r from-amber-500 to-yellow-500
        text-white border-0 shadow-lg
        hover:shadow-xl hover:scale-[1.02]
        transition-all duration-300
      ">
        <Mail className="h-4 w-4 mr-2" />
        Contact Support
      </Button>
    </motion.div>
  );
}
```

---

## Animation Performance

### Optimization Techniques

**GPU Acceleration**:
```typescript
// Use transform and opacity for smooth 60fps animations
className="transform-gpu will-change-transform"

// Avoid animating layout properties
// ❌ DON'T: animate width, height, top, left
// ✅ DO: animate transform, opacity, scale
```

**Animation Throttling**:
```typescript
// Debounce scroll animations
const handleScroll = debounce(() => {
  // Animation logic
}, 100);

// Use IntersectionObserver for entrance animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  },
  { threshold: 0.1 }
);
```

**Reduced Motion**:
```typescript
// Tailwind config
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  variants: {
    animation: ['motion-safe', 'motion-reduce'],
  },
};

// Usage
className="motion-safe:animate-slide-up motion-reduce:animate-fade-in"
```

---

## Security Considerations

### Data Privacy

**Client-Side Validation**:
```typescript
// Validate student can only access own data
if (session.user.id !== studentId) {
  throw new Error('Unauthorized access');
}

// Sanitize file uploads
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const maxSize = 5 * 1024 * 1024; // 5MB

if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

if (file.size > maxSize) {
  throw new Error('File too large');
}
```

**API Security**:
```typescript
// Middleware for student routes
export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.redirect('/login');
  }
  
  // Verify student can only access own data
  const studentId = request.nextUrl.searchParams.get('studentId');
  if (studentId && studentId !== session.user.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}
```

---

## Testing Strategy

### Component Testing

**Unit Tests**:
```typescript
describe('StatCard', () => {
  it('should render with correct value and animation', () => {
    render(<StatCard title="Present Days" value={15} />);
    
    expect(screen.getByText('Present Days')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });
  
  it('should animate on hover', async () => {
    const { container } = render(<StatCard title="Test" value={10} />);
    const card = container.firstChild;
    
    await userEvent.hover(card);
    
    expect(card).toHaveStyle({ transform: 'scale(1.02)' });
  });
});
```

**Integration Tests**:
```typescript
describe('StudentDashboard', () => {
  it('should load and display student data', async () => {
    const mockData = {
      studentName: 'John Doe',
      attendancePercentage: 85,
      presentDays: 17,
      absentDays: 3,
    };
    
    server.use(
      rest.get('/api/student/attendance', (req, res, ctx) => {
        return res(ctx.json(mockData));
      })
    );
    
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });
});
```

**Accessibility Tests**:
```typescript
describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<StudentDashboard />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
  
  it('should support keyboard navigation', async () => {
    render(<StudentDashboard />);
    
    await userEvent.tab();
    expect(screen.getByRole('button', { name: /view history/i })).toHaveFocus();
  });
});
```

---

## Implementation Checklist

### Phase 1: Core Layout & Components
- [ ] Create StudentDashboard page component
- [ ] Implement DashboardLayout with header and navigation
- [ ] Build Welcome Hero Section with animations
- [ ] Create Statistics Cards Grid with count-up animations
- [ ] Implement responsive grid layouts

### Phase 2: Attendance Visualization
- [ ] Build Weekly Calendar View with day cards
- [ ] Create Attendance Progress Chart with circular progress
- [ ] Implement Progress Bars for status breakdown
- [ ] Add status-based color coding and icons
- [ ] Implement week navigation functionality

### Phase 3: Status Alerts & Notifications
- [ ] Create محروم (Disqualified) Alert Banner
- [ ] Create تصدیق طلب (Certification Required) Alert Banner
- [ ] Implement animated progress bars for thresholds
- [ ] Add action buttons with proper routing
- [ ] Implement notification system

### Phase 4: Activity & History
- [ ] Build Recent Activity Timeline
- [ ] Create ActivityItem component with animations
- [ ] Implement "View Full History" functionality
- [ ] Add filtering and sorting capabilities
- [ ] Create detailed history page

### Phase 5: Medical Certificate Upload
- [ ] Implement drag-and-drop upload zone
- [ ] Create file validation logic
- [ ] Build uploaded files list with status badges
- [ ] Add preview and delete functionality
- [ ] Implement upload progress tracking

### Phase 6: Mobile Optimization
- [ ] Implement responsive layouts for all components
- [ ] Add touch-optimized interactions
- [ ] Create mobile navigation drawer
- [ ] Implement swipe gestures for calendar
- [ ] Add pull-to-refresh functionality

### Phase 7: Accessibility & Performance
- [ ] Add ARIA labels and semantic HTML
- [ ] Implement keyboard navigation
- [ ] Add focus indicators
- [ ] Create skeleton loading states
- [ ] Optimize animations for performance
- [ ] Implement lazy loading for heavy components

### Phase 8: Testing & Polish
- [ ] Write unit tests for all components
- [ ] Create integration tests for data flow
- [ ] Perform accessibility audit
- [ ] Test on multiple devices and browsers
- [ ] Optimize bundle size
- [ ] Add error boundaries

---

## Summary

The Student Dashboard design provides a modern, engaging, and highly functional interface for students to monitor their attendance and academic standing. Key highlights include:

✅ **Modern UI**: Borderless design with gradients, shadows, and smooth animations
✅ **Visual Clarity**: Clear status indicators with animated badges and progress visualization
✅ **Engaging UX**: Gamified elements and motivational messages to encourage attendance
✅ **Mobile-First**: Fully responsive with touch-optimized interactions
✅ **Accessible**: WCAG 2.1 AA compliant with full keyboard navigation
✅ **Performant**: Optimized animations, lazy loading, and efficient data fetching
✅ **Secure**: Read-only access with proper validation and authorization

The design follows all established UI guidelines, avoiding borders, using filled buttons, implementing skeleton loading states, and providing smooth micro-animations throughout the interface.
