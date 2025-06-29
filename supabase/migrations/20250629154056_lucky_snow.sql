/*
  # Create status change logs table

  1. New Tables
    - `status_change_logs`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `old_status` (text)
      - `new_status` (text)
      - `changed_by` (uuid, foreign key to auth.users)
      - `changed_by_email` (text)
      - `changed_at` (timestamp)
      - `notes` (text, optional)

  2. Security
    - Enable RLS on `status_change_logs` table
    - Add policies for admin access only
    - Add service role policy for full access

  3. Indexes
    - Add index on order_id for fast lookups
    - Add index on changed_at for chronological queries
*/

CREATE TABLE IF NOT EXISTS status_change_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  old_status text NOT NULL,
  new_status text NOT NULL,
  changed_by uuid NOT NULL,
  changed_by_email text NOT NULL,
  changed_at timestamptz DEFAULT now() NOT NULL,
  notes text
);

-- Add foreign key constraints
ALTER TABLE status_change_logs 
ADD CONSTRAINT status_change_logs_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE status_change_logs 
ADD CONSTRAINT status_change_logs_changed_by_fkey 
FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE status_change_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can view all status change logs"
  ON status_change_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert status change logs"
  ON status_change_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to status change logs"
  ON status_change_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS status_change_logs_order_id_idx ON status_change_logs(order_id);
CREATE INDEX IF NOT EXISTS status_change_logs_changed_at_idx ON status_change_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS status_change_logs_changed_by_idx ON status_change_logs(changed_by);