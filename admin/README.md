# Dreammy Admin (Next.js)

The **admin management app** for Dreammy — manage Sky game services, orders, vouchers and reports.
It is a standalone Next.js app that lives beside the existing Laravel customer site.

Repo layout (two sibling apps):
- `../customer/` — **Laravel customer site + future API** (`cd customer && php artisan serve`). Untouched by this app.
- `../admin/` (this folder) — **Next.js admin frontend**. Talks only to a replaceable mock API.

> **Demo mode.** Every screen runs on in-memory mock data. No real payments, refunds, uploads,
> authentication or database writes happen. Image-upload fields are **local previews only**.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v3 (Dreammy design tokens ported from the root `tailwind.config.js`)
- Recharts for charts
- No backend calls — a mock `AdminApi` adapter stands in for Laravel

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
  lib/
    api/           AdminApi interface + mockAdapter + index (swap point) + BACKEND.md
    mock/          typed seed data — single source of truth for all pages
    exports/       CSV builders for orders & reports
    money.ts csv.ts format.ts images.ts cn.ts
  types/           Service, Voucher, Order, Guardian, Transaction, Report, Dashboard
public/images/dreammy/{brand,avatars,services,backgrounds,decorations}/  + ASSET-MANIFEST.md
```

### Data & money

- All money is stored as **integer minor units** (`{ minor, currency }`) and formatted only for
  display. **MYR and CNY are always kept separate.**
- Pages read data exclusively through `api` (`src/lib/api`). No mock records are embedded in
  components, so replacing the adapter is a one-line change.

### Images

All artwork areas are **empty reserved slots** (`ImageSlot`) that hold the correct aspect ratio and
never show a broken-image icon. Drop files into `public/images/dreammy/**` per `ASSET-MANIFEST.md`
and they appear automatically. Nothing is generated or fetched remotely.

## Connecting the real Laravel API

See [`src/lib/api/BACKEND.md`](src/lib/api/BACKEND.md) for the full endpoint → method map and payload
shapes. In short:

1. Implement the `AdminApi` interface with `fetch` calls to Laravel (shapes already match `src/types`).
2. Swap the export in `src/lib/api/index.ts`:
   ```ts
   export const api: AdminApi = httpAdapter; // was mockAdapter
   ```
3. No page/component changes required. The Laravel API lives in `../customer/` (root routes in
   `customer/routes/`); add the `/api/admin/*` endpoints there.

**Security:** the `/admin` routes and any frontend role check are **not** security. The Laravel API
must authenticate and authorize every admin request server-side. Keep Firebase service-account keys
and other secrets out of this frontend entirely.

## Known limitations

- Backend + Firebase are **not** wired — everything is mock/in-memory and resets on reload.
- Uploads are local object-URL previews only (no storage).
- PDF export uses the browser's **print-to-PDF** (Save as PDF in the print dialog); a print
  stylesheet hides the app chrome and prints the report area. CSV is the primary real export.
- Dashboard/report aggregate figures represent a full period; the Orders list is a curated recent
  subset of that period (documented in `src/lib/mock/orders.ts`).
