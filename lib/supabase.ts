/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getOptimizedSupabaseClient, executePooledQuery } from './config/database-pool'

let _supabaseClient: SupabaseClient | null = null

// Function to get Supabase client with lazy initialization
function getSupabaseClient(): SupabaseClient {
  if (_supabaseClient) {
    return _supabaseClient
  }

  // Try to use optimized pooled client first
  try {
    _supabaseClient = getOptimizedSupabaseClient()
    return _supabaseClient
  } catch (error) {
    console.warn('Failed to get optimized client, falling back to basic client:', error)
  }

  // Fallback to basic client configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file.')
  }

  _supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Disable session persistence for server-side usage
    },
    db: {
      schema: 'public', // Use public schema
    },
  })

  return _supabaseClient
}

// Export the client getter (lazy initialization)
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient()
    return (client as any)[prop]
  }
})

// Connection test function with pooled query execution
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    // Use pooled query execution for better performance
    const result = await executePooledQuery(async (client) => {
      const { data, error } = await client
        .from('students')
        .select('count')
        .limit(1)
      
      if (error) {
        throw new Error(`Connection test failed: ${error.message}`)
      }
      
      return data
    })
    
    console.log('Supabase connection successful (pooled)')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    
    // Fallback to direct client test
    try {
      const { data, error } = await supabase
        .from('students')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('Supabase connection test failed:', error.message)
        return false
      }
      
      console.log('Supabase connection successful (fallback)')
      return true
    } catch (fallbackError) {
      console.error('Supabase fallback connection test error:', fallbackError)
      return false
    }
  }
}

// Export pooled query execution utility
export { executePooledQuery }

// Export the client as default for convenience
export default supabase