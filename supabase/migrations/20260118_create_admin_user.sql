-- Create admin user with email: admin@gmail.com and password: admin@2026
-- This migration creates the admin user in the auth.users table

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Generate a new UUID for the admin user
  admin_user_id := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'admin@gmail.com',
    crypt('admin@2026', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"System Administrator","role":"admin"}',
    false,
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING;

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    admin_user_id,
    jsonb_build_object(
      'sub', admin_user_id::text,
      'email', 'admin@gmail.com'
    ),
    'email',
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, id) DO NOTHING;

  -- Insert into users_extended
  INSERT INTO users_extended (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin@gmail.com',
    'System Administrator',
    'admin',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', full_name = 'System Administrator';

  RAISE NOTICE 'Admin user created successfully with ID: %', admin_user_id;
END $$;