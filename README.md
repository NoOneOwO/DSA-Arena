# DSA Arena

A gamified Data Structures & Algorithms tracking platform where friends compete, track progress, and stay motivated together. Built with Next.js 15, PostgreSQL, Prisma, and Tailwind CSS.

## Features

- **User Authentication** - JWT-based signup/login with secure httpOnly cookies
- **Problem Tracking** - 86 curated DSA problems across 17 topics with solve/attempt status
- **XP & Leveling** - Earn XP for solving problems (Easy: 10, Medium: 25, Hard: 50) with streak bonuses
- **Leaderboard** - Compete with friends ranked by XP, problems solved, or streak
- **Friend System** - Add friends via username or invite code, view each other's progress
- **Streak Tracking** - Daily streak with bonus XP, longest streak tracking
- **Topic Progress** - Hierarchical topic breakdown with progress bars (Trees, Graphs, DP with subtopics)
- **Badges & Achievements** - Unlock badges like "Consistency King", "Hard Slayer", "Grinder"
- **Profile Pages** - Detailed profiles with topic breakdown, badges, and activity timeline
- **Dark Mode** - Full dark/light theme support
- **Mobile Responsive** - Works on all screen sizes
- **Confetti Animation** - Celebration on solving problems

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, ShadCN UI, Radix UI Primitives |
| Backend | Next.js API Routes |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Charts | Recharts |
| Animations | canvas-confetti, tailwindcss-animate |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### 1. Clone and Install

```bash
git clone <repo-url>
cd dsa-arena
npm install
```

### 2. Configure Environment

Copy the example env file and update with your database URL:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/dsa_arena?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (86 problems, 6 badges, 3 demo users)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts (after seeding)

| Username | Email | Password |
|----------|-------|----------|
| ali | ali@test.com | password123 |
| zaid | zaid@test.com | password123 |
| sara | sara@test.com | password123 |

All three users are pre-configured as friends with some solved problems and activity history.

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated app pages
│   │   ├── dashboard/      # Main dashboard
│   │   ├── problems/       # Problem tracker
│   │   ├── leaderboard/    # Friend leaderboard
│   │   ├── friends/        # Friend management
│   │   └── profile/[user]/ # User profiles
│   ├── (auth)/             # Auth pages (login, signup)
│   ├── api/                # API routes
│   │   ├── auth/           # Auth endpoints
│   │   ├── problems/       # Problem CRUD + solve
│   │   ├── friends/        # Friend requests
│   │   ├── leaderboard/    # Leaderboard data
│   │   ├── profile/        # User profiles
│   │   ├── dashboard/      # Dashboard aggregation
│   │   └── activity/       # Activity feed
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # ShadCN UI components
│   ├── layout/             # Navbar, Sidebar, AppShell
│   ├── dashboard/          # Dashboard widgets
│   ├── problems/           # Problem table, filters, topic progress
│   ├── leaderboard/        # Leaderboard table
│   ├── profile/            # Profile header, badges, timeline
│   └── friends/            # Friend cards, add dialog, requests
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities (auth, prisma, xp, topics)
└── providers/              # Context providers (auth, theme)
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed script
```

## DSA Topics Covered

1. Arrays (8 problems)
2. Strings (6 problems)
3. Linked List (5 problems)
4. Stack (4 problems)
5. Queue (3 problems)
6. Recursion (3 problems)
7. Binary Search (5 problems)
8. Trees - Binary Tree, BST, Traversals (8 problems)
9. Heap / Priority Queue (3 problems)
10. Hashing (4 problems)
11. Graphs - BFS, DFS, Shortest Path (8 problems)
12. Dynamic Programming - 1D DP, 2D DP, Knapsack (10 problems)
13. Greedy (4 problems)
14. Backtracking (4 problems)
15. Sliding Window (4 problems)
16. Two Pointers (4 problems)
17. Bit Manipulation (3 problems)

## XP & Level System

- **Easy**: 10 XP | **Medium**: 25 XP | **Hard**: 50 XP
- **First problem of the day**: +10 XP bonus
- **Streak bonus**: +5 XP per streak day (up to 30 days)
- **Level formula**: `Level = floor(sqrt(XP / 100))`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/problems` | List problems (filterable) |
| POST | `/api/problems/[id]/solve` | Mark problem solved/attempted |
| GET | `/api/friends` | List friends |
| POST | `/api/friends/request` | Send friend request |
| PATCH | `/api/friends/[id]` | Accept/reject request |
| DELETE | `/api/friends/[id]` | Remove friend |
| GET | `/api/friends/pending` | Pending requests |
| GET | `/api/leaderboard` | Friend leaderboard |
| GET | `/api/profile/[username]` | User profile |
| GET | `/api/dashboard` | Dashboard data |
| GET | `/api/activity` | Activity feed |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```

## License

MIT
