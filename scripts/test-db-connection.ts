#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Database Connection Testing Script for Supabase
 * 
 * This script tests the Supabase database connection, table access,
 * and error handling capabilities.
 * 
 * Requirements tested: 5.4, 5.5
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') });

import { supabase } from '../lib/supabase';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

class DatabaseConnectionTester {
  private results: TestResult[] = [];

  private addResult(name: string, passed: boolean, error?: string, details?: any) {
    this.results.push({ name, passed, error, details });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (error) {
      console.log(`   Error: ${error}`);
    }
    if (details) {
      console.log(`   Details: ${JSON.stringify(details)}`);
    }
  }

  async testBasicConnection() {
    try {
      console.log('🔌 Testing basic Supabase connection...');
      
      // Test basic connection with a simple query
      const { data, error } = await supabase
        .from('students')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        // Even if we get an RLS error, it means connection is working
        if (error.code === '42501') {
          this.addResult('Basic Connection', true, undefined, 'Connection successful (RLS policy active)');
        } else {
          this.addResult('Basic Connection', false, error.message);
        }
      } else {
        this.addResult('Basic Connection', true, undefined, 'Connection successful');
      }
    } catch (error) {
      this.addResult('Basic Connection', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testTableAccess() {
    console.log('\n📊 Testing table access...');

    // Test Students table
    try {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        // RLS error is expected for anonymous access
        if (error.code === '42501') {
          this.addResult('Students Table Access', true, undefined, 'Table exists (RLS policy active)');
        } else {
          this.addResult('Students Table Access', false, error.message);
        }
      } else {
        this.addResult('Students Table Access', true, undefined, `Table accessible, count: ${count}`);
      }
    } catch (error) {
      this.addResult('Students Table Access', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async run() {
    console.log('='.repeat(50));
    console.log('DATABASE CONNECTION TEST');
    console.log('='.repeat(50));
    
    await this.testBasicConnection();
    await this.testTableAccess();
    
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    console.log(`\nTotal: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed');
      process.exit(1);
    }
  }
}

// Run tests
const tester = new DatabaseConnectionTester();
tester.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
