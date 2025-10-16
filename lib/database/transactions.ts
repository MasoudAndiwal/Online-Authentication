/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Transaction context for Supabase operations
 * Since Supabase doesn't have built-in transactions like Prisma,
 * we simulate transaction behavior using RPC functions or manual rollback
 */
export interface SupabaseTransactionContext {
  client: SupabaseClient
  rollbackOperations: Array<() => Promise<void>>
  addRollback: (rollbackFn: () => Promise<void>) => void
}

/**
 * Execute a function within a Supabase transaction-like context with proper error handling
 * and timeout configuration for multi-table operations
 */
export async function withTransaction<T>(
  operation: (tx: SupabaseTransactionContext) => Promise<T>
): Promise<T> {
  const rollbackOperations: Array<() => Promise<void>> = []
  const transactionContext: SupabaseTransactionContext = {
    client: supabase,
    rollbackOperations,
    addRollback: (rollbackFn: () => Promise<void>) => {
      rollbackOperations.push(rollbackFn)
    }
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Transaction timeout after 10 seconds')), 10000)
  })

  try {
    // Execute the operation with timeout
    const result = await Promise.race([
      operation(transactionContext),
      timeoutPromise
    ])
    
    return result
  } catch (error) {
    // Rollback operations in reverse order
    for (let i = rollbackOperations.length - 1; i >= 0; i--) {
      try {
        await rollbackOperations[i]()
      } catch (rollbackError) {
        console.error('Rollback operation failed:', rollbackError)
      }
    }
    throw error
  }
}

/**
 * Execute multiple operations in a single transaction
 * Useful for batch operations that need to be atomic
 */
