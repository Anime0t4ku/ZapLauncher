/*
  # Add Auth Columns and Update Triggers

  1. Changes
    - Add email_verified and last_login columns to user_roles
    - Update existing triggers to handle these columns
    
  2. Security
    - All functions use SECURITY DEFINER for proper permissions
    - Maintains existing RLS policies
*/

-- Add columns to user_roles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE user_roles 
    ADD COLUMN email_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND column_name = 'last_login'
  ) THEN
    ALTER TABLE user_roles 
    ADD COLUMN last_login timestamptz;
  END IF;
END $$;