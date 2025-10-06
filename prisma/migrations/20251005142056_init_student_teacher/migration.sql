-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "grandFatherName" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT NOT NULL,
    "fatherPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "programs" TEXT NOT NULL,
    "CurrentSemester" TEXT NOT NULL,
    "enrollmentYear" TEXT NOT NULL,
    "classSection" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "studentIdRef" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "grandFatherName" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT NOT NULL,
    "secondaryPhone" TEXT,
    "address" TEXT NOT NULL,
    "departments" TEXT[],
    "experience" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "subjects" TEXT[],
    "classes" TEXT[],
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_phone_key" ON "Student"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_teacherId_key" ON "Teacher"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_phone_key" ON "Teacher"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_username_key" ON "Teacher"("username");
