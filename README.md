# Taha's Portfolio Website + Admin Panel

A React + Vite + Tailwind website. All content lives in a free Supabase database, and you edit it
yourself from the Admin Panel at `/admin`. No code changes needed.

You will need: a computer, a free Supabase account, a free GitHub account, a free Vercel account,
and Node.js (version 20.19 or newer) from https://nodejs.org if you want to test on your computer.

---

## Part 1 — Create your free Supabase project

1. Go to https://supabase.com and click **Start your project**. Sign up (GitHub or email).
2. Click **New project**. Give it any name. Choose a **database password** (save it somewhere safe;
   you will not need it for this website). Pick the region closest to you and the **Free** plan.
3. Wait a minute or two until the project finishes setting up.

## Part 2 — Run the setup script

1. In your Supabase project, open **SQL Editor** in the left menu and click **New query**.
2. Open the file `supabase/setup.sql` from this project in any text editor, select everything,
   copy it, and paste it into the SQL Editor.
3. Click **Run**. You should see "Success". This creates the tables, the security rules, the image
   storage and your starting content (everything that is on the website today).

If the script shows an error, run it in three smaller pieces instead. In the SQL Editor, select all and delete
what is there, then paste and Run each file in this order, one at a time:
`supabase/setup-part1-tables-and-security.sql`, then `setup-part2-images-and-live-updates.sql`, then
`setup-part3-starting-content.sql`. Tell me which one fails and the exact error text.

## Part 3 — Create your own admin account

There is **no default username or password**. You create your own.

1. In Supabase open **Authentication**, then **Users**, then **Add user** and **Create new user**.
2. Enter **your own email** and a **strong password** (long, unique, not used anywhere else).
   Tick **Auto Confirm User** if you see that option. Click create.
3. **Turn off public sign-ups** so nobody else can create accounts: open **Authentication**, then
   **Sign In / Providers** (it may be called **Settings**), and switch off **Allow new users to sign up**.
4. Make your account the admin: open `supabase/make-admin.sql`, replace `YOUR-EMAIL-HERE` with the exact
   email from step 2 (keep the quotes), paste it into a new SQL Editor query and click **Run**.

Only accounts listed this way can change anything on the website, even if someone else managed to sign up.

## Part 4 — Copy your two keys

1. In Supabase open **Project Settings**, then **API** (newer dashboards may call it **API Keys**).
2. Copy the **Project URL**.
3. Copy the **anon public** key (newer dashboards call it the **publishable** key).

Never copy or use the **service_role** (secret) key anywhere in this website. The anon key is meant to be
public; the security rules from Part 2 are what protect your data.

## Part 5 — Test it on your computer

1. Unzip the project. Make a copy of the file `.env.example` and name the copy `.env`.
   (On Windows, if you cannot see it, enable "File name extensions" and "Hidden items" in File Explorer.)
2. Open `.env` and paste your two values after the equals signs, with no spaces or quotes:

       VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
       VITE_SUPABASE_ANON_KEY=your-anon-key

3. Open a terminal in the project folder and run:

       npm install
       npm run dev

4. Open the address it prints (usually http://localhost:5173) to see the website.
5. Go to http://localhost:5173/admin to log in.

## Part 6 — Log in for the first time

1. Open `/admin` on your website (for example `https://your-site.vercel.app/admin`).
2. Enter the email and password you created in Part 3.
3. You see the dashboard. Pick any section (Home, About, Projects, Skills, Experience, Achievements,
   Contact Info, Messages, Images, Theme, Account), edit, and click **Save**. Visitors see the change
   straight away. Deleting always asks you to confirm first.

The Admin Panel is not linked anywhere on the public website. Only you know the address.

### Change your password

Open **Account** in the Admin Panel, enter your current password, then the new one twice (10 characters or
more) and click **Change password**.

If you ever forget the password: in Supabase go to **Authentication**, then **Users**, delete your user,
create it again (Part 3, steps 1 and 2) and run `supabase/make-admin.sql` again.

## Part 7 — Put it online with Vercel

1. **GitHub:** create a free account at https://github.com, click **New repository**, name it
   (for example `portfolio`) and create it. Click **uploading an existing file** and drag in the
   contents of the project folder. **Do not upload** the `node_modules` folder or your `.env` file
   (your keys go into Vercel instead). Click **Commit changes**.
2. **Vercel:** sign up at https://vercel.com with your GitHub account. Click **Add New**, then **Project**,
   and **Import** your repository.
3. Vercel detects Vite automatically. Open **Environment Variables** and add two:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, with the values from Part 4.
4. Click **Deploy**. When it finishes, Vercel gives you your live address.
5. Visit `your-address/admin` and log in.

After changing the environment variables later, redeploy once (Deployments, then Redeploy).

---

## Good to know

- **Fallback:** if the database is empty or cannot be reached, every page shows its built-in content,
  so visitors never see a broken site.
- **Images:** upload them from the Images section (or inside each project or certificate). JPG, PNG or WebP
  up to 8 MB; they are resized to 1600 px and compressed automatically.
- **Themes:** the Theme section has four themes. You see a live preview before saving, and the saved theme
  applies to every page for every visitor.
- **Contact form:** messages go into the Messages inbox. A hidden spam-trap field catches simple bots.
  It is basic protection; if spam ever becomes a problem, ask for a CAPTCHA to be added.
- **Not working?** "Not an admin account" means Part 3 step 4 was missed. Images failing to upload means
  Part 2 was not run completely. Run `supabase/setup.sql` again, it is safe to repeat.
