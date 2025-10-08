// Load environment variables first
require('dotenv').config()

async function main() {
  console.log('Testing Supabase connection...')
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set')
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set')
  
  // Import after environment is loaded
  const { testSupabaseConnection } = await import('../lib/supabase')
  
  try {
    const result = await testSupabaseConnection()
    console.log('Connection test result:', result)
    process.exit(result ? 0 : 1)
  } catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
  }
}

main()