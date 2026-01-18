-- ============================================================================
-- RegalPay - Auto-create user profiles on signup
-- This trigger automatically creates the user_extended profile when someone signs up
-- ============================================================================

-- First, let's create a function that handles new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users_extended with default role 'customer'
  INSERT INTO public.users_extended (id, role, full_name)
  VALUES (
    NEW.id,
    'customer',  -- Default role, will be updated by app if merchant
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  -- Create customer profile by default
  INSERT INTO public.customer_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now let's update the RLS policies to allow the service role to create profiles
-- The trigger runs with SECURITY DEFINER so it bypasses RLS

-- Also add a policy that allows users to update their own role-specific profiles
DROP POLICY IF EXISTS "Users can update to merchant" ON users_extended;

CREATE POLICY "Users can update to merchant" ON users_extended FOR
UPDATE USING (auth.uid () = id);

-- Add policy for service role operations (triggers)
DROP POLICY IF EXISTS "Service role can insert" ON users_extended;

DROP POLICY IF EXISTS "Service role can insert customer" ON customer_profiles;

-- Grant permissions to the function
GRANT USAGE ON SCHEMA public TO postgres,
anon,
authenticated,
service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres,
service_role;

-- ============================================================================
-- DONE!
-- Now when users sign up via Supabase Auth, their profile is auto-created
-- ============================================================================