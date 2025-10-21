/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { use } from "react";
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
  Calendar,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";
import { handleLogout as performLogout } from "@/lib/auth/logout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import {
  validateName,
  validateId,
  validateDate,
  validatePhone,
  validateAddress,
  validateExperience,
  validateSpecialization,
  validateUsername,
  validatePassword,
  sanitizeLettersOnly,
  sanitizeNumbersOnly,
  sanitizeAlphanumeric,
  sanitizePhone,
} from "@/lib/utils/validation";

// Sample teacher data for editing
const sampleTeacherData = {
  id: "T-2024-001",
  firstName: "Ahmad",
  lastName: "Hassan",
  fatherName: "Mohammad Hassan",
  grandFatherName: "Ali Hassan",
  teacherId: "8472",
  dateOfBirth: undefined,
  phone: "0704382703",
  secondaryPhone: "0773628728",
  address: "123 Main Street, City, State",
  departments: ["Computer Science"],
  qualification: "Master's in Computer Science",
  experience: "5",
  specialization: "Software Engineering",
  subjects: ["Programming", "Data Structures"],
  classes: ["Section A", "Morning Batch"],
  employmentType: "Full Time (Permanent)",
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
  employmentType: string;
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
  employmentType?: string;
}

interface EditTeacherPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTeacherPage({ params }: EditTeacherPageProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth({ requiredRole: 'OFFICE' });
  const resolvedParams = use(params);
  const teacherId = resolvedParams.id as string;
  
  const [classes, setClasses] = React.useState<Array<{ id: string; name: string; session: string }>>([]);
  const [loadingClasses, setLoadingClasses] = React.useState(false);

  // Fetch teacher data from API
  React.useEffect(() => {
    if (!teacherId) {
      router.replace("/dashboard/teachers");
      return;
    }

    const fetchTeacher = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/teachers/${teacherId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch teacher data');
        }

        const data = await response.json();
        
        // Transform data to match form structure
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          fatherName: data.fatherName || '',
          grandFatherName: data.grandFatherName || '',
          teacherId: data.teacherId || '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          phone: data.phone || '',
          secondaryPhone: data.secondaryPhone || '',
          address: data.address || '',
          departments: Array.isArray(data.departments) ? data.departments : data.departments ? data.departments.split(',').map((d: string) => d.trim()) : [],
          qualification: data.qualification || '',
          experience: data.experience || '',
          specialization: data.specialization || '',
          subjects: Array.isArray(data.subjects) ? data.subjects : data.subjects ? data.subjects.split(',').map((s: string) => s.trim()) : [],
          classes: Array.isArray(data.classes) ? data.classes : data.classes ? data.classes.split(',').map((c: string) => c.trim()) : [],
          employmentType: 'Full Time (Permanent)',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching teacher:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId, router]);

  // Fetch classes from database
  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const [currentPath] = React.useState("/dashboard/edit-teacher");
  const [formData, setFormData] = React.useState<FormData>({
    firstName: sampleTeacherData.firstName,
    lastName: sampleTeacherData.lastName,
    fatherName: sampleTeacherData.fatherName,
    grandFatherName: sampleTeacherData.grandFatherName,
    teacherId: sampleTeacherData.teacherId,
    dateOfBirth: sampleTeacherData.dateOfBirth,
    phone: sampleTeacherData.phone,
    secondaryPhone: sampleTeacherData.secondaryPhone,
    address: sampleTeacherData.address,
    departments: sampleTeacherData.departments,
    qualification: sampleTeacherData.qualification,
    experience: sampleTeacherData.experience,
    specialization: sampleTeacherData.specialization,
    subjects: sampleTeacherData.subjects,
    classes: sampleTeacherData.classes,
    employmentType: sampleTeacherData.employmentType,
  });
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleNavigation = (href: string) => {
    try {
      router.push(href);
    } catch (error) {
      console.error("Navigation failed:", error);
      window.location.href = href;
    }
  };
  const handleLogout = async () => {
    await performLogout();
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

    // Validate first name
    const firstNameError = validateName(formData.firstName, 'firstName');
    if (firstNameError) errors.firstName = firstNameError;

    // Validate last name
    const lastNameError = validateName(formData.lastName, 'lastName');
    if (lastNameError) errors.lastName = lastNameError;

    // Validate father name
    const fatherNameError = validateName(formData.fatherName, 'fatherName');
    if (fatherNameError) errors.fatherName = fatherNameError;

    // Validate grandfather name
    const grandFatherNameError = validateName(formData.grandFatherName, 'grandFatherName');
    if (grandFatherNameError) errors.grandFatherName = grandFatherNameError;

    // Validate teacher ID
    const teacherIdError = validateId(formData.teacherId, 'teacherId');
    if (teacherIdError) errors.teacherId = teacherIdError;

    // Validate date of birth (optional)
    if (formData.dateOfBirth) {
      const dateError = validateDate(formData.dateOfBirth.toISOString().split('T')[0].replace(/-/g, '/'));
      if (dateError) errors.dateOfBirth = dateError;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: FormErrors = {};

    // Validate phone number
    const phoneError = validatePhone(formData.phone, 'phone');
    if (phoneError) errors.phone = phoneError;

    // Validate secondary phone (optional)
    if (formData.secondaryPhone) {
      const secondaryPhoneError = validatePhone(formData.secondaryPhone, 'secondaryPhone');
      if (secondaryPhoneError) errors.secondaryPhone = secondaryPhoneError;
    }

    // Validate address (optional)
    if (formData.address) {
      const addressError = validateAddress(formData.address);
      if (addressError) errors.address = addressError;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.qualification.trim()) {
      errors.qualification = "Qualification is required";
    }

    // Validate experience
    const experienceError = validateExperience(formData.experience);
    if (experienceError) errors.experience = experienceError;

    // Validate specialization
    const specializationError = validateSpecialization(formData.specialization);
    if (specializationError) errors.specialization = specializationError;

    if (formData.subjects.length === 0) {
      errors.subjects = "At least one subject is required";
    }
    if (formData.classes.length === 0) {
      errors.classes = "At least one class is required";
    }
    if (!formData.employmentType.trim()) {
      errors.employmentType = "Employment type is required";
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
    setError(null);

    try {
      // Prepare data for API
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fatherName: formData.fatherName,
        grandFatherName: formData.grandFatherName,
        teacherId: formData.teacherId,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
        phone: formData.phone,
        secondaryPhone: formData.secondaryPhone,
        address: formData.address,
        departments: formData.departments.join(', '),
        qualification: formData.qualification,
        experience: formData.experience,
        specialization: formData.specialization,
        subjects: formData.subjects.join(', '),
        classes: formData.classes.join(', '),
      };

      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        
        // Show detailed validation errors if available
        if (errorData.details && Array.isArray(errorData.details)) {
          type Issue = { field: string; message: string }
          const detailMessages = (errorData.details as Issue[])
            .map((d) => `${d.field}: ${d.message}`)
            .join(', ');
          throw new Error(`${errorData.error}: ${detailMessages}`);
        }
        
        throw new Error(errorData.error || errorData.details || 'Failed to update teacher');
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Redirect to teacher list after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/teachers');
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      setError(error instanceof Error ? error.message : 'An error occurred while updating teacher');
      console.error("Error updating teacher:", error);
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
    { number: 2, title: "Contact & Address", icon: Phone, color: "orange" },
    {
      number: 3,
      title: "Academic Details",
      icon: GraduationCap,
      color: "orange",
    },
  ];

  // Department options
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

  // Class options - dynamically loaded from database
  // Format: "Class Name - Session" (e.g., "CS-101-A - Morning")
  const classOptions = classes.map((cls) => `${cls.name} - ${cls.session}`);

  // Create display user
  const displayUser = user ? {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email || '',
    role: user.role,
  } : { name: 'User', email: '', role: 'OFFICE' as const };

  // Show loading screen while checking authentication
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

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
              className="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto scrollbar-hide"
              style={{
                position: "absolute",
                zIndex: 99999,
                top: "100%",
                left: 0,
                right: 0,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
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
        user={displayUser}
        title="Edit Teacher"
        subtitle="Update teacher account information"
        currentPath={currentPath}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        onSearch={handleSearch}
        hideSearch={true}
      >
        <PageContainer>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mb-8">
                <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Teacher Updated Successfully! 🎉
              </h2>

              <p className="text-slate-600 mb-8">
                {formData.firstName} {formData.lastName}&apos;s information has been
                updated.
              </p>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => handleNavigation("/dashboard/teachers")}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  View All Teachers
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

  // Show loading state
  if (loading) {
    return (
      <ModernDashboardLayout
        user={displayUser}
        title="Edit Teacher"
        subtitle="Loading teacher information..."
        currentPath={currentPath}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        onSearch={handleSearch}
        hideSearch={true}
      >
        <PageContainer>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-spin" />
              <p className="text-slate-600 text-lg">Loading teacher information...</p>
            </div>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <ModernDashboardLayout
        user={displayUser}
        title="Edit Teacher"
        subtitle="Error loading teacher"
        currentPath={currentPath}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        onSearch={handleSearch}
        hideSearch={true}
      >
        <PageContainer>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Teacher</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => handleNavigation('/dashboard/teachers')}>
                  Back to Teachers
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
      user={displayUser}
      title="Edit Teacher"
      subtitle="Update teacher account information"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
      hideSearch={true}
    >
      <style jsx global>{`
        /* Hide scrollbar for webkit browsers */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
      <PageContainer>
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => handleNavigation("/dashboard/teachers")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teachers
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
              Edit Teacher Account
            </h1>
            <p className="text-slate-600 mt-2">
              Update {formData.firstName} {formData.lastName}&apos;s information
            </p>
          </div>
        </div>

        {/* Fully Responsive Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Mobile Layout (< sm) */}
          <div className="sm:hidden">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                  currentStep >= steps[currentStep - 1]?.number
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
{React.createElement(steps[currentStep - 1]?.icon, { className: "h-8 w-8 text-white" })}
              </motion.div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-900 mb-1">
                Step {currentStep} of {steps.length}
              </div>
              <div className="text-xs text-slate-600 mb-3">
                {steps[currentStep - 1]?.title}
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Tablet Layout (sm to lg) */}
          <div className="hidden sm:flex lg:hidden justify-center items-center space-x-3 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
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

                <div className="ml-2 text-left">
                  <div
                    className={`text-xs font-semibold ${
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
                    className={`mx-3 h-0.5 w-8 transition-all duration-300 ${
                      currentStep > step.number
                        ? "bg-orange-400"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Desktop Layout (lg+) */}
          <div className="hidden lg:flex justify-center items-center space-x-8 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <step.icon className="h-6 w-6" />
                  {currentStep > step.number && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
                    >
                      <CheckCircle className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                <div className="ml-4 text-left">
                  <div
                    className={`text-sm font-semibold ${
                      currentStep >= step.number
                        ? "text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    Step {step.number}
                  </div>
                  <div
                    className={`text-sm ${
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
                    className={`mx-6 h-0.5 w-16 transition-all duration-300 ${
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
                        <div className="inline-block p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg mb-4">
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
                        </div>

                        <div className="space-y-2">
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
                            placeholder="e.g., T-2024-001"
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
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                        <div className="order-2 sm:order-1"></div>
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="order-1 sm:order-2 w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Next Step
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Contact & Department */}
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
                        <div className="inline-block p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg mb-4">
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
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="secondaryPhone"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Secondary Phone
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
                            className={cn(
                              "h-12 border bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 rounded-lg",
                              formErrors.secondaryPhone
                                ? "border-red-500"
                                : "border-slate-200"
                            )}
                          />
                          {formErrors.secondaryPhone && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.secondaryPhone}
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
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="order-2 sm:order-1 w-full sm:w-auto px-8 py-3 rounded-lg font-semibold"
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="order-1 sm:order-2 w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Next Step
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
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
                        <div className="inline-block p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg mb-4">
                          <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Academic Details
                        </h2>
                        <p className="text-slate-600">
                          Academic qualifications and experience
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
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
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="experience"
                              className="text-sm font-semibold text-slate-700"
                            >
                              Years of Experience *
                            </Label>
                            <Input
                            min="0"
                              id="experience"
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
                          </div>
                        </div>

                        <div className="space-y-2">
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
                        </div>

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
                            <div
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
                            </div>
                          </div>

                          <div
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                            style={{ position: "relative", zIndex: 5 }}
                          >
                            <div
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
                            </div>

                            <div
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
                            </div>
                          </div>

                          {/* Employment Type Section */}
                          <div className="mt-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="employmentType"
                                className="text-sm font-semibold text-slate-700"
                              >
                                Employment Type *
                              </Label>
                              <CustomSelect
                                id="employmentType"
                                value={formData.employmentType}
                                onValueChange={(value) =>
                                  handleInputChange("employmentType", value)
                                }
                                placeholder="Select employment type"
                                className={cn(
                                  "focus:border-orange-500 focus:ring-2 focus:ring-orange-100",
                                  formErrors.employmentType
                                    ? "border-red-500"
                                    : "border-slate-200"
                                )}
                              >
                                <option value="">Select employment type</option>
                                <option value="Full Time (Permanent)">
                                  Full Time (Permanent)
                                </option>
                                <option value="Part Time (Credit-Based)">
                                  Part Time (Credit-Based)
                                </option>
                              </CustomSelect>
                              {formErrors.employmentType && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {formErrors.employmentType}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="order-2 sm:order-1 w-full sm:w-auto px-8 py-3 rounded-lg font-semibold"
                        >
                          Previous
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="order-1 sm:order-2 w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Update Teacher
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
