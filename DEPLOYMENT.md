# Deployment Guide — GASTA AI

This guide covers a common, low-cost setup:

- **Frontend (Next.js)** → Vercel
- **Backend (Express)** → Railway
- **Database (PostgreSQL)** → Railway managed Postgres

A Render / Fly.io alternative is noted at the end.

---

## 1. Provision the database (Railway)

1. Create a project at <https://railway.app>.
2. **New → Database → PostgreSQL**.
3. Open the Postgres service → **Variables/Connect** and copy the connection string
   (looks like `postgresql://user:pass@host:port/railway`).
4. You'll paste this into the backend as `DATABASE_URL`.

---

## 2. Deploy the backend (Railway)

1. In the same Railway project: **New → Deploy from GitHub repo** and pick your repo.
2. Set the service **Root Directory** to `server`.
3. **Build command:** `npm install && npm run prisma:generate`
4. **Start command:** `npm run prisma:deploy && npm start`
   (runs migrations on each deploy, then boots the API)
5. Add environment variables (Service → **Variables**):

   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<the Postgres URL from step 1>
   JWT_ACCESS_SECRET=<openssl rand -hex 32>
   JWT_REFRESH_SECRET=<openssl rand -hex 32>
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=12
   AI_PROVIDER=mock            # or openai
   OPENAI_API_KEY=             # set if AI_PROVIDER=openai
   OPENAI_MODEL=gpt-4o-mini
   STORAGE_DRIVER=local        # use s3 for persistent prod storage
   MAX_UPLOAD_MB=10
   CLIENT_ORIGIN=https://<your-vercel-domain>.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   ```

6. Deploy. Railway gives you a public URL like `https://gasta-api.up.railway.app`.
7. (Once) seed an admin/teacher: open the service shell and run `npm run prisma:seed`,
   or temporarily append `&& npm run prisma:seed` to the start command for the first deploy.

> **Generate secrets:** `openssl rand -hex 32`

> **File storage in production:** the `local` driver writes to the container's ephemeral
> disk and is wiped on redeploy. For durable storage set `STORAGE_DRIVER=s3` and implement
> the S3 branch in `server/src/services/storage.service.js` (AWS S3, Cloudflare R2, or
> Backblaze B2 all work with the same SDK).

---

## 3. Deploy the frontend (Vercel)

1. Import the repo at <https://vercel.com/new>.
2. Set **Root Directory** to `client`.
3. Framework preset: **Next.js** (auto-detected). No build overrides needed.
4. Add an environment variable:

   ```
   NEXT_PUBLIC_API_URL=https://<your-railway-api-domain>/api
   ```

5. Deploy. Vercel gives you `https://<project>.vercel.app`.
6. Go back to Railway and make sure `CLIENT_ORIGIN` matches this exact domain (for CORS),
   then redeploy the backend.

---

## 4. Post-deploy checklist

- [ ] `GET https://<api-domain>/api/health` returns `{ "success": true, "status": "ok" }`.
- [ ] Sign up a teacher on the live frontend; confirm login persists on refresh.
- [ ] File a claim with a document; confirm it appears with a **Pending** badge.
- [ ] Ask the assistant "what documents for a medical claim?".
- [ ] `CLIENT_ORIGIN` on the backend exactly equals the Vercel domain (no trailing slash).
- [ ] Secrets rotated away from the example values.

---

## Alternative: Render / Fly.io

- **Render:** create a *PostgreSQL* instance + a *Web Service* (root `server`, build
  `npm install && npm run prisma:generate`, start `npm run prisma:deploy && npm start`).
  Deploy the frontend as a *Static Site* or on Vercel. Same env vars apply.
- **Fly.io:** `fly launch` in `server/` (add a Postgres with `fly postgres create`),
  set secrets with `fly secrets set KEY=value`. Host the frontend on Vercel.

---

## Local production build (smoke test)

```bash
# backend
cd server && NODE_ENV=production npm start

# frontend
cd client && npm run build && npm start
```
