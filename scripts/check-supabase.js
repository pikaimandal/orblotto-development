#!/usr/bin/env node

// Simple script to check Supabase connectivity and configuration
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Output environment information
console.log('\n--- SUPABASE CONFIGURATION CHECK ---\n');

// Check URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
if (supabaseUrl) {
  console.log(`  URL: ${supabaseUrl}`);
} else {
  console.error('  Error: NEXT_PUBLIC_SUPABASE_URL is not defined in .env.local');
}

// Check anon key
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
if (!supabaseAnonKey) {
  console.error('  Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in .env.local');
}

// Check service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);
if (!supabaseServiceKey) {
  console.error('  Error: SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local');
  console.error('  This key is required for admin operations like user creation');
}

// If we don't have the necessary variables, exit
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Required Supabase configuration is missing. Please check your .env.local file.');
  process.exit(1);
}

// Try to connect to Supabase
console.log('\n--- TESTING SUPABASE CONNECTIVITY ---\n');

// Regular client
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Testing public client connection...');

(async () => {
  try {
    const { data, error } = await supabase.from('ticket_types').select('*').limit(1);
    
    if (error) {
      console.error('❌ Public client connection failed:');
      console.error(`  Error: ${error.message}`);
    } else {
      console.log('✅ Public client connection successful');
      console.log(`  Retrieved ${data.length} ticket types`);
    }
    
    // Admin client (if service key is available)
    if (supabaseServiceKey) {
      console.log('\nTesting admin client connection...');
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      try {
        // Try to query users table which requires admin privileges
        const { data: userData, error: userError } = await supabaseAdmin.from('users').select('*').limit(1);
        
        if (userError) {
          console.error('❌ Admin client connection failed:');
          console.error(`  Error: ${userError.message}`);
        } else {
          console.log('✅ Admin client connection successful');
          console.log(`  Retrieved ${userData.length} users`);
        }
        
        // Test admin-specific API
        console.log('\nTesting admin-specific APIs...');
        try {
          // Check if we can get postgres version - admin only operation
          const { data: versionData, error: versionError } = await supabaseAdmin.rpc('postgres_version');
          
          if (versionError) {
            console.error('❌ Admin API access failed:');
            console.error(`  Error: ${versionError.message}`);
          } else {
            console.log('✅ Admin API access successful');
            console.log(`  Postgres version: ${versionData}`);
          }
        } catch (adminApiError) {
          console.error('❌ Admin API access failed:');
          console.error(`  Error: ${adminApiError.message}`);
        }
      } catch (adminError) {
        console.error('❌ Admin client connection failed:');
        console.error(`  Error: ${adminError.message}`);
      }
    }
    
    console.log('\n--- CONFIGURATION RECOMMENDATIONS ---\n');
    
    // Provide recommendations based on findings
    if (!supabaseServiceKey) {
      console.log('- Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file');
      console.log('  This is required for user creation and other admin operations');
    }
    
    // Check if we need RLS policy adjustments
    console.log('- Ensure Row Level Security (RLS) policies are configured correctly');
    console.log('- Verify database schema matches your expected structure');
    console.log('- Check that your Supabase project has the proper migrations applied');
    
    console.log('\nFor detailed setup instructions, refer to SUPABASE_SETUP.md');
    
  } catch (error) {
    console.error('❌ Connection test failed with unexpected error:');
    console.error(error);
  }
})(); 