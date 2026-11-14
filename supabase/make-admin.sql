-- Run this ONCE, after you have created your admin user in Supabase (Authentication > Users).
-- Replace YOUR-EMAIL-HERE with the exact email you used, keep the quotes, then click Run.
insert into public.admin_users (user_id)
select id from auth.users where email = 'YOUR-EMAIL-HERE'
on conflict do nothing;
