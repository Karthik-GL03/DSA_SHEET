<<<<<<< HEAD
# DSA Flow — Personal Coding Tracker

> A responsive, real-time web application for tracking DSA practice, topic coverage, consistency streaks, time spent, revision notes, and public coding-platform profiles.

Developed by **[@Karthik-GL03](https://github.com/Karthik-GL03)** | Repository: **[https://github.com/Karthik-GL03/dsa-flow-tracker](https://github.com/Karthik-GL03/dsa-flow-tracker)**

---

## What works in this application

- **Responsive Analytics Dashboard**: Real-time KPI cards (aggregate solves, live platform breakdown, Codeforces rating, LeetCode global ranking), live latency monitors, and quick preset selectors.
- **365-Day Practice Calendar & Heatmap**: Computes activity levels directly from verified submission timestamps across LeetCode and Codeforces with hover inspection.
- **Pedagogical Curriculum Coverage**: Full native indexing of **NeetCode 150** (18 pattern categories) and **Striver A2Z DSA Sheet** (16+ steps) with automatic solve matching, progress percentages, and manual checkboxes.
- **Algorithmic Weak Topics Radar**: Flags curriculum categories where completion is below 40% to guide deliberate, targeted problem solving.
- **Searchable Problem & Revision Notes Vault**: Add, edit, and search personal revision notes with tags (`#Must-Revise`, `#Two-Pointers`, `#DP`), algorithmic approach notes, and time/space complexities.
- **Competitive Contest Radar**: Live countdown timers for upcoming Codeforces rounds, LeetCode Weekly & Biweekly Contests, and CodeChef contests with Codeforces rating progression chart.
- **Real-Time Peer Leaderboard**: Add peers by handle and live-query their official profiles to compare consistency streaks and solve volume.
- **Dual Storage Architecture**:
  - **Local-Browser Mode**: Ready out-of-the-box. All records and notes persist in the browser's `localStorage` without requiring external database credentials.
  - **Cloud Mode with Supabase**: Optional managed PostgreSQL database with Row-Level Security (`supabase/schema.sql`) for secure multi-device synchronization.
- **Real-Time Automated Streak Engine**:
  - Daily consistency check banner with confetti celebration on goal completion.
  - Free push notifications dispatched to your mobile device via the **Telegram Bot API**.
  - **GitHub Actions Serverless Cron**: Pre-configured workflow running daily at `18:30 UTC` to audit streaks at zero server cost.

---

## Important limits — read before using it as your only record

1. **Deployable starter, not already hosted**: You need to create your own GitHub repository (`https://github.com/Karthik-GL03/dsa-flow-tracker`), Vercel project, and (if you want cloud database sync) Supabase project.
2. **Local mode is per browser**: Clearing site cache or local data can wipe unexported local records. Use the exported schema and notes backup if relying solely on local storage.
3. **Cloud mode requires Supabase setup**: Never expose a Supabase `service_role` key in the frontend. Only use the project's publishable/anon key with the supplied Row-Level Security schema (`supabase/schema.sql`).
4. **Platform API constraints**:
   - **Codeforces**: The public official API enforces a rate limit of 1 call every 2 seconds. The app parses the latest 2,000 submissions and deduplicates accepted solutions (`verdict === "OK"`).
   - **LeetCode**: LeetCode does not provide a public REST API. The app uses server-side Next.js GraphQL proxies to extract accepted submissions and yearly submission calendars. If LeetCode rate limits, the app recovers gracefully.
   - **GeeksforGeeks**: GFG does not offer an official public API and protects its frontend with Web Application Firewalls (Cloudflare). The app employs a server-side parser and a dedicated TLS impersonation script (`scraper/gfg_scraper.py`).
5. **Background reminders require automation**: Service workers alone cannot wake a sleeping browser. Automated notifications when the browser is closed are powered by the included GitHub Actions cron workflow (`.github/workflows/daily-streak-sync.yml`) and Telegram Bot API.

---

## A. Run it locally on Windows

### 1. Prerequisites
- **Node.js LTS** (v18+ or v20+) installed from [https://nodejs.org/](https://nodejs.org/).
- **Git** installed from [https://git-scm.com/downloads](https://git-scm.com/downloads).
- Your GitHub account: **[https://github.com/Karthik-GL03](https://github.com/Karthik-GL03)**.

### 2. Clone and run the project
Open PowerShell or your terminal:

```powershell
# Navigate to your workspace directory
cd e:\DSA

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **`http://localhost:3000`** in your browser. You can start tracking immediately in local mode.

### 3. Build and test production build
```powershell
npm run build
npm run start
```
The server will compile an optimized production build and serve it at `http://localhost:3000`.

---

## B. Enable real cloud accounts and cross-device saving with Supabase

### 1. Create a Supabase project
1. Go to [https://supabase.com/](https://supabase.com/) and create a free project.
2. Navigate to **SQL Editor → New query**.
3. Open [`supabase/schema.sql`](supabase/schema.sql) from this project, copy the entire SQL script, and click **Run**.
4. In Supabase, go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public key` (never use `service_role` in client code).
5. In **Authentication → URL Configuration**, add your local address (`http://localhost:3000`) and your production Vercel domain.

### 2. Add environment variables locally
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Telegram Bot API (for instant phone alerts)
TELEGRAM_BOT_TOKEN=7123456789:ABCdefGhIJKlmNoPQRstuVWXyz
TELEGRAM_CHAT_ID=123456789

# Secret key for GitHub Actions Cron webhook
CRON_SECRET=karthik_dsa_tracker_secret_2026
```

Restart `npm run dev` after changing environment variables.

---

## C. Deploy to a public URL with Vercel and GitHub

### 1. Push code to your GitHub repository
In PowerShell in `e:\DSA`:

```powershell
git add .
git commit -m "Build DSA Flow tracker for Karthik-GL03"
git branch -M main
git remote add origin https://github.com/Karthik-GL03/dsa-flow-tracker.git
git push -u origin main
```

*(If you haven't created the repository on GitHub yet, open [https://github.com/new](https://github.com/new), name it `dsa-flow-tracker`, and then run the push command above).*

### 2. Import into Vercel
1. Visit [https://vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import **`Karthik-GL03/dsa-flow-tracker`**.
3. Vercel automatically detects **Next.js**. The build settings and [`vercel.json`](vercel.json) are pre-configured.
4. Under **Environment Variables**, add:
   - `CRON_SECRET`
   - `TELEGRAM_BOT_TOKEN` *(optional)*
   - `TELEGRAM_CHAT_ID` *(optional)*
   - `NEXT_PUBLIC_SUPABASE_URL` *(if using Supabase)*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(if using Supabase)*
5. Click **Deploy**. In under a minute, your tracker is live globally on your own `*.vercel.app` domain.

---

## D. How integrations work

### Codeforces
The app uses the official Codeforces endpoint:
```
https://codeforces.com/api/user.status?handle=HANDLE&from=1&count=2000
```
It filters for `verdict === "OK"`, deduplicates solved problems by `contestId-index`, calculates submission dates for the heatmap, and computes difficulty breakdowns based on problem ratings (<1300 Easy, 1300–1800 Medium, >1800 Hard).

### LeetCode
The app proxies requests via a server-side route to `https://leetcode.com/graphql`:
- `recentAcSubmissionList`: Extracts real accepted submissions with slugs and timestamps.
- `userProfileCalendar`: Extracts the 365-day submission calendar, current streak, and active days.
- `matchedUser`: Retrieves total solves by difficulty and global rank.

### GeeksforGeeks
Profile statistics are extracted via server-side HTML and Next.js hydration parsing. For advanced scraping scenarios, [`scraper/gfg_scraper.py`](scraper/gfg_scraper.py) demonstrates browser TLS fingerprint spoofing via `curl_cffi` to bypass Cloudflare JA3/JA4 checks.

---

## E. What “real-time” means here

- **Client Reactivity**: The UI updates immediately when you log a solve, check off a curriculum problem, or add a note.
- **Live Stream & Auto-Sync**: The dashboard maintains a live telemetry ping (`LC: ~240ms`, `CF: ~180ms`) and auto-refreshes every 60 seconds with live countdown timers.
- **Genuine API Timestamps**: Heatmap activity squares and streak numbers are calculated directly from user timestamps returned by the platforms.
- **Peer Leaderboard Live Query**: Adding a friend triggers live queries to LeetCode and Codeforces to fetch their genuine solves and contest ratings.
- **Background Cron Alerts**: GitHub Actions (`.github/workflows/daily-streak-sync.yml`) executes at `18:30 UTC` daily to audit user activity and trigger Telegram push notifications when streaks are in danger.

---

## F. Date / streak rules

- **Day boundaries**: Day calculations use the browser's local date for logging practice.
- **Active Streak Calculation**: A streak counts consecutive days with at least 1 verified solve. If no solves are logged yet today, yesterday still counts toward the active streak until the day concludes.
- **Missed Day Warnings**: Triggered if total solves logged for the current calendar date evaluate to 0 by the notification threshold (10:00 PM).

---

## G. Project File Structure

```
DSA/
├── .github/workflows/
│   └── daily-streak-sync.yml     # Serverless Cron workflow (18:30 UTC)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cron/             # Scheduled streak audit endpoint
│   │   │   ├── notify/telegram/  # Telegram Bot API gateway
│   │   │   └── platforms/        # Server-side CORS-free proxies
│   │   │       ├── leetcode/     # LeetCode GraphQL query engine
│   │   │       ├── codeforces/   # Codeforces official REST API
│   │   │       ├── gfg/          # GFG parser
│   │   │       └── contests/     # Live contest aggregator
│   │   ├── globals.css           # Dark theme & heatmap styling
│   │   ├── layout.tsx            # Root layout & metadata
│   │   └── page.tsx              # Main dashboard application
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation & streak counter
│   │   ├── TodayCheckInBanner.tsx# Consistency banner & celebration
│   │   ├── ActivityHeatmap.tsx   # 365-day commit heatmap
│   │   ├── DashboardOverview.tsx # KPI cards & distribution charts
│   │   ├── CurriculumTracker.tsx # Striver A2Z & NeetCode 150 hub
│   │   ├── WeakTopicsAnalysis.tsx# Low-completion topic radar
│   │   ├── ContestRadar.tsx      # Upcoming contests & CF rating chart
│   │   ├── NotesVault.tsx        # Revision notes & tagging system
│   │   ├── FriendsLeaderboard.tsx# Peer solve comparison
│   │   ├── PlatformSyncModal.tsx # Handles configuration & sync
│   │   └── NotificationSettingsModal.tsx # Telegram & cron rules
│   ├── data/curricula/
│   │   ├── neetcode-150.json     # All 18 NeetCode categories
│   │   └── striver-a2z.json      # Complete Striver A2Z steps
│   └── lib/
│       ├── types.ts              # Data contracts and interfaces
│       └── storage.ts            # Local-first persistence & calculations
├── scraper/
│   └── gfg_scraper.py            # TLS fingerprint spoofing script
├── supabase/
│   └── schema.sql                # Production PostgreSQL DDL with RLS
├── DEPLOYMENT.md                 # Step-by-step cloud deployment guide
├── vercel.json                   # Vercel deployment & cron config
├── package.json
└── README.md
```
=======
# DSA_SHEET
>>>>>>> 11e3f728fd56bf9bb1d76b086ed7514f7e85a2d5
