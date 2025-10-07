
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'SICK');
CREATE TYPE "TeacherStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "OfficeRole" AS ENUM ('ADMIN', 'STAFF', 'MANAGER');

CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "fatherName" VARCHAR(70) NOT NULL,
    "grandFatherName" VARCHAR(70) NOT NULL,
    "studentId" VARCHAR(20) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "phone" VARCHAR(20) NOT NULL,
    "fatherPhone" VARCHAR(20) NOT NULL,
    "address" TEXT NOT NULL,
    "programs" TEXT[],
    "semester" VARCHAR(20) NOT NULL,
    "enrollmentYear" VARCHAR(4) NOT NULL,
    "classSection" VARCHAR(20) NOT NULL,
    "timeSlot" VARCHAR(50) NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "studentIdRef" VARCHAR(20) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "fatherName" VARCHAR(70) NOT NULL,
    "grandFatherName" VARCHAR(70) NOT NULL,
    "teacherId" VARCHAR(20) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "phone" VARCHAR(20) NOT NULL,
    "secondaryPhone" VARCHAR(20),
    "address" TEXT NOT NULL,
    "departments" TEXT[],
    "qualification" VARCHAR(100) NOT NULL,
    "experience" VARCHAR(50) NOT NULL,
    "specialization" VARCHAR(100) NOT NULL,
    "subjects" TEXT[],
    "classes" TEXT[],
    "username" VARCHAR(30) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "status" "TeacherStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "office_staff" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(80) NOT NULL,
    "lastName" VARCHAR(80) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "role" "OfficeRole" NOT NULL DEFAULT 'STAFF',
    "supabaseUserId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "office_staff_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "students_studentId_key" ON "students"("studentId");
CREATE UNIQUE INDEX "students_phone_key" ON "students"("phone");
CREATE UNIQUE INDEX "students_username_key" ON "students"("username");
CREATE UNIQUE INDEX "students_password_key" ON "students"("password");

CREATE UNIQUE INDEX "teachers_teacherId_key" ON "teachers"("teacherId");
CREATE UNIQUE INDEX "teachers_phone_key" ON "teachers"("phone");
CREATE UNIQUE INDEX "teachers_username_key" ON "teachers"("username");
CREATE UNIQUE INDEX "teachers_password_key" ON "teachers"("password");

CREATE UNIQUE INDEX "office_staff_email_key" ON "office_staff"("email");
CREATE UNIQUE INDEX "office_staff_phone_key" ON "office_staff"("phone");
CREATE UNIQUE INDEX "office_staff_supabaseUserId_key" ON "office_staff"("supabaseUserId");

CREATE INDEX "students_firstName_lastName_idx" ON "students"("firstName", "lastName");
CREATE INDEX "students_studentId_idx" ON "students"("studentId");
CREATE INDEX "students_programs_semester_classSection_idx" ON "students"("programs", "semester", "classSection");
CREATE INDEX "students_status_idx" ON "students"("status");
CREATE INDEX "students_createdAt_idx" ON "students"("createdAt");
CREATE INDEX "students_username_idx" ON "students"("username");

CREATE INDEX "teachers_firstName_lastName_idx" ON "teachers"("firstName", "lastName");
CREATE INDEX "teachers_teacherId_idx" ON "teachers"("teacherId");
CREATE INDEX "teachers_departments_status_idx" ON "teachers"("departments", "status");
CREATE INDEX "teachers_subjects_idx" ON "teachers"("subjects");
CREATE INDEX "teachers_status_idx" ON "teachers"("status");
CREATE INDEX "teachers_createdAt_idx" ON "teachers"("createdAt");
CREATE INDEX "teachers_username_idx" ON "teachers"("username");

CREATE INDEX "office_staff_email_idx" ON "office_staff"("email");
CREATE INDEX "office_staff_supabaseUserId_idx" ON "office_staff"("supabaseUserId");
CREATE INDEX "office_staff_role_isActive_idx" ON "office_staff"("role", "isActive");