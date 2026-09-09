# DRUGSAFE — Medication Safety & Drug Interaction Intelligence Platform

> **Clinical decision support only.** DRUGSAFE surfaces deterministic, curated safety findings for
> qualified clinicians. It does not diagnose, prescribe, change dosages, or discontinue therapy, and
> it never makes an autonomous clinical decision. The demo data shipped with the seed script is
> illustrative and must not be used for patient care.

Node.js / Express / Prisma / PostgreSQL backend implementing authentication, RBAC, patient and
medication management, a drug catalog with normalization, prescription OCR, medication
reconciliation, five deterministic safety engines, evidence tracking, clinician review,
notifications, PDF reports, grounded AI explanations, administration and audit logging.

## Safety model

- Curated, versioned rules are the only source of safety findings. AI and unverified input can never
  create, alter or override a finding.
- Anything uncertain — an unmatched drug name, a missing lab value, an ambiguous allergy relation —
  becomes `REVIEW_REQUIRED` rather than an assumption.
- Evidence is attached only when a stored knowledge document resolves; nothing is fabricated.
- Findings are prioritized by clinical severity, and lower-severity findings always stay visible.
- Medication records are retained; stopping a medication changes its status and never deletes it.
- Rules are versioned: an update writes a new version and archives the old one.

## Layout

```
frontend/                  React + Vite interface (see frontend/README.md)
backend/
  prisma/schema.prisma     data model and indexes
  prisma/seed.js           demo users, drugs, rules and one demo patient
  src/routes               HTTP surface (no business logic)
  src/controllers          request/response wiring (no database access)
  src/services             domain and medical safety logic
  src/services/safety      the five deterministic engines and the pipeline
  src/repositories         all Prisma access
  src/middleware           auth, RBAC, validation, uploads, errors
  src/integrations         OCR, AI, email and storage provider abstractions
  tests/unit               engine and pure-logic tests
  tests/integration        Supertest tests against a real PostgreSQL database
```

## Getting started

```bash
cd backend
cp .env.example .env          # then fill in secrets (see below)
npm ci
docker run -d --name drugsafe-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
npx prisma migrate dev
npm run seed
npm run dev
```

The API listens on `http://localhost:4000`. Health: `GET /api/health`. Interactive docs:
`http://localhost:4000/api/docs` (OpenAPI JSON at `/api/docs.json`).

### With Docker Compose

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

## Continuous integration

The GitHub Actions pipeline (install, `prisma generate`, `prisma validate`, lint, tests against a
PostgreSQL service, Docker build) lives at `ci/github-actions-ci.yml`. Copy it to
`.github/workflows/ci.yml` to activate it — Devin's GitHub app cannot write workflow files.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT`, `NODE_ENV`, `LOG_LEVEL` | Runtime basics |
| `CLIENT_URL` | Allowed CORS origin |
| `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN` | Short-lived access tokens |
| `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Rotating refresh tokens |
| `SMTP_*`, `EMAIL_FROM` | Verification and password-reset email |
| `OCR_PROVIDER`, `OCR_API_KEY` | OCR provider (`tesseract` for development) |
| `AI_PROVIDER`, `AI_API_KEY` | Grounded explanation provider (`null` disables it) |
| `STORAGE_PROVIDER`, `STORAGE_BUCKET`, `STORAGE_LOCAL_DIR` | Prescription image storage |
| `UPLOAD_MAX_BYTES` | Upload size limit |
| `RATE_LIMIT_*` | Global and auth rate limits |
| `SEED_*_PASSWORD` | Development seed account passwords |

Generate secrets with `openssl rand -hex 32`. The application refuses to start in production without
strong secrets. `.env` is never committed.

## Seed accounts (development only)

`admin@example.com`, `doctor@example.com`, `pharmacist@example.com`, `patient@example.com` — each
with the password taken from the matching `SEED_*_PASSWORD` variable.

## Tests

```bash
npm run lint
npm run test:unit          # engines, pairing, prioritization, normalization, reconciliation
npm run test:integration   # requires PostgreSQL; resets and seeds drugsafe_test
npm test                   # both projects
```

Integration tests use `TEST_DATABASE_URL` (default
`postgresql://postgres:postgres@localhost:5432/drugsafe_test?schema=public`) and reset that database
before running. Never point it at a database you care about.

## API overview

| Area | Routes |
| --- | --- |
| Auth | `POST /api/auth/register|login|logout|refresh|verify-email|forgot-password|reset-password`, `GET /api/auth/me` |
| Patients | `/api/patients/:patientId` plus conditions, allergies, medications, lab results, care team, reconciliation |
| Medications | `PATCH /api/medications/:id`, `POST /api/medications/:id/stop` |
| Drugs | `/api/drugs`, `/api/drugs/search`, `/api/drugs/normalize`, `/api/drugs/:id/interactions` |
| Prescriptions | `POST /api/prescriptions`, `/:id/process`, `/:id/items`, `PATCH /api/prescriptions/items/:id` |
| Safety | `POST /api/safety/check`, `/api/safety/checks/:id`, `/api/safety/findings`, `/api/safety/findings/:id/reviews` |
| Reports | `POST /api/reports`, `GET /api/reports/:id`, `GET /api/reports/:id/pdf` |
| Notifications | `GET /api/notifications`, `POST /api/notifications/:id/read`, `POST /api/notifications/read-all` |
| Evidence | `/api/evidence/sources`, `/api/evidence/documents` |
| AI | `POST /api/ai/explain` (grounded; returns `INSUFFICIENT_VERIFIED_EVIDENCE` without stored evidence) |
| Admin | `/api/admin/users|drugs|rules|evidence|audit|analytics` |

Responses are always `{ "success": true, "data": … }` or
`{ "success": false, "error": { "code": …, "message": … } }`.

## Security posture

Helmet, CORS allowlist, global and auth-specific rate limits, bcrypt password hashing, hashed and
rotating refresh tokens with replay detection, HTTP-only cookies, Zod validation of body/query/params
/files, magic-byte upload verification, request size limits, Prisma-parameterized queries, role and
object-level authorization on every patient resource, audit logging, and redacted production errors.
