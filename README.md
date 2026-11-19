# Ralph de Vinca Group

Portfolio and front door of an independent group in Bali with two divisions: Perfumery (a platform for understanding fragrance) and Technology (websites and internal systems).

## Stack

- **client/** React 19, TypeScript, Vite. Self-hosted fonts (Archivo, IBM Plex Mono). Design system in `DESIGN.md`.
- **server/** NestJS 12, TypeScript. Talks to Supabase with the secret key.
- **Database:** Supabase Postgres (project `rdv-group`, Singapore). Photos in the Storage bucket `work`. Admin sign-in with Supabase Auth.

Row level security is on with no policies, so the browser's publishable key can read no table. Every read and write goes through the NestJS API.

## Run it locally

```bash
cp server/.env.example server/.env   # fill in SUPABASE_SECRET_KEY
cd server && npm install && npm run start:dev   # http://localhost:3001

cd client && npm install && npm run dev         # http://localhost:5173
```

Admin: create the user in Supabase › Authentication › Add user with an email listed in `ADMIN_EMAILS`, then turn off new sign-ups. Sign in at `/admin/login`.

## Checks

```bash
cd server && npm test && npm run test:e2e && npm run lint && npm run build
cd client && npm test && npm run lint && npm run build
```

## API

| Method | Path | Who |
|---|---|---|
| GET | `/projects`, `/projects/:slug` | public |
| POST | `/inquiries` | public, 5 per minute per IP |
| GET | `/admin/me` | admin |
| GET, PATCH | `/admin/inquiries`, `/admin/inquiries/:id` | admin |
| GET, POST, PUT, DELETE | `/admin/projects`, `/admin/projects/:id` | admin |
| POST | `/admin/projects/:id/photos` | admin, JPG/PNG/WebP up to 10 MB |

## Deploying

- **client:** a static site. Run `npm run build` and serve `client/dist`, falling back to `index.html` for every path.
- **server:** a Node process. Set the same variables as in `.env.example`, plus `CLIENT_ORIGINS` for the real domain and `TRUST_PROXY=1` behind a reverse proxy.
