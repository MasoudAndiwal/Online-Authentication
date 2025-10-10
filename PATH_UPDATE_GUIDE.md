# Path Updates Required After Folder Restructure

## Overview
After moving folders, these paths need updating throughout user-management pages:

**OLD:** `/user-management/*`  
**NEW:** `/dashboard/user-management/*`

## Files That Need Updates

### 1. Teachers Page
**File:** `app/(office)/dashboard/user-management/teachers/page.tsx`

Update these lines:
```typescript
// Line 101: Update currentPath
const [currentPath] = React.useState("/dashboard/user-management/teachers");

// Line 280: Update add teacher path
handleNavigation("/dashboard/user-management/add-teacher")

// Line 368: Update edit teacher path
handleNavigation(`/dashboard/user-management/edit-teacher/${id}`)

// Line 387: Update add teacher path
handleNavigation("/dashboard/user-management/add-teacher")
```

### 2. Students Page
**File:** `app/(office)/dashboard/user-management/students/page.tsx`

Update these lines:
```typescript
// Line 98: Update currentPath
const [currentPath] = React.useState("/dashboard/user-management/students");

// Lines 348, 427, 485, 610, 645: Update all paths
handleNavigation("/dashboard/user-management/add-student")
handleNavigation(`/dashboard/user-management/edit-student/${student.id}`)
```

### 3. Add Teacher Page
**File:** `app/(office)/dashboard/user-management/add-teacher/page.tsx`

Update currentPath and all navigation links.

### 4. Add Student Page
**File:** `app/(office)/dashboard/user-management/add-student/page.tsx`

Update currentPath and all navigation links.

### 5. Edit Teacher Page
**File:** `app/(office)/dashboard/user-management/edit-teacher/[id]/page.tsx`

```typescript
// Line 120: Update redirect
router.replace("/dashboard/user-management/teachers");

// Line 124: Update currentPath
const [currentPath] = React.useState("/dashboard/user-management/edit-teacher");

// Lines 546, 593: Update navigation
handleNavigation("/dashboard/user-management/teachers")
```

### 6. Edit Student Page
**File:** `app/(office)/dashboard/user-management/edit-student/[id]/page.tsx`

```typescript
// Line 113: Update redirect
router.replace("/dashboard/user-management/students");

// Line 117: Update currentPath
const [currentPath] = React.useState("/dashboard/user-management/edit-student");

// Lines 387, 422: Update navigation
handleNavigation("/dashboard/user-management/students")
```

## Quick Find & Replace

Use VS Code's Find & Replace across all files in `user-management` folder:

**Find:** `"/user-management/`  
**Replace:** `"/dashboard/user-management/`

**Find:** `'/user-management/`  
**Replace:** `'/dashboard/user-management/`

## Testing Checklist

After updates, test:
- [ ] Navigate to `/dashboard/user-management`
- [ ] Click "View All Teachers" → should go to `/dashboard/user-management/teachers`
- [ ] Click "View All Students" → should go to `/dashboard/user-management/students`
- [ ] Click "Add Teacher" → should go to `/dashboard/user-management/add-teacher`
- [ ] Click "Add Student" → should go to `/dashboard/user-management/add-student`
- [ ] Edit a teacher → should go to `/dashboard/user-management/edit-teacher/[id]`
- [ ] Edit a student → should go to `/dashboard/user-management/edit-student/[id]`
- [ ] All "Back" buttons work correctly

## Quick Fix Command

Run this in your terminal from project root:

```powershell
# Find all files in user-management
$files = Get-ChildItem -Path "app\(office)\dashboard\user-management" -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace '"/user-management/', '"/dashboard/user-management/'
    $content = $content -replace "'/user-management/", "'/dashboard/user-management/"
    Set-Content $file.FullName $content -NoNewline
}
```
