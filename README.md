# SayNeel Technologies — Website & BalSaathi Portal

The public website for **SayNeel Technologies Private Limited** at <https://sayneeltech.in>, plus the
**BalSaathi web portal** (login and officials' dashboard).

- Built with **Next.js 14** (App Router, TypeScript, Tailwind) and deployed as a **static export**:
  `npm run build` produces plain HTML/JS/CSS in `out/`, which is uploaded to cPanel. There is no Node
  server for the website.
- The marketing pages (Services, About, Careers, …) are still **legacy static HTML** in `public/`.
  They are copied into the build unchanged and will be converted to Next.js pages over time
  (see [section 7](#7-converting-a-legacy-page-to-nextjs)).
- The portal calls the **BalSaathi API** (separate repo, `rural-app-api`), which runs as a Node.js app
  on the same cPanel account at `https://sayneeltech.in/balsaathiapi/`.

---

## Contents

1. [Project structure](#1-project-structure)
2. [Local development](#2-local-development)
3. [Environment variables](#3-environment-variables)
4. [Deploying to cPanel](#4-deploying-to-cpanel)
5. [Server layout — what not to touch](#5-server-layout--what-not-to-touch)
6. [Troubleshooting](#6-troubleshooting)
7. [Converting a legacy page to Next.js](#7-converting-a-legacy-page-to-nextjs)
8. [Editing the legacy marketing pages](#8-editing-the-legacy-marketing-pages)
9. [Checklists](#9-checklists)

---

## 1. Project structure

```
/
├── src/
│   ├── app/                    Next.js routes
│   │   ├── page.tsx            /            Home
│   │   ├── balsaathi/          /balsaathi/  BalSaathi product page
│   │   ├── login/              /login/      Portal login
│   │   ├── dashboard/          /dashboard/  Officials' dashboard (needs login)
│   │   ├── layout.tsx          Shared shell: Navbar, Footer, fonts
│   │   └── not-found.tsx       404 page (exported as 404.html)
│   ├── components/             Navbar, Footer, dashboard charts and tables
│   └── lib/
│       ├── api.ts              fetch wrapper + endpoint registry for the BalSaathi API
│       └── auth.ts             Session (token) stored in localStorage
│
├── public/                     Copied as-is into the build output
│   ├── .htaccess               Apache/LiteSpeed rules: HTTPS, redirects, 404, security headers, CSP
│   ├── *.html                  Legacy marketing pages (services, about, careers, contact, legal, …)
│   ├── assets/                 CSS/JS/images used by the legacy pages
│   ├── robots.txt, sitemap.xml, site.webmanifest, favicon.ico
│
├── docs/                       SEO, performance, browser and production checklists
├── .env.production             API URL used by `npm run build` (committed; it is public anyway)
├── next.config.mjs             output: "export", trailingSlash: true
└── out/                        Build output — this is what gets deployed (git-ignored)
```

---

## 2. Local development

Requires **Node.js 18.17+** (20 LTS recommended).

```bash
npm install
npm run dev          # http://localhost:3000
```

Create `.env.development.local` (git-ignored) pointing at your local API:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Other scripts:

| Command          | What it does                                     |
| ---------------- | ------------------------------------------------ |
| `npm run build`  | Production build → static files in `out/`        |
| `npm run lint`   | ESLint                                           |
| `npx serve out`  | Preview the production build locally             |

> Do **not** name your local env file `.env.local`. Next.js loads `.env.local` during `npm run build`
> too, and it overrides `.env.production` — the live site would then try to call `localhost`.

---

## 3. Environment variables

| Variable                   | Used for                          | Set in                                                     |
| -------------------------- | --------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the BalSaathi backend | `.env.production` (build) / `.env.development.local` (dev) |

Current production value: `https://sayneeltech.in/balsaathiapi/api`

**Important:** `NEXT_PUBLIC_*` values are **baked into the JavaScript at build time**. There is no env
file on the server. If the API URL changes you must edit `.env.production`, **rebuild and re-upload**,
and also update `connect-src` in the Content-Security-Policy in `public/.htaccess` if the API moves to
a different domain.

---

## 4. Deploying to cPanel

### 4.1 Build

1. Make sure `.env.production` has the correct API URL.
2. Build:

   ```powershell
   npm run build
   ```

   It must end with `○ (Static) prerendered as static content`. Pages that use server-only features
   (API routes, middleware, `cookies()`, `headers()`) will fail the build — static export cannot run them.

3. Optional: preview with `npx serve out` and click through Home, Login, Dashboard and a few legacy pages.

4. Zip the **contents** of `out/` (not the folder itself):

   ```powershell
   Compress-Archive -Path out\* -DestinationPath site.zip -Force
   ```

   `site.zip` is git-ignored.

### 4.2 Upload

1. Log in to cPanel → **File Manager** → open `public_html`.
2. Click **Settings** (top right) → tick **Show Hidden Files (dotfiles)**.
3. **Back up first:** select everything in `public_html` → **Compress** → download the archive.
4. **Upload** `site.zip` into `public_html`.
5. Right-click `site.zip` → **Extract** into `public_html`, overwriting existing files.
6. Delete `site.zip`.

> **Never empty `public_html` before uploading.** It contains the folder that keeps the API running
> (see [section 5](#5-server-layout--what-not-to-touch)). Always extract *over* the existing files.

Optional clean-up: delete the old `public_html/_next/` folder **before** extracting, to avoid piling
up stale JS bundles from earlier builds. Delete nothing else.

### 4.3 Verify

| Check                                                              | Expected                                   |
| ------------------------------------------------------------------ | ------------------------------------------ |
| <https://sayneeltech.in/>                                          | Home page loads                            |
| <https://sayneeltech.in/services.html>                             | Legacy page loads                          |
| <https://sayneeltech.in/login/>                                    | Portal login loads; signing in works       |
| <https://sayneeltech.in/balsaathiapi/api/languages/get>            | JSON list of languages (API still running) |
| <https://sayneeltech.in/does-not-exist>                            | Site's 404 page                            |
| Browser DevTools → Console on Home, Dashboard, Contact             | No red "Refused to …" CSP errors           |

### 4.4 SSL

cPanel → **SSL/TLS Status** → run **AutoSSL** if the certificate is missing or expired. The `.htaccess`
forces HTTPS, so the site will not load over plain HTTP.

### 4.5 Rolling back

Extract the backup archive from step 4.2.3 back into `public_html`, overwriting files.

---

## 5. Server layout — what not to touch

```
/home/<cpanel-user>/
├── balsaathiapi/               BalSaathi API code (Node.js app, managed in "Setup Node.js App")
├── nodevenv/                   Node virtual environment for the API
└── public_html/                Web root for sayneeltech.in
    ├── .htaccess               ← from this repo (public/.htaccess)
    ├── index.html, _next/, …   ← from this repo (out/)
    ├── balsaathiapi/           ⚠ KEEP — contains only a hidden .htaccess with the API's Passenger
    │   └── .htaccess             config and environment variables (secrets). Managed by cPanel.
    ├── .well-known/            ⚠ KEEP — used by AutoSSL certificate validation
    └── cgi-bin/                ⚠ KEEP — cPanel system folder
```

- **`public_html/balsaathiapi/.htaccess` is the API's routing.** If it is deleted, every
  `/balsaathiapi/…` request stops reaching Node and the API goes down. It is easy to delete by
  accident because the folder looks empty when hidden files are not shown.
  To recreate it: cPanel → **Setup Node.js App** → edit the `balsaathiapi` app → **Save** → **Restart**.
- That file contains production secrets (database password, JWT secret, Firebase key). Never commit
  it, paste it into chat, or leave downloaded backups lying around.
- The root `public_html/.htaccess` (from this repo) is separate. **Do not merge the two files.**
  Its security headers also apply to API responses, which is harmless; its rewrite rules do not
  affect the API because the API folder has its own `RewriteEngine On`.
- Leftover files from older static-site deployments — `_headers`, `netlify.toml`, `vercel.json`,
  `README.md`, `parking-page.shtml` — do nothing on cPanel and are publicly downloadable. Delete them.

---

## 6. Troubleshooting

| Symptom                                                                   | Cause / fix                                                                                                                                                                           |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/balsaathiapi/...` shows the website's 404 page                          | `public_html/balsaathiapi/.htaccess` is missing. Recreate it via **Setup Node.js App** → Save → Restart ([section 5](#5-server-layout--what-not-to-touch)).                             |
| API returns `Cannot GET /balsaathiapi/api/...` (Express 404)              | The API is up; that route does not exist. Check the path against `rural-app-api/src/server.ts` and its routers (e.g. languages is `/api/languages/get`).                                |
| API returns 503 / "Incomplete response"                                   | The Node app crashed. Read `stderr.log` in `/home/<cpanel-user>/balsaathiapi/`, fix, then Restart in **Setup Node.js App**.                                                             |
| Every page returns 500                                                    | The server rejected a line in the root `.htaccess`. Rename it to `.htaccess.off` to confirm, then fix the offending rule.                                                               |
| Portal calls `http://localhost:5000` in production                        | Built with the wrong env file. Make sure there is no `.env.local`; check `.env.production`; rebuild.                                                                                   |
| Login / dashboard fail with "Refused to connect" in the console           | CSP `connect-src` in `public/.htaccess` does not include the API's origin. Add it and redeploy.                                                                                        |
| Login fails with a CORS error                                             | The portal and API are on different origins and the API does not allow the portal's origin.                                                                                           |
| Legacy page link gives a 404, or console shows `*.html.txt?_rsc=` errors  | A `.html` link was rendered with Next's `<Link>`. Use a plain `<a>` (the Navbar's `SiteLink` does this automatically) and make sure the page exists in `public/`.                        |
| A page works locally but 404s on the server                               | Check the file is in `out/` after build and was extracted. With `trailingSlash`, routes are `/login/` → `login/index.html`.                                                            |
| Old content still shows after deploying                                   | Hard refresh (Ctrl+F5). LiteSpeed may cache pages — purge the cache in cPanel → **LiteSpeed Web Cache Manager** if enabled.                                                           |

---

## 7. Converting a legacy page to Next.js

When a legacy page (e.g. `public/services.html`) is rebuilt in Next.js:

1. Create the route next to the home page, e.g. `src/app/services/page.tsx`.
2. Delete `public/services.html`.
3. Update links from `/services.html` to `/services` in `src/components/Navbar.tsx`,
   `src/components/Footer.tsx`, and any remaining legacy pages that link to it.
   The Navbar's `SiteLink` switches to Next's `<Link>` automatically once the `.html` is gone.
4. Keep old URLs working by adding a redirect to `public/.htaccess`:

   ```apache
   RewriteRule ^services\.html$ /services/ [L,R=301]
   ```

5. Update `public/sitemap.xml`.

---

## 8. Editing the legacy marketing pages

All of this applies to the `.html` files and `assets/` inside **`public/`**.

### Contact details

Contact information lives in `public/assets/js/config.js` and is applied on page load:

```js
window.SAYNEEL = {
  email:        'contact@sayneeltech.in',
  phoneDisplay: '+91 8600 40 50 88',
  phoneDial:    '+918600405088',
  ...
};
```

The same values are also hard-coded in the HTML (so they show without JavaScript). After editing
`config.js`, find-and-replace the old value across `public/*.html` so both stay in sync.

### Items to review before relying on the content

| What                                       | Where (inside `public/`)                                                                  |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Phone number, street address               | `assets/js/config.js`, `contact.html`, and the footer of each page                         |
| CIN and GSTIN                              | `terms.html`, section 2                                                                   |
| Domain (`https://www.sayneeltech.in`)      | `robots.txt`, `sitemap.xml`, `assets/js/config.js` (`baseUrl`), canonical / OG tags        |
| Social media URLs                          | `assets/js/config.js` → `social`                                                          |
| Sample testimonials                        | Home page — replace with real quotes you have written permission to publish               |
| Job listings                               | `careers.html`, `#openings`                                                               |
| Legal pages (templates, not legal advice)  | `privacy-policy.html`, `terms.html`, `cookie-policy.html` — have them reviewed            |
| Google Maps / Calendly embeds (optional)   | `assets/js/config.js` → `mapEmbed`, `calendlyUrl` (already allowed by the CSP)            |

### Images

Placeholder images live in `public/assets/images/` (`about-team.svg`, `careers-culture.svg`,
`balsaathi-screen-*.svg`, `portfolio-*.svg`, `og-*.jpg`, `sayneel-logo.png`). Replace them keeping the
same filename; if the extension changes, update the `src` in the page. Keep photographs under ~200 KB,
and hold written consent before publishing photos of identifiable people — especially children,
patients or field beneficiaries.

---

## 9. Checklists

See `docs/`:

- `SEO-CHECKLIST.md`
- `PERFORMANCE-CHECKLIST.md`
- `BROWSER-COMPATIBILITY.md`
- `PRODUCTION-REVIEW.md`

After a deployment that changes pages, resubmit `sitemap.xml` in Google Search Console.

---

© SayNeel Technologies Private Limited.
