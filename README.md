# Advantage One Interactive Portal — Frontend (`AIP_UI`)

React + TypeScript SPA for the Advantage One Interactive Portal. All production data comes from the .NET API (`AIP_Backend`); the UI uses Axios against `VITE_API_BASE_URL` (or the Vite dev proxy).

## Tech stack

- React 19, TypeScript, Vite
- Tailwind CSS, Radix / shadcn-style primitives under `src/components/ui`
- React Router, TanStack Query, Redux Toolkit (users slice)
- Zod + react-hook-form on complex forms

## Getting started

### Prerequisites

- Node.js 18+
- npm
- Running API (local default: `http://127.0.0.1:5128` via Vite proxy)

### Install

```bash
npm install
```

### Environment

Copy `.env.example` values as needed:

- `VITE_API_BASE_URL` — production API root including `/api` (required for production builds)
- `VITE_DEV_PROXY_TARGET` — backend URL for `npm run dev` when not using default localhost
- `VITE_DEBUG_LOGS=true` — verbose client logging in development only
- `VITE_API_TIMEOUT_MS` — optional Axios timeout

### Run development server

```bash
npm run dev
```

### Build and quality checks

```bash
npm run build
npm run lint
npm run typecheck
```

## Source layout (`src/`)

| Folder | Responsibility |
|--------|----------------|
| `main.tsx` | DOM mount, Redux `Provider` |
| `App.tsx` | Global providers, error boundary, router |
| `routes.tsx` | Route table, lazy customer routes, layout shell |
| `pages/` | Route-level screens (data loading, page layout) |
| `components/` | Reusable UI by domain (`operations`, `customer-setup`, `crm`, …) |
| `components/ui/` | Shared primitives (shadcn); avoid business logic here |
| `services/` | HTTP clients and DTO mapping to the API |
| `api/` | Thin API modules tightly coupled to backend contracts (e.g. page access) |
| `contexts/` | Auth, page access, customer selection |
| `state/` | `sessionStore` (tokens, user snapshot for interceptors) |
| `config/` | `api.ts` endpoints, navigation definitions, customer page registry |
| `types/` | Shared TypeScript interfaces |
| `utils/` | Pure helpers (roles, customer id, guards, mappers) |
| `hooks/` | Reusable React hooks |
| `store/` | Redux slices |

## Bootstrap flow

1. `main.tsx` renders `App` inside Redux `Provider`.
2. `App.tsx` wraps the tree with QueryClient, theme, auth, customer selection, toasts, and `RouterProvider`.
3. `routes.tsx` defines public routes (login, reset password) and authenticated routes under `Layout` + `ProtectedRoute`.
4. Pages call `services/*` (or React Query wrappers); services use the shared Axios instance from `config/api.ts`.

## API and auth

- **HTTP client:** `src/config/api.ts` — `api` Axios instance, `BASE_API_URL`, endpoint constants, JWT on requests, refresh-on-401 interceptor.
- **Session:** `src/state/sessionStore.ts` — access/refresh tokens and serialized user; read by interceptors and contexts.
- **Auth context:** `src/contexts/AuthContext.tsx` — login/logout, user profile for the UI.
- **Page access:** `src/contexts/PageAccessContext.tsx` + `src/api/pageAccess.ts` — role and per-page visibility from the backend.
- **Route guard:** `src/components/ProtectedRoute.tsx` — authentication and optional page-access checks.

Development: requests to `/api` are proxied to `VITE_DEV_PROXY_TARGET` (see `vite.config.ts`).

## In-file documentation conventions

Use comments for **intent and section boundaries**, not line-by-line narration.

- **File header** (pages, services, contexts, large components): 3–6 lines — purpose, route or consumer, primary service/API, non-obvious constraints.
- **Sections:** `// ============ Types ============` (or `// === Types ===`) between types, constants, hooks, handlers, and render blocks.
- **Exports:** Short JSDoc when auth, tenant scoping, or side effects are not obvious from the name.
- **Skip:** Obvious JSX, prop passthrough, restating TypeScript types.
- **Logging:** Prefer `src/utils/logger.ts` (gated by `VITE_DEBUG_LOGS` in dev); avoid raw `console.log` in new code.

### Reference module

Use as a template for new or refactored screens:

- Page: `src/pages/operations/OfficerExpensesPage.tsx` — section banners, React Query + service layer, role-aware UI.
- Service: `src/services/officerExpenseService.ts` — REST paths, DTO types, list/detail/mutation helpers.

## Pull request checklist

- [ ] `npm run build` and `npm run lint` pass in `AIP_UI`
- [ ] No intentional behavior change unless called out in the PR description
- [ ] Touched routes smoke-tested (login + relevant staff/customer flow)
- [ ] New or moved files include a file header; large files use section banners
- [ ] No new mock/MSW data paths; API remains the source of truth
