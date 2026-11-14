-- PART 1 of 3: tables, admin check and security rules. Run this first.
-- Select all in the SQL Editor, delete, paste this file, click Run.

-- 1. Tables ------------------------------------------------------------
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  company text check (company is null or char_length(company) <= 200),
  inquiry_type text not null check (char_length(inquiry_type) between 1 and 100),
  message text not null check (char_length(message) between 1 and 5000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- The list of accounts allowed to edit the website (filled in by make-admin.sql).
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- 2. Admin check ---------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()); $$;
grant execute on function public.is_admin() to anon, authenticated;

-- 3. Row Level Security --------------------------------------------------
alter table public.site_content enable row level security;
alter table public.messages enable row level security;
alter table public.admin_users enable row level security;  -- no policies: nobody can read it through the API

drop policy if exists "Anyone can read content" on public.site_content;
drop policy if exists "Admin adds content" on public.site_content;
drop policy if exists "Admin edits content" on public.site_content;
drop policy if exists "Admin deletes content" on public.site_content;
create policy "Anyone can read content" on public.site_content for select to anon, authenticated using (true);
create policy "Admin adds content" on public.site_content for insert to authenticated with check (public.is_admin());
create policy "Admin edits content" on public.site_content for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin deletes content" on public.site_content for delete to authenticated using (public.is_admin());

drop policy if exists "Visitors can send messages" on public.messages;
drop policy if exists "Admin reads messages" on public.messages;
drop policy if exists "Admin edits messages" on public.messages;
drop policy if exists "Admin deletes messages" on public.messages;
create policy "Visitors can send messages" on public.messages for insert to anon, authenticated with check (is_read = false);
create policy "Admin reads messages" on public.messages for select to authenticated using (public.is_admin());
create policy "Admin edits messages" on public.messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin deletes messages" on public.messages for delete to authenticated using (public.is_admin());
