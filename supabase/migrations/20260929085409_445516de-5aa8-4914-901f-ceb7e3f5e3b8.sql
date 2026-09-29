DELETE FROM public.user_roles
WHERE role = 'coach'::public.app_role
  AND user_id NOT IN (
    SELECT id
    FROM auth.users
    WHERE lower(email) = 'adilmushtaq088@gmail.com'
      AND email_confirmed_at IS NOT NULL
  );

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN auth.users au ON au.id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND lower(au.email) = 'adilmushtaq088@gmail.com'
      AND au.email_confirmed_at IS NOT NULL
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;