-- Vaishnavi Collections: customer registration and first-login notifications.
-- Run once in the Supabase SQL Editor or apply as a migration.

-- Enforce one welcome notification per customer, even if login requests race.
-- Keep the earliest existing WELCOME notification if the feature was tested before.
WITH ranked_welcome AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY user_id
           ORDER BY created_at ASC, id ASC
         ) AS row_number
  FROM public.notifications
  WHERE type = 'WELCOME'
)
DELETE FROM public.notifications AS n
USING ranked_welcome AS r
WHERE n.id = r.id
  AND r.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS notifications_one_welcome_per_user
  ON public.notifications (user_id)
  WHERE type = 'WELCOME';

CREATE OR REPLACE FUNCTION public.notify_admins_of_customer_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_name text;
  v_email text;
BEGIN
  -- Only notify for a newly-created customer profile, never for role updates.
  IF NEW.role::text <> 'CUSTOMER' THEN
    RETURN NEW;
  END IF;

  SELECT
    COALESCE(
      NULLIF(btrim(NEW.full_name), ''),
      NULLIF(btrim(u.raw_user_meta_data ->> 'display_name'), ''),
      NULLIF(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(btrim(u.raw_user_meta_data ->> 'name'), ''),
      NULLIF(split_part(COALESCE(u.email, ''), '@', 1), ''),
      'New customer'
    ),
    u.email
  INTO v_name, v_email
  FROM auth.users AS u
  WHERE u.id = NEW.id;

  v_name := COALESCE(v_name, 'New customer');

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    click_url,
    metadata
  )
  SELECT
    p.id,
    'CUSTOMER_REGISTERED',
    'New Customer Registered',
    'New customer registered: ' || v_name,
    '/admin/customers',
    jsonb_build_object(
      'event_key', 'customer_registered:' || NEW.id::text,
      'customer_user_id', NEW.id,
      'customer_name', v_name,
      'customer_email', v_email
    )
  FROM public.profiles AS p
  WHERE p.role::text IN ('ADMIN', 'OWNER');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_notify_admins_customer_registration
  ON public.profiles;

CREATE TRIGGER profiles_notify_admins_customer_registration
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_of_customer_registration();
