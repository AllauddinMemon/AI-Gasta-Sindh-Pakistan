# GASTA AI — Government Secondary Teachers' Association System

A full-stack platform where government secondary-school teachers register, file welfare
claims (medical, housing, scholarship, sun-quota, emergency), upload supporting documents,
and track each claim from **Pending → Approved/Rejected**. An AI assistant guides teachers
through the process and tells them which documents each claim needs.

The codebase is built around a clean **separation of concerns**: all sensitive business
logic (auth, AI prompts, storage, claim rules) lives in backend **service layers** and is
never exposed to the frontend.

---

## Tech stack

| Layer        | Technology                                             |
|--------------|--------------------------------------------------------|
| Frontend     | Next.js 14 (App Router, React 18), Tailwind CSS, lucide-react |
| Backend      | Node.js + Express (REST API)                           |
| Database     | PostgreSQL + Prisma ORM                                |
| Auth         | JWT (access + refresh), bcrypt password hashing        |
| AI           | Provider-abstracted service (`mock` or OpenAI)         |
| Storage      | Provider-abstracted service (`local` disk or S3 stub)  |
| Validation   | Zod                                                    |
| Security     | helmet, CORS allow-list, express-rate-limit            |

---

## Project structure

```
GASTA-AI/
├── README.md
├── DEPLOYMENT.md
├── .env.example                 # master env reference
├── .gitignore
├── docker-compose.yml           # local PostgreSQL
│
├── database/
│   ├── prisma/
│   │   └── schema.prisma         # User, Claim, Document, Notification models
│   └── seed.js                   # admin + sample teacher + claim
│
├── server/                       # Express REST API
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js              # server bootstrap + graceful shutdown
│       ├── app.js                # express app, middleware wiring
│       ├── config/               # env.js (validated config), prisma.js (client)
│       ├── controllers/          # thin HTTP handlers (auth, claim, ai, notification)
│       ├── routes/               # route definitions + router index
│       ├── services/             # business logic: auth, token, claim, ai, storage, notification
│       ├── middleware/           # auth, validate, error, rateLimit, upload
│       ├── validators/           # Zod schemas (auth, claim)
│       └── utils/                # ApiError, catchAsync
│
└── client/                       # Next.js frontend
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── jsconfig.json
    ├── .env.example
    └── src/
        ├── app/                  # App Router pages
        │   ├── layout.js  globals.css  page.js (landing)
        │   ├── login/  signup/
        │   └── dashboard/        # layout + page + claims/new
        ├── components/           # Sidebar, StatusPanel, ChatAssistant, ClaimForm, ClaimCard, ui/
        ├── context/              # AuthContext (JWT session)
        └── lib/                  # api.js (API client + token store)
```

---

## API overview

All routes are prefixed with `/api`.

| Method | Endpoint                          | Auth      | Purpose                              |
|--------|-----------------------------------|-----------|--------------------------------------|
| GET    | `/health`                         | —         | Health check                         |
| POST   | `/auth/register`                  | —         | Teacher signup                       |
| POST   | `/auth/login`                     | —         | Login, returns access+refresh tokens |
| POST   | `/auth/refresh`                   | —         | Exchange refresh token               |
| GET    | `/auth/me`                        | Bearer    | Current profile                      |
| POST   | `/claims`                         | Bearer    | Create claim (multipart, files)      |
| GET    | `/claims`                         | Bearer    | List my claims                       |
| GET    | `/claims/stats`                   | Bearer    | Pending/Approved/Rejected counts     |
| GET    | `/claims/:id`                     | Bearer    | Claim detail                         |
| GET    | `/claims/admin/all`               | Admin     | List all claims (admin panel)        |
| PATCH  | `/claims/admin/:id/review`        | Admin     | Approve/reject + reviewer notes      |
| POST   | `/ai/chat`                        | Bearer    | Ask the assistant                    |
| GET    | `/ai/required-docs/:category`     | Bearer    | Required documents per category      |
| GET    | `/notifications`                  | Bearer    | List notifications                   |
| PATCH  | `/notifications/read-all`         | Bearer    | Mark all read                        |

---

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (or Docker, to use the bundled `docker-compose.yml`)

---

## Local setup

### 1. Clone & start a database

```bash
git clone <your-repo-url> GASTA-AI
cd GASTA-AI

# Option A: spin up PostgreSQL with Docker
docker compose up -d

# Option B: use your own PostgreSQL and update DATABASE_URL accordingly
```

### 2. Backend

```bash
cd server
cp .env.example .env          # then edit secrets in .env
npm install

# generate Prisma client, run migrations, seed sample data
npm run prisma:generate
npm run prisma:migrate        # name the migration e.g. "init"
npm run prisma:seed

npm run dev                   # API on http://localhost:5000
```

### 3. Frontend

```bash
cd ../client
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                   # app on http://localhost:3000
```

### Seeded logins

| Role    | Email               | Password        |
|---------|---------------------|-----------------|
| Admin   | `admin@gasta.gov`   | `Admin@12345`   |
| Teacher | `teacher@gasta.gov` | `Teacher@12345` |

---

## Environment variables

