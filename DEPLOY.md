# Deploy — Plan B (Azure Free, $0 credit)

## Architecture
| Piece | Choice | URL / notes |
| --- | --- | --- |
| **FE** | Azure Static Web Apps **Free** | https://yellow-river-0623ac700.3.azurestaticapps.net |
| **BE (target)** | Azure App Service **F1** shell | https://thebasic-shop-api.azurewebsites.net |
| **BE (working path)** | Keep **Render** free web service **or** local Docker until F1 can run Nest | Render cold-starts; F1 often OOMs / times out on `npm`/Oryx for this Nest app |
| **DB** | Neon / Render Postgres free | `DATABASE_URL` |
| **Images** | Cloudinary free | — |
| **Redis** | Docker local only | omit `REDIS_URL` on Azure |

Resource group: `thebasic-rg` (East Asia)

### App Service F1 caveat
Nest + `node_modules` is heavy for **F1 Free** (Kudu/Oryx/`npm ci` timeouts, 503). Prefer:
1. Local `docker compose` for BE+Postgres+Redis
2. External free Postgres (Neon/Render)
3. Deploy BE to Azure only after confirming F1 capacity, or accept Render free for API for now

BE upgrade PR (Docker/Redis/seed): https://github.com/hoang-IT-eng/be-fashion-shop/pull/19

## FE — GitHub secret (CD on main)
Repo → Settings → Secrets → Actions → New secret:

- `AZURE_STATIC_WEB_APPS_API_TOKEN` ←  
  `az staticwebapp secrets list -n thebasic-shop-fe -g thebasic-rg --query properties.apiKey -o tsv`

Repo **variable** `VITE_API_URL` = your live API base (Render or Azure), no trailing slash.

- PR checks: `.github/workflows/ci.yml`
- CD: `.github/workflows/azure-static-web-apps.yml` (push `main` only; skips if secret missing)

## Local
```bash
npm ci
cp .env.example .env   # set VITE_API_URL
npm run dev
```

## Do not create (keeps credit)
Azure Cache for Redis · Azure Database for PostgreSQL · ACR · Front Door / CDN · App Gateway
