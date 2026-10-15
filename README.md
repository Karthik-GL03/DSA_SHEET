# AlgoPulse — Unified Data Structures & Algorithms Tracking Platform
> **Zero-Cost, Multi-Platform DSA Pedagogy, Consistency Streak & Automation Platform**

AlgoPulse is a full-featured, automated DSA tracking platform built according to the architectural blueprint detailed in *"Architecting a Unified Data Structures and Algorithms Tracking Platform: A Comprehensive Guide to Pedagogy, System Design, and Automation"*.

---

## 🌟 Core Architectural Pillars

### 1. Foundational Pedagogy & Problem Sheets
- **NeetCode 150**: Pattern-centric curriculum categorized across 18 algorithmic patterns (Arrays & Hashing, Two Pointers, Sliding Window, Monotonic Stacks, Binary Search, Trees, Graphs, DP, Greedy, etc.).
- **Striver A2Z DSA Sheet**: Exhaustive, step-by-step linear progression spanning Step 1 (Basics & Sorting) through Step 16+ (Advanced DP, Graphs, Tries).
- **Algorithmic Weak Topics Radar**: Automatically maps accepted platform submissions against curriculum topics and flags categories with completion rates under 40% for targeted revision.

### 2. Multi-Platform Data Ingestion
- **LeetCode GraphQL API Engine**:
  - `recentAcSubmissionList` extracts real accepted submissions.
  - `userProfileCalendar` extracts the 365-day submission calendar, active streak, and total active days.
- **Codeforces Official REST API**:
  - `user.info`: Live rating, max rating, and competitive rank title.
  - `user.status`: Extracts unique accepted (`verdict == OK`) problems.
  - `user.rating`: Live rating history chart tracking contest trajectory.
- **GeeksforGeeks Scraper**:
  - Server-side regex and Next.js hydration parser with Cloudflare resilience.
  - Standalone `scraper/gfg_scraper.py` using `curl_cffi` browser TLS impersonation (`impersonate="chrome"`) to bypass JA3/JA4 fingerprinting.

### 3. Consistency Enforcer & Push Notification Engine
- **Telegram Bot API**:
  - Zero-cost push notifications sent straight to user devices.
  - Automated rules:
    - *Daily Streak Warning*: Triggers if user has 0 solves logged by 10:00 PM.
    - *Streak Milestones*: Celebrates 7-day, 30-day, and 100-day streaks.
    - *Contest Radar*: Alerts 24 hours & 2 hours before Codeforces/LeetCode contests.
    - *Weekly Summary*: Weekly performance recap sent every Monday.
- **GitHub Actions Serverless Cron**:
  - Scheduled daily at `30 18 * * *` (18:30 UTC, offset to prevent runner queue delays).
  - Triggers `/api/cron` securely using a bearer secret.

### 4. Interactive Analytics & Revision Vault
- **365-Day GitHub/LeetCode Activity Heatmap**: Interactive calendar with tooltips and streak counters.
- **Revision Vault**: Notes database with custom tagging (`Must-Revise`, `Two-Pointers`, `DP`), time/space complexity notes, and markdown takeaways.
- **Friends & Peer Leaderboard**: Compare solves, active streaks, and ratings against peers.

---

## 🚀 Quick Start Guide

### 1. Installation
Clone the repository and install dependencies:
```bash
cd e:\DSA
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration & Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional Supabase Connection (for cloud persistence across devices)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Telegram Bot API (for automated push notifications)
TELEGRAM_BOT_TOKEN=7123456789:ABCdefGhIJKlmNoPQRstuVWXyz
TELEGRAM_CHAT_ID=123456789

# Secret key for GitHub Actions Cron Webhook
CRON_SECRET=dsa_tracker_cron_secret
```

---

## 🤖 2-Minute Telegram Bot Setup (Free)
1. Open Telegram and search for **[@BotFather](https://t.me/BotFather)**.
2. Send `/newbot`, give your bot a name, and copy the **HTTP API Token**.
3. Open **[@userinfobot](https://t.me/userinfobot)** or start your new bot to find your numeric **Chat ID**.
4. Open the AlgoPulse app, click the **Bell Icon** (Notification Settings), paste your token and chat ID, and click **"Send Test Notification"**.

---

## 📅 GitHub Actions Automation Setup
The workflow file is located at [`.github/workflows/daily-streak-sync.yml`](.github/workflows/daily-streak-sync.yml).

To enable daily automated streak checks in your GitHub repository:
1. Push your repository to GitHub.
2. Navigate to **Settings > Secrets and variables > Actions**.
3. Add repository secrets:
   - `CRON_SECRET`: Match the secret set in your app.
   - `APP_URL`: Your deployed URL (e.g. `https://your-app.vercel.app`).
4. GitHub Actions will trigger your tracker automatically at 18:30 UTC every day.

---

## 🗄️ Supabase Relational Database Schema
The complete PostgreSQL DDL with Row-Level Security (RLS) is located at [`supabase/schema.sql`](supabase/schema.sql).
It defines tables for `users`, `external_accounts`, `problems`, `solves`, `daily_activity`, `curriculum`, `contests`, `participations`, `notes`, `tags`, and `notifications`.

---

## 📁 Project Architecture
```
DSA/
├── .github/workflows/
│   └── daily-streak-sync.yml     # Serverless Cron workflow (18:30 UTC)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cron/             # Scheduled audit endpoint
│   │   │   ├── notify/telegram/  # Telegram Bot API dispatcher
│   │   │   └── platforms/        # Server-side CORS-free proxies
│   │   │       ├── leetcode/     # LeetCode GraphQL query
│   │   │       ├── codeforces/   # Codeforces REST API
│   │   │       ├── gfg/          # GeeksforGeeks scraper
│   │   │       └── contests/     # Live contest aggregator
│   │   ├── globals.css           # Custom dark theme & heatmap styles
│   │   ├── layout.tsx            # Root layout & metadata
│   │   └── page.tsx              # Main dashboard application
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation & streak counter
│   │   ├── TodayCheckInBanner.tsx# Daily consistency banner
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
├── vercel.json                   # Vercel deployment & cron config
├── package.json
└── README.md
```
