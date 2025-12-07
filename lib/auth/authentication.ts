import { comparePassword } from '@/lib/utils/password';
import { findStudentByUsername, findTeacherByUsername } from '@/lib/database/operations';
import { supabase } from '@/lib/supabase';
import { Student, Teacher } from '@/lib/database/models';
// Audit logging removed

// Authentication response type
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    username?: string;
    email?: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// Context for audit logging (optional IP and user agent)
export interface AuthContext {
  ipAddress?: string;
  userAgent?: string;
}

// Office authentication (using username and password)
export async function authenticateOffice(
  username: string, 
  password: string,
  context?: AuthContext
): Promise<AuthResponse> {
  // Audit logging removed
  
  try {
    // Query office_staff table for matching username
    const { data: officeUser, error } = await supabase
      .from('office_staff')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !officeUser) {
      return {
        success: false,
        message: 'Invalid credentials. Please check your username and password.',
      };
    }

    // Compare password with stored hashed password
    const isPasswordValid = await comparePassword(password, officeUser.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials. Please check your username and password.',
      };
    }

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

// Teacher authentication
export async function authenticateTeacher(
  username: string, 
  password: string,
  context?: AuthContext
): Promise<AuthResponse> {
  // Audit logging removed
  
  try {
    // Find teacher by username
    const teacher: Teacher | null = await findTeacherByUsername(username);

    if (!teacher) {
      return {
        success: false,
        message: 'Invalid credentials. Please check your username and password.',
      };
    }

    // Check if teacher is active
    if (teacher.status !== 'ACTIVE') {
      return {
        success: false,
        message: 'Your account is inactive. Please contact administration.',
      };
    }

    // Compare password with stored hashed password
    const isPasswordValid = await comparePassword(password, teacher.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials. Please check your username and password.',
      };
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        id: teacher.id,
        username: teacher.username,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        role: 'teacher',
      },
    };
  } catch (error) {
    console.error('Teacher authentication error:', error);
    
    return {
      success: false,
      message: 'An error occurred during authentication. Please try again.',
    };
  }
}

// Student authentication (requires username, studentId, and password)
export async function authenticateStudent(
  username: string,
  studentId: string,
  password: string,
  context?: AuthContext
): Promise<AuthResponse> {
  // Audit logging removed
  
  try {
    console.log('🔐 Student Authentication Attempt:', {
      username,
      studentId,
      passwordLength: password.length
    });

    // Find student by username
    const student: Student | null = await findStudentByUsername(username);

    if (!student) {
      console.log('❌ Student not found with username:', username);
      
      return {
        success: false,
        message: 'Invalid credentials. Please check your username, student ID, and password.',
      };
    }

    console.log('✅ Student found:', {
      id: student.id,
      username: student.username,
      studentId: student.studentId,
      studentIdRef: student.studentIdRef,
      status: student.status
    });

    // Verify student ID matches (check both studentId and studentIdRef for flexibility)
    const studentIdMatches = student.studentId === studentId || student.studentIdRef === studentId;
    
    console.log('🔍 Student ID Check:', {
      providedStudentId: studentId,
      dbStudentId: student.studentId,
      dbStudentIdRef: student.studentIdRef,
      matches: studentIdMatches
    });
    
    if (!studentIdMatches) {
      console.log('❌ Student ID does not match');
      
      return {
        success: false,
        message: 'Invalid credentials. Please check your username, student ID, and password.',
      };
    }

    // Check if student is active
    if (student.status !== 'ACTIVE') {
      console.log('❌ Student account is not active:', student.status);
      
      return {
        success: false,
        message: 'Your account is inactive. Please contact administration.',
      };
    }

    // Compare password with stored hashed password
    console.log('🔑 Comparing passwords...');
    const isPasswordValid = await comparePassword(password, student.password);

    console.log('🔑 Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password is invalid');
      
      return {
        success: false,
        message: 'Invalid credentials. Please check your username, student ID, and password.',
      };
    }

    console.log('✅ Authentication successful for student:', student.username);

    return {
      success: true,
      message: 'Login successful',
      data: {
        id: student.id,
        username: student.username,
        firstName: student.firstName,
        lastName: student.lastName,
        role: 'student',
      },
    };
  } catch (error) {
    console.error('❌ Student authentication error:', error);
    
    return {
      success: false,
      message: 'An error occurred during authentication. Please try again.',
    };
  }
}
