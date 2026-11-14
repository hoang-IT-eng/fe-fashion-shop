# Deploy — Plan B (Azure Free, $0 credit)

## Architecture
- **FE:** Azure Static Web Apps **Free** → `https://yellow-river-0623ac700.3.azurestaticapps.net`
- **BE:** Azure App Service **F1 Free** → `https://thebasic-shop-api.azurewebsites.net`
- **DB:** Neon / Render Postgres free (`DATABASE_URL` on App Service)
- **Images:** Cloudinary free
- **Redis:** Docker local only (optional on Azure)

Resource group: `thebasic-rg` (East Asia / SWA East Asia)

## FE — GitHub secret (required for CD on main)
Repo → Settings → Secrets and variables → Actions → New repository secret:

- Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
- Value:
  ```bash
  az staticwebapp secrets list -n thebasic-shop-fe -g thebasic-rg --query properties.apiKey -o tsv
  ```

Optional repo **variable** `VITE_API_URL` = `https://thebasic-shop-api.azurewebsites.net`

- PR checks: `.github/workflows/ci.yml` (lint/test/build)
- CD: `.github/workflows/azure-static-web-apps.yml` runs on push to `main` only (skips deploy if secret missing)

## Local
```bash
npm ci
cp .env.example .env   # set VITE_API_URL
npm run dev
```

## Do not create (keeps credit)
Azure Cache for Redis · Azure Database for PostgreSQL · ACR · Front Door / CDN · App Gateway