### `server/.env`

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` / `production` |
| `PORT` | API port (default 5000) |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Long random strings — **change in production** |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes (e.g. `15m`, `7d`) |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost (default 12) |
| `AI_PROVIDER` | `mock` (no key needed) or `openai` |
| `OPENAI_API_KEY` | Only required when `AI_PROVIDER=openai` |
| `OPENAI_MODEL` | e.g. `gpt-4o-mini` |
| `STORAGE_DRIVER` | `local` or `s3` |
| `STORAGE_LOCAL_DIR` | Folder for local uploads (default `uploads`) |
| `MAX_UPLOAD_MB` | Max file size per upload |
| `S3_*` | Only required when `STORAGE_DRIVER=s3` |
| `CLIENT_ORIGIN` | Comma-separated CORS allow-list |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Global rate limiting |

### `client/.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

> The OpenAI key and all secrets stay on the server. The frontend only knows the API URL.

---

## AI assistant

The assistant is fully functional with **no API key** — set `AI_PROVIDER=mock` (default) and
a rule-based service answers document/claim questions. To use a real model, set
`AI_PROVIDER=openai` and provide `OPENAI_API_KEY`. The system prompt and document rules live
in `server/src/services/ai.service.js` and are never sent to the browser.

---

## Security notes

- Passwords hashed with bcrypt; never stored or returned in plaintext.
- JWT access/refresh tokens; secrets read only from env.
- All request bodies validated with Zod before reaching services.
- `helmet` security headers, CORS origin allow-list, and rate limiting (stricter on auth).
- File uploads restricted to PDF/images with a size cap.
- Business logic isolated in `services/`; controllers stay thin; the frontend holds no rules.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel (frontend) + Railway (backend + PostgreSQL).

---

## Bonus features included

- Admin-ready claim review (`status` + `reviewerNotes` + reviewer relation).
- Notifications model + endpoints (teacher notified on claim review).
- Claim history & stats on the dashboard.

## License

MIT — adapt freely for your association.

---

## Testing

Backend tests use **Jest** + **supertest** and run without a database (Prisma is mocked in the
integration test):

```bash
cd server
npm install      # first time, to pull jest + supertest
npm test
```

Coverage:

- `tests/unit/token.service.test.js` — JWT sign/verify, secret separation, tamper rejection.
- `tests/unit/validators.test.js` — Zod registration/login/claim rules and type coercion.
- `tests/unit/ai.service.test.js` — mock AI provider guidance + required-documents map.
- `tests/integration/auth.api.test.js` — `/api/health`, validation errors, successful
  registration (asserts `passwordHash` is never returned), and 401 on protected routes.

### Suggested next test scenarios

- Claim creation with file uploads (mock `storage.service`).
- Admin review flow updates status + creates a notification.
- Document download returns 403 for a non-owner, 200 for the owner/admin.

---

## Security notes (audit summary)

- **Passwords** hashed with bcrypt (cost configurable); `passwordHash` is stripped from every API response.
- **JWT** access + refresh tokens; secrets only read from env, never shipped to the client.
- **Input validation** with Zod on every write route; admin status filter is enum-checked.
- **SQL injection**: all DB access goes through Prisma's parameterised queries (no raw SQL).
- **XSS**: React escapes all rendered values; no `dangerouslySetInnerHTML` is used.
- **File access control**: uploaded documents are **not** served as public static files. They are
  streamed only through `GET /api/documents/:id/download`, which authenticates the request and
  verifies the document's claim belongs to the caller (or an admin). The storage layer guards
  against path traversal.
- **Transport/headers**: `helmet` security headers, CORS origin allow-list, and `trust proxy`
  so rate limiting evaluates real client IPs behind a proxy.
- **Rate limiting**: global limiter on `/api`, stricter limiter on auth endpoints.
- **Upload limits**: PDF/image MIME allow-list and a configurable size cap.

### Known trade-off

Tokens are stored in `localStorage` for simplicity, which is readable by JavaScript and therefore
sensitive to XSS. The app mitigates XSS (React escaping, no raw HTML injection, helmet). For a
higher-security deployment, move tokens to `httpOnly`, `Secure`, `SameSite` cookies and add CSRF
protection on state-changing routes.

---

## Production checklist

- [ ] Rotate `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` to long random values (`openssl rand -hex 32`).
- [ ] Set `NODE_ENV=production` and a real `DATABASE_URL`.
- [ ] Set `CLIENT_ORIGIN` to the exact deployed frontend domain (no trailing slash).
- [ ] Use durable storage in production: `STORAGE_DRIVER=s3` (local disk is ephemeral on most hosts).
- [ ] Run `npm run prisma:deploy` on release; seed once.
- [ ] `npm test` green in CI.
- [ ] Confirm `GET /api/health` returns ok behind the load balancer.

---

## UX roadmap (proposed, not yet implemented)

These require additional backend work and are documented as future enhancements rather than stubbed:

- **OCR auto-fill** — read uploaded receipts with a vision model and pre-populate hospital, date and amount for the user to verify, cutting data entry.
- **Conversational form filling** — let the AI collect form fields turn-by-turn in chat and update the injected form in real time.
- **Notifications hub** — wire the header bell to the existing `/api/notifications` endpoints (mark-read, unread badge).
- **PWA / offline drafts** — service worker so teachers on poor connectivity can draft claims and sync later.

Already implemented from the design review: **contextual form injection** — selecting a claim
service (or "New Claim") injects the matching form into the dashboard's right panel, wired to the
live API, with a tab to switch back to the claims list.
