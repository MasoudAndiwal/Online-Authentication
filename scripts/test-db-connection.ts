import { prisma } from '../lib/prisma'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Try to connect and query the database
    await prisma.$connect()
    console.log('✓ Successfully connected to database')
    
    // Test if we can query the Student table
    const studentCount = await prisma.student.count()
    console.log(`✓ Student table accessible (count: ${studentCount})`)
    
    // Test if we can query the Teacher table
    const teacherCount = await prisma.teacher.count()
    console.log(`✓ Teacher table accessible (count: ${teacherCount})`)
    
    console.log('\n✓ All database checks passed!')
  } catch (error) {
    console.error('✗ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
