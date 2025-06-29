/*
  # Add direct foreign key relationship between orders and profiles

  1. Changes
    - Add foreign key constraint linking orders.user_id to profiles.id
    - This enables direct joins between orders and profiles tables
    - Maintains data integrity and enables the admin dashboard queries

  2. Security
    - No changes to existing RLS policies
    - Maintains existing security model
*/

-- Add foreign key constraint between orders and profiles
-- Since both tables reference users.id with the same user_id/id values,
-- we can create a direct relationship
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_profiles_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;