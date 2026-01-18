-- Temporarily disable RLS to test if app works
-- RUN THIS ONLY FOR TESTING - NOT FOR PRODUCTION!

ALTER TABLE users_extended DISABLE ROW LEVEL SECURITY;

ALTER TABLE customer_profiles DISABLE ROW LEVEL SECURITY;

ALTER TABLE merchant_profiles DISABLE ROW LEVEL SECURITY;

-- After running this, try registering again
-- If it works, we know the issue is with RLS policies