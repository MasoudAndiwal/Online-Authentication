/**
 * Vitest Setup File
 * Global test configuration and setup
 */

// Load environment variables for tests
import dotenv from 'dotenv';
dotenv.config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
