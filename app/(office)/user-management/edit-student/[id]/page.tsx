"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Phone,
  Save,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Sample user data
const sampleUser = {
  name: "Dr. Sarah Ahmed",
  email: "sarah.ahmed@university.edu",
  role: "OFFICE" as const,
  avatar: undefined,
};

// Sample student data for editing
const sampleStudentData = {
  id: "CS-2024-001",
  firstName: "Ahmad",
  lastName: "Hassan",
  fatherName: "Mohammad Hassan",
  grandFatherName: "Ali Hassan",
  studentId: "CS-2024-001",
  dateOfBirth: undefined,
  phone: "+1 (555) 111-2222",
  fatherPhone: "+1 (555) 111-3333",
  address: "123 Main Street, City, State",
  programs: ["Computer Science"],
  semester: "Fall 2024",
  enrollmentYear: "2024",
  classSection: "Section A",
  timeSlot: "morning",
};

// Form state interface
interface FormData {
  firstName: string;
  lastName: string;
  fatherName: string;
  grandFatherName: string;
  studentId: string;
  dateOfBirth: Date | undefined;
  phone: string;
  fatherPhone: string;
  address: string;
  programs: string[];
  semester: string;
  enrollmentYear: string;
  classSection: string;
  timeSlot: string;
}

// Form validation errors
interface FormErrors {
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  grandFatherName?: string;
  studentId?: string;
  dateOfBirth?: string;
  phone?: string;
  fatherPhone?: string;
  address?: string;
  programs?: string;
  semester?: string;
  enrollmentYear?: string;
  classSection?: string;
  timeSlot?: string;
}

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  // Redirect to student list if no ID is provided
  React.useEffect(() => {
    if (!studentId) {
      router.replace("/user-management/students");
    }
  }, [studentId, router]);

  const [currentPath] = React.useState("/user-management/edit-student");
  const [formData, setFormData] = React.useState<FormData>({
    firstName: sampleStudentData.firstName,
    lastName: sampleStudentData.lastName,
    fatherName: sampleStudentData.fatherName,
    grandFatherName: sampleStudentData.grandFatherName,
    studentId: sampleStudentData.studentId,
    dateOfBirth: sampleStudentData.dateOfBirth,
    phone: sampleStudentData.phone,
    fatherPhone: sampleStudentData.fatherPhone,
    address: sampleStudentData.address,
    programs: sampleStudentData.programs,
    semester: sampleStudentData.semester,
    enrollmentYear: sampleStudentData.enrollmentYear,
    classSection: sampleStudentData.classSection,
    timeSlot: sampleStudentData.timeSlot,
  });
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleNavigation = (href: string) => {
    try {
      router.push(href);
    } catch (error) {
      console.error("Navigation failed:", error);
      window.location.href = href;
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | Date | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validation functions
  const validateStep1 = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!formData.fatherName.trim()) {
      errors.fatherName = "Father name is required";
    }
    if (!formData.grandFatherName.trim()) {
      errors.grandFatherName = "Grand father name is required";
    }
    if (!formData.studentId.trim()) {
      errors.studentId = "Student ID is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }
    if (!formData.fatherPhone.trim()) {
      errors.fatherPhone = "Father phone number is required";
    }
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: FormErrors = {};

    if (formData.programs.length === 0) {
      errors.programs = "At least one program/class is required";
    }
    if (!formData.semester.trim()) {
      errors.semester = "Current semester is required";
    }
    if (!formData.enrollmentYear.trim()) {
      errors.enrollmentYear = "Enrollment year is required";
    }
    if (!formData.classSection.trim()) {
      errors.classSection = "Class Name is required";
    }
    if (!formData.timeSlot.trim()) {
      errors.timeSlot = "Time slot is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all steps before submission
    const step1Valid = validateStep1();
    const step2Valid = validateStep2();
    const step3Valid = validateStep3();

    if (!step1Valid) {
      setCurrentStep(1);
      return;
    }
    if (!step2Valid) {
      setCurrentStep(2);
      return;
    }
    if (!step3Valid) {
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSubmitting(false);
      setShowSuccess(true);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error updating student:", error);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      return;
    }
    if (currentStep === 3 && !validateStep3()) {
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: "Personal Info", icon: User, color: "green" },
    { number: 2, title: "Contact & Address", icon: Phone, color: "green" },
    {
      number: 3,
      title: "Academic Details",
      icon: GraduationCap,
      color: "green",
    },
  ];

  // Program options (Classes)
  const programOptions = [
    "computer science",
    "Electrical engineering ",
    "Building engineering",
    "Class 10",
    "Class 11",
    "Class 12",
  ];

  // Class section options
  const classSectionOptions = [
    "class B",
    "class C",
    "class D",
    "class E",
    "class F",
    "class G",
    "class H",
    "class I",
    "class A",
  ];

  // Time slot options with detailed schedule
  const timeSlotOptions = [
    {
      value: "morning",
      label: "Morning (8:30 AM - 12:30 PM)",
      description: "6 teaching hours, 40 min each + 15 min breaks",
    },
    {
      value: "afternoon",
      label: "Afternoon (1:30 PM - 6:30 PM)",
      description: "6 teaching hours, 40 min each + 15 min breaks",
    },
  ];

  if (showSuccess) {
    return (
      <ModernDashboardLayout
        user={sampleUser}
        currentPath={currentPath}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        onSearch={handleSearch}
        hideHeader={true}
      >
        <PageContainer>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mb-8">
                <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Student Updated Successfully! 🎉
              </h2>

              <p className="text-slate-600 mb-8">
                {formData.firstName} {formData.lastName}'s information has been
                updated.
              </p>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => handleNavigation("/user-management/students")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  View All Students
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Edit Again
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout
      user={sampleUser}
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
      hideHeader={true}
    >
      <PageContainer>
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => handleNavigation("/user-management/students")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
              Edit Student Account
            </h1>
            <p className="text-slate-600 mt-2">
              Update {formData.firstName} {formData.lastName}'s information
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <step.icon className="h-6 w-6" />
                  {currentStep > step.number && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="ml-2 sm:ml-3 text-left">
                  <div
                    className={`text-xs sm:text-sm font-semibold ${
                      currentStep >= step.number
                        ? "text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    Step {step.number}
                  </div>
                  <div
                    className={`text-xs ${
                      currentStep >= step.number
                        ? "text-slate-600"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 sm:mx-4 lg:mx-6 h-0.5 w-8 sm:w-12 lg:w-16 transition-all duration-300 ${
                      currentStep > step.number
                        ? "bg-green-400"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ModernCard className="overflow-visible bg-white border border-slate-200 shadow-xl">
            <ModernCardContent className="relative p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-4">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Personal Information
                        </h2>
                        <p className="text-slate-600">
                          Update basic personal details
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="firstName"
                            className="text-sm font-semibold text-slate-700"
                          >
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            placeholder="Enter first name"
                            className={cn(
                              "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                              formErrors.firstName
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.firstName && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.firstName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="lastName"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            placeholder="Enter last name"
                            className={cn(
                              "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                              formErrors.lastName
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.lastName && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.lastName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="fatherName"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Father Name *
                          </Label>
                          <Input
                            id="fatherName"
                            value={formData.fatherName}
                            onChange={(e) =>
                              handleInputChange("fatherName", e.target.value)
                            }
                            placeholder="Enter father name"
                            className={cn(
                              "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                              formErrors.fatherName
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.fatherName && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.fatherName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="grandFatherName"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Grand Father Name *
                          </Label>
                          <Input
                            id="grandFatherName"
                            value={formData.grandFatherName}
                            onChange={(e) =>
                              handleInputChange(
                                "grandFatherName",
                                e.target.value
                              )
                            }
                            placeholder="Enter grand father name"
                            className={cn(
                              "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                              formErrors.grandFatherName
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.grandFatherName && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.grandFatherName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="studentId"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Student ID *
                          </Label>
                          <Input
                            id="studentId"
                            value={formData.studentId}
                            onChange={(e) =>
                              handleInputChange("studentId", e.target.value)
                            }
                            placeholder="e.g., CS-2024-001"
                            className={cn(
                              "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                              formErrors.studentId
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.studentId && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.studentId}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="dateOfBirth"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Date of Birth
                          </Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={
                              formData.dateOfBirth
                                ? formData.dateOfBirth
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "dateOfBirth",
                                e.target.value
                                  ? new Date(e.target.value)
                                  : undefined
                              )
                            }
                            className={cn(
                              "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                              formErrors.dateOfBirth
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.dateOfBirth && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.dateOfBirth}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <div></div>
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Next Step
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Contact & Address */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-4">
                          <Phone className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Contact & Address
                        </h2>
                        <p className="text-slate-600">
                          Update contact information and address
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Phone Number *
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            placeholder="+1 (555) 123-4567"
                            className={cn(
                              "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                              formErrors.phone
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.phone && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.phone}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="fatherPhone"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Father Phone Number *
                          </Label>
                          <Input
                            id="fatherPhone"
                            value={formData.fatherPhone}
                            onChange={(e) =>
                              handleInputChange("fatherPhone", e.target.value)
                            }
                            placeholder="+1 (555) 987-6543"
                            className={cn(
                              "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                              formErrors.fatherPhone
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.fatherPhone && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.fatherPhone}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                          <Label
                            htmlFor="address"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Address *
                          </Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            placeholder="Enter full address"
                            className={cn(
                              "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                              formErrors.address
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.address && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.address}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="px-8 py-3 rounded-lg font-semibold"
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Next Step
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Academic Information */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <motion.div
                          whileHover={{ scale: 1.05, rotateY: 10 }}
                          className="inline-block p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-4"
                        >
                          <GraduationCap className="h-8 w-8 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Academic Details
                        </h2>
                        <p className="text-slate-600">
                          Academic program and enrollment information
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="program"
                              className="text-sm font-semibold text-slate-700"
                            >
                              Program/Major *
                            </Label>
                            <Select
                              id="program"
                              value={formData.programs[0] || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  programs: e.target.value
                                    ? [e.target.value]
                                    : [],
                                }))
                              }
                              placeholder="Select Program"
                              className={cn(
                                formErrors.programs
                                  ? "border-red-500"
                                  : "border-slate-200"
                              )}
                            >
                              {programOptions.map((program) => (
                                <option key={program} value={program}>
                                  {program}
                                </option>
                              ))}
                            </Select>
                            {formErrors.programs && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {formErrors.programs}
                              </p>
                            )}
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="space-y-2"
                          >
                            <Label className="text-sm font-semibold text-slate-700">
                              Academic Year
                            </Label>
                            <Input
                              value="2nd Year"
                              disabled
                              className="h-12 border border-slate-200 bg-slate-50 text-slate-600 rounded-lg"
                            />
                            <p className="text-xs text-slate-500">
                              Default academic year
                            </p>
                          </motion.div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="semester"
                              className="text-sm font-semibold text-slate-700"
                            >
                              Current Semester *
                            </Label>
                            <Input
                              id="semester"
                              value={formData.semester}
                              onChange={(e) =>
                                handleInputChange("semester", e.target.value)
                              }
                              placeholder="e.g., Fall 2024"
                              className={cn(
                                "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                                formErrors.semester
                                  ? "border-red-500"
                                  : "border-slate-200"
                              )}
                            />
                            {formErrors.semester && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {formErrors.semester}
                              </p>
                            )}
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="enrollmentDate"
                              className="text-sm font-semibold text-slate-700"
                            >
                              Enrollment Date *
                            </Label>
                            <Input
                              id="enrollmentDate"
                              type="number"
                              min="1380"
                              max="1404"
                              placeholder="YYYY"
                              value={formData.enrollmentYear}
                              onChange={(e) =>
                                handleInputChange(
                                  "enrollmentYear",
                                  e.target.value
                                )
                              }
                              className={cn(
                                "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
                                formErrors.enrollmentYear
                                  ? "border-red-500"
                                  : "border-slate-200"
                              )}
                            />
                            {formErrors.enrollmentYear && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {formErrors.enrollmentYear}
                              </p>
                            )}
                          </motion.div>
                        </div>

                        {/* Class Schedule Section */}
                        <div className="border-t border-slate-200 pt-6 mt-6">
                          <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            Class Schedule
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="space-y-2"
                            >
                              <Label
                                htmlFor="classSection"
                                className="text-sm font-semibold text-slate-700"
                              >
                                Class Name *
                              </Label>
                              <Select
                                id="classSection"
                                value={formData.classSection}
                                onChange={(e) =>
                                  handleInputChange(
                                    "classSection",
                                    e.target.value
                                  )
                                }
                                placeholder="Select Class Section"
                                className={cn(
                                  formErrors.classSection
                                    ? "border-red-500"
                                    : "border-slate-200"
                                )}
                              >
                                {classSectionOptions.map((section) => (
                                  <option key={section} value={section}>
                                    {section}
                                  </option>
                                ))}
                              </Select>
                              {formErrors.classSection && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {formErrors.classSection}
                                </p>
                              )}
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="space-y-2"
                            >
                              <Label
                                htmlFor="timeSlot"
                                className="text-sm font-semibold text-slate-700"
                              >
                                Time Slot *
                              </Label>
                              <Select
                                id="timeSlot"
                                value={formData.timeSlot}
                                onChange={(e) =>
                                  handleInputChange("timeSlot", e.target.value)
                                }
                                placeholder="Select Time Slot"
                                className={cn(
                                  formErrors.timeSlot
                                    ? "border-red-500"
                                    : "border-slate-200"
                                )}
                              >
                                {timeSlotOptions.map((slot) => (
                                  <option key={slot.value} value={slot.value}>
                                    {slot.label}
                                  </option>
                                ))}
                              </Select>
                              {formErrors.timeSlot && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {formErrors.timeSlot}
                                </p>
                              )}
                              <p className="text-xs text-slate-500">
                                {formData.timeSlot &&
                                  timeSlotOptions.find(
                                    (slot) => slot.value === formData.timeSlot
                                  )?.description}
                              </p>
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="px-8 py-3 rounded-lg font-semibold"
                        >
                          Previous
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Update Student
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </ModernCardContent>
          </ModernCard>
        </div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}
