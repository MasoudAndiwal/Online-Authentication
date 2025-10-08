#!/usr/bin/env node

/**
 * Database Operations Testing Script
 * 
 * This script tests the database operations directly to identify any issues
 * before testing the API endpoints.
 */

// Load environment variables BEFORE importing any modules
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

// Verify environment variables are loaded
console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');

import { createStudent, createTeacher } from '@/lib/database/operations';
import { StudentStatus, TeacherStatus } from '@/lib/database/models';

async function testDatabaseOperations() {
    console.log('🔍 Testing Database Operations...\n');

    try {
        // Test student creation
        console.log('📝 Testing Student Creation...');
        const studentData = {
            firstName: 'John',
            lastName: 'Doe',
            fatherName: 'Robert',
            grandFatherName: 'William',
            studentId: `${Date.now()}`.slice(-8),
            dateOfBirth: new Date('1995-01-15'),
            phone: '1234567890',
            fatherPhone: '0987654321',
            address: 'Test Address 123',
            programs: 'Computer Science, Mathematics',
            semester: '3',
            enrollmentYear: '2023',
            classSection: 'A',
            timeSlot: 'Morning',
            username: `john${Date.now()}`.slice(-10),
            studentIdRef: `STU${Date.now()}`.slice(-10),
            password: 'hashedpassword123',
            status: StudentStatus.ACTIVE,
        };

        const student = await createStudent(studentData);
        console.log('✅ Student created successfully:', student.id);

        // Test teacher creation
        console.log('\n👨‍🏫 Testing Teacher Creation...');
        const teacherData = {
            firstName: 'Jane',
            lastName: 'Smith',
            fatherName: 'Michael',
            grandFatherName: 'David',
            teacherId: `${Date.now()}`.slice(-8),
            dateOfBirth: new Date('1980-05-20'),
            phone: '1234567890',
            secondaryPhone: '0987654321',
            address: 'Teacher Address 456',
            departments: ['Computer Science', 'Information Technology'],
            qualification: 'PhD Computer Science',
            experience: '10',
            specialization: 'Machine Learning',
            subjects: ['Programming', 'Algorithms'],
            classes: ['CS101', 'CS201'],
            username: `jane${Date.now()}`.slice(-10),
            password: 'hashedpassword123',
            status: TeacherStatus.ACTIVE,
        };

        const teacher = await createTeacher(teacherData);
        console.log('✅ Teacher created successfully:', teacher.id);

        console.log('\n🎉 All database operations completed successfully!');

    } catch (error) {
        console.error('❌ Database operation failed:', error);

        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        process.exit(1);
    }
}

// Run the test
testDatabaseOperations();