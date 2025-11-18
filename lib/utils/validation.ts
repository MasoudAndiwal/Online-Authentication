// Frontend validation utilities

export const ValidationPatterns = {
    // Letters only (with spaces) - Updated to support Persian characters
    lettersOnly: /^[A-Za-z\u0600-\u06FF\s]*$/,
    // Numbers only
    numbersOnly: /^\d*$/,
    // Alphanumeric (letters, numbers, spaces) - Updated to support Persian characters
    alphanumeric: /^[A-Za-z0-9\u0600-\u06FF\s]*$/,
    // Address pattern - Safe symbols for addresses
    address: /^[A-Za-z0-9\u0600-\u06FF\s\-_.,#/]*$/,
    // Specialization pattern - Safe symbols for specialization
    specialization: /^[A-Za-z0-9\u0600-\u06FF\s\-_.,&()]*$/,
    // Phone number (10 digits)
    phone: /^\d{10}$/,
    // Date format YYYY/MM/DD
    date: /^\d{4}\/\d{2}\/\d{2}$/,
    // Year format YYYY
    year: /^\d{4}$/,
	// Username (letters only; supports English and Persian letters)
	username: /^[A-Za-z\u0600-\u06FF]*$/,
	// Password (6-20 chars, uppercase, lowercase, number)
	password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/,
};

export const ValidationMessages = {
    // Name fields - Updated to support Persian characters
    firstName: {
        required: 'First name is required',
        pattern: 'First name must contain only letters (English or Persian)',
        minLength: 'First name must be at least 1 character',
        maxLength: 'First name must be 30 characters or less',
    },
    lastName: {
        required: 'Last name is required',
        pattern: 'Last name must contain only letters (English or Persian)',
        minLength: 'Last name must be at least 1 character',
        maxLength: 'Last name must be 30 characters or less',
    },
    fatherName: {
        required: 'Father name is required',
        pattern: 'Father name must contain only letters (English or Persian)',
        minLength: 'Father name must be at least 1 character',
        maxLength: 'Father name must be 30 characters or less',
    },
    grandFatherName: {
        required: 'Grandfather name is required',
        pattern: 'Grandfather name must contain only letters (English or Persian)',
        minLength: 'Grandfather name must be at least 1 character',
        maxLength: 'Grandfather name must be 30 characters or less',
    },
    // ID fields
    studentId: {
        required: 'Student ID is required',
        pattern: 'Student ID must contain only numbers',
        minLength: 'Student ID must be at least 4 digits',
        maxLength: 'Student ID must be 12 digits or less',
    },
    teacherId: {
        required: 'Teacher ID is required',
        pattern: 'Teacher ID must contain only numbers',
        minLength: 'Teacher ID must be at least 4 digits',
        maxLength: 'Teacher ID must be 10 digits or less',
    },
    // Date fields
    dateOfBirth: {
        pattern: 'Date must be in YYYY/MM/DD format',
    },
    // Phone fields
    phone: {
        required: 'Phone number is required',
        pattern: 'Phone number must be exactly 10 digits',
    },
    fatherPhone: {
        required: 'Father phone number is required',
        pattern: 'Father phone number must be exactly 10 digits',
    },
    secondaryPhone: {
        pattern: 'Secondary phone number must be exactly 10 digits',
    },
    // Address - Updated to support safe symbols
    address: {
        pattern: 'Address must contain only letters, numbers, and safe symbols (-, _, ., ,, #, /)',
    },
    // Experience
    experience: {
        required: 'Years of experience is required',
        pattern: 'Experience must contain only numbers',
    },
    // Specialization - Updated to support safe symbols
    specialization: {
        required: 'Specialization is required',
        pattern: 'Specialization must contain only letters, numbers, and safe symbols (-, _, ., ,, &, (, ))',
    },
    // Semester
    semester: {
        required: 'Current semester is required',
        pattern: 'Semester must contain only numbers',
        minLength: 'Semester must be at least 1 digit',
        maxLength: 'Semester must be 4 digits or less',
    },
    // Enrollment Year
    enrollmentYear: {
        required: 'Enrollment year is required',
        pattern: 'Enrollment year must be in YYYY format',
    },
    // Username
    username: {
        required: 'Username is required',
        pattern: 'Username must contain only letters',
    },
    // Password
    password: {
        required: 'Password is required',
		pattern: 'Password must be 6-20 characters with uppercase, lowercase, and number',
        minLength: 'Password must be at least 6 characters',
		maxLength: 'Password must be 20 characters or less',
    },
};

// Validation functions
export const validateName = (value: string, fieldName: keyof typeof ValidationMessages): string | undefined => {
    const messages = ValidationMessages[fieldName];

    if (!value || value.trim() === '') {
        return 'required' in messages ? messages.required : 'This field is required';
    }

    if (value.length > 30) {
        return 'maxLength' in messages ? messages.maxLength : 'Must be 30 characters or less';
    }

    if (!ValidationPatterns.lettersOnly.test(value)) {
        return messages.pattern;
    }

    return undefined;
};

export const validateId = (value: string, type: 'studentId' | 'teacherId'): string | undefined => {
    const messages = ValidationMessages[type];

    if (!value || value.trim() === '') {
        return messages.required;
    }

    if (!ValidationPatterns.numbersOnly.test(value)) {
        return messages.pattern;
    }

    if (value.length < 4) {
        return messages.minLength;
    }

    if (value.length > 12) {
        return messages.maxLength;
    }

    return undefined;
};

export const validateDate = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
        return undefined; // Optional field
    }

    if (!ValidationPatterns.date.test(value)) {
        return ValidationMessages.dateOfBirth.pattern;
    }

    return undefined;
};

