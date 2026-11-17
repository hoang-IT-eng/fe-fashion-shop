# ENIGMA — Cult-Dark Authenticated Streetwear, Grail Auctions & Reborn Customs

Frontend storefront and Dribbble-grade Executive Admin Console for **ENIGMA**, inspired by `enigmascult.com` chiaroscuro high-fashion editorial design and Linear / Shopify Plus studio precision.

---

## Aesthetic & Experience Architecture

- **Chiaroscuro Cult-Dark Palette**:
  - Deep Obsidian (`#070709`), Smoked Charcoal (`#111115`), Chiaroscuro Cloud Slate (`#1c1d24`), Warm Bone (`#ece5d8`), Muted Pewter (`#9a948a`), Antique Gold (`#cfa156`).
  - Zero purple-on-dark gradients, zero gradient headline text, crisp 1px hairlines, and strict `tabular-nums` monospace telemetry for bids, timers, and VND pricing.
- **Editorial Typography**:
  - Display Serif: `Cormorant Garamond` / `Cinzel` (`clamp()` fluid display scale)
  - Geometric Sans: `Plus Jakarta Sans`
  - Telemetry Monospace: `JetBrains Mono`
- **3D (Three.js) + GSAP + Procedural Web Audio**:
  - **Cinematic Preloader**: Condensing chiaroscuro cloud canvas + scrambling `DECODING...` → `DECODE YOUR STYLE` counter (auto-bypassed for `prefers-reduced-motion`, test runners, and internal session navigations).
  - **Three.js Scenes**: Lazy-loaded `HeroMonolithScene` (volumetric cloud particle ring + cursor-parallax obsidian/gold monolith) and `MysteryVaultScene` (anodized 3D chest that unseals its lid upon completing the 8-step style quiz) with graceful WebGL fallback.
  - **GSAP + ScrollTrigger**: Scrubbed House Manifesto narrative, Mystery Codex unseal reveal, and painted-cloud route curtain transitions.
  - **Diegetic Web Audio Synthesizer (`Sound Off / Sound On`)**: Pure Web Audio API brown-noise wind hum, mechanical pocket-watch escapement tick on auction hover, and resonant bronze gavel chime on bid confirmation or cipher unlock (zero external `.mp3` files; off by default).
  - **Inner Circle Initiation Easter Egg**: Typing `ENIGMA` anywhere outside an input field unlocks the secret *Inner Circle Initiation* modal and automatically applies `ENIGMA15` (15% off, up to 2,500,000₫) to the Vault Bag and Checkout.

---

## Hybrid Live API + Resilient Demo Vault Engine

`src/api/apiClient.ts` connects directly to `be-fashion-shop` (`VITE_API_URL`) when available and seamlessly falls back to `src/api/enigmaDemoEngine.ts` (persisted in `localStorage` under `enigma_vault_state_v1`) when running standalone or offline.

### Demo Vault Passkeys

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| **Executive Curator (Admin)** | `admin@fashionshop.com` | `Admin@123` | Unlocks `/admin` Executive Grail Desk |
| **Collector** | `demo@fashionshop.com` | `Demo@123` | Pre-seeded Provenance Orders, Codex & Concierge |
| **Collector** | `lan@fashionshop.com` | `Demo@123` | Pre-seeded Neo-Renaissance Codex & Counter-Offer |
| **Secret Privilege Code** | `ENIGMA15` | *(Cipher: type `ENIGMA`)* | 15% Initiation Privilege (Max 2,500,000₫) |

---

## Storefront & Admin Modules

- **Storefront Routes**:
  - `/` — 3D Hero Monolith, GSAP Manifesto, Curated Grail Drops, Live Trending Auctions (with Quick Bid modal), Mystery Vaults, interactive "Find It At My Price" Sourcing Builder, and Reborn Journal dossiers.
  - `/products` — Instant search, Allocation Tier (`grail`, `reborn`, `archive`, `drop`), Category, Brand, Size, Price ceiling filters, Quick Inspect modal, and Collector Wishlist toggle.
  - `/products/:id` — High-res studio gallery, SKU Variant selector, **Interactive Size & Fit Calculator modal**, NFC Authentication Guarantee seal, Verified Buyer Reviews with rating breakdown, and Related Grails.
  - `/auctions` — Real-time 1s ticking Grail Lots, `<60s → +120s` Anti-Snipe protocol badge, Bid Audit History feed, and Seat-Hold Bid Confirmation modal.
  - `/mystery-boxes` — Interactive 3D Vault Chest + **8-Step AI Style Quiz** computing the user's **Taste Codex** archetype (*Shadow Archive*, *Concrete Vanguard*, *Neo-Renaissance*, *Monolith Minimalist*) and matched Mystery Box tier.
  - `/concierge` — "Find It At My Price" custom sourcing mandates & live curator counter-offer tracker.
  - `/wishlist`, Slide-Over `CartDrawer` + `/cart`, 3-Step Armored `/checkout`, `/orders` & `/orders/:id` (5-stage visual provenance stepper), `/journal`, `/profile`, `/auth`.
  - **Generative UI AI Stylist (`AiChatWidget.tsx`)**: Hybrid BM25 RAG + Tool Router rendering inline Product Cards (with size pick + 1-click Add to Bag), Side-by-Side Grail Comparison Tables, Live Auction Cards, Order Steppers, and Taste Codex Prompts.
- **Dribbble-Grade Executive Admin UI (`/admin`)**:
  - Studio sidebar + `Cmd/Ctrl+K` quick jump command palette + `tabular-nums` KPI header strip.
  - Executive Analytics (SVG Area 7-day GMV chart, Conversion & Order Status funnel, Top Moving Sizes/Colorways matrix, Low-Stock SKU alerts, CSV Export).
  - Products & SKU Variant Matrix Manager (slide-over drawer editor + multi-variant SKU stock modal).
  - Live Auctions Monitor, Taste Codex & Concierge Sourcing Desk, Vouchers Manager (`ENIGMA15`), Orders Fulfillment Pipeline (with slide-over dossier), Categories, and Collectors/Roles.

---

## Local Development & Verification

```bash
npm install
cp .env.example .env   # Optional: set VITE_API_URL=http://localhost:3000 for live NestJS API
npm run dev
```

### Quality Gates

```bash
npx tsc --noEmit
npm run lint
npm test -- --run
npm run build
```
