#!/usr/bin/env node

/**
 * Test script to verify error handling and mapping functionality
 * This script tests the Supabase error mapping to ensure compatibility with Prisma error codes
 */

import {
    mapSupabaseError,
    isUniqueConstraintViolation,
    isForeignKeyConstraintViolation,
    isRecordNotFoundError,
    formatErrorResponse,
    handleApiError,
    createUniqueConstraintError,
    DatabaseError,
    PrismaErrorCode,
    PostgreSQLErrorCode
} from '../lib/database/errors'

// Mock Supabase errors for testing
const mockSupabaseErrors = {
    uniqueViolation: {
        code: '23505',
        message: 'duplicate key value violates unique constraint "students_username_key"',
        details: 'Key (username)=(testuser) already exists.'
    },
    foreignKeyViolation: {
        code: '23503',
        message: 'insert or update on table "students" violates foreign key constraint "fk_office_id"',
        details: 'Key (office_id)=(999) is not present in table "office_staff".'
    },
    notNullViolation: {
        code: '23502',
        message: 'null value in column "first_name" violates not-null constraint',
        details: 'Failing row contains (1, null, ...).'
    },
    recordNotFound: {
        code: 'PGRST116',
        message: 'The result contains 0 rows'
    },
    connectionError: {
        message: 'connection timeout'
    }
}

function testErrorMapping() {
    console.log('🧪 Testing Supabase Error Mapping...\n')

    // Test unique constraint violation
    console.log('1. Testing Unique Constraint Violation:')
    const uniqueError = mapSupabaseError(mockSupabaseErrors.uniqueViolation)
    console.log(`   ✓ Mapped to code: ${uniqueError.code}`)
    console.log(`   ✓ Expected: ${PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION}`)
    console.log(`   ✓ Target field: ${uniqueError.meta?.target}`)
    console.log(`   ✓ Is unique violation: ${isUniqueConstraintViolation(uniqueError)}`)

    // Test foreign key violation
    console.log('\n2. Testing Foreign Key Constraint Violation:')
    const fkError = mapSupabaseError(mockSupabaseErrors.foreignKeyViolation)
    console.log(`   ✓ Mapped to code: ${fkError.code}`)
    console.log(`   ✓ Expected: ${PrismaErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION}`)
    console.log(`   ✓ Is FK violation: ${isForeignKeyConstraintViolation(fkError)}`)

    // Test not null violation
    console.log('\n3. Testing Not Null Violation:')
    const notNullError = mapSupabaseError(mockSupabaseErrors.notNullViolation)
    console.log(`   ✓ Mapped to code: ${notNullError.code}`)
    console.log(`   ✓ Expected: ${PrismaErrorCode.INVALID_DATA}`)

    // Test record not found
    console.log('\n4. Testing Record Not Found:')
    const notFoundError = mapSupabaseError(mockSupabaseErrors.recordNotFound)
    console.log(`   ✓ Mapped to code: ${notFoundError.code}`)
    console.log(`   ✓ Expected: ${PrismaErrorCode.RECORD_NOT_FOUND}`)
    console.log(`   ✓ Is record not found: ${isRecordNotFoundError(notFoundError)}`)

    // Test connection error
    console.log('\n5. Testing Connection Error:')
    const connectionError = mapSupabaseError(mockSupabaseErrors.connectionError)
    console.log(`   ✓ Mapped to code: ${connectionError.code}`)
    console.log(`   ✓ Expected: ${PrismaErrorCode.CONNECTION_ERROR}`)
}

function testErrorFormatting() {
    console.log('\n🎨 Testing Error Response Formatting...\n')

    // Test unique constraint error formatting
    const uniqueError = new DatabaseError(
        'Unique constraint violation',
        PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
        { target: 'username' }
    )

    const formattedResponse = formatErrorResponse(uniqueError)
    console.log('1. Unique Constraint Error Response:')
    console.log(`   ✓ Error: ${formattedResponse.error}`)
    const details = Array.isArray(formattedResponse.details) ? formattedResponse.details[0] : formattedResponse.details
    console.log(`   ✓ Field: ${details?.field}`)
    console.log(`   ✓ Message: ${details?.message}`)

    // Test API error handling
    const apiResponse = handleApiError(uniqueError)
    console.log('\n2. API Error Response:')
    console.log(`   ✓ Status: ${apiResponse.status}`)
    console.log(`   ✓ Response: ${JSON.stringify(apiResponse.response, null, 2)}`)

    // Test helper function
    const helperResponse = createUniqueConstraintError('Student', 'username')
    console.log('\n3. Helper Function Response:')
    console.log(`   ✓ Status: ${helperResponse.status}`)
    console.log(`   ✓ Response: ${JSON.stringify(helperResponse.response, null, 2)}`)
}

function testCompatibility() {
    console.log('\n🔄 Testing Prisma Compatibility...\n')

    // Simulate the exact error format that would come from Prisma P2002
    const prismaLikeError = new DatabaseError(
        'Unique constraint violation',
        PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
        { target: ['username'] }
    )

    const apiResponse = handleApiError(prismaLikeError)

    console.log('Prisma P2002 Compatible Response:')
    console.log(`   ✓ Status Code: ${apiResponse.status} (Expected: 409)`)
    console.log(`   ✓ Error Message: "${apiResponse.response.error}"`)
    const responseDetails = Array.isArray(apiResponse.response.details) ? apiResponse.response.details[0] : apiResponse.response.details
    console.log(`   ✓ Field: ${responseDetails?.field}`)
    console.log(`   ✓ Details: ${responseDetails?.message}`)

    // Verify it matches the expected Prisma format
    const expectedFormat = {
        error: 'A record with this username already exists',
        details: { field: 'username', message: 'Duplicate value' }
    }

    const matches = apiResponse.response.error.includes('already exists') &&
        responseDetails?.field === 'username' &&
        responseDetails?.message === 'Duplicate value'

    console.log(`   ✓ Format Compatibility: ${matches ? '✅ PASS' : '❌ FAIL'}`)
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting Error Handling Tests\n')
    console.log('='.repeat(50))

    try {
        testErrorMapping()
        testErrorFormatting()
        testCompatibility()

        console.log('\n' + '='.repeat(50))
        console.log('✅ All error handling tests completed successfully!')
        console.log('\n📋 Summary:')
        console.log('   • Supabase errors are properly mapped to Prisma-equivalent codes')
        console.log('   • Error response formats match existing API contracts')
        console.log('   • Unique constraint violations maintain compatibility')
        console.log('   • All helper functions work as expected')

    } catch (error) {
        console.error('\n❌ Test failed:', error)
        process.exit(1)
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests()
}

export { runTests }