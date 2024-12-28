/*
  # Authentication Setup

  1. Tables
    - Add email_verified and last_login columns to user_roles if they don't exist

  2. Functions
    - handle_new_user: Creates user role on signup
    - handle_user_signin: Updates last login timestamp
    - verify_user_email: Marks user email as verified
  
  3. Triggers
    - on_auth_user_created: Assigns initial role on signup
    - on_auth_user_signin: Updates last login time
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

-- Create function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_roles (user_id, role, email_verified)
  VALUES (new.id, 'child', false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update user_roles when user signs in
CREATE OR REPLACE FUNCTION handle_user_signin()
RETURNS trigger AS $$
BEGIN
  UPDATE user_roles
  SET last_login = now()
  WHERE user_id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user signin
DROP TRIGGER IF EXISTS on_auth_user_signin ON auth.users;
CREATE TRIGGER on_auth_user_signin
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_signin();

-- Function to verify email
CREATE OR REPLACE FUNCTION verify_user_email(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_roles
  SET email_verified = true
  WHERE user_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;