/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseClient: SupabaseClient | null = null

// Function to get Supabase client with lazy initialization
function getSupabaseClient(): SupabaseClient {
  if (_supabaseClient) {
    return _supabaseClient
  }

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

// Connection test function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error.message)
      return false
    }
    
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}

// Export the client as default for convenience
export default supabase