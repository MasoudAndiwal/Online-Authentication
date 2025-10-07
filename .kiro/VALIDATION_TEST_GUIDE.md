# Validation Testing Guide

## Quick Test Commands

```powershell
npm run dev
```

## Test Each Page

### 1. Add Teacher Page (`/user-management/add-teacher`)

#### Step 1 Tests:
- **First Name**: Try "John123" → Should show error, cannot proceed
- **Teacher ID**: Try "abc" → Should show error, cannot proceed
- **Teacher ID**: Try "123" → Should show error (too short), cannot proceed

#### Step 2 Tests:
- **Phone**: Try "12345" → Should show error (not 10 digits), cannot proceed
- **Phone**: Try "abc1234567" → Should show error (not numbers only), cannot proceed

#### Step 3 Tests:
- **Experience**: Try "5 years" → Should show error (numbers only), cannot proceed
- **Specialization**: Try "AI & ML" → Should show error (no special chars), cannot proceed

#### Step 4 Tests:
- **Username**: Try "user123" → Should show error (letters only), cannot proceed
- **Password**: Try "password" → Should show error (needs uppercase/number), cannot proceed

### 2. Edit Teacher Page (`/user-management/edit-teacher/[id]`)
- Same tests as Add Teacher
- Verify existing data loads correctly
- Verify validation works on updates

### 3. Add Student Page (`/user-management/add-student`)

#### Step 1 Tests:
- **First Name**: Try "Sara123" → Should show error, cannot proceed
- **Student ID**: Try "12" → Should show error (too short), cannot proceed

#### Step 2 Tests:
- **Phone**: Try "123456789" → Should show error (not 10 digits), cannot proceed
- **Father Phone**: Try "abc1234567" → Should show error (not numbers only), cannot proceed

#### Step 3 Tests:
- **Semester**: Try "1st" → Should show error (numbers only), cannot proceed
- **Enrollment Year**: Try "24" → Should show error (must be YYYY), cannot proceed

#### Step 4 Tests:
- **Username**: Try "student123" → Should show error (letters only), cannot proceed
- **Password**: Try "123456" → Should show error (needs uppercase/lowercase), cannot proceed

### 4. Edit Student Page (`/user-management/edit-student/[id]`)
- Same tests as Add Student
- Verify existing data loads correctly
- Verify validation works on updates

## Expected Behavior

### ✅ Success Criteria:
1. **Cannot proceed to next step** with invalid data
2. **Error messages appear** under invalid fields
3. **Red borders** appear on invalid fields
4. **Clear, specific error messages** (not generic)
5. **Form stays on current step** until errors fixed
6. **Errors clear** when valid data entered

### ❌ What Should NOT Happen:
- Form should NOT proceed with invalid data
- Should NOT show generic "required" errors for format issues
- Should NOT allow submission with validation errors
- Should NOT crash or show console errors

## Quick Validation Test

### Test Names:
- Try: "John123" → Error: "First name must contain only letters"
- Try: "A very long name that exceeds thirty characters" → Error: "First name must be 30 characters or less"

### Test IDs:
- Try: "abc" → Error: "Teacher ID must contain only numbers"
- Try: "123" → Error: "Teacher ID must be at least 4 digits"
- Try: "12345678901" → Error: "Teacher ID must be 10 digits or less"

### Test Phone:
- Try: "123456789" → Error: "Phone number must be exactly 10 digits"
- Try: "abc1234567" → Error: "Phone number must be exactly 10 digits"

### Test Password:
- Try: "password" → Error: "Password must be 6-12 characters with uppercase, lowercase, and number"
- Try: "Password123!" → Error: "Password must be 6-12 characters with uppercase, lowercase, and number" (no special chars)
- Try: "Pass123" → ✅ Valid

## All Pages Status

| Page | Validation | Status |
|------|------------|--------|
| Add Teacher | ✅ Complete | Ready |
| Edit Teacher | ✅ Complete | Ready |
| Add Student | ✅ Complete | Ready |
| Edit Student | ✅ Complete | Ready |

## Files Updated

1. ✅ `lib/validations/user.validation.ts` - Backend validation
2. ✅ `lib/utils/validation.ts` - Frontend validation utilities
3. ✅ `app/(office)/user-management/add-teacher/page.tsx` - Validation applied
4. ✅ `app/(office)/user-management/edit-teacher/[id]/page.tsx` - Validation applied
5. ✅ `app/(office)/user-management/add-student/page.tsx` - Validation applied
6. ✅ `app/(office)/user-management/edit-student/[id]/page.tsx` - Validation applied

## Success!

🎉 **All 4 pages now have comprehensive validation that prevents invalid data from proceeding to the next step!**

The forms will now:
- Block progression with invalid data
- Show clear error messages
- Validate according to all your requirements
- Work consistently across all pages