# Comprehensive Validation Implementation Plan

## Overview

This document outlines the complete validation implementation for all teacher and student forms.

## Completed Steps

### ✅ Step 1: Backend Validation (Zod Schemas)

**File**: `lib/validations/user.validation.ts`

**Implemented**:

- Name fields: Letters only, 1-30 characters
- ID fields: Numbers only, 4-10 digits
- Date of Birth: Optional, YYYY/MM/DD format
- Phone numbers: 10 digits exactly
- Address: Alphanumeric, optional
- Experience: Numbers only
- Specialization: Alphanumeric
- Semester: Numbers only, 1-4 digits
- Enrollment Year: YYYY format
- Username: Letters only
- Password: 6-12 chars, uppercase, lowercase, number

### ✅ Step 2: Frontend Validation Utilities

**File**: `lib/utils/validation.ts`

**Created**:

- Validation patterns (regex)
- Validation messages
- Validation functions for each field type
- Input sanitization functions
- Phone number formatting utilities

## Remaining Steps

### Step 3: Update Add Teacher Page

**File**: `app/(office)/user-management/add-teacher/page.tsx`

**Changes Needed**:

1. Import validation utilities
2. Add real-time validation on blur
3. Add input sanitization on change
4. Update validation functions for each step
5. Add phone number prefix (+93) handling
6. Add "years" suffix for experience field
7. Improve error messages display

**Fields to Update**:

- First Name, Last Name, Father Name, Grandfather Name
- Teacher ID
- Date of Birth
- Phone Number, Secondary Phone Number
- Address
- Experience (with "years" display)
- Specialization
- Username, Password

### Step 4: Update Edit Teacher Page

**File**: `app/(office)/user-management/edit-teacher/[id]/page.tsx`

**Changes Needed**:

- Same as Add Teacher Page
- Ensure existing data is prefilled correctly
- Validate on update

### Step 5: Update Add Student Page

**File**: `app/(office)/user-management/add-student/page.tsx`

**Changes Needed**:

1. Import validation utilities
2. Add real-time validation on blur
3. Add input sanitization on change
4. Update validation functions for each step
5. Add phone number prefix (+93) handling
6. Improve error messages display

**Fields to Update**:

- First Name, Last Name, Father Name, Grandfather Name
- Student ID
- Date of Birth
- Phone Number, Father Phone Number
- Address
- Current Semester
- Enrollment Year
- Program/Major, Class Name, Time Slot
- Username, Password

### Step 6: Update Edit Student Page

**File**: `app/(office)/user-management/edit-student/[id]/page.tsx`

**Changes Needed**:

- Same as Add Student Page
- Ensure existing data is prefilled correctly
- Validate on update

## Validation Rules Summary

### Name Fields (First, Last, Father, Grandfather)

```typescript
- Pattern: /^[A-Za-z\s]*$/
- Min Length: 1
- Max Length: 30
- Error: "Name must contain only letters"
- Sanitize: Remove non-letters on input
```

### ID Fields (Student ID, Teacher ID)

```typescript
- Pattern: /^\d*$/
- Min Length: 4
- Max Length: 10
- Error: "ID must contain only numbers (4-10 digits)"
- Sanitize: Remove non-numbers on input
```

### Date of Birth

```typescript
- Pattern: /^\d{4}\/\d{2}\/\d{2}$/
- Optional: true
- Format: YYYY/MM/DD
- Error: "Date must be in YYYY/MM/DD format"
```

### Phone Numbers

```typescript
- Pattern: /^\d{10}$/
- Length: Exactly 10 digits
- Prefix: +93 (auto-added, editable)
- Error: "Phone number must be exactly 10 digits"
- Sanitize: Remove non-numbers, limit to 10 digits
```

### Address

```typescript
- Pattern: /^[A-Za-z0-9\s]*$/
- Optional: true
- Error: "Address must contain only letters and numbers"
- Sanitize: Remove special characters
```

### Experience (Teachers only)

```typescript
- Pattern: /^\d*$/
- Required: true
- Display: Show "years" beside input
- Error: "Experience must contain only numbers"
- Sanitize: Remove non-numbers
```

### Specialization (Teachers only)

```typescript
- Pattern: /^[A-Za-z0-9\s]*$/
- Required: true
- Error: "Specialization must contain only letters and numbers"
- Sanitize: Remove special characters
```

### Current Semester (Students only)

```typescript
- Pattern: /^\d*$/
- Min Length: 1
- Max Length: 4
- Required: true
- Error: "Semester must contain only numbers (1-4 digits)"
- Sanitize: Remove non-numbers
```

### Enrollment Year (Students only)

```typescript
- Pattern: /^\d{4}$/
- Format: YYYY
- Required: true
- Error: "Enrollment year must be in YYYY format"
- Sanitize: Remove non-numbers, limit to 4 digits
```

### Username

```typescript
- Pattern: /^[A-Za-z]*$/
- Required: true
- Error: "Username must contain only letters"
- Sanitize: Remove non-letters
```

### Password

```typescript
- Pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,12}$/
- Min Length: 6
- Max Length: 12
- Requirements: Uppercase, lowercase, number
- Error: "Password must be 6-12 characters with uppercase, lowercase, and number"
```

## Implementation Pattern

### For Each Input Field:

```typescript
// 1. Add onChange with sanitization
<Input
  value={formData.fieldName}
  onChange={(e) => {
    const sanitized = sanitizeFunction(e.target.value);
    handleInputChange("fieldName", sanitized);
  }}
  onBlur={() => {
    const error = validateFunction(formData.fieldName);
    if (error) {
      setFormErrors((prev) => ({ ...prev, fieldName: error }));
    }
  }}
  className={cn(
    "h-12 border bg-white rounded-lg",
    formErrors.fieldName ? "border-red-500" : "border-slate-200"
  )}
/>;
{
  formErrors.fieldName && (
    <p className="text-sm text-red-500 flex items-center gap-1">
      <AlertCircle className="h-4 w-4" />
      {formErrors.fieldName}
    </p>
  );
}
```

### For Phone Number Fields:

```typescript
// Display with +93 prefix
<div className="relative">
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
    +93
  </span>
  <Input
    value={formData.phone}
    onChange={(e) => {
      const sanitized = sanitizePhone(e.target.value);
      handleInputChange("phone", sanitized);
    }}
    onBlur={() => {
      const error = validatePhone(formData.phone, "phone");
      if (error) {
        setFormErrors((prev) => ({ ...prev, phone: error }));
      }
    }}
    className="pl-14"
    maxLength={10}
  />
</div>
```

### For Experience Field:

```typescript
// Display with "years" suffix
<div className="relative">
  <Input
    value={formData.experience}
    onChange={(e) => {
      const sanitized = sanitizeNumbersOnly(e.target.value);
      handleInputChange("experience", sanitized);
    }}
    onBlur={() => {
      const error = validateExperience(formData.experience);
      if (error) {
        setFormErrors((prev) => ({ ...prev, experience: error }));
      }
    }}
  />
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
    years
  </span>
</div>
```

## Testing Checklist

### For Each Form:

- [ ] All fields validate on blur
- [ ] Invalid characters are prevented on input
- [ ] Error messages display inline
- [ ] Error messages are clear and specific
- [ ] Phone numbers show +93 prefix
- [ ] Experience shows "years" suffix
- [ ] Form cannot submit with errors
- [ ] Backend validation matches frontend
- [ ] Edit forms prefill existing data
- [ ] Edit forms validate updates

### Specific Tests:

- [ ] Name fields: Try entering numbers/symbols
- [ ] ID fields: Try entering letters/symbols
- [ ] Phone fields: Try entering letters, verify 10 digit limit
- [ ] Date fields: Try invalid formats
- [ ] Password: Try without uppercase/lowercase/number
- [ ] Username: Try with numbers/symbols
- [ ] Experience: Try with letters
- [ ] Semester: Try with letters, verify 4 digit limit

## Next Steps

1. **Implement Add Teacher Page validation** (highest priority)
2. **Implement Edit Teacher Page validation**
3. **Implement Add Student Page validation**
4. **Implement Edit Student Page validation**
5. **Test all forms thoroughly**
6. **Update API error handling if needed**

## Notes

- All validation is done both frontend and backend
- Frontend validation provides immediate feedback
- Backend validation ensures data integrity
- Sanitization prevents invalid input
- Error messages are user-friendly and specific
- Phone prefix (+93) is editable but auto-added
- Experience field shows "years" for clarity
