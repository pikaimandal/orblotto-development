-- Create a simple increment function
CREATE OR REPLACE FUNCTION increment(x NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN x + 1;
END;
$$ LANGUAGE plpgsql;

-- Create a function to increment by an amount
CREATE OR REPLACE FUNCTION increment_by(base NUMERIC, amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN base + amount;
END;
$$ LANGUAGE plpgsql; 