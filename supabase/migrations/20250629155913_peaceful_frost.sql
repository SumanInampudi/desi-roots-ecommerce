/*
  # Performance Optimization Database Indexes

  1. Indexes for Orders Table
    - Composite index on user_id + created_at for efficient user order queries
    - Index on order_status for status filtering
    - Index on payment_status for payment filtering
    - Index on order_number for quick lookups

  2. Indexes for Profiles Table
    - Index on email for user lookups
    - Index on is_admin for admin queries
    - Index on is_active for active user filtering

  3. Indexes for Cart Items Table
    - Composite index on user_id + created_at for user cart queries
    - Index on product_id for product-based queries

  4. Indexes for Transactions Table
    - Composite index on user_id + created_at for user transaction history
    - Index on status for transaction status filtering
    - Index on payment_method for payment method analysis

  5. Indexes for Favorites Table
    - Composite index on user_id + created_at for user favorites
    - Index on product_id for product popularity analysis
*/

-- Orders table performance indexes
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(order_status);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

-- Profiles table performance indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_admin_idx ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS profiles_active_idx ON profiles(is_active);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at DESC);

-- Cart items table performance indexes
CREATE INDEX IF NOT EXISTS cart_items_user_created_idx ON cart_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cart_items_product_idx ON cart_items(product_id);

-- Transactions table performance indexes
CREATE INDEX IF NOT EXISTS transactions_user_created_idx ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_payment_method_idx ON transactions(payment_method);

-- Favorites table performance indexes (already exists but ensuring completeness)
CREATE INDEX IF NOT EXISTS favorites_user_created_idx ON favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS favorites_product_popularity_idx ON favorites(product_id, created_at DESC);

-- Status change logs performance indexes
CREATE INDEX IF NOT EXISTS status_change_logs_order_created_idx ON status_change_logs(order_id, changed_at DESC);

-- Add partial indexes for common query patterns
CREATE INDEX IF NOT EXISTS orders_pending_idx ON orders(user_id, created_at DESC) WHERE order_status = 'pending';
CREATE INDEX IF NOT EXISTS orders_processing_idx ON orders(user_id, created_at DESC) WHERE order_status = 'processing';
CREATE INDEX IF NOT EXISTS orders_completed_idx ON orders(user_id, created_at DESC) WHERE order_status IN ('delivered', 'shipped');

-- Add covering indexes for frequently accessed columns
CREATE INDEX IF NOT EXISTS orders_summary_idx ON orders(user_id, created_at DESC) 
  INCLUDE (order_number, total_amount, order_status, payment_status);

-- Analyze tables to update statistics for query planner
ANALYZE orders;
ANALYZE profiles;
ANALYZE cart_items;
ANALYZE transactions;
ANALYZE favorites;
ANALYZE status_change_logs;