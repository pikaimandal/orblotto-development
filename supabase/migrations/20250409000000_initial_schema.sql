-- Create users table to store user profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create ticket types table
CREATE TABLE IF NOT EXISTS ticket_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,  -- e.g. 'Basic', 'Plus', 'Super', 'Mega', 'Jackpot'
  price DECIMAL(10, 2) NOT NULL,  -- in USD
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create draws table to store lottery draw information
CREATE TABLE IF NOT EXISTS draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_number SERIAL UNIQUE NOT NULL,
  draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
  winning_numbers TEXT[] NOT NULL,  -- Store as array of strings
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'completed', 'cancelled'
  prize_pool DECIMAL(20, 8) NOT NULL DEFAULT 0,  -- Total prize pool for this draw
  currency TEXT NOT NULL DEFAULT 'USDC',  -- Default to USDC but could be WLD or others
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create tickets table to store user tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  draw_id UUID REFERENCES draws(id) NOT NULL,
  ticket_type_id INTEGER REFERENCES ticket_types(id) NOT NULL,
  ticket_numbers TEXT[] NOT NULL,  -- Store as array of strings
  purchase_price DECIMAL(20, 8) NOT NULL,  -- Actual price paid
  currency TEXT NOT NULL,  -- 'USDC', 'WLD'
  transaction_hash TEXT,  -- Blockchain transaction hash if applicable
  is_winner BOOLEAN DEFAULT FALSE,
  winnings DECIMAL(20, 8) DEFAULT 0,  -- Amount won, if any
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create transactions table for tracking all financial transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  ticket_id UUID REFERENCES tickets(id),  -- Optional, only for ticket purchases
  transaction_type TEXT NOT NULL,  -- 'purchase', 'winning', 'refund', etc.
  amount DECIMAL(20, 8) NOT NULL,
  currency TEXT NOT NULL,  -- 'USDC', 'WLD'
  transaction_hash TEXT,  -- Blockchain transaction hash
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Insert default ticket types
INSERT INTO ticket_types (name, price, description) VALUES
  ('Basic', 2.00, 'Basic ORB Lotto ticket for $2'),
  ('Plus', 5.00, 'Plus ORB Lotto ticket for $5'),
  ('Super', 10.00, 'Super ORB Lotto ticket for $10'),
  ('Mega', 100.00, 'Mega ORB Lotto ticket for $100'),
  ('Jackpot', 500.00, 'Jackpot ORB Lotto ticket for $500');

-- Create RLS (Row Level Security) policies
-- Users can only view and edit their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Ticket policies
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);
  
-- Transaction policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Add service role policies for API access
CREATE POLICY "Service role can manage users" ON users
  FOR ALL TO service_role USING (true);
  
CREATE POLICY "Service role can manage tickets" ON tickets
  FOR ALL TO service_role USING (true);
  
CREATE POLICY "Service role can manage transactions" ON transactions
  FOR ALL TO service_role USING (true);

-- Create or replace function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create public views for transparency
CREATE VIEW public_draws AS
  SELECT draw_number, draw_date, winning_numbers, status, prize_pool, currency, completed_at
  FROM draws
  WHERE status = 'completed';

-- Check if wallet exists (case insensitive)
CREATE OR REPLACE FUNCTION check_wallet_exists(wallet_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  exists_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_count 
  FROM users 
  WHERE LOWER(wallet_address) = LOWER(wallet_to_check);
  
  RETURN exists_count > 0;
END;
$$ LANGUAGE plpgsql; 