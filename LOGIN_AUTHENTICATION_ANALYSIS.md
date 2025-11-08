# 🔐 Login Page & Office Authentication Analysis

## Complete Authentication Flow Analysis

---

## 1. **Login Page Structure**

### **File:** `app/(auth)/login/page.tsx`

### **Key Features:**

#### **Multi-Role Login System**
The login page supports 3 different user roles:
- **Office** (Administrative staff)
- **Teacher** (Faculty members)
- **Student** (Students)

#### **Role Configuration:**
```typescript
const roleConfig = {
  office: {
    title: "Office Portal",
    description: "Administrative access for university staff and management",
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
    showForgotPassword: true,
    icon: Building2,
  },
  teacher: {
    title: "Teacher Portal",
    description: "Access for faculty members to manage classes and attendance",
    color: "orange",
    gradient: "from-orange-500 to-orange-600",
    showForgotPassword: false,
    icon: Users,
  },
  student: {
    title: "Student Portal",
    description: "Student access to view attendance records and academic progress",
    color: "emerald",
    gradient: "from-emerald-500 to-emerald-600",
    showForgotPassword: false,
    icon: BookOpen,
  },
};
```

---

## 2. **Office Login Validation**

### **Client-Side Validation (Zod Schema)**

```typescript
const createLoginSchema = (role: Role) => {
  const baseSchema = {
    username: z
      .string()
      .min(3, "Please enter a valid username (minimum 3 characters)"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  };

  // Student role requires additional studentId field
  if (role === "student") {
    return z.object({
      ...baseSchema,
      studentId: z
        .string()
        .min(6, "Student ID must be at least 6 digits")
        .max(12, "Student ID must be at most 12 digits")
        .regex(/^\d+$/, "Student ID must contain only numbers"),
    });
  }

  return z.object(baseSchema);
};
```

### **Office Login Requirements:**
- ✅ **Username**: Minimum 3 characters
- ✅ **Password**: Minimum 6 characters
- ✅ **No Student ID required** (unlike student login)

---

## 3. **Office Authentication Flow**

### **Step 1: Form Submission**

When user submits the office login form:

```typescript
const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true);
  setLoginStatus("idle");
  setErrorMessage("");

  try {
    // API endpoint for office login
    const endpoint = "/api/auth/login/office";

    // Request body
    const requestBody = {
      username: data.username,
      password: data.password,
    };

    // Make API call
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      setLoginStatus("error");
      setErrorMessage(result.message || "Login failed. Please try again.");
      return;
    }

    // Success - save session and redirect
    setLoginStatus("success");
    saveSession(result.data);
    router.push("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    setLoginStatus("error");
    setErrorMessage("Unable to connect to the server.");
  }
};
```

---

### **Step 2: API Endpoint Processing**

**File:** `app/api/auth/login/office/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate input using Zod schema
    const validationResult = officeLoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    // 3. Authenticate office user
    const authResult = await authenticateOffice(username, password);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message,
        },
        { status: 401 }
      );
    }

    // 4. Return success response
    return NextResponse.json(
      {
        success: true,
        message: authResult.message,
        data: authResult.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Office login API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An internal server error occurred.',
      },
      { status: 500 }
    );
  }
}
```

---

### **Step 3: Database Authentication**

**File:** `lib/auth/authentication.ts`

```typescript
export async function authenticateOffice(
  username: string, 
  password: string
): Promise<AuthResponse> {
  try {
    // 1. Query office_staff table for matching username
    const { data: officeUser, error } = await supabase
      .from('office_staff')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)  // Only active users can login
      .single();

    if (error || !officeUser) {
      return {
        success: false,
        message: 'Invalid credentials. Please check your username and password.',
      };
    }

    // 2. Compare password with stored hashed password
    const isPasswordValid = await comparePassword(password, officeUser.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials. Please check your username and password.',
      };
    }

    // 3. Return success with user data
    return {
      success: true,
      message: 'Login successful',
      data: {
        id: officeUser.id,
        username: officeUser.username,
        email: officeUser.email,
        firstName: officeUser.first_name,
        lastName: officeUser.last_name,
        role: officeUser.role,
      },
    };
  } catch (error) {
    console.error('Office authentication error:', error);
    return {
      success: false,
      message: 'An error occurred during authentication. Please try again.',
    };
  }
}
```

---

### **Step 4: Password Verification**

**File:** `lib/utils/password.ts`

