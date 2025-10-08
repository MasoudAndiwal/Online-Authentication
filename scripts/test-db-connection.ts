#!/usr/bin/env node

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
          this.addResult('Students Table Access', fal
