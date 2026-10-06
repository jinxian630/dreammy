# Backend integration notes

The admin app talks to **one interface**: `AdminApi` (`src/lib/api/AdminApi.ts`).

**Live implementation (current):** `httpAdapter` (`src/lib/api/httpAdapter.ts`) forwards each method to
a Next.js route handler under `src/app/api/admin/**`, which queries the shared **Supabase** Postgres
DB using the server-only secret key (`src/lib/supabase/server.ts` → `src/lib/api/server/db.ts`). The
DB schema is owned by the Laravel migrations in `../../customer/database/migrations`; snake_case ↔
camelCase mapping lives in `src/lib/api/mappers.ts`. The path/method map below documents those route
handlers (it also mirrors how a standalone Laravel `/api/admin/*` API could implement the same contract).

> Security: an `/admin` route or any frontend role check is **not** security. The Laravel API MUST
> authenticate the admin (e.g. Sanctum/session) and authorize every endpoint server-side. Never place
> Firebase service-account keys or other secrets in this frontend.

## Money

All money crosses the wire as **integer minor units** (sen/fen) plus a `currency` (`MYR` | `CNY`),
matching `App\Domain\Money\Money`. The frontend never sends or trusts floats. MYR and CNY are always
reported separately.

## Suggested endpoints → `AdminApi` method mapping

| Method (frontend) | HTTP | Path | Notes |
|---|---|---|---|
| `getDashboard(currency)` | GET | `/api/admin/dashboard?currency=MYR` | metrics + trend + recent orders |
| `listServices(query)` | GET | `/api/admin/services` | `search,category,status,page,perPage` → paginated |
| `getService(id)` | GET | `/api/admin/services/{id}` | |
| `createService(input)` | POST | `/api/admin/services` | returns created `Service` |
| `updateService(id,input)` | PUT | `/api/admin/services/{id}` | |
| `setServiceStatus(id,status)` | PATCH | `/api/admin/services/{id}/status` | `{ status }` |
| `archiveServices(ids)` | POST | `/api/admin/services/archive` | `{ ids: [] }` |
| `listVouchers(query)` | GET | `/api/admin/vouchers` | `search,status`; server returns derived `status` |
| `getVoucher(id)` | GET | `/api/admin/vouchers/{id}` | |
| `createVoucher(input)` | POST | `/api/admin/vouchers` | |
| `updateVoucher(id,input)` | PUT | `/api/admin/vouchers/{id}` | |
| `listGuardians()` | GET | `/api/admin/guardians` | |
| `listStaff()` | GET | `/api/admin/staff` | active team members assignable to orders; any active member may read |
| `listOrders(query)` | GET | `/api/admin/orders` | all filters + pagination; `assignedStaffId` accepts a user id or `unassigned` |
| `getOrder(id)` | GET | `/api/admin/orders/{id}` | |
| `assignGuardian(id,guardianId)` | PATCH | `/api/admin/orders/{id}/guardian` | `{ guardianId }` (external fulfiller, not a team role) |
| `assignStaff(id,staffId)` | PATCH | `/api/admin/orders/{id}/assignee` | `{ staffId }` (null clears); the `guardian` team role may only self-assign / self-release |
| `updateFulfillment(id,status)` | PATCH | `/api/admin/orders/{id}/fulfillment` | `{ status }` |
| `completeOrder(id)` | POST | `/api/admin/orders/{id}/complete` | requires completion screenshot server-side |
| `cancelOrder(id)` | POST | `/api/admin/orders/{id}/cancel` | |
| `requestRefund(id)` | POST | `/api/admin/orders/{id}/refund` | initiates refund workflow (not a real charge here) |
| `saveInternalNote(id,note)` | PATCH | `/api/admin/orders/{id}/note` | `{ note }` |
| `setScreenshot(id,slot,url)` | POST | `/api/admin/orders/{id}/screenshot` | multipart upload → returns stored URL |
| `getReport(currency)` | GET | `/api/admin/reports?currency=MYR` | gross/discounts/refunds/net + series |

## Data shapes

The request/response shapes are exactly the TypeScript types in `src/types/` (`Service`, `Voucher`,
`Order`, `Guardian`, `StaffOption`, `ReportSummary`, `DashboardMetrics`, `Paginated<T>`, …). Keep the
Laravel API resources aligned to these and the mock swap is 1:1.

`Order.assignment` (the internal staff responsible for the order) is backed by the
`assigned_staff_id` / `assigned_staff_email` / `assigned_by_id` / `assigned_by_email` / `assigned_at`
columns added in `2026_07_02_000009_add_staff_assignment_to_orders.php`; it is `null` when unassigned.
This is distinct from `guardianId` (the external fulfiller). Each `assignStaff` call also appends an
order timeline event.

## Uploads

`setScreenshot` and the service-image field currently create **local object URLs only** (browser
preview). No file is uploaded until the Laravel endpoint (backed by Firebase Storage or Laravel disk)
is implemented; it should accept multipart form-data and return the stored file URL.
