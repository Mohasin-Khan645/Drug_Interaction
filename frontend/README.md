# DRUGSAFE frontend

React + Vite interface for the DRUGSAFE medication safety platform. It talks only to the backend
REST API — no database access, no clinical logic in the browser.

> **Clinical decision support only.** The interface never diagnoses, prescribes, or overrides a
> clinician. Findings come from the backend's curated deterministic rules; the AI panel only explains
> findings that already exist, citing stored evidence.

## Getting started

```bash
npm ci
cp .env.example .env       # optional; defaults proxy /api to http://localhost:4000
npm run dev                # http://localhost:5173
```

`npm run dev` proxies `/api` to the backend so refresh cookies stay first-party. Set
`VITE_API_PROXY` to point at a different backend, or `VITE_API_URL` to call an absolute API origin.

```bash
npm run lint
npm test
npm run build
```

## Architecture

```
src/api          one module per backend domain, all through a single axios client
src/app          route guards (auth, public-only, role)
src/context      auth session, toasts, active patient scope
src/components   ui primitives, layout shell, domain components (safety, drugs, patients)
src/pages        route views grouped by domain
src/lib          constants, severity presentation, formatting helpers
src/test         vitest suites and setup
```

- The access token is held in memory only; the refresh token is an HTTP-only cookie. A single shared
  refresh promise retries one failed request and clears the session if refresh fails.
- Role-aware navigation and `RoleRoute` only keep the interface coherent — the API authorizes every
  request again, including object-level access to a patient record.
- Server state is TanStack Query; forms use React Hook Form with Zod resolvers.
- Severity is always paired with its word, never colour alone, and lower severities stay visible.
- OCR lines and normalization candidates must be confirmed against the catalog by a person; low
  confidence forces an explicit drug selection. Reconciliation only adds what is selected and never
  removes a medication.
