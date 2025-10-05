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
  Plus,
  X,
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

// Form state interface
interface FormData {
  firstName: string;
  lastName: string;
  fatherName: string;
  grandFatherName: string;
  teacherId: string;
  dateOfBirth: Date | undefined;
  phone: string;
  secondaryPhone: string;
  address: string;
  departments: string[];
  qualification: string;
  experience: string;
  specialization: string;
  subjects: string[];
  classes: string[];
}

// Form validation errors
interface FormErrors {
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  grandFatherName?: string;
  teacherId?: string;
  dateOfBirth?: string;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  departments?: string;
  qualification?: string;
  experience?: string;
  specialization?: string;
  subjects?: string;
  classes?: string;
}

export default function AddTeacherPage() {
  const router = useRouter();
  const [currentPath] = React.useState("/user-management/add-teacher");
  const [formData, setFormData] = React.useState<FormData>({
    firstName: "",
    lastName: "",
    fatherName: "",
    grandFatherName: "",
    teacherId: "",
    dateOfBirth: undefined,
    phone: "",
    secondaryPhone: "",
    address: "",
    departments: [],
    qualification: "",
    experience: "",
    specialization: "",
    subjects: [],
    classes: [],
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
    value: string | Date | undefined | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMultiSelectChange = (
    field: "departments" | "subjects" | "classes",
    selectedValue: string
  ) => {
    setFormData((prev) => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter((v) => v !== selectedValue)
        : [...currentValues, selectedValue];

      return { ...prev, [field]: newValues };
    });

    // Clear error when user makes selection
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
    if (!formData.teacherId.trim()) {
      errors.teacherId = "Teacher ID is required";
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
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.qualification.trim()) {
      errors.qualification = "Qualification is required";
    }
    if (!formData.experience.trim()) {
      errors.experience = "Experience is required";
    }
    if (!formData.specialization.trim()) {
      errors.specialization = "Specialization is required";
    }
    if (formData.subjects.length === 0) {
      errors.subjects = "At least one subject is required";
    }
    if (formData.classes.length === 0) {
      errors.classes = "At least one class is required";
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
      console.error("Error creating teacher:", error);
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
    { number: 1, title: "Personal Info", icon: User, color: "orange" },
    { number: 2, title: "Contact & Department", icon: Phone, color: "orange" },
    {
      number: 3,
      title: "Academic Details",
      icon: GraduationCap,
      color: "orange",
    },
  ];

  // Department options
  // Department options (all available departments)
  const departmentOptions = [
    "Computer Science",
    "Electrical Engineering",
    "Building Engineering",
    "10th class",
    "11th class",
    "12th class",
  ];

  // Subject options
  const subjectOptions = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Programming",
    "Data Structures",
    "Algorithms",
    "Database Systems",
    "Network Engineering",
    "Circuit Analysis",
    "Digital Electronics",
    "Power Systems",
    "Structural Engineering",
    "Construction Management",
    "English Literature",
    "History",
    "Geography",
    "Islamic Studies",
  ];

  // Class options
  const classOptions = [
    "Section A",
    "Section B",
    "Section C",
    "Section D",
    "Morning Batch",
    "Afternoon Batch",
    "Evening Batch",
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

  // Multi-Select Component
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
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div
        className="space-y-2"
        ref={dropdownRef}
        style={{ position: "relative", zIndex: isOpen ? 9999 : "auto" }}
      >
        <Label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label} {required && "*"}
        </Label>
        <div className="relative" style={{ zIndex: isOpen ? 9999 : "auto" }}>
          <div
            className={cn(
              "min-h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg p-3 cursor-pointer",
              error ? "border-red-500" : "border-slate-200"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedValues.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((value) => (
                  <span
                    key={value}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {value}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(value);
                      }}
                      className="ml-1 text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-500">{placeholder}</span>
            )}
          </div>

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
              {options.map((option) => (
                <div
                  key={option}
                  className={cn(
                    "px-3 py-2 cursor-pointer hover:bg-slate-50 flex items-center justify-between",
                    selectedValues.includes(option)
                      ? "bg-orange-50 text-orange-700"
                      : ""
                  )}
                  onClick={() => {
                    onChange(option);
                  }}
                >
                  <span>{option}</span>
                  {selectedValues.includes(option) && (
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    );
  };

  if (showSuccess) {
    return (
      <ModernDashboardLayout
        user={sampleUser}
        title="Add Teacher"
        subtitle="Create a new teacher account"
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
          /* Ensure dropdowns appear on top */
          .dropdown-portal {
            position: fixed !important;
            z-index: 99999 !important;
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
                Teacher Created Successfully! 🎉
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
                  onClick={() => handleNavigation("/user-management/teachers")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  View All Teachers
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Add Another Teacher
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
      title="Add Teacher"
      subtitle="Create a new teacher account"
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
        /* Ensure dropdowns appear on top */
        .dropdown-portal {
          position: fixed !important;
          z-index: 99999 !important;
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
              className="absolute -top-4 -right-4 text-orange-500"
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
              Create New Teacher Account
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
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg"
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
                        ? "bg-orange-400"
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
          <ModernCard className="overflow-visible bg-white border border-slate-200 shadow-xl">
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
                          className="inline-block p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg mb-4"
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
                              "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
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
                              "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
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
                              "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
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
                              "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
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
                            htmlFor="teacherId"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Teacher ID *
                          </Label>
                          <Input
                            id="teacherId"
                            value={formData.teacherId}
                            onChange={(e) =>
                              handleInputChange("teacherId", e.target.value)
                            }
                            placeholder="e.g., TCH-2024-001"
                            className={cn(
                              "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
                              formErrors.teacherId
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.teacherId && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.teacherId}
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
                              "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
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

                  {/* Step 2: Contact Information & Department */}
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
                          className="inline-block p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg mb-4"
                        >
                          <Phone className="h-8 w-8 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Contact & Department
                        </h2>
                        <p className="text-slate-600">
                          Contact information and department assignment
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
                                "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
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
                              htmlFor="secondaryPhone"
                              className="text-sm font-semibold text-slate-700"
                            >
                              Secondary Phone Number (Optional)
                            </Label>
                            <Input
                              id="secondaryPhone"
                              value={formData.secondaryPhone}
                              onChange={(e) =>
                                handleInputChange(
                                  "secondaryPhone",
                                  e.target.value
                                )
                              }
                              placeholder="+1 (555) 987-6543"
                              className="h-12 border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg"
                            />
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
                              "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
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

                  {/* Step 3: Academic Details */}
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
                          className="inline-block p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg mb-4"
                        >
                          <GraduationCap className="h-8 w-8 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Academic Details
                        </h2>
                        <p className="text-slate-600">
                          Academic qualifications and experience
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="qualification"
                              className="text-sm font-semibold text-slate-700"
                            >
                              Highest Qualification *
                            </Label>
                            <Input
                              id="qualification"
                              value={formData.qualification}
                              onChange={(e) =>
                                handleInputChange(
                                  "qualification",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., PhD in Computer Science"
                              className={cn(
                                "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
                                formErrors.qualification
                                  ? "border-red-500"
                                  : "border-slate-200"
                              )}
                            />
                            {formErrors.qualification && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {formErrors.qualification}
                              </p>
                            )}
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="experience"
                              className="text-sm font-semibold text-slate-700"
                            >
                              Years of Experience *
                            </Label>
                            <Input
                              id="experience"
                              type="number"
                              value={formData.experience}
                              onChange={(e) =>
                                handleInputChange("experience", e.target.value)
                              }
                              placeholder="e.g., 5"
                              className={cn(
                                "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
                                formErrors.experience
                                  ? "border-red-500"
                                  : "border-slate-200"
                              )}
                            />
                            {formErrors.experience && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {formErrors.experience}
                              </p>
                            )}
                          </motion.div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2"
                        >
                          <Label
                            htmlFor="specialization"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Specialization *
                          </Label>
                          <Input
                            id="specialization"
                            value={formData.specialization}
                            onChange={(e) =>
                              handleInputChange(
                                "specialization",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Machine Learning, Data Structures"
                            className={cn(
                              "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
                              formErrors.specialization
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.specialization && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.specialization}
                            </p>
                          )}
                        </motion.div>

                        {/* Teaching Assignments Section */}
                        <div
                          className="border-t border-slate-200 pt-6 mt-6"
                          style={{ position: "relative", zIndex: 1 }}
                        >
                          <h3 className="text-lg font-semibold text-slate-900 mb-6">
                            Teaching Assignments
                          </h3>
                          
                          {/* Departments Section */}
                          <div className="mb-6">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="space-y-2"
                              style={{ position: "relative", zIndex: 10 }}
                            >
                              <MultiSelect
                                id="departments"
                                label="Departments"
                                options={departmentOptions}
                                selectedValues={formData.departments}
                                onChange={(value) =>
                                  handleMultiSelectChange("departments", value)
                                }
                                placeholder="Select departments"
                                error={formErrors.departments}
                                required={true}
                              />
                            </motion.div>
                          </div>

                          <div
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                            style={{ position: "relative", zIndex: 5 }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="space-y-2"
                              style={{ position: "relative", zIndex: 8 }}
                            >
                              <MultiSelect
                                id="subjects"
                                label="Subjects/Content"
                                options={subjectOptions}
                                selectedValues={formData.subjects}
                                onChange={(value) =>
                                  handleMultiSelectChange("subjects", value)
                                }
                                placeholder="Select subjects to teach"
                                error={formErrors.subjects}
                                required={true}
                              />
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="space-y-2"
                              style={{ position: "relative", zIndex: 7 }}
                            >
                              <MultiSelect
                                id="classes"
                                label="Classes"
                                options={classOptions}
                                selectedValues={formData.classes}
                                onChange={(value) =>
                                  handleMultiSelectChange("classes", value)
                                }
                                placeholder="Select classes to teach"
                                error={formErrors.classes}
                                required={true}
                              />
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
                  style={{ position: "relative" }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
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
                            ? "bg-orange-500"
                            : "bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
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
                          Create Teacher Account
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
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {[
            {
              icon: Target,
              title: "Class Management",
              desc: "Manage assigned classes and students",
            },
            {
              icon: Award,
              title: "Attendance Tracking",
              desc: "Mark and track student attendance",
            },
            {
              icon: Users,
              title: "Student Progress",
              desc: "Monitor student academic progress",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-slate-200"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                  <Icon3D
                    icon={feature.icon}
                    className="text-white"
                    size="h-6 w-6"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}
