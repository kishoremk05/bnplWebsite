-- Fix: Allow merchants to update BNPL applications
-- This fixes the 403 error when merchants try to approve/reject applications

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Merchants can update their applications" ON bnpl_applications;

-- Create new policy allowing merchants to update applications for their merchant_id
CREATE POLICY "Merchants can update their applications" ON bnpl_applications FOR
UPDATE USING (
    merchant_id IN (
        SELECT id
        FROM merchant_profiles
        WHERE
            user_id = auth.uid ()
    )
)
WITH
    CHECK (
        merchant_id IN (
            SELECT id
            FROM merchant_profiles
            WHERE
                user_id = auth.uid ()
        )
    );

-- Also ensure merchants can insert payment schedules
DROP POLICY IF EXISTS "Merchants can create payment schedules" ON payment_schedules;

CREATE POLICY "Merchants can create payment schedules" ON payment_schedules FOR
INSERT
WITH
    CHECK (
        application_id IN (
            SELECT id
            FROM bnpl_applications
            WHERE
                merchant_id IN (
                    SELECT id
                    FROM merchant_profiles
                    WHERE
                        user_id = auth.uid ()
                )
        )
    );