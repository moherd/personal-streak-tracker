# Personal Streak Tracker

A clean, minimalist personal habit and streak-tracking web application built with React, Vite, and Supabase PostgreSQL.

Designed as a personal productivity product to commit to consistent habits, maintain daily/weekly streaks, analyze consistency patterns, and highlight habits that need attention.

---

## 1. Project Location

```
C:\wamp64\www\personal-streak-tracker
```

---

## 2. Technology Stack

- **Frontend**: React 18 (ES6+ JavaScript), Vite
- **Styling**: Modern CSS3 (CSS Variables, Flexbox/Grid, Responsive Typography)
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security and Auth)
- **Hosting**: Vercel ready (with `vercel.json` SPA routing rewrites)
- **Version Control**: Git & GitHub

---

## 3. Features

### 📊 Dashboard
- **Active Habits Count**: Total habits currently in progress.
- **Today's Completion Checklist**: Interactive list of daily commitments with instant toggle & undo.
- **Key Metrics Cards**: Completed today, today's completion rate, cumulative active streaks, longest streak record, and weekly consistency percentage.
- **7-Day Consistency Chart**: Visual bar visualization showing completion rate for the past week.

### 🎯 Habit Management
- Create, edit, and archive habits.
- Customizable habit categories (Health & Fitness, Productivity, Learning, Mindfulness, Finance, Personal, or custom).
- Flexible frequency: Daily or Weekly target (e.g. 3x/week).
- Color accents for visual distinction.
- Archive functionality for paused habits without deleting historical records.
- Delete with confirmation safeguard.

### 🔥 Accurate Streak Calculation Engine
- **Timezone-Safe Date Handling**: Calendar arithmetic operates strictly on `YYYY-MM-DD` strings, avoiding daylight savings and UTC timezone drift.
- **Daily Habits**: Consecutive calendar completions increase current streak. Missing a day resets the current streak to 0, while safely preserving the longest streak record.
- **Pending Today Status**: If yesterday was completed, the streak remains active today until the day ends.
- **Weekly Habits**: Evaluates completions per calendar week against the user's weekly target.
- **Instant Undo**: Accidentally marked complete? Undo immediately recalculates the streak and updates the database.

### 📅 Calendar History
- Monthly calendar grid view with previous/next month navigation and a "Today" quick jump.
- Daily habit count pills and colored completion dots.
- Click any calendar date to inspect and manage completions for that specific day.

### 📈 Habit Health & Analytics
- **Consistency Analysis**: Automatic categorization of habits into *Strong* (≥ 80%), *Moderate* (50-79%), and *Needs Attention* (< 50%).
- **Friction Identification**: Highlights habits that are repeatedly missed to help adjust goals or rebuild momentum.
- **Streak Hall of Fame**: Leaderboard ranking habits by their historical longest streaks.
- **JSON Data Export**: Full export of habits and logs for personal offline backups.

---

## 4. Local Development

### Prerequisites
- Node.js (v18+)
- npm

### Running the Application

1. Open your terminal in the project folder:
   ```bash
   cd C:\wamp64\www\personal-streak-tracker
   ```

2. Dependencies are already installed. If needed:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

5. Run the streak calculation test suite:
   ```bash
   npm test
   ```

---

## 5. Supabase Setup & Configuration

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Under **Project Settings -> API**, copy your:
   - **Project URL**
   - **anon (public) Key**

### Step 2: Configure Environment Variables
Create a `.env` file in `C:\wamp64\www\personal-streak-tracker\` (or copy from `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 3: Run Database Migration
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Open the file `supabase/schema.sql` (or `supabase/migrations/20240101000000_init_schema.sql`).
3. Paste the entire SQL script and click **Run**.
4. This creates:
   - `profiles` table (with auto-sync on new user signup)
   - `habits` table (with Row Level Security)
   - `habit_logs` table (with unique constraint on `(habit_id, completed_date)` to guarantee zero duplicate logs)
   - Indexes for fast queries
   - RLS security policies isolating each user's records to `auth.uid() = user_id`.

---

## 6. Pushing to GitHub

1. Initialize git and commit:
   ```bash
   cd C:\wamp64\www\personal-streak-tracker
   git init
   git add .
   git commit -m "feat: initial commit of personal streak tracker"
   ```

2. Create a new repository on [github.com](https://github.com/new).

3. Link and push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/personal-streak-tracker.git
   git branch -M main
   git push -u origin main
   ```

---

## 7. Deploying to Vercel

1. Log in to [vercel.com](https://vercel.com) and click **Add New -> Project**.
2. Import your GitHub repository `personal-streak-tracker`.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Click **Deploy**.
5. Vercel automatically builds Vite and applies the SPA routing rules configured in `vercel.json`.
