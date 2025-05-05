-- Step 1: Drop dependent tables first to avoid constraint errors
-- Note: This is destructive - only run if you're okay losing existing data
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS tickets;

-- Step 2: Recreate the users table without auth.users reference
ALTER TABLE users DROP CONSTRAINT users_pkey;
ALTER TABLE users DROP CONSTRAINT users_id_fkey;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ADD PRIMARY KEY (id);

-- Step 3: Create additional RLS policies for service roles
-- Add policy for service roles and admin access
CREATE POLICY IF NOT EXISTS "Service roles can view all users" ON users
  FOR SELECT TO service_role USING (true);
  
CREATE POLICY IF NOT EXISTS "Service roles can insert users" ON users
  FOR INSERT TO service_role WITH CHECK (true);
  
CREATE POLICY IF NOT EXISTS "Service roles can update users" ON users
  FOR UPDATE TO service_role USING (true);

-- Step 4: Recreate tickets and transactions tables
CREATE TABLE IF NOT EXISTS tickets (
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
);

CREATE TABLE IF NOT EXISTS transactions (
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
);

-- Step 5: Add RLS policies for tickets and transactions
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Ticket policies
CREATE POLICY IF NOT EXISTS "Users can view their own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);
  
-- Add policy for service roles for tickets
CREATE POLICY IF NOT EXISTS "Service roles can view all tickets" ON tickets
  FOR SELECT TO service_role USING (true);
  
CREATE POLICY IF NOT EXISTS "Service roles can insert tickets" ON tickets
  FOR INSERT TO service_role WITH CHECK (true);

-- Transaction policies
CREATE POLICY IF NOT EXISTS "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
  
-- Add policy for service roles for transactions
CREATE POLICY IF NOT EXISTS "Service roles can view all transactions" ON transactions
  FOR SELECT TO service_role USING (true);
  
CREATE POLICY IF NOT EXISTS "Service roles can insert transactions" ON transactions
  FOR INSERT TO service_role WITH CHECK (true);

-- Step 6: Comment out or drop the auth webhook trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user(); 