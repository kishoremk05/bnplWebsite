-- Automatic Payment Schedule Creator
-- This script automatically finds the approved application and creates the payment schedule

DO $$
DECLARE
  app_id uuid;
  app_total numeric;
  app_installments int;
  installment_amt numeric;
  last_installment_amt numeric;
BEGIN
  -- Find the most recent approved application
  SELECT a.id, a.total_amount, p.installments
  INTO app_id, app_total, app_installments
  FROM bnpl_applications a
  JOIN bnpl_plans p ON a.plan_id = p.id
  WHERE a.status = 'approved'
  ORDER BY a.created_at DESC
  LIMIT 1;

  -- Check if we found an application
  IF app_id IS NULL THEN
    RAISE NOTICE 'No approved applications found';
    RETURN;
  END IF;

  RAISE NOTICE 'Creating payment schedule for application: %', app_id;
  RAISE NOTICE 'Total amount: $%, Installments: %', app_total, app_installments;

  -- Calculate installment amounts
  installment_amt := ROUND((app_total / app_installments)::numeric, 2);
  last_installment_amt := app_total - (installment_amt * (app_installments - 1));

  -- Create payment schedules
  FOR i IN 1..app_installments LOOP
    INSERT INTO payment_schedules (
      application_id,
      installment_number,
      amount,
      due_date,
      status,
      paid_amount
    ) VALUES (
      app_id,
      i,
      CASE WHEN i = app_installments THEN last_installment_amt ELSE installment_amt END,
      CURRENT_DATE + (i * 14),  -- Every 2 weeks
      'scheduled',
      0
    );
    
    RAISE NOTICE 'Created installment % of %: $%', i, app_installments, 
      CASE WHEN i = app_installments THEN last_installment_amt ELSE installment_amt END;
  END LOOP;

  -- Update application status to 'active'
  UPDATE bnpl_applications
  SET status = 'active'
  WHERE id = app_id;

  RAISE NOTICE '✅ Payment schedule created successfully!';
  RAISE NOTICE 'Customer can now see payments in their dashboard';
END $$;

-- Verify the payment schedule
SELECT ps.installment_number as "#", '$' || ps.amount as "Amount", ps.due_date as "Due Date", ps.status as "Status", u.full_name as "Customer"
FROM
    payment_schedules ps
    JOIN bnpl_applications a ON ps.application_id = a.id
    JOIN customer_profiles cp ON a.customer_id = cp.id
    JOIN users_extended u ON cp.user_id = u.id
WHERE
    a.status = 'active'
ORDER BY ps.installment_number;