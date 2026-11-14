-- PART 2 of 3: image storage and live updates. Run this second.
-- Select all in the SQL Editor, delete, paste this file, click Run.

-- 4. Image storage -------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Admin lists images" on storage.objects;
drop policy if exists "Admin uploads images" on storage.objects;
drop policy if exists "Admin replaces images" on storage.objects;
drop policy if exists "Admin deletes images" on storage.objects;
create policy "Admin lists images" on storage.objects for select to authenticated using (bucket_id = 'site-images' and public.is_admin());
create policy "Admin uploads images" on storage.objects for insert to authenticated with check (bucket_id = 'site-images' and public.is_admin());
create policy "Admin replaces images" on storage.objects for update to authenticated using (bucket_id = 'site-images' and public.is_admin());
create policy "Admin deletes images" on storage.objects for delete to authenticated using (bucket_id = 'site-images' and public.is_admin());

-- 5. Live updates for visitors --------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.site_content;
exception when duplicate_object then null; when undefined_object then null;
end $$;