export async function withBatchTransaction<T>(
  operations: Array<(tx: SupabaseTransactionContext) => Promise<T>>
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
  operation: (tx: SupabaseTransactionContext) => Promise<T>,
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
        error.message.includes('duplicate key') ||
        error.message.includes('violates foreign key') ||
        error.message.includes('violates check constraint') ||
        error.message.includes('23505') || // Unique constraint violation
        error.message.includes('23503') || // Foreign key constraint violation
        error.message.includes('23514')    // Check constraint violation
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
  studentData: import('./models').StudentCreateInput,
  additionalOperations?: (tx: SupabaseTransactionContext, student: import('./models').Student) => Promise<void>
): Promise<import('./models').Student> {
  return await withTransaction(async (tx) => {
    // Add timestamps
    const dataWithTimestamps = {
      ...studentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: studentData.status || 'ACTIVE'
    }
    
    // Create the student
    const { data: student, error } = await tx.client
      .from('students')
      .insert(dataWithTimestamps)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Add rollback operation for the created student
    tx.addRollback(async () => {
      await tx.client
        .from('students')
        .delete()
        .eq('id', student.id)
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
  teacherData: import('./models').TeacherCreateInput,
  additionalOperations?: (tx: SupabaseTransactionContext, teacher: import('./models').Teacher) => Promise<void>
): Promise<import('./models').Teacher> {
  return await withTransaction(async (tx) => {
    // Add timestamps
    const dataWithTimestamps = {
      ...teacherData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: teacherData.status || 'ACTIVE'
    }
    
    // Create the teacher
    const { data: teacher, error } = await tx.client
      .from('teachers')
      .insert(dataWithTimestamps)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Add rollback operation for the created teacher
    tx.addRollback(async () => {
      await tx.client
        .from('teachers')
        .delete()
        .eq('id', teacher.id)
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
  tableName: string,
  id: string,
  data: any,
  currentUpdatedAt: Date
): Promise<T> {
  return await withTransaction(async (tx) => {
    // Check if the record has been modified since we last read it
    const { data: current, error: fetchError } = await tx.client
      .from(tableName)
      .select('updatedAt')
      .eq('id', id)
      .single()
    
    if (fetchError || !current) {
      throw new Error(`${tableName} with id ${id} not found`)
    }
    
    const currentTime = new Date(current.updatedAt).getTime()
    const expectedTime = currentUpdatedAt.getTime()
    
    if (currentTime !== expectedTime) {
      throw new Error(`${tableName} has been modified by another user. Please refresh and try again.`)
    }
    
    // Store original data for rollback
    const { data: originalRecord } = await tx.client
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()
    
    // Update the record
    const { data: updatedRecord, error: updateError } = await tx.client
      .from(tableName)
      .update({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      throw updateError
    }
    
    // Add rollback operation
    if (originalRecord) {
      tx.addRollback(async () => {
        await tx.client
          .from(tableName)
          .update(originalRecord)
          .eq('id', id)
      })
    }
    
    return updatedRecord as T
  })
}
/**
 * E
xecute a Supabase RPC function within a transaction context
 * Useful for complex operations that require database-level transactions
 */
export async function executeRPC<T>(
  functionName: string,
  params?: Record<string, any>
): Promise<T> {
  const { data, error } = await supabase.rpc(functionName, params)
  
  if (error) {
    throw error
  }
  
  return data as T
}

/**
 * Create a batch operation that can be executed atomically
 * Returns a function that can be used within withTransaction
 */
export function createBatchOperation<T>(
  operations: Array<{
    table: string
    operation: 'insert' | 'update' | 'delete'
    data?: any
    filter?: Record<string, any>
  }>
) {
  return async (tx: SupabaseTransactionContext): Promise<T[]> => {
    const results: T[] = []
    
    for (const op of operations) {
      let result: any
      let rollbackFn: (() => Promise<void>) | null = null
      
      switch (op.operation) {
        case 'insert':
          const { data: insertedData, error: insertError } = await tx.client
            .from(op.table)
            .insert(op.data)
            .select()
            .single()
          
          if (insertError) throw insertError
          
          result = insertedData
          rollbackFn = async () => {
            await tx.client
              .from(op.table)
              .delete()
              .eq('id', insertedData.id)
          }
          break
          
        case 'update':
          // Get original data for rollback
          const { data: originalData } = await tx.client
            .from(op.table)
            .select('*')
            .match(op.filter || {})
            .single()
          
          const { data: updatedData, error: updateError } = await tx.client
            .from(op.table)
            .update(op.data)
            .match(op.filter || {})
            .select()
            .single()
          
          if (updateError) throw updateError
          
          result = updatedData
          if (originalData) {
            rollbackFn = async () => {
              await tx.client
                .from(op.table)
                .update(originalData)
                .eq('id', originalData.id)
            }
          }
          break
          
        case 'delete':
          // Get data before deletion for rollback
          const { data: dataToDelete } = await tx.client
            .from(op.table)
            .select('*')
            .match(op.filter || {})
            .single()
          
          const { error: deleteError } = await tx.client
            .from(op.table)
            .delete()
            .match(op.filter || {})
          
          if (deleteError) throw deleteError
          
          result = dataToDelete
          if (dataToDelete) {
            rollbackFn = async () => {
              await tx.client
                .from(op.table)
                .insert(dataToDelete)
            }
          }
          break
      }
      
      if (rollbackFn) {
        tx.addRollback(rollbackFn)
      }
      
      results.push(result)
    }
    
    return results
  }
}

/**
 * Utility for handling concurrent operations with retry logic
 * Specifically designed for Supabase's eventual consistency model
 */
export async function withConcurrencyControl<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 100
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Check if it's a concurrency-related error
      const isConcurrencyError = error instanceof Error && (
        error.message.includes('conflict') ||
        error.message.includes('concurrent') ||
        error.message.includes('lock') ||
        error.message.includes('timeout')
      )
      
      if (!isConcurrencyError || attempt === maxRetries) {
        throw error
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
      )
    }
  }
  
  throw lastError || new Error('Operation failed after maximum retries')
}

/**
 * Utility for creating an office staff member with related data in a single transaction
 * 
 * @param officeData Office staff data to be created
 * @param additionalOperations Optional additional operations to be executed within the transaction
 * @returns Created office staff member
 */
export async function createOfficeWithTransaction(
  officeData: import('./models').OfficeCreateInput,
  additionalOperations?: (tx: SupabaseTransactionContext, office: import('./models').Office) => Promise<void>
): Promise<import('./models').Office> {
  return await withTransaction(async (tx) => {
    // Add timestamps
    const dataWithTimestamps = {
      ...officeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: officeData.role || 'STAFF',
      isActive: officeData.isActive !== undefined ? officeData.isActive : true
    }
    
    // Create the office staff member
    const { data: office, error } = await tx.client
      .from('office_staff')
      .insert(dataWithTimestamps)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Add rollback operation for the created office staff
    tx.addRollback(async () => {
      await tx.client
        .from('office_staff')
        .delete()
        .eq('id', office.id)
    })
    
    // Execute any additional operations if provided
    if (additionalOperations) {
      await additionalOperations(tx, office)
    }
    
    return office
  })
}

/**
 * Update a student with optimistic locking and transaction support
 */
export async function updateStudentWithTransaction(
  id: string,
  updateData: import('./models').StudentUpdateInput,
  currentUpdatedAt: Date,
  additionalOperations?: (tx: SupabaseTransactionContext, student: import('./models').Student) => Promise<void>
): Promise<import('./models').Student> {
  return await withRetryTransaction(async (tx) => {
    // Check if the record has been modified since we last read it
    const { data: current, error: fetchError } = await tx.client
      .from('students')
      .select('updatedAt')
      .eq('id', id)
      .single()
    
    if (fetchError || !current) {
      throw new Error(`Student with id ${id} not found`)
    }
    
    const currentTime = new Date(current.updatedAt).getTime()
    const expectedTime = currentUpdatedAt.getTime()
    
    if (currentTime !== expectedTime) {
      throw new Error('Student has been modified by another user. Please refresh and try again.')
    }
    
    // Store original data for rollback
    const { data: originalRecord } = await tx.client
      .from('students')
      .select('*')
      .eq('id', id)
      .single()
    
    // Update the record
    const { data: updatedStudent, error: updateError } = await tx.client
      .from('students')
      .update({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      throw updateError
    }
    
    // Add rollback operation
    if (originalRecord) {
      tx.addRollback(async () => {
        await tx.client
          .from('students')
          .update(originalRecord)
          .eq('id', id)
      })
    }
    
    // Execute any additional operations if provided
    if (additionalOperations) {
      await additionalOperations(tx, updatedStudent)
    }
    
    return updatedStudent
  }, 3, 200) // 3 retries with 200ms base delay
}

/**
 * Update a teacher with optimistic locking and transaction support
 */
export async function updateTeacherWithTransaction(
  id: string,
  updateData: import('./models').TeacherUpdateInput,
  currentUpdatedAt: Date,
  additionalOperations?: (tx: SupabaseTransactionContext, teacher: import('./models').Teacher) => Promise<void>
): Promise<import('./models').Teacher> {
  return await withRetryTransaction(async (tx) => {
    // Check if the record has been modified since we last read it
    const { data: current, error: fetchError } = await tx.client
      .from('teachers')
      .select('updatedAt')
      .eq('id', id)
      .single()
    
    if (fetchError || !current) {
      throw new Error(`Teacher with id ${id} not found`)
    }
    
    const currentTime = new Date(current.updatedAt).getTime()
    const expectedTime = currentUpdatedAt.getTime()
    
    if (currentTime !== expectedTime) {
      throw new Error('Teacher has been modified by another user. Please refresh and try again.')
    }
    
    // Store original data for rollback
    const { data: originalRecord } = await tx.client
      .from('teachers')
      .select('*')
      .eq('id', id)
      .single()
    
    // Update the record
    const { data: updatedTeacher, error: updateError } = await tx.client
      .from('teachers')
      .update({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      throw updateError
    }
    
    // Add rollback operation
    if (originalRecord) {
      tx.addRollback(async () => {
        await tx.client
          .from('teachers')
          .update(originalRecord)
          .eq('id', id)
      })
    }
    
    // Execute any additional operations if provided
    if (additionalOperations) {
      await additionalOperations(tx, updatedTeacher)
    }
    
    return updatedTeacher
  }, 3, 200) // 3 retries with 200ms base delay
}

/**
 * Bulk create students with transaction support and rollback capability
 */
export async function bulkCreateStudentsWithTransaction(
  studentsData: import('./models').StudentCreateInput[]
): Promise<import('./models').Student[]> {
  return await withTransaction(async (tx) => {
    const createdStudents: import('./models').Student[] = []
    
    for (const studentData of studentsData) {
      const dataWithTimestamps = {
        ...studentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: studentData.status || 'ACTIVE'
      }
      
      const { data: student, error } = await tx.client
        .from('students')
        .insert(dataWithTimestamps)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      createdStudents.push(student)
    }
    
    // Add rollback operation for all created students
    tx.addRollback(async () => {
      const studentIds = createdStudents.map(s => s.id)
      await tx.client
        .from('students')
        .delete()
        .in('id', studentIds)
    })
    
    return createdStudents
  })
}

/**
 * Bulk create teachers with transaction support and rollback capability
 */
export async function bulkCreateTeachersWithTransaction(
  teachersData: import('./models').TeacherCreateInput[]
): Promise<import('./models').Teacher[]> {
  return await withTransaction(async (tx) => {
    const createdTeachers: import('./models').Teacher[] = []
    
    for (const teacherData of teachersData) {
      const dataWithTimestamps = {
        ...teacherData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: teacherData.status || 'ACTIVE'
      }
      
      const { data: teacher, error } = await tx.client
        .from('teachers')
        .insert(dataWithTimestamps)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      createdTeachers.push(teacher)
    }
    
    // Add rollback operation for all created teachers
    tx.addRollback(async () => {
      const teacherIds = createdTeachers.map(t => t.id)
      await tx.client
        .from('teachers')
        .delete()
        .in('id', teacherIds)
    })
    
    return createdTeachers
  })
}