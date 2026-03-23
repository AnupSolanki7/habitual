# HabitFlow — Habit Tracker MVP

A production-ready habit tracking SaaS application built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, NextAuth, and MongoDB Atlas.

## Features

- **Authentication** — Email/password login and registration with NextAuth
- **Habit Tracking** — Create yes/no, count, and duration habits
- **Frequencies** — Daily, weekly, or custom day schedules
- **Streaks** — Current and longest streak calculations
- **Analytics** — Completion rates, weekly charts, habit breakdowns
- **Calendar View** — Monthly progress heatmap per habit
- **In-App Notifications** — Daily reminder notifications stored in MongoDB
- **Journal & Mood** — Daily journal entries with mood tracking
- **Dark Mode** — Full dark/light theme support
- **SaaS-Ready** — Free/Pro plan model with free plan habit limits (3 habits)
- **Responsive** — Mobile-first layout with collapsible sidebar

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth v4 (Credentials) |
| Database | MongoDB Atlas + Mongoose |
| Validation | Zod + React Hook Form |
| Charts | Recharts |
| Date Handling | date-fns |
| Theme | next-themes |

## Project Structure

```
habit-tracker/
├── app/
│   ├── (marketing)/         ← Public landing page
│   ├── (auth)/              ← Login + Register pages
│   ├── (app)/               ← Protected app pages
│   │   ├── dashboard/
│   │   ├── habits/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── settings/
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/
│       │   └── register/
│       └── settings/profile/
├── components/
│   ├── ui/                  ← shadcn/ui components
│   ├── layout/              ← Sidebar, Header, MobileNav
│   ├── habits/              ← Habit-specific components
│   ├── dashboard/           ← Dashboard widgets
│   ├── analytics/           ← Charts and stats
│   ├── notifications/       ← Bell + notification items
│   ├── journal/             ← Journal form
│   └── providers/           ← SessionProvider + ThemeProvider
├── models/                  ← Mongoose schemas
├── lib/                     ← DB, auth, utils, business logic
├── actions/                 ← Server actions
├── hooks/                   ← Client-side hooks
├── types/                   ← TypeScript interfaces
├── constants/               ← App-wide constants
└── scripts/                 ← Seed script
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas account (free tier works great)

### 1. Clone and install

```bash
git clone <repo-url>
cd habit-tracker
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habit-tracker?retryWrites=true&w=majority

# NextAuth — must be a random string at least 32 characters
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
```

**Getting your MongoDB URI:**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Go to Database → Connect → Connect your application
3. Copy the connection string and replace `<password>` with your DB user password

**Generating NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. (Optional) Seed the database

Populate the database with a demo user and 30 days of sample data:

```bash
npm run seed
```

This creates:
- User: `demo@habitflow.app` / `demo1234`
- 3 sample habits (Morning Run, Read, Meditate)
- 30 days of randomized habit logs
- A welcome notification
- A sample journal entry

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Design Decisions

### Route Groups
Three route groups cleanly separate concerns:
- `(marketing)` — Public-facing pages, no auth required
- `(auth)` — Login/register with centered card layout
- `(app)` — Protected pages with sidebar navigation

### Server Actions over API Routes
All data mutations use Next.js server actions instead of REST API routes. This provides type-safe, co-located server code without the overhead of API endpoints. Only NextAuth and the register endpoint use API routes.

### In-App Notifications
No external services. Notifications are:
1. Generated on dashboard load via `generateDailyReminders()`
2. Stored in the `notifications` MongoDB collection
3. Deduped — only one reminder per user per day
4. Displayed with read/unread states and badge counts

### Streak Calculation
Streaks are calculated on-demand from `HabitLog` data:
- Walks backward from today
- Skips non-due days (e.g., custom weekday habits)
- A missed due day breaks the streak

### Plan Enforcement
No payment integration, but the plan model is ready:
- `User.plan` field: `"free"` | `"pro"`
- Free plan: max 3 active habits (enforced in `createHabit` server action)
- Pro plan: unlimited habits
- Upgrade UI placeholder on Settings page

## Free Plan Limits

| Feature | Free | Pro |
|---|---|---|
| Active habits | 3 | Unlimited |
| Analytics | Basic | Advanced |
| Journal entries | ✅ | ✅ |
| Notifications | ✅ | ✅ |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

Make sure to:
- Set `NEXTAUTH_URL` to your production URL (e.g., `https://yourapp.vercel.app`)
- Add your Vercel domain to MongoDB Atlas network access

### Environment variables for production

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=<strong-random-secret>
```

## What to Build Next

### Immediate improvements
- [ ] Email verification on registration
- [ ] Password reset flow (with in-app token, no email service)
- [ ] Profile avatar upload
- [ ] Timezone-aware date handling
- [ ] Habit reordering (drag and drop)

### Features for Pro tier
- [ ] Stripe integration for billing
- [ ] Unlimited habits (already enforced as free limit)
- [ ] Data export (CSV/JSON)
- [ ] Habit templates library
- [ ] Team/accountability partner features

### Notifications
- [ ] Cron job (Vercel cron or external) to generate reminders at specific times
- [ ] Browser push notifications (with service worker)
- [ ] Weekly summary digest

### Analytics
- [ ] Monthly completion heatmap (GitHub-style)
- [ ] Habit correlation insights
- [ ] Best time of day analysis
- [ ] Streak milestones and achievement badges

### Performance
- [ ] React Query / SWR for client-side data fetching and caching
- [ ] Optimistic updates across all mutations
- [ ] Pagination for logs and notifications
- [ ] MongoDB indexes optimization

### Quality
- [ ] Unit tests for streak/analytics logic (Jest)
- [ ] E2E tests (Playwright)
- [ ] Error boundary components
- [ ] Loading skeletons for all pages

## License

MIT
# habitual
