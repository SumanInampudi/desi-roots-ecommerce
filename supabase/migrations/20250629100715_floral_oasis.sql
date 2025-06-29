/*
  # Create transactions table for payment processing

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key) - Unique transaction identifier
      - `order_id` (text) - Reference to the order being paid for
      - `user_id` (uuid) - Reference to the user making the payment
      - `amount` (numeric) - Payment amount
      - `currency` (text) - Currency code (default INR)
      - `payment_method` (text) - Payment method used
      - `upi_id` (text, nullable) - UPI ID if applicable
      - `transaction_id` (text, nullable) - External transaction ID from payment gateway
      - `status` (text) - Transaction status (pending, success, failed)
      - `gateway_response` (jsonb, nullable) - Response data from payment gateway
      - `created_at` (timestamp) - When transaction was created
      - `updated_at` (timestamp) - When transaction was last updated

  2. Security
    - Enable RLS on `transactions` table
    - Add policies for authenticated users to manage their own transactions
    - Add service role policy for full access

  3. Constraints
    - Add check constraint for valid status values
    - Add foreign key constraint to users table
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  user_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR' NOT NULL,
  payment_method text NOT NULL,
  upi_id text,
  transaction_id text,
  status text DEFAULT 'pending' NOT NULL,
  gateway_response jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add check constraint for status values
ALTER TABLE transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('pending', 'success', 'failed', 'cancelled'));

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to transactions"
  ON transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_order_id_idx ON transactions(order_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);