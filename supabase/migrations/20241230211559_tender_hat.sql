/*
  # Fix sign-in flow and user roles
  
  1. Changes
    - Add indexes for better performance
    - Add error handling for user role queries
    - Improve handle validation
    
  2. Security
    - Better error handling in functions
    - Proper transaction management
*/

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_handle ON user_roles(handle);

-- Create function to safely get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS TABLE (
  handle text,
  email_verified boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.handle,
    ur.email_verified
  FROM user_roles ur
  WHERE ur.user_id = get_user_role.user_id;
  
  -- If no rows returned, create default role
  IF NOT FOUND THEN
    INSERT INTO user_roles (
      user_id,
      handle,
      email_verified,
      created_at,
      updated_at
    )
    VALUES (
      user_id,
      'user' || substr(gen_random_uuid()::text, 1, 8),
      false,
      now(),
      now()
    )
    RETURNING handle, email_verified;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle verification function with better error handling
CREATE OR REPLACE FUNCTION verify_user_handle(
  user_id uuid,
  new_handle text,
  OUT success boolean,
  OUT error text,
  OUT handle text
)
RETURNS record AS $$
BEGIN
  -- Validate handle format
  IF new_handle !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{2,29}$' THEN
    success := false;
    error := 'Handle must start with a letter or number and be 3-30 characters long';
    RETURN;
  END IF;

  -- Check if handle is taken
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE handle = new_handle 
    AND user_id != verify_user_handle.user_id
  ) THEN
    success := false;
    error := 'This handle is already taken';
    RETURN;
  END IF;

  -- Update handle within transaction
  BEGIN
    UPDATE user_roles
    SET 
      handle = new_handle,
      updated_at = now()
    WHERE user_id = verify_user_handle.user_id
    RETURNING handle INTO handle;

    IF handle IS NULL THEN
      success := false;
      error := 'User not found';
      RETURN;
    END IF;

    success := true;
    error := null;
  EXCEPTION
    WHEN OTHERS THEN
      success := false;
      error := 'Database error: ' || SQLERRM;
      RETURN;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;