# AlgoPulse — Real-Time Cloud Deployment & Automation Guide

Follow this step-by-step guide to deploy **AlgoPulse** live to the web at **$0 operational cost** using Vercel, Supabase, and GitHub Actions.

---

## 🚀 Option 1: Instant Deployment to Vercel (Recommended)

Vercel provides free edge hosting, global CDN, serverless API execution, and automatic SSL.

### Method A: Via Vercel Web Dashboard (1-Click)
1. Push your local `e:\DSA` repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_DSA_REPO.git
   git branch -M main
   git push -u origin main
   ```
2. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
3. Click **"Add New..."** > **"Project"**.
4. Select your `YOUR_DSA_REPO` repository and click **"Import"**.
5. Under **Environment Variables**, optionally add:
   - `CRON_SECRET` = any secure random string (e.g. `algopulse_secret_key_2026`)
   - `TELEGRAM_BOT_TOKEN` = (Optional, can also be configured inside the app)
   - `TELEGRAM_CHAT_ID` = (Optional)
6. Click **"Deploy"**.
7. In ~60 seconds, your site is live with a public URL (e.g., `https://algopulse.vercel.app`)!

### Method B: Via Vercel CLI
From your terminal in `e:\DSA`:
```bash
npx vercel
```
Follow the interactive prompts (Accept defaults). To deploy to production:
```bash
npx vercel --prod
```

---

## 🗄️ Setting Up Supabase Database (Optional Cloud Sync)

If you wish to persist solves across multiple devices in addition to the local-first storage:
1. Go to **[supabase.com](https://supabase.com)** and create a new free project.
2. Open the **SQL Editor** in the left sidebar.
3. Open [`supabase/schema.sql`](supabase/schema.sql) from this repository, copy all contents, and click **Run**.
4. In Supabase, go to **Project Settings > API** and copy:
   - `Project URL`
   - `anon public key`
5. In your Vercel project settings or `.env.local`, set:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🤖 Automating Telegram Notifications & Daily Streak Audit

To make sure you never lose your consistency streak, AlgoPulse includes an automated daily audit engine.

### 1. Create your Free Telegram Bot
1. In Telegram, search for `@BotFather`.
2. Send `/newbot`, name it (e.g. `MyAlgoTrackerBot`), and copy the **HTTP API Token**.
3. Send `/start` to your bot, then open `@userinfobot` to retrieve your numeric **Chat ID**.
4. Open the AlgoPulse app (locally or on Vercel), click the **Bell Icon**, paste both credentials, and click **"Send Test Notification"**.

### 2. Configure GitHub Actions Cron
1. Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions**.
2. Click **"New repository secret"**:
   - Name: `APP_URL` | Value: `https://your-app.vercel.app` (your deployed Vercel domain)
   - Name: `CRON_SECRET` | Value: (same secret you gave in Vercel)
3. The workflow in [`.github/workflows/daily-streak-sync.yml`](.github/workflows/daily-streak-sync.yml) will automatically run every day at **18:30 UTC** to audit user activity and send streak defense alerts!

---

## 💻 Running Locally in Real Time Right Now

Your production build is already running locally in the background!
* URL: **`http://localhost:3000`**
* To restart anytime:
  ```powershell
  npm run start
  # or for hot-reloading development:
  npm run dev
  ```
