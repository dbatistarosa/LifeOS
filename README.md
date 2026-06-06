# LifeOS — Landing Page

> Bilingual (EN/ES) waitlist landing page with Supabase + Resend integration.
> Single HTML file — no build step required.

---

## 🛠️ Stack (all free tier)

| Layer       | Service        | Why                                      |
|-------------|----------------|------------------------------------------|
| Frontend    | Plain HTML/CSS/JS | Single file, instant deploy            |
| Hosting     | **Vercel** (free)  | Deploy from GitHub in 60 seconds      |
| Database    | **Supabase** (free) | PostgreSQL + RLS + Edge Functions     |
| Email       | **Resend** (free)   | 3,000 emails/month, great deliverability |

---

## 🚀 Deploy in 5 steps

### Step 1 — Supabase setup

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `lifeos` — choose the closest region (US East)
3. Go to **SQL Editor** → paste & run `supabase/migrations/001_create_waitlist.sql`
4. Go to **Settings → API**, copy:
   - **Project URL** → your `SUPABASE_URL`
   - **anon / public** key → your `SUPABASE_ANON_KEY`

### Step 2 — Add your keys to index.html

Open `index.html` and find these two lines (near line 955):

```js
const SUPABASE_URL      = 'REPLACE_WITH_YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY'
```

Replace the placeholder strings with your real values.

### Step 3 — Resend + Edge Function (email)

1. Sign up at [resend.com](https://resend.com) → create an API key
2. Verify your domain (or use the test `@resend.dev` domain)
3. Install Supabase CLI: `npm install -g supabase`
4. Login and link:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_ID
   ```
5. Set secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_key_here
   supabase secrets set ALLOWED_ORIGIN=https://lifeos.app
   ```
6. Deploy the edge function:
   ```bash
   supabase functions deploy send-welcome-email
   ```

### Step 4 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: LifeOS landing page v1"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lifeos-landing.git
git push -u origin main
```

### Step 5 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework preset: **Other**
4. Root directory: `/` (leave as-is)
5. Click **Deploy** — done! 🎉

---

## 📊 View your signups

In Supabase Dashboard → SQL Editor:

```sql
-- All signups
SELECT * FROM waitlist_admin ORDER BY created_at DESC;

-- Total count
SELECT get_waitlist_count();

-- By top problem
SELECT top_problem, COUNT(*) as votes
FROM waitlist
GROUP BY top_problem
ORDER BY votes DESC;
```

---

## 📁 File structure

```
lifeos-landing/
├── index.html                          ← The entire landing page
├── public/
│   └── favicon.svg                     ← LifeOS favicon
├── supabase/
│   ├── functions/
│   │   └── send-welcome-email/
│   │       └── index.ts               ← Welcome email via Resend
│   └── migrations/
│       └── 001_create_waitlist.sql    ← Database schema
├── vercel.json                         ← Security headers + routing
├── .gitignore                          ← Protects secrets from Git
├── CONFIGURATION.txt                   ← Where to find your keys
└── README.md
```

---

## ✅ Security checklist

- [x] No secrets committed to Git
- [x] Supabase anon key only (service_role never in frontend)
- [x] RLS enabled — anon users cannot read email list
- [x] Email format validated at DB level (regex constraint)
- [x] Client-side rate limiting (1 submission/minute/session)
- [x] Input sanitized before DB insert and email send
- [x] Edge Function CORS locked to your domain
- [x] Internal errors never exposed to the client
- [x] Content-Security-Policy header configured
- [x] X-Frame-Options: DENY (prevents clickjacking)

---

Built with purpose in South Florida · LifeOS 2026