export const validatePhone = (value: string, fieldName: 'phone' | 'fatherPhone' | 'secondaryPhone'): string | undefined => {
    const messages = ValidationMessages[fieldName];

    // Secondary phone is optional
    if (fieldName === 'secondaryPhone' && (!value || value.trim() === '')) {
        return undefined;
    }

    if (!value || value.trim() === '') {
        return 'required' in messages ? messages.required : 'This field is required';
    }

    if (!ValidationPatterns.phone.test(value)) {
        return messages.pattern;
    }

    return undefined;
};

export const validateAddress = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
        return undefined; // Optional field
    }

    if (!ValidationPatterns.address.test(value)) {
        return ValidationMessages.address.pattern;
    }

    return undefined;
};

export const validateExperience = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
        return ValidationMessages.experience.required;
    }

    if (!ValidationPatterns.numbersOnly.test(value)) {
        return ValidationMessages.experience.pattern;
    }

    return undefined;
};

export const validateSpecialization = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
        return ValidationMessages.specialization.required;
    }

    if (!ValidationPatterns.specialization.test(value)) {
        return ValidationMessages.specialization.pattern;
    }

    return undefined;
};

export const validateSemester = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
        return ValidationMessages.semester.required;
    }

    if (!ValidationPatterns.numbersOnly.test(value)) {
        return ValidationMessages.semester.pattern;
    }

    if (value.length < 1) {
        return ValidationMessages.semester.minLength;
    }

    if (value.length > 4) {
        return ValidationMessages.semester.maxLength;
    }

    return undefined;
};

export const validateEnrollmentYear = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
        return ValidationMessages.enrollmentYear.required;
    }

    if (!ValidationPatterns.year.test(value)) {
        return ValidationMessages.enrollmentYear.pattern;
    }

    return undefined;
};

export const validateUsername = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
        return ValidationMessages.username.required;
    }

    if (!ValidationPatterns.username.test(value)) {
        return ValidationMessages.username.pattern;
    }

    return undefined;
};

export const validatePassword = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
        return ValidationMessages.password.required;
    }

    if (value.length < 6) {
        return ValidationMessages.password.minLength;
    }

	if (value.length > 20) {
        return ValidationMessages.password.maxLength;
    }

    if (!ValidationPatterns.password.test(value)) {
        return ValidationMessages.password.pattern;
    }

    return undefined;
};

// Input sanitization functions - Updated to support Persian characters
export const sanitizeLettersOnly = (value: string): string => {
    return value.replace(/[^A-Za-z\u0600-\u06FF\s]/g, '');
};

export const sanitizeNumbersOnly = (value: string): string => {
    return value.replace(/[^\d]/g, '');
};

export const sanitizeAlphanumeric = (value: string): string => {
    return value.replace(/[^A-Za-z0-9\u0600-\u06FF\s]/g, '');
};

export const sanitizeAddress = (value: string): string => {
    return value.replace(/[^A-Za-z0-9\u0600-\u06FF\s\-_.,#/]/g, '');
};

export const sanitizeSpecialization = (value: string): string => {
    return value.replace(/[^A-Za-z0-9\u0600-\u06FF\s\-_.,&()]/g, '');
};

export const sanitizePhone = (value: string): string => {
    return value.replace(/[^\d]/g, '').slice(0, 10);
};

export const formatPhoneWithPrefix = (value: string): string => {
    const cleaned = sanitizePhone(value);
    return cleaned ? `+93${cleaned}` : '';
};

export const removePhonePrefix = (value: string): string => {
    return value.replace(/^\+93/, '');
};
