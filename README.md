# Ralph de Vinca Group

Portfolio and front door of an independent group in Bali with two divisions: Perfumery (a platform for understanding fragrance) and Technology (websites and internal systems).

## Stack

- **client/** React 19, TypeScript, Vite. Self-hosted fonts (Archivo, IBM Plex Mono). Design system in `DESIGN.md`.
- **server/** NestJS 12, TypeScript, `mysql2`. The only thing that touches the database.
- **Database:** MySQL 8 (`server/schema.sql`, case studies in `server/seed.sql`). Photos are files in `server/uploads`, served at `/uploads`. Admin accounts are rows in `users` (scrypt hashes); a session is a 12-hour token signed with `AUTH_SECRET`.

## Run it locally

```bash
cp server/.env.example server/.env   # fill in AUTH_SECRET
mysql -uroot -e "CREATE DATABASE rdv_group CHARACTER SET utf8mb4"
mysql -uroot rdv_group < server/schema.sql
mysql -uroot rdv_group < server/seed.sql
cd server && npm install && npm run start:dev   # http://localhost:3001

cd client && npm install && npm run dev         # http://localhost:5173
```

Admin: `cd server && npm run admin:create -- you@example.com 'a long password'` (run again to reset the password), then sign in at `/admin/login`. Deleting the row from `users` ends that account's sessions.

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
| POST | `/auth/login` | public, 5 per minute per IP |
| GET | `/admin/me` | admin |
| GET, PATCH | `/admin/inquiries`, `/admin/inquiries/:id` | admin |
| GET, POST, PUT, DELETE | `/admin/projects`, `/admin/projects/:id` | admin |
| POST | `/admin/projects/:id/photos` | admin, JPG/PNG/WebP up to 10 MB |

## Deploying

- **client:** a static site. Run `npm run build` and serve `client/dist`, falling back to `index.html` for every path.
- **server:** a Node process. Set the same variables as in `.env.example`, plus `CLIENT_ORIGINS` for the real domain and `TRUST_PROXY=1` behind a reverse proxy.
