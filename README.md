# Nexus Control Center

Premium, lightweight internal management dashboard for Nexus.

## Stack

- Next.js (App Router) + TypeScript
- PostgreSQL + Prisma
- Tailwind CSS
- Session-based auth (HTTP-only cookies, bcrypt)

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL` and `AUTH_SECRET` (min 32 chars).

3. Install & migrate:

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

## Demo accounts

| Role  | Email           | Password   |
|-------|-----------------|------------|
| Owner | owner@nexus.gr  | owner123!  |
| HR    | hr@nexus.gr     | hr123!     |

## Access model

- **Owner** — full access including Finance, Payments, Salary, Settings, Audit Log
- **HR** — People, HR, Work modules only (no financial data server-side)

Employees are records only — they do not log in.

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # production server
npm run db:migrate   # apply migrations
npm run db:seed      # seed demo data
npm run db:studio    # Prisma Studio
```

## Deploy (Vercel)

1. Create a PostgreSQL database (Neon, Supabase, etc.)
2. Set env vars: `DATABASE_URL`, `AUTH_SECRET`
3. Build command: `prisma generate && next build`
4. Run migrations against production DB before first deploy
