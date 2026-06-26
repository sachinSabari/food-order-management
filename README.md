# Order Up — Order Management Feature

An Order Management feature for a food delivery app: browse a menu, build a
cart, check out with delivery details, and track the order status live as it
moves from **Order Received → Preparing → Out for Delivery → Delivered**.

Built as a take-home assessment. Two packages, one repo:

```
food-order-management/
├── client/   React + Vite + TypeScript frontend
└── server/   Node + Express + TypeScript REST API
```

## Why two separate apps instead of one Next.js app

A single Next.js app would have been the faster path to a single Vercel
deploy. I went with a separate Express API on purpose, for two reasons:

1. **Real-time status updates use Server-Sent Events (SSE)**, which need a
   long-lived HTTP connection per client. That's a poor fit for short-lived
   serverless functions (Vercel/Netlify functions), and a natural fit for a
   regular long-running Node process.
2. It mirrors a more conventional "frontend talks to a REST API" setup,
   which made it easier to keep the API boundary, validation, and tests
   honest and explicit rather than letting client and server code blur
   together.

## Architecture

**Server** (`server/`)
- `routes/` → thin Express route handlers (HTTP concerns only)
- `services/` → business logic: pricing, status transitions, SSE fan-out
- `data/store.ts` → in-memory repository behind a small interface, so
  swapping in Postgres/Mongo later only touches this one file
- `schemas/` → Zod request validation
- `middleware/` → validation + centralized error handling

Order totals are **always recomputed server-side** from the current menu
prices — the client sends `menuItemId` + `quantity`, never a price. This
closes off a basic price-tampering vector.

**Client** (`client/`)
- `pages/` → `MenuPage`, `CheckoutPage`, `OrderStatusPage`
- `context/CartContext.tsx` → cart state (no backend needed until checkout)
- `hooks/useOrderStream.ts` → subscribes to the order's SSE stream
- `api/` → typed fetch wrappers

**Real-time updates**: when an order is created, the server schedules itself
to walk the order through the remaining statuses on a timer, pushing each
change over SSE to any client subscribed to that order's stream
(`GET /api/orders/:id/stream`). The status can also be moved forward
manually via `PATCH /api/orders/:id/status`.

## Running it locally

Requires Node 18+.

```bash
# Terminal 1 — API
cd server
cp .env.example .env
npm install
npm run dev        # http://localhost:4000

# Terminal 2 — frontend
cd client
cp .env.example .env
npm install
npm run dev         # http://localhost:5173
```

## Running tests

```bash
cd server && npm test   # 21 tests — routes, validation, status transitions
cd client && npm test   # 11 tests — cart logic, components, checkout flow
```

## API reference

| Method | Path                       | Description                                  |
|--------|-----------------------------|-----------------------------------------------|
| GET    | `/api/menu`                 | List available menu items                     |
| GET    | `/api/menu/:id`              | Get one menu item                             |
| POST   | `/api/orders`                | Place an order (validates + prices server-side) |
| GET    | `/api/orders`                | List orders (most recent first)               |
| GET    | `/api/orders/:id`            | Get a single order                            |
| PATCH  | `/api/orders/:id/status`     | Manually advance status (rejects going backwards) |
| GET    | `/api/orders/:id/stream`     | SSE stream of live status updates             |

All error responses use the shape `{ "error": { "message": "...", "details"?: [...] } }`.

## Deploying

- **Client** → Vercel or Netlify (static build via `npm run build`, output in `client/dist`). Set `VITE_API_URL` to the deployed API URL.
- **Server** → a host that supports a persistent Node process (Render, Railway, Fly.io). Set `CLIENT_ORIGIN` to the deployed frontend URL so CORS allows it.

## Notable edge cases handled

- Unknown / unavailable menu items in an order → `400`
- Zero, negative, fractional, or absurdly large quantities → `400`
- Missing/invalid delivery name, address, or phone → `400` with per-field messages
- Moving an order's status backwards → `400`
- Requesting a non-existent order or menu item → `404`
- Basic abuse protection on `/api/orders` via rate limiting

## Use of AI in building this

This project was built with Claude's help across the full stack:
- Scaffolding the Express service layout (routes/services/data separation) and the Zod validation schemas
- Generating the bulk of the test suites (Vitest + Supertest on the API, Vitest + React Testing Library on the frontend), which I then reviewed and adjusted (e.g. fixing a few ambiguous test queries and an incorrect relative import)
- Iterating on the SSE-based status simulation design and on the visual design system (the "order ticket" theme)

I reviewed and ran everything locally before committing — all 32 tests pass and both `tsc --noEmit` and `vite build` are clean.
