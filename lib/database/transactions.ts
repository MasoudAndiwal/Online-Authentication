import { prisma, PrismaTransactionClient } from '@/lib/prisma'

/**
 * Execute a function within a Prisma transaction with proper error handling
 * and timeout configuration for multi-table operations
 */
export async function withTransaction<T>(
  operation: (tx: PrismaTransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(operation, {
    maxWait: 5000, // Maximum time to wait for a transaction slot (5 seconds)
    timeout: 10000, // Maximum time for the transaction to complete (10 seconds)
    isolationLevel: 'ReadCommitted', // Isolation level for concurrent operations
  })
}

/**
 * Execute multiple operations in a single transaction
 * Useful for batch operations that need to be atomic
 */
export async function withBatchTransaction<T>(
  operations: Array<(tx: PrismaTransactionClient) => Promise<T>>
): Promise<T[]> {
  return await withTransaction(async (tx) => {
    const results: T[] = []
    for (const operation of operations) {
      const result = await operation(tx)
      results.push(result)
    }
    return results
  })
}

/**
 * Execute an operation with retry logic for handling transient failures
 * Useful for operations that might fail due to concurrent access
 */
export async function withRetryTransaction<T>(
  operation: (tx: PrismaTransactionClient) => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 100
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(operation)
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on validation errors or other non-transient errors
      if (error instanceof Error && (
        error.message.includes('Unique constraint') ||
        error.message.includes('Foreign key constraint') ||
        error.message.includes('Check constraint')
      )) {
        throw error
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1)))
      }
    }
  }
  
  throw lastError || new Error('Transaction failed after maximum retries')
}

/**
 * Utility for creating a student with related data in a single transaction
 * Example of a domain-specific transaction utility
 */
export async function createStudentWithTransaction(
  studentData: any,
  additionalOperations?: (tx: PrismaTransactionClient, student: any) => Promise<void>
) {
  return await withTransaction(async (tx) => {
    // Create the student
    const student = await tx.student.create({
      data: studentData
    })
    
    // Execute any additional operations if provided
    if (additionalOperations) {
      await additionalOperations(tx, student)
    }
    
    return student
  })
}

/**
 * Utility for creating a teacher with related data in a single transaction
 * Example of a domain-specific transaction utility
 */
export async function createTeacherWithTransaction(
  teacherData: any,
  additionalOperations?: (tx: PrismaTransactionClient, teacher: any) => Promise<void>
) {
  return await withTransaction(async (tx) => {
    // Create the teacher
    const teacher = await tx.teacher.create({
      data: teacherData
    })
    
    // Execute any additional operations if provided
    if (additionalOperations) {
      await additionalOperations(tx, teacher)
    }
    
    return teacher
  })
}

/**
 * Utility for updating records with optimistic locking
 * Prevents concurrent modification conflicts
 */
export async function updateWithOptimisticLocking<T>(
  model: string,
  id: string,
  data: any,
  currentUpdatedAt: Date
): Promise<T> {
  return await withTransaction(async (tx) => {
    // Check if the record has been modified since we last read it
    const current = await (tx as any)[model].findUnique({
      where: { id },
      select: { updatedAt: true }
    })
    
    if (!current) {
      throw new Error(`${model} with id ${id} not found`)
    }
    
    if (current.updatedAt.getTime() !== currentUpdatedAt.getTime()) {
      throw new Error(`${model} has been modified by another user. Please refresh and try again.`)
    }
    
    // Update the record
    return await (tx as any)[model].update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  })
}