# Ralph de Vinca Group

The group site: two divisions, three case studies, one contact form, and a small
private inbox to read what the form collects.

Laravel 13 · Blade · Tailwind CSS v4 · MySQL. No Livewire, no Filament, no
Inertia — every page and every admin screen is plain Blade.

## Running it

```sh
composer install
npm install
cp .env.example .env            # if .env does not exist yet
php artisan key:generate
php artisan migrate
npm run build                   # or: npm run dev
php artisan serve
```

The Vite build downloads Newsreader, Inter Tight and IBM Plex Mono from
bunny.net and self-hosts them, so the first build needs a network connection and
the running site never calls a font CDN.

## The one account

There is no registration route anywhere in the application. The single account
that can read the inbox is created from the command line:

```sh
php artisan admin:create
```

Then sign in at `/login`. Messages are at `/inbox` and case studies at
`/admin/projects`. Nothing on the public site links to either.

In Docker, run the same command inside the container:

```sh
docker compose exec rdvgroup php artisan admin:create
```

## Deploying an update

```sh
git pull
docker compose up -d --build
docker compose exec rdvgroup php artisan migrate --force
docker compose exec rdvgroup php artisan optimize
```

Screenshots uploaded in the admin are written to `storage/app/public/work`,
which lives on the `rdv-storage` volume, so a rebuild keeps them. Back that
volume up along with the database.

## Where the content lives

No page copy is written inside a Blade file if it is a fact about the business.

| File | What it holds |
|---|---|
| `config/site.php` | Brand facts, email, outbound links, the four principles, the hero composition, per-route meta |
| `config/divisions.php` | The two divisions and the accent colour each one is allowed to use |
| `projects` table | Every case study end to end: situation, constraint, decisions, result, composition, images. Edited at `/admin/projects` |
| `config/images.php` | Intrinsic dimensions of the screenshots that ship with the repository, so nothing shifts while loading |

Adding a project is done in the admin. The work index, the case study page, the
home page list and the sitemap all pick it up with no further edits.
`database/data/projects.php` only seeds the first three, once, when the
migration runs.

## Structure

```
/                             Home — the composition element lives in the hero
/about                        The name, the thinking, the founder, the editorial commitment
/perfumery  /technology       The two divisions
/work  /work/{slug}           Index and the three case studies
/contact                      The only form on the site
/privacy
/sitemap.xml                  Built from the routes and the project list

/login  /inbox  /inbox/{id}   Private. Behind auth middleware.
```

## How a message is handled

Order matters and is covered by tests:

1. Validate.
2. Honeypot (`company_website`) and a timing check — anything submitted within
   three seconds of the page rendering is treated as a bot. Both cases return
   the same success response a person gets, and store nothing.
3. **Save to the database.**
4. *Then* send the notification, wrapped in `try/catch`.

If the mail step fails the message is already safe in the inbox and the visitor
is still told it arrived, because from their side it did. Reversing steps 3 and 4
would lose messages during an SMTP outage.

## Speed

Locally the first request after starting Laragon takes around a second: PHP's
OPcache is empty and Laravel is reading all fourteen config files and
registering every route from scratch. Every request after that is 40–170ms.

That first-request cost belongs to development, not to visitors. On a
deployment, run once after each release:

```sh
php artisan optimize        # caches config, routes, events and views
```

That takes the first request from ~1.3s to ~60ms and it stays there, because a
real server does not restart between visits.

**Do not leave that cached while developing.** With a cached config, `.env` is
no longer read — which also means `phpunit.xml` cannot redirect the tests to an
in-memory SQLite database, and `RefreshDatabase` would happily truncate the real
MySQL one. Undo it with:

```sh
php artisan optimize:clear
```

## Fonts

Faces are downloaded from bunny.net at build time and self-hosted, in WOFF2
only. The Vite font plugin emits a second, separate `@font-face` per face for
legacy WOFF; because they are two rules rather than one `src` list, browsers
fetch both — and for some faces prefer the larger WOFF. `npm run build` removes
them afterwards with `scripts/strip-legacy-fonts.mjs`.

The `latin-ext` subset is required, not decorative: the four principles print
*rād*, and U+0101 sits outside the latin subset.

## Tests

```sh
php artisan test
```

The feature suite pins the acceptance criteria: the save-before-mail order, the
honeypot storing nothing, the inbox being closed to guests, opening a message
marking it read, no registration route, and — across every public page — no
first-person-plural voice and no delivery-time promise.