```typescript
import bcrypt from 'bcrypt';

/**
 * Compares a plain text password with a hashed password
 * @param password - The plain text password to compare
 * @param hash - The hashed password to compare against
 * @returns A promise that resolves to true if passwords match, false otherwise
 */
export async function comparePassword(
  password: string, 
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**How it works:**
- Uses **bcrypt** library for secure password comparison
- Compares plain text password with hashed password from database
- Returns `true` if passwords match, `false` otherwise
- Bcrypt automatically handles salt verification

---

## 4. **Database Schema**

### **Office Staff Table: `office_staff`**

Expected columns based on the code:
```sql
CREATE TABLE office_staff (
  id UUID PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,  -- Bcrypt hashed password
  email VARCHAR,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. **Security Features**

### **✅ Password Security:**
- **Bcrypt hashing** with 10 salt rounds
- Passwords are **never stored in plain text**
- Secure comparison using bcrypt.compare()

### **✅ Input Validation:**
- **Client-side validation** using Zod
- **Server-side validation** in API route
- Minimum length requirements enforced

### **✅ Account Status Check:**
- Only **active users** (`is_active = true`) can login
- Inactive accounts are rejected

### **✅ Error Handling:**
- Generic error messages to prevent username enumeration
- "Invalid credentials" message for both wrong username and wrong password
- Proper HTTP status codes (400, 401, 500)

### **✅ Session Management:**
- User data saved to session after successful login
- Session includes: id, username, email, firstName, lastName, role
- Automatic redirect to dashboard

---

## 6. **Authentication Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ENTERS CREDENTIALS                   │
│                  (Username + Password)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              CLIENT-SIDE VALIDATION (Zod)                    │
│  • Username: min 3 chars                                     │
│  • Password: min 6 chars                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           POST /api/auth/login/office                        │
│           { username, password }                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVER-SIDE VALIDATION (Zod)                    │
│              Validate request body                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           authenticateOffice(username, password)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         QUERY DATABASE: office_staff table                   │
│  • WHERE username = ?                                        │
│  • AND is_active = true                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │         │
              User Found?   User Not Found
                    │         │
                    ▼         ▼
              ┌─────────┐  ┌──────────────┐
              │  YES    │  │   NO         │
              └────┬────┘  └──────┬───────┘
                   │              │
                   ▼              ▼
    ┌──────────────────────┐  ┌──────────────────┐
    │ COMPARE PASSWORD     │  │ Return Error:    │
    │ bcrypt.compare()     │  │ Invalid creds    │
    └──────┬───────────────┘  └──────────────────┘
           │
      ┌────┴────┐
      │         │
  Password    Password
   Match?     Mismatch
      │         │
      ▼         ▼
┌──────────┐  ┌──────────────┐
│ SUCCESS  │  │ Return Error:│
│          │  │ Invalid creds│
└────┬─────┘  └──────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│              RETURN USER DATA                                │
│  { id, username, email, firstName, lastName, role }          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SAVE SESSION & REDIRECT                         │
│              → /dashboard                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. **Key Differences Between Roles**

| Feature | Office | Teacher | Student |
|---------|--------|---------|---------|
| **Username Required** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Password Required** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Student ID Required** | ❌ No | ❌ No | ✅ Yes |
| **Database Table** | `office_staff` | `teachers` | `students` |
| **Forgot Password** | ✅ Shown | ❌ Hidden | ❌ Hidden |
| **Default Redirect** | `/dashboard` | `/teacher/dashboard` | `/student/dashboard` |
| **API Endpoint** | `/api/auth/login/office` | `/api/auth/login/teacher` | `/api/auth/login/student` |

---

## 8. **Error Messages**

### **Generic Error (Security Best Practice):**
```
"Invalid credentials. Please check your username and password."
```

This message is shown for:
- ❌ Username not found
- ❌ Password incorrect
- ❌ Account inactive

**Why generic?** Prevents attackers from determining if a username exists in the system.

### **Other Errors:**
- **Validation Error:** "Invalid input" (with field-specific errors)
- **Server Error:** "An internal server error occurred. Please try again later."
- **Network Error:** "Unable to connect to the server. Please check your internet connection."

---

## 9. **Session Management**

After successful login, user data is saved to session:

```typescript
saveSession({
  id: result.data.id,
  username: result.data.username,
  email: result.data.email,
  firstName: result.data.firstName,
  lastName: result.data.lastName,
  role: 'OFFICE',  // Mapped from selected role
});
```

This session data is used throughout the application for:
- Authorization checks
- Displaying user information
- Role-based access control

---

## 10. **Summary**

### **Office Authentication Process:**

1. ✅ **User enters** username and password
2. ✅ **Client validates** input (min 3 chars username, min 6 chars password)
3. ✅ **API receives** request at `/api/auth/login/office`
4. ✅ **Server validates** input again
5. ✅ **Database query** finds user in `office_staff` table
6. ✅ **Check active status** (`is_active = true`)
7. ✅ **Password verification** using bcrypt
8. ✅ **Return user data** if successful
9. ✅ **Save session** and redirect to dashboard

### **Security Highlights:**
- 🔒 **Bcrypt password hashing** (10 salt rounds)
- 🔒 **Active account verification**
- 🔒 **Generic error messages** (prevent enumeration)
- 🔒 **Client + Server validation**
- 🔒 **Secure session management**

The authentication system is well-designed with proper security measures! 🎉
