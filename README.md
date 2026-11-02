# test submission

A booking demo/test app with a Laravel REST API backend and a Next.js frontend.

- **Backend** — Laravel (`backend/`), PHP ^8.3, SQLite, exposes the booking API under `/api/v1/bookings`.
- **Frontend** — Next.js (`frontend/`), React 19, talks to the API at `http://localhost:8000`.

## Prerequisites

- PHP >= 8.3 with the usual Laravel extensions and Composer
- Node.js >= 20.9 (Next.js 16 requirement) and npm
- No database server needed — SQLite is used out of the box

## Backend setup

```bash
cd backend

# Install PHP dependencies
composer install

# Create the .env file and app key
cp .env.example .env
php artisan key:generate

# Create the SQLite database file and run migrations
touch database/database.sqlite
php artisan migrate

# Start the API server on http://localhost:8000
php artisan serve
```

> Shortcut: the project also ships a `composer setup` script that runs composer
> install, copies `.env`, generates the key, migrates, and installs/builds the
> npm assets in one go. The manual steps above are equivalent for API-only use.

Sanity check:

```bash
curl http://localhost:8000/api/v1/bookings
```

## Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# (Optional) point the app at the API — this is already the default,
# skipped automatically if the variable is not set
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# Start the dev server on http://localhost:3000
npm run dev
```

Open http://localhost:3000 in a browser.

## Running both at once

Use two terminals:

| Terminal | Directory  | Command             | URL                   |
| -------- | ---------- | ------------------- | --------------------- |
| 1        | `backend`  | `php artisan serve` | http://localhost:8000 |
| 2        | `frontend` | `npm run dev`       | http://localhost:3000 |

Start the backend first — the frontend fetches from it at request time, but the
API client falls back to `http://localhost:8000` regardless.

## Tests

```bash
# Backend
cd backend
php artisan test

# Frontend (Playwright e2e)
cd frontend
npm run test:e2e
```

## Questions

### Your caching and revalidation choices, and why

No explicit caching. All pages always hits the REST api. Given more time, this would be something that can be worked on, for example the /bookings/<id> page and /bookings/<id>/edit page. Also the initial /bookings page. For revalidation, in the mutations (create, edit) we are doing revalidate to reset the form and the listing page.

### How your overlap rule handles two simultaneous bookings

The bookings table has a unique constraint on 'service_bay' + 'pending' or 'confirmed'. In the API controller, it catches this DB constraint error and throws it as a validation error.

### If this became one module in a multi-tenant platform used by 200 dealers, what you'd change first

Add tenant ownership to each booking. There would be a tenants table then each booking would be owned by this tenant. We have to identify the tenant too before it hits the API, probably in a before middleware, also can be detected if tenants have their own subdomain. Not sure if we need to scope the the API path with the tenant_id too, probably not necessary. Later on when authentication is added, we can also stick the tenant info there in the session/token. Also, introduce soft-delete probably. The delete feature in my implementation does not do soft-delete.

### Which AI tools did I use

Opencode coding Agent - LLM is GLM5.3 Flash, sorry I'm on a $10 budget :-)

### What AI got wrong, and what did I change

- A pending and a confirmed booking can coexist in the same bay (since uniqueness is on the (service_bay, status) combination, as you specified). I prompted it to allow-only one to treat 'service_bay_01' + 'pending' and 'service_bay_01' + 'confirmed' as Duplicate.

- LLM did not use a custom Request class for validation. I prompted it again to extend the FormRequest class
- 404 response in body has details in the message (what type of model was not found, etc.). Prompted to use a more generic error message.
- PUT request update, it initially did not allow updating of status. Prompted to allow updating of status
