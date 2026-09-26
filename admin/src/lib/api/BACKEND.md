# Backend integration notes (Laravel API)

The admin app talks to **one interface**: `AdminApi` (`src/lib/api/AdminApi.ts`). Today it is backed by
`mockAdapter` (in-memory, `src/lib/api/mockAdapter.ts`). To go live, implement `AdminApi` with `fetch`
calls to the Laravel API and swap the export in `src/lib/api/index.ts`. **No page or component changes
are required.**

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
| `listOrders(query)` | GET | `/api/admin/orders` | all filters + pagination |
| `getOrder(id)` | GET | `/api/admin/orders/{id}` | |
| `assignGuardian(id,guardianId)` | PATCH | `/api/admin/orders/{id}/guardian` | `{ guardianId }` |
| `updateFulfillment(id,status)` | PATCH | `/api/admin/orders/{id}/fulfillment` | `{ status }` |
| `completeOrder(id)` | POST | `/api/admin/orders/{id}/complete` | requires completion screenshot server-side |
| `cancelOrder(id)` | POST | `/api/admin/orders/{id}/cancel` | |
| `requestRefund(id)` | POST | `/api/admin/orders/{id}/refund` | initiates refund workflow (not a real charge here) |
| `saveInternalNote(id,note)` | PATCH | `/api/admin/orders/{id}/note` | `{ note }` |
| `setScreenshot(id,slot,url)` | POST | `/api/admin/orders/{id}/screenshot` | multipart upload → returns stored URL |
| `getReport(currency)` | GET | `/api/admin/reports?currency=MYR` | gross/discounts/refunds/net + series |

## Data shapes

The request/response shapes are exactly the TypeScript types in `src/types/` (`Service`, `Voucher`,
`Order`, `Guardian`, `ReportSummary`, `DashboardMetrics`, `Paginated<T>`, …). Keep the Laravel API
resources aligned to these and the mock swap is 1:1.

## Uploads

`setScreenshot` and the service-image field currently create **local object URLs only** (browser
preview). No file is uploaded until the Laravel endpoint (backed by Firebase Storage or Laravel disk)
is implemented; it should accept multipart form-data and return the stored file URL.
