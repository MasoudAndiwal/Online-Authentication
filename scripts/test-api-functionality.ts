#!/usr/bin/env node

/**
 * API Functionality Testing Script
 * 
 * This script tests all API endpoints to ensure identical behavior after Supabase migration.
 * It validates error responses, data validation, and business logic preservation.
 * 
 * Requirements tested: 2.1, 2.2, 2.3, 6.1, 6.2, 6.3
 */

import { config } from 'dotenv';

// Load environment variables
config();

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  response?: any;
}

class APITester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return {
        status: response.status,
        data,
        ok: response.ok,
      };
    } catch (error) {
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private addResult(name: string, passed: boolean, error?: string, response?: any) {
    this.results.push({ name, passed, error, response });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (error) {
      console.log(`   Error: ${error}`);
    }
  }

  // Test data generators
  private generateValidStudentData() {
    const timestamp = Date.now();
    return {
      firstName: 'John',
      lastName: 'Doe',
      fatherName: 'Robert',
      grandFatherName: 'William',
      studentId: `${timestamp}`.slice(-8), // Use last 8 digits of timestamp
      dateOfBirth: '1995/01/15',
      phone: '1234567890',
      fatherPhone: '0987654321',
      address: 'Test Address 123',
      programs: ['Computer Science', 'Mathematics'],
      semester: '3',
      enrollmentYear: '2023',
      classSection: 'A',
      timeSlot: 'Morning',
      username: `john${timestamp}`.slice(-10), // Ensure uniqueness
      studentIdRef: `STU${timestamp}`.slice(-10),
      password: 'Test123',
    };
  }

  private generateValidTeacherData() {
    const timestamp = Date.now();
    return {
      firstName: 'Jane',
      lastName: 'Smith',
      fatherName: 'Michael',
      grandFatherName: 'David',
      teacherId: `${timestamp}`.slice(-8),
      dateOfBirth: '1980/05/20',
      phone: '1234567890',
      secondaryPhone: '0987654321',
      address: 'Teacher Address 456',
      departments: ['Computer Science', 'Information Technology'],
      qualification: 'PhD Computer Science',
      experience: '10',
      specialization: 'Machine Learning',
      subjects: ['Programming', 'Algorithms'],
      classes: ['CS101', 'CS201'],
      employmentType: 'Full Time',
      username: `jane${timestamp}`.slice(-10),
      password: 'Test123',
    };
  }

  // Student API Tests
  async testStudentCreationSuccess() {
    try {
      const studentData = this.generateValidStudentData();
      const response = await this.makeRequest('/api/students', 'POST', studentData);

      if (response.status === 201 && response.data.id) {
        // Verify password is not returned
        if (response.data.password) {
          this.addResult('Student Creation Success', false, 'Password field should not be returned');
          return;
        }

        // Verify required fields are present
        const requiredFields = ['id', 'firstName', 'lastName', 'studentId', 'username'];
        const missingFields = requiredFields.filter(field => !response.data[field]);
        
        if (missingFields.length > 0) {
          this.addResult('Student Creation Success', false, `Missing fields: ${missingFields.join(', ')}`);
          return;
        }

        this.addResult('Student Creation Success', true, undefined, response.data);
      } else {
        this.addResult('Student Creation Success', false, `Unexpected response: ${response.status}`, response.data);
      }
    } catch (error) {
      this.addResult('Student Creation Success', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testStudentValidationErrors() {
    try {
      // Test with invalid data
      const invalidData = {
        firstName: '', // Required field empty
        lastName: 'Doe',
        fatherName: 'Robert',
        grandFatherName: 'William',
        studentId: '123', // Too short
        phone: '123', // Invalid phone
        fatherPhone: '0987654321',
        programs: [], // Empty array
        semester: '3',
        enrollmentYear: '2023',
        classSection: 'A',
        timeSlot: 'Morning',
        username: 'john123', // Invalid username (contains numbers)
        studentIdRef: 'STU123',
        password: 'weak', // Weak password
      };

      const response = await this.makeRequest('/api/students', 'POST', invalidData);

      if (response.status === 400 && response.data.error === 'Validation failed') {
        // Verify error format
        if (Array.isArray(response.data.details)) {
          const hasFieldAndMessage = response.data.details.every((detail: any) => 
            detail.field && detail.message
          );
          
          if (hasFieldAndMessage) {
            this.addResult('Student Validation Errors', true, undefined, response.data);
          } else {
            this.addResult('Student Validation Errors', false, 'Invalid error detail format');
          }
        } else {
          this.addResult('Student Validation Errors', false, 'Details should be an array');
        }
      } else {
        this.addResult('Student Validation Errors', false, `Expected 400 validation error, got ${response.status}`);
      }
    } catch (error) {
      this.addResult('Student Validation Errors', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testStudentDuplicateError() {
    try {
      const studentData = this.generateValidStudentData();
      
      // Create student first time
      const firstResponse = await this.makeRequest('/api/students', 'POST', studentData);
      
      if (firstResponse.status !== 201) {
        this.addResult('Student Duplicate Error', false, 'Failed to create initial student');
        return;
      }

      // Try to create same student again
      const duplicateResponse = await this.makeRequest('/api/students', 'POST', studentData);

      if (duplicateResponse.status === 409 || duplicateResponse.status === 400) {
        // Check if error message indicates duplicate/unique constraint
        const errorMessage = duplicateResponse.data.error?.toLowerCase() || '';
        if (errorMessage.includes('unique') || errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
          this.addResult('Student Duplicate Error', true, undefined, duplicateResponse.data);
        } else {
          this.addResult('Student Duplicate Error', false, 'Error message should indicate duplicate/unique constraint violation');
        }
      } else {
        this.addResult('Student Duplicate Error', false, `Expected 409 or 400 for duplicate, got ${duplicateResponse.status}`);
      }
    } catch (error) {
      this.addResult('Student Duplicate Error', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Teacher API Tests
  async testTeacherCreationSuccess() {
    try {
      const teacherData = this.generateValidTeacherData();
      const response = await this.makeRequest('/api/teachers', 'POST', teacherData);

      if (response.status === 201 && response.data.id) {
        // Verify password is not returned
        if (response.data.password) {
          this.addResult('Teacher Creation Success', false, 'Password field should not be returned');
          return;
        }

        // Verify required fields are present
        const requiredFields = ['id', 'firstName', 'lastName', 'teacherId', 'username'];
        const missingFields = requiredFields.filter(field => !response.data[field]);
        
        if (missingFields.length > 0) {
          this.addResult('Teacher Creation Success', false, `Missing fields: ${missingFields.join(', ')}`);
          return;
        }

        this.addResult('Teacher Creation Success', true, undefined, response.data);
      } else {
        this.addResult('Teacher Creation Success', false, `Unexpected response: ${response.status}`, response.data);
      }
    } catch (error) {
      this.addResult('Teacher Creation Success', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testTeacherValidationErrors() {
    try {
      // Test with invalid data
      const invalidData = {
        firstName: '', // Required field empty
        lastName: 'Smith',
        fatherName: 'Michael',
        grandFatherName: 'David',
        teacherId: '123', // Too short
        phone: '123', // Invalid phone
        departments: [], // Empty array
        qualification: '',
        experience: 'abc', // Should be numbers only
        specialization: '',
        subjects: [], // Empty array
        classes: [], // Empty array
        employmentType: '',
        username: 'jane123', // Invalid username (contains numbers)
        password: 'weak', // Weak password
      };

      const response = await this.makeRequest('/api/teachers', 'POST', invalidData);

      if (response.status === 400 && response.data.error === 'Validation failed') {
        // Verify error format
        if (Array.isArray(response.data.details)) {
          const hasFieldAndMessage = response.data.details.every((detail: any) => 
            detail.field && detail.message
          );
          
          if (hasFieldAndMessage) {
            this.addResult('Teacher Validation Errors', true, undefined, response.data);
          } else {
            this.addResult('Teacher Validation Errors', false, 'Invalid error detail format');
          }
        } else {
          this.addResult('Teacher Validation Errors', false, 'Details should be an array');
        }
      } else {
        this.addResult('Teacher Validation Errors', false, `Expected 400 validation error, got ${response.status}`);
      }
    } catch (error) {
      this.addResult('Teacher Validation Errors', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testTeacherDuplicateError() {
    try {
      const teacherData = this.generateValidTeacherData();
      
      // Create teacher first time
      const firstResponse = await this.makeRequest('/api/teachers', 'POST', teacherData);
      
      if (firstResponse.status !== 201) {
        this.addResult('Teacher Duplicate Error', false, 'Failed to create initial teacher');
        return;
      }

      // Try to create same teacher again
      const duplicateResponse = await this.makeRequest('/api/teachers', 'POST', teacherData);

      if (duplicateResponse.status === 409 || duplicateResponse.status === 400) {
        // Check if error message indicates duplicate/unique constraint
        const errorMessage = duplicateResponse.data.error?.toLowerCase() || '';
        if (errorMessage.includes('unique') || errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
          this.addResult('Teacher Duplicate Error', true, undefined, duplicateResponse.data);
        } else {
          this.addResult('Teacher Duplicate Error', false, 'Error message should indicate duplicate/unique constraint violation');
        }
      } else {
        this.addResult('Teacher Duplicate Error', false, `Expected 409 or 400 for duplicate, got ${duplicateResponse.status}`);
      }
    } catch (error) {
      this.addResult('Teacher Duplicate Error', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Test malformed JSON
  async testMalformedJSON() {
    try {
      const response = await fetch(`${this.baseUrl}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{ invalid json',
      });

      const data = await response.json();

      if (response.status === 400) {
        this.addResult('Malformed JSON Handling', true, undefined, data);
      } else {
        this.addResult('Malformed JSON Handling', false, `Expected 400 for malformed JSON, got ${response.status}`);
      }
    } catch (error) {
      this.addResult('Malformed JSON Handling', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting API Functionality Tests...\n');

    console.log('📝 Testing Student API...');
    await this.testStudentCreationSuccess();
    await this.testStudentValidationErrors();
    await this.testStudentDuplicateError();

    console.log('\n👨‍🏫 Testing Teacher API...');
    await this.testTeacherCreationSuccess();
    await this.testTeacherValidationErrors();
    await this.testTeacherDuplicateError();

    console.log('\n🔧 Testing Error Handling...');
    await this.testMalformedJSON();

    this.printSummary();
  }

  private printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error}`);
        });
    }

    console.log('\n' + '='.repeat(50));
    
    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Main execution
async function main() {
  const tester = new APITester();
  
  // Check if server is running
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Failed to run tests:', error instanceof Error ? error.message : 'Unknown error');
    console.log('\n Make sure your Next.js server is running on http://localhost:3000');
    console.log('   Run: npm run dev');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { APITester };