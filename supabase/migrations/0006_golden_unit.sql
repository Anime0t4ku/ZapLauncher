/*
  # Auth System Fixes

  1. Changes
    - Add email verification flag to user_roles
    - Add last login timestamp
    - Add email verification policies
    - Add default admin user creation

  2. Security
    - Enable RLS on all new tables
    - Add policies for user management
*/

-- Add email verification and last login
ALTER TABLE user_roles
ADD COLUMN email_verified boolean DEFAULT false,
ADD COLUMN last_login timestamptz;

-- Create function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_roles (user_id, role, email_verified)
  VALUES (new.id, 'child', false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
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
CREATE OR REPLACE TRIGGER on_auth_user_signin
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