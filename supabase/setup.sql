-- =====================================================================
-- Website setup script. Paste ALL of this into the Supabase SQL Editor and click Run.
-- Safe to run more than once: it never overwrites content you have already edited.
-- =====================================================================

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

-- 6. Starting content (everything that is on the website today) -----------
insert into public.site_content (key, value) values
  ('profile', '{"name":"Syed Taha Bukhari","title":"Frontend Developer","tagline":"Turning ideas into fast, clean, responsive web experiences.","location":"Lahore, Pakistan","phone":"+92 319 1546707","whatsapp":"","badge":"Open to internships & junior roles","photo":"/headshot-placeholder.svg","socials":{"github":"https://github.com/Taha-bukhari","linkedin":"https://www.linkedin.com/in/taha-bukhari-a512702a8/","email":"tahabukhari175@gmail.com"}}'::jsonb),
  ('texts', '{"navCta":"Hire Me","homeCta":"View My Projects","homeTeaserTitle":"What I build","homeTeaserText":"Interfaces that load fast, read clearly and work on any device.","homeFeaturedTitle":"Featured projects","homeFeaturedText":"Real projects I have designed and built.","homeViewAll":"View All Projects","homeExperienceTitle":"Experience","homeHowTitle":"How I work","homeTechTitle":"Technologies I work with","homeClosingTitle":"Let''s build something great together","homeClosingText":"I''m looking for an internship or a junior frontend role. If you''re hiring, or just want to say hello, I''d love to hear from you.","aboutTitle":"About me","aboutJourneyTitle":"My journey","aboutJourneyText":"The path so far, one step at a time.","aboutSkillsTitle":"Core skills","aboutSkillsText":"Where I am with each tool today.","aboutClosingTitle":"See what I have built","projectsTitle":"Projects","projectsIntro":"Real projects I have built with React, Next.js and plain HTML, CSS and JavaScript. Select one to see more.","skillsTitle":"Skills","skillsIntro":"The tools I use, grouped by area, and the projects where I have used them.","skillsClosingTitle":"See these skills in my projects","contactTitle":"Get in touch","contactIntro":"Hiring for an internship or junior frontend role, or have a project in mind? Send me a message and I will get back to you."}'::jsonb),
  ('stats', '[{"to":5,"suffix":"+","label":"Projects built"},{"to":10,"suffix":"+","label":"Technologies used"},{"to":2,"suffix":"+","label":"Years teaching online"},{"to":100,"suffix":"%","label":"Responsive builds"}]'::jsonb),
  ('principles', '[{"title":"Clean, reusable code","text":"Small components and clear naming, so a project stays easy to read and extend."},{"title":"Responsive on every screen","text":"Every build is checked from small phones up to wide desktop monitors."},{"title":"Always learning new tools","text":"I keep picking up new frameworks and libraries, and put each one into a real project."}]'::jsonb),
  ('about', '{"lead":"A Computer Science student and online mathematics tutor, learning frontend development by building real projects.","story":["I am a Computer Science student at the Virtual University of Pakistan, and I have been teaching mathematics online since January 2024. Teaching taught me how to break complex ideas into simple steps, and I bring the same approach to web development.","I taught myself frontend development step by step. I started with HTML, CSS and JavaScript, then moved to React and Tailwind CSS, and then to Next.js and TypeScript. I learned each tool by building real projects with it instead of only watching tutorials.","What makes me different is that I do not just copy layouts. I build complete, working apps with authentication, databases and external APIs, and I care about clean, reusable, responsive code."],"mission":"My mission is to join a team as a junior frontend developer or intern, learn from experienced engineers, and help turn ideas into fast, clean, responsive web experiences.","facts":[["Based in","Lahore, Pakistan"],["Studying","BSc Computer Science, Virtual University of Pakistan"],["Teaching","Mathematics online, since January 2024"],["Looking for","An internship or junior frontend role"]]}'::jsonb),
  ('timeline', '[{"title":"Started teaching mathematics online","date":"January 2024","description":"Teaching taught me to break complex ideas into simple steps, an approach I now bring to web development."},{"title":"Began BSc Computer Science at Virtual University of Pakistan","date":"September 2024","description":"Started my degree while continuing to teach online."},{"title":"Learned HTML, CSS and JavaScript and built the Sidcup Family Golf website and a Calculator","date":"","description":"Started my frontend path with the fundamentals, learning each one by building real projects."},{"title":"Moved to React and Tailwind CSS and built Hirrd, a full job portal with Supabase and Clerk","date":"","description":"Built a complete job portal with authentication and a database."},{"title":"Learned Next.js and TypeScript and built the Travel App and the Car Showroom App","date":"","description":"Built two Next.js apps, one of them using an external API."},{"title":"Now looking for my first internship or junior frontend role","date":"","description":"Ready to join a team, learn from experienced engineers and help turn ideas into fast, clean, responsive web experiences."}]'::jsonb),
  ('skills', '[{"name":"HTML & CSS","level":"Strong"},{"name":"JavaScript","level":"Good"},{"name":"React","level":"Strong"},{"name":"Next.js","level":"Good"},{"name":"Tailwind CSS","level":"Strong"},{"name":"TypeScript","level":"Growing"}]'::jsonb),
  ('skillAreas', '[{"icon":"Code2","title":"Frontend Fundamentals","description":"Building clean, semantic, fully responsive websites from scratch.","technologies":["HTML","CSS","JavaScript"],"usedIn":["Sidcup Family Golf Website","Calculator"]},{"icon":"Atom","title":"React & Modern UI","description":"Building reusable components and polished, responsive interfaces.","technologies":["React","React Router","Tailwind CSS","shadcn/ui","Bootstrap"],"usedIn":["Hirrd"]},{"icon":"Braces","title":"Next.js & TypeScript","description":"Building fast, well-structured, type-safe apps.","technologies":["Next.js (App Router)","TypeScript","Tailwind CSS v4","HeadlessUI"],"usedIn":["Travel App","Car Showroom App"]},{"icon":"Database","title":"Backend Integration & APIs","description":"Connecting my frontends to real data and user accounts, with Supabase for authentication and a database and Clerk for user authentication.","technologies":["Supabase","Clerk","RapidAPI"],"usedIn":["Hirrd","Car Showroom App"]},{"icon":"Rocket","title":"Tools & Deployment","description":"GitHub for version control and Vercel for deploying and hosting live projects.","technologies":["GitHub","Vercel"],"usedIn":["Travel App","all my project repositories"]},{"icon":"MessageCircle","title":"Communication & Problem Solving","description":"Explaining complex ideas simply and patiently, built through teaching mathematics online since January 2024.","technologies":[],"usedIn":["my daily teaching","how I document and explain my code"]}]'::jsonb),
  ('projects', '[{"title":"Hirrd","category":"React Apps","description":"A full job portal with authentication and a database, built with React and Supabase.","tags":["React","Tailwind CSS","shadcn/ui","Supabase","Clerk"],"image":"","github":"https://github.com/Taha-bukhari","live":"#","featured":true},{"title":"Travel App","category":"Next.js Apps","description":"A responsive travel website built with Next.js 16 and deployed on Vercel.","tags":["Next.js 16","Tailwind CSS v4","TypeScript","Vercel"],"image":"","github":"https://github.com/Taha-bukhari","live":"#","featured":true},{"title":"Car Showroom App","category":"Next.js Apps","description":"A car showroom app built with Next.js, HeadlessUI and RapidAPI.","tags":["Next.js","Tailwind CSS v4","TypeScript","HeadlessUI","RapidAPI"],"image":"","github":"https://github.com/Taha-bukhari","live":"#","featured":false},{"title":"Sidcup Family Golf Website","category":"HTML, CSS & JavaScript Websites","description":"A responsive business website built with HTML, CSS and JavaScript.","tags":["HTML","CSS","JavaScript"],"image":"","github":"https://github.com/Taha-bukhari","live":"#","featured":true},{"title":"Calculator","category":"HTML, CSS & JavaScript Websites","description":"A working calculator built with HTML, CSS and JavaScript.","tags":["HTML","CSS","JavaScript"],"image":"","github":"https://github.com/Taha-bukhari","live":"#","featured":true}]'::jsonb),
  ('experience', '[{"title":"Online Mathematics Tutor","org":"Remote","dates":"January 2024 – Present","text":"Teaching mathematics online and explaining concepts clearly, step by step. Teaching has built my communication, patience and problem-solving skills."}]'::jsonb),
  ('achievements', '[{"title":"Gold Medalist, Taekwondo Championship (1st Position)","category":"Awards","date":"2017","issuer":"Organizing Committee of the 8th Inter-School & Inter-College Games (Punjab Olympic Association)","why":"Recognizes outstanding skill and a winning performance in competition, and shows the discipline, focus and perseverance I bring to everything I do.","verify":"","image":""},{"title":"React and Redux","category":"Certifications","date":"October 16, 2026","issuer":"KnowledgeGate","why":"Completed with a score of 92%, which shows my modern React skills.","verify":"https://knowledgegate.in/certificate/F6F927F7","image":""},{"title":"Web Development Course (Batch 2)","category":"Certifications","date":"December 2024 – February 2025","issuer":"JDC Free IT City Lahore (JDC Foundation Pakistan)","why":"This is where I built my web development foundation.","verify":"","image":""},{"title":"HTML Certification","category":"Certifications","date":"","issuer":"KnowledgeGate (YouTube Course)","why":"Proves my HTML fundamentals.","verify":"https://www.knowledgegate.ai/certificate/DA30B215","image":""},{"title":"CSS Certification","category":"Certifications","date":"","issuer":"KnowledgeGate (YouTube Course)","why":"Proves my CSS fundamentals.","verify":"https://www.knowledgegate.ai/certificate/547AB6A3","image":""}]'::jsonb),
  ('theme', '{"name":"charcoal"}'::jsonb)
on conflict (key) do nothing;
