# Dreammy Admin (Next.js)

The **admin management app** for Dreammy — manage Sky game services, orders, vouchers and reports.
It is a standalone Next.js app that lives beside the existing Laravel customer site.

Repo layout (two sibling apps sharing ONE Supabase Postgres database):
- `../customer/` — **Laravel customer site** (`cd customer && php artisan serve`). Reads the shared DB directly via `pgsql`.
- `../admin/` (this folder) — **Next.js admin frontend**. Reads/writes the shared DB via Supabase.

> **Live data.** The admin is backed by Supabase. Services published here (status `active`) appear on
> the customer catalogue; image uploads go to Supabase Storage. The customer app reads the same tables.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v3 (Dreammy design tokens ported from the root `tailwind.config.js`)
- Recharts for charts
- `@supabase/supabase-js` — reached only through server-only route handlers (see Architecture)

## Environment

Copy `.env.example` → `.env.local` and fill in your Supabase keys:

| Var | Scope | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | public | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | publishable key |
| `SUPABASE_SECRET_KEY` | **server-only** | service_role / secret key. NEVER prefix with `NEXT_PUBLIC`. Used only in `src/app/api/admin/**`. |
| `SUPABASE_SERVICE_IMAGES_BUCKET` | server | defaults to `service-images` (auto-created, public) |
| `SUPABASE_ORDER_SCREENSHOTS_BUCKET` | server | defaults to `order-screenshots` (auto-created, public) |

The database schema is owned by the Laravel migrations in `../customer/database/migrations`; run those
against Supabase first (see `../customer` and the project plan). This app never runs migrations.

## Run

```bash
cd admin
npm install
npm run dev      # http://localhost:3100  (→ redirects to /admin)
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build on :3100
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

The customer site runs separately: `cd customer && php artisan serve`.

## Admin routes

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard: revenue / orders / refunds, revenue & service-sales charts, recent orders |
| `/admin/services` | Service list: search, filters, pagination, publish/unpublish, archive |
| `/admin/services/new`, `/admin/services/[id]/edit` | Shared create/edit form + live preview |
| `/admin/vouchers` | Voucher list + create/edit form (fixed/%, MYT validity, limits, eligibility) |
| `/admin/orders` | Order list + filters + **real CSV export** (column picker, injection-safe) |
| `/admin/orders/[id]` | Order detail: guardian, status, progress, timeline, screenshots, actions |
| `/admin/reports` | Gross / discounts / refunds / net, charts, CSV + print-to-PDF, MYR & CNY separate |
| `/admin/settings` | Honest disabled placeholder (built later) |

## Architecture

```
src/
  app/admin/…      route groups + pages (client components where interactive)
  components/
    admin/…        shell (sidebar/header/bottom-nav), StatCard, tables, charts, ImageSlot, …
    ui/…           Button, Input, Select, Dialog, Toast, Badge, … (design-system primitives)
  app/api/admin/…  server-only route handlers (talk to Supabase with the secret key)
  lib/
    api/           AdminApi interface + httpAdapter (index swap point) + server/db.ts + mappers.ts
    supabase/      server.ts — server-only Supabase client (secret key)
    upload.ts      client helper: POST file → /api/admin/upload → Supabase Storage URL
    exports/       CSV builders for orders & reports
    money.ts csv.ts format.ts images.ts cn.ts
  types/           Service, Voucher, Order, Guardian, Transaction, Report, Dashboard
public/images/dreammy/{brand,avatars,services,backgrounds,decorations}/  + ASSET-MANIFEST.md
```

### Data flow & security

Pages (`'use client'`) call the `api` facade (`src/lib/api`). `api` is the `httpAdapter`, which
`fetch`es `/api/admin/**` route handlers. Those handlers run **on the server** and use
`src/lib/supabase/server.ts` (the **secret key**) via `src/lib/api/server/db.ts`. Because the secret
client is `import 'server-only'`, it can never be bundled into the browser.

```
page.tsx → api (httpAdapter) → /api/admin/* route handler → db.ts → Supabase (secret key)
```

- Column mapping (snake_case DB ↔ camelCase types) lives in `src/lib/api/mappers.ts`.
- All money is **integer minor units** (`{ minor, currency }`); **MYR and CNY are kept separate.**
- Swapping the data source is still a one-line change in `src/lib/api/index.ts`.

### Images

`ImageSlot` reserves the aspect ratio and never shows a broken icon. Uploaded service images and
order screenshots are stored in Supabase Storage (public buckets, auto-created on first upload) and
`image_key` holds the full public URL — `src/lib/images.ts#assetPath` passes `http(s)` URLs through
untouched.

## Authentication & roles (RBAC)

The admin is gated by **Supabase Auth** (`middleware.ts`): every `/admin` page redirects to `/login`
when signed out, and every `/api/admin/*` route returns `401`. Admin team members are Supabase
`auth.users`, tracked in the `team_members` table with a **role**:

| Role | Access |
|------|--------|
| owner | Everything incl. managing the team (Settings → Team). |
| admin | Everything except team management. |
| manager | Create/edit services, vouchers, orders. |
| viewer | Read-only. |

Server enforcement lives in `src/lib/auth/session.ts` (`requireRole`) + `src/lib/auth/roles.ts`;
mutating routes use `handleWithRole(MUTATE_ROLES, …)`. Invitations (Settings → Team, owner only) call
Supabase `inviteUserByEmail` (cloud-sends the email) and also show a **copyable invite link**.

### First-time setup

1. **Supabase dashboard → Auth → URL Configuration**: set **Site URL** `http://localhost:3100` and add
   redirect URL `http://localhost:3100/admin/../auth/callback` → i.e. `http://localhost:3100/auth/callback`.
   (For email invites to send, configure **SMTP** under Auth → Email; the copyable link works without it.)
2. **Bootstrap the first owner** (nobody can invite until one exists):
   ```bash
   # Direct password (works immediately, no email/SMTP needed):
   npm run invite-owner -- you@example.com "YourPassword123"
   # …or invite by email + copyable link:
   npm run invite-owner -- you@example.com
   ```
3. Sign in at `http://localhost:3100/login`, then invite the rest of the team from **Settings**.

## Security notes / follow-ups

- Rotate the Supabase keys + any bootstrap password if they were shared in plaintext.
- The secret key stays server-only. Optionally enable Postgres RLS to further lock the anon key
  (the customer app reads via direct Postgres and bypasses RLS).

## Known limitations

- Orders/guardians exist in the shared DB but there is no customer checkout flow yet, so the
  Orders/Reports/Dashboard screens are empty until orders are created.
- PDF export uses the browser's **print-to-PDF**; CSV is the primary real export.
