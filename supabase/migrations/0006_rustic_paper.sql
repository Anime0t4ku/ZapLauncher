/*
  # Auth System Triggers and Functions

  1. Changes
    - Add user signup trigger to create user_roles entry
    - Add user signin trigger to update last_login
    - Add email verification function
    
  2. Security
    - All functions use SECURITY DEFINER for proper permissions
    - Triggers run automatically on auth events
*/

-- Create function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (new.id, 'child');
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