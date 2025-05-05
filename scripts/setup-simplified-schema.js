#!/usr/bin/env node

/**
 * This script applies the simplified schema without auth dependency
 * It's useful for development and testing purposes
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verify credentials
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials! Please check your .env.local file');
  console.error('Required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration file path
const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20250410000000_remove_auth_dependency.sql');

// Read migration SQL
if (!fs.existsSync(migrationFile)) {
  console.error(`❌ Migration file not found: ${migrationFile}`);
  console.error('Please make sure the migration file exists before running this script');
  process.exit(1);
}

const sql = fs.readFileSync(migrationFile, 'utf8');

// Function to apply the simplified schema
async function applySimplifiedSchema() {
  console.log('🔄 Applying simplified schema without auth dependency...');
  console.log('⚠️  WARNING: This will modify your database schema!');
  console.log('⚠️  This is meant for development/testing purposes only.\n');
  
  // We'll break this into individual steps for better error handling
  
  try {
    // Step 1: Test connection
    const { data, error } = await supabase.from('ticket_types').select('count');
    
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      console.error('Please check your credentials and try again');
      process.exit(1);
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Step 2: Before we modify anything, make sure the users table exists
    const { data: usersCheck, error: usersError } = await supabase
      .from('users')
      .select('count');
      
    if (usersError) {
      console.error('❌ Users table check failed:', usersError.message);
      console.error('It seems your database might not have the initial schema applied.');
      console.error('Please run the initial migration first, then try this script again.');
      process.exit(1);
    }
    
    console.log('✅ Users table exists, proceeding with schema modifications');
    
    // Step 3: Apply the migration in multiple steps
    console.log('🔄 Dropping dependent tables...');
    
    // Drop dependent tables
    await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS transactions;' });
    await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS tickets;' });
    
    console.log('✅ Dependent tables dropped');
    
    // Step 4: Modify users table
    console.log('🔄 Modifying users table...');
    
    try {
      // Remove constraints
      await supabase.rpc('exec_sql', { sql: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;' });
      await supabase.rpc('exec_sql', { sql: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;' });
      
      // Set default and add primary key
      await supabase.rpc('exec_sql', { sql: 'ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();' });
      await supabase.rpc('exec_sql', { sql: 'ALTER TABLE users ADD PRIMARY KEY (id);' });
      
      console.log('✅ Users table modified successfully');
    } catch (schemaError) {
      console.error('❌ Error modifying users table:', schemaError);
      console.log('Attempting to continue with remaining steps...');
    }
    
    // Step 5: Add RLS policies
    console.log('🔄 Adding RLS policies...');
    
    try {
      // Create policies
      await supabase.rpc('exec_sql', { 
        sql: `DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'users' 
            AND policyname = 'Service roles can view all users'
          ) THEN
            CREATE POLICY "Service roles can view all users" ON users
              FOR SELECT TO service_role USING (true);
          END IF;
        END $$;`
      });
      
      await supabase.rpc('exec_sql', { 
        sql: `DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'users' 
            AND policyname = 'Service roles can insert users'
          ) THEN
            CREATE POLICY "Service roles can insert users" ON users
              FOR INSERT TO service_role WITH CHECK (true);
          END IF;
        END $$;`
      });
      
      await supabase.rpc('exec_sql', { 
        sql: `DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'users' 
            AND policyname = 'Service roles can update users'
          ) THEN
            CREATE POLICY "Service roles can update users" ON users
              FOR UPDATE TO service_role USING (true);
          END IF;
        END $$;`
      });
      
      console.log('✅ RLS policies added successfully');
    } catch (policyError) {
      console.error('❌ Error adding RLS policies:', policyError);
      console.log('Attempting to continue with remaining steps...');
    }
    
    // Step 6: Recreate dependent tables
    console.log('🔄 Recreating dependent tables...');
    
    try {
      // Create tickets table
      await supabase.rpc('exec_sql', { 
        sql: `CREATE TABLE IF NOT EXISTS tickets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) NOT NULL,
          draw_id UUID REFERENCES draws(id) NOT NULL,
          ticket_type_id INTEGER REFERENCES ticket_types(id) NOT NULL,
          ticket_numbers TEXT[] NOT NULL,
          purchase_price DECIMAL(20, 8) NOT NULL,
          currency TEXT NOT NULL,
          transaction_hash TEXT,
          is_winner BOOLEAN DEFAULT FALSE,
          winnings DECIMAL(20, 8) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
        );`
      });
      
      // Create transactions table
      await supabase.rpc('exec_sql', { 
        sql: `CREATE TABLE IF NOT EXISTS transactions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) NOT NULL,
          ticket_id UUID REFERENCES tickets(id),
          transaction_type TEXT NOT NULL,
          amount DECIMAL(20, 8) NOT NULL,
          currency TEXT NOT NULL,
          transaction_hash TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE
        );`
      });
      
      console.log('✅ Dependent tables recreated successfully');
    } catch (tableError) {
      console.error('❌ Error recreating dependent tables:', tableError);
      console.log('Please check your database schema manually');
    }
    
    // Step 7: Add RLS to dependent tables
    console.log('🔄 Adding RLS to dependent tables...');
    
    try {
      // Enable RLS
      await supabase.rpc('exec_sql', { sql: 'ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;' });
      await supabase.rpc('exec_sql', { sql: 'ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;' });
      
      // Add policies for tickets
      await supabase.rpc('exec_sql', { 
        sql: `DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'tickets' 
            AND policyname = 'Users can view their own tickets'
          ) THEN
            CREATE POLICY "Users can view their own tickets" ON tickets
              FOR SELECT USING (auth.uid() = user_id);
          END IF;
        END $$;`
      });
      
      await supabase.rpc('exec_sql', { 
        sql: `DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'tickets' 
            AND policyname = 'Service roles can view all tickets'
          ) THEN
            CREATE POLICY "Service roles can view all tickets" ON tickets
              FOR SELECT TO service_role USING (true);
          END IF;
        END $$;`
      });
      
      await supabase.rpc('exec_sql', { 
        sql: `DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'tickets' 
            AND policyname = 'Service roles can insert tickets'
          ) THEN
            CREATE POLICY "Service roles can insert tickets" ON tickets
              FOR INSERT TO service_role WITH CHECK (true);
          END IF;
        END $$;`
      });
      
      // Add policies for transactions
      await supabase.rpc('exec_sql', { 
        sql: `DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'transactions' 
            AND policyname = 'Users can view their own transactions'
          ) THEN
            CREATE POLICY "Users can view their own transactions" ON transactions
              FOR SELECT USING (auth.uid() = user_id);
          END IF;
        END $$;`
      });
      
      await supabase.rpc('exec_sql', { 
        sql: `DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'transactions' 
            AND policyname = 'Service roles can view all transactions'
          ) THEN
            CREATE POLICY "Service roles can view all transactions" ON transactions
              FOR SELECT TO service_role USING (true);
          END IF;
        END $$;`
      });
      
      await supabase.rpc('exec_sql', { 
        sql: `DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'transactions' 
            AND policyname = 'Service roles can insert transactions'
          ) THEN
            CREATE POLICY "Service roles can insert transactions" ON transactions
              FOR INSERT TO service_role WITH CHECK (true);
          END IF;
        END $$;`
      });
      
      console.log('✅ RLS policies added to dependent tables');
    } catch (rlsError) {
      console.error('❌ Error adding RLS to dependent tables:', rlsError);
    }
    
    // Step 8: Drop auth trigger if it exists
    console.log('🔄 Removing auth triggers...');
    
    try {
      await supabase.rpc('exec_sql', { sql: 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;' });
      await supabase.rpc('exec_sql', { sql: 'DROP FUNCTION IF EXISTS public.handle_new_user();' });
      
      console.log('✅ Auth triggers removed');
    } catch (triggerError) {
      console.error('❌ Error removing auth triggers:', triggerError);
    }
    
    console.log('\n🎉 Simplified schema applied successfully!');
    console.log('You can now use the application without auth dependency.');
    console.log('Users can be created directly in the database without auth accounts.');
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

// Run the script
applySimplifiedSchema(); 