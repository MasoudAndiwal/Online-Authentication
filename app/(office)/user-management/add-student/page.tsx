"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Target,
  AlertCircle,
  Clock,
  Plus,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Sample user data
const sampleUser = {
  name: "AN. Masoud Andiwal",
  email: "MasoudAndiwal@university.edu",
  role: "OFFICE" as const,
  avatar: undefined,
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

export default function AddStudentPage() {
  const router = useRouter();
  const [currentPath] = React.useState("/user-management/add-student");
  const [formData, setFormData] = React.useState<FormData>({
    firstName: "",
    lastName: "",
    fatherName: "",
    grandFatherName: "",
    studentId: "",
    dateOfBirth: undefined,
    phone: "",
    fatherPhone: "",
    address: "",
    programs: [],
    semester: "",
    enrollmentYear: "",
    classSection: "",
    timeSlot: "",
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
    // Date of birth is now optional

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

      // Don't auto-redirect - let user choose what to do next
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error creating student:", error);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
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
    { number: 2, title: "Contact & Address", icon: User, color: "green" },
    {
      number: 3,
      title: "Academic Details",
      icon: GraduationCap,
      color: "green",
    },
  ];

  // 3D Icon Component
  const Icon3D = ({
    icon: IconComponent,
    className = "",
    size = "h-6 w-6",
  }: {
    icon: any;
    className?: string;
    size?: string;
  }) => (
    <motion.div
      whileHover={{
        scale: 1.1,
        rotateY: 15,
        rotateX: 5,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className={`relative ${className}`}
      style={{
        transformStyle: "preserve-3d",
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
      }}
    >
      <IconComponent className={`${size} relative z-10`} />
      <div
        className={`absolute inset-0 ${size} opacity-30 blur-sm`}
        style={{ transform: "translateZ(-2px) translateY(2px)" }}
      >
        <IconComponent className={size} />
      </div>
    </motion.div>
  );

  // MultiSelect Component for Programs
  const MultiSelect = ({
    id,
    label,
    options,
    selectedValues,
    onChange,
    placeholder,
    error,
    required = false,
  }: {
    id: string;
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (value: string) => void;
    placeholder: string;
    error?: string;
    required?: boolean;
  }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [customInput, setCustomInput] = React.useState("");
    const [showCustomInput, setShowCustomInput] = React.useState(false);

    const handleAddCustom = () => {
      if (customInput.trim() && !selectedValues.includes(customInput.trim())) {
        onChange(customInput.trim());
        setCustomInput("");
        setShowCustomInput(false);
      }
    };

    return (
      <div
        className="space-y-2 relative"
        style={{ position: "relative", zIndex: isOpen ? 9999 : "auto" }}
      >
        <Label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label} {required && "*"}
        </Label>

        {/* Selected Values Display */}
        <div
          className={cn(
            "min-h-12 border bg-white rounded-lg p-3 transition-all duration-300",
            error ? "border-red-500" : "border-slate-200",
            "focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100"
          )}
        >
          <div className="flex flex-wrap gap-2">
            {selectedValues.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md"
              >
                {value}
                <button
                  type="button"
                  onClick={() => onChange(value)}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedValues.length === 0 && (
              <span className="text-slate-500 text-sm">{placeholder}</span>
            )}
          </div>
        </div>

        {/* Dropdown Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-10"
        >
          Add {label}
          <ArrowRight
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-90"
            )}
          />
        </Button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
            style={{
              position: "absolute",
              zIndex: 99999,
              top: "100%",
              left: 0,
              right: 0,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="p-2 space-y-1">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    selectedValues.includes(option)
                      ? "bg-green-100 text-green-800"
                      : "hover:bg-slate-100"
                  )}
                >
                  {option}
                  {selectedValues.includes(option) && (
                    <CheckCircle className="h-4 w-4 inline ml-2" />
                  )}
                </button>
              ))}

              {/* Custom Input Section */}
              <div className="border-t border-slate-200 pt-2 mt-2">
                {!showCustomInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Class
                  </button>
                ) : (
                  <div className="flex gap-2 p-2">
                    <Input
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter custom class name"
                      className="flex-1 h-8 text-sm"
                      onKeyPress={(e) => e.key === "Enter" && handleAddCustom()}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustom}
                      className="h-8 px-2 bg-green-600 hover:bg-green-700"
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomInput("");
                      }}
                      className="h-8 px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    );
  };

  // Program options (Classes)
  const programOptions = [
    "computer science",
    "Electrical engineering ",
    "Building engineering",
    "Class 10",
    "Class 11",
    "Class 12",
  ];

  // Handle multi-select changes for programs
  const handleProgramChange = (value: string) => {
    setFormData((prev) => {
      const currentPrograms = prev.programs;
      const newPrograms = currentPrograms.includes(value)
        ? currentPrograms.filter((item) => item !== value)
        : [...currentPrograms, value];
      return { ...prev, programs: newPrograms };
    });

    // Clear error when user makes selection
    if (formErrors.programs) {
      setFormErrors((prev) => ({ ...prev, programs: undefined }));
    }
  };

  // Add custom program
  const addCustomProgram = (customValue: string) => {
    if (customValue.trim() && !formData.programs.includes(customValue.trim())) {
      setFormData((prev) => ({
        ...prev,
        programs: [...prev.programs, customValue.trim()],
      }));
    }
  };

  // Remove selected program
  const removeSelectedProgram = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      programs: prev.programs.filter((item) => item !== value),
    }));
  };

  // Auto-calculate enrollment year based on semester
  const calculateEnrollmentYear = (semester: string) => {
    const currentYear = new Date().getFullYear();
    const semesterNumber = parseInt(semester);

    if (semesterNumber && semesterNumber >= 1 && semesterNumber <= 4) {
      // 2-year program: Semester 1-2 = Year 1, Semester 3-4 = Year 2
      const yearsAgo = Math.floor((semesterNumber - 1) / 2);
      return (currentYear - yearsAgo).toString();
    }

    return "";
  };

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

  // Time slot options with detailed schedule
  const timeSlotOptions1 = [
    {
      value: "morning",
      label: "Morning (8:30 AM - 12:30 PM)",
      description: "6 teaching hours, 40 min each + 15 min breaks",
    },
    {
      value: "afternoon",
      label: "Afternoon (1:30 PM - 6:30 PM)",
      description: "6 teaching hours, 40 min each",
    },
  ];
  if (showSuccess) {
    return (
      <ModernDashboardLayout
        user={sampleUser}
        title="Add Student"
        subtitle="Create a new student account"
        currentPath={currentPath}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        onSearch={handleSearch}
        hideHeader={true}
      >
        <style jsx global>{`
          /* Hide scrollbar but keep functionality */
          ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: transparent;
          }
          /* For Firefox */
          html {
            scrollbar-width: none;
          }
          /* For IE and Edge */
          body {
            -ms-overflow-style: none;
          }
        `}</style>
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[60vh] flex items-center justify-center"
          >
            <div className="text-center max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-8"
              >
                <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle className="h-12 w-12 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-green-400 rounded-full opacity-30"
                  />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-slate-900 mb-4"
              >
                Student Created Successfully! 🎉
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-slate-600 mb-8"
              >
                {formData.firstName} {formData.lastName} has been added to the
                system.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center space-x-4"
              >
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
                  Add Another Student
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </PageContainer>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout
      user={sampleUser}
      title="Add Student"
      subtitle="Create a new student account"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
      hideHeader={true}
    >
      <style jsx global>{`
        /* Hide scrollbar but keep functionality */
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: transparent;
        }
        /* For Firefox */
        html {
          scrollbar-width: none;
        }
        /* For IE and Edge */
        body {
          -ms-overflow-style: none;
        }
      `}</style>
      <PageContainer>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4 text-green-500"
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
              Create New Student Account
            </h1>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-center items-center space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Icon3D
                    icon={step.icon}
                    className={
                      currentStep >= step.number
                        ? "text-white"
                        : "text-slate-500"
                    }
                  />
                  {currentStep > step.number && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
                    >
                      <CheckCircle className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </motion.div>

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
                  <motion.div
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
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <ModernCard className="overflow-hidden bg-white border border-slate-200 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 to-white/50" />

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
                        <motion.div
                          whileHover={{ scale: 1.05, rotateY: 10 }}
                          className="inline-block p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-4"
                        >
                          <User className="h-8 w-8 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Personal Information
                        </h2>
                        <p className="text-slate-600">
                          Let's start with basic personal details
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2"
                        >
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
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2"
                        >
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
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2"
                        >
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
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2"
                        >
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
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2"
                        >
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
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2"
                        >
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
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Contact Information */}
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
                        <motion.div
                          whileHover={{ scale: 1.05, rotateY: 10 }}
                          className="inline-block p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-4"
                        >
                          <Phone className="h-8 w-8 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Contact & Address
                        </h2>
                        <p className="text-slate-600">
                          Contact information and address details
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="space-y-2"
                          >
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
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="space-y-2"
                          >
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
                          </motion.div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2"
                        >
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
                        </motion.div>
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
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-slate-200 gap-4"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {steps.map((step) => (
                      <div
                        key={step.number}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentStep >= step.number
                            ? "bg-green-500"
                            : "bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Create Student Account
                        </>
                      )}
                    </Button>
                  )}
                </motion.div>
              </form>
            </ModernCardContent>
          </ModernCard>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {[
            {
              icon: Target,
              title: "Attendance Tracking",
              desc: "Real-time attendance monitoring",
            },
            {
              icon: Award,
              title: "Progress Reports",
              desc: "Detailed academic progress",
            },
            {
              icon: Users,
              title: "Class Management",
              desc: "Easy class enrollment",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-white rounded-xl shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300"
            >
              <Icon3D
                icon={feature.icon}
                className="text-green-600 mb-4"
                size="h-8 w-8"
              />
              <h3 className="font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}
