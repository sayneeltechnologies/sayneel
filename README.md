# SayNeel Technologies — Website

A complete, production-ready static website for **SayNeel Technologies Private Limited**.
Plain HTML5, CSS3 and vanilla JavaScript. No build step, no framework, no backend, no database.
Upload the folder to any web host and it works.

---

## 1. Quick start

**Any static host (cPanel, shared hosting, S3, GitHub Pages, Netlify, Vercel):**
upload the entire contents of this folder to your web root, keeping the folder structure intact.
`index.html` must sit at the top level.

**To preview locally**, from inside this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly with `file://` mostly works, but a local server is closer to production.

---

## 2. What you must change before publishing

These are the only items in the site that are deliberately generic. Everything else is finished content.

| #   | What                                                              | Where                                                                                                                                                                                                    |
| --- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Phone number** — currently `+91 00000 00000`                    | `assets/js/config.js` (`phoneDisplay`, `phoneDial`) and search the `.html` files for `+91 00000 00000` and `tel:+918600405088`                                                                           |
| 2   | **Street address and postcode**                                   | `assets/js/config.js` (`addressLine1–3`), `contact.html`                                                                                                                                                 |
| 3   | **CIN and GSTIN**                                                 | `terms.html`, section 2                                                                                                                                                                                  |
| 4   | **Domain** — currently `https://www.sayneeltech.in`               | `robots.txt`, `sitemap.xml`, `assets/js/config.js` (`baseUrl`), and the `canonical` / `og:url` / `og:image` / `twitter:image` tags in every `.html` file (find and replace `https://www.sayneeltech.in`) |
| 5   | **Social media URLs**                                             | `assets/js/config.js` → `social` object, and the `href` fallbacks in the footer of each page                                                                                                             |
| 6   | **Sample testimonials** — three on `index.html`, clearly labelled | `index.html`, `#testimonials` section. Replace with real, attributed quotations you have **written permission** to publish, and delete the "Sample content" chip                                         |
| 7   | **Job listings** — generic across the disciplines you hire for    | `careers.html`, `#openings` section. Delete roles you are not recruiting for                                                                                                                             |
| 8   | **Legal pages** — carefully drafted templates, not legal advice   | `privacy-policy.html`, `terms.html`, `cookie-policy.html`. Have an advocate review them against your actual data flows before you rely on them                                                           |
| 9   | **Google Maps embed** — optional                                  | `assets/js/config.js` → `mapEmbed`                                                                                                                                                                       |
| 10  | **Placeholder images** — see section 5                            | `assets/images/`                                                                                                                                                                                         |

There is **no statistic on this site that you cannot defend.** The animated counters describe the
business definitionally (12 service practices, 12 industries, 40 BalSaathi modules, 1 business-day
reply). When you have audited traction numbers, they can replace these — see section 6.

---

## 3. Editing contact details

All contact information lives in **one file**: `assets/js/config.js`.
Change a value there and every page updates automatically on load.

```js
window.SAYNEEL = {
  email:        'info@sayneel.com',
  phoneDisplay: '+91 00000 00000',
  phoneDial:    '+918600405088',
  ...
};
```

The HTML also contains the same values hard-coded, so the page still shows correct details if a
visitor has JavaScript disabled. **After editing `config.js`, run a find-and-replace across the
`.html` files** for the old value so both stay in sync. For example, to change the main email:

```bash
grep -rl "info@sayneel.com" *.html | xargs sed -i 's/info@sayneel\.com/hello@sayneel.com/g'
```

---

## 4. Folder structure

```
/
├── index.html              Home — every required section
├── about.html              Mission, vision, values, story, CSR, future vision
├── services.html           12 services, each with features, benefits and a CTA
├── balsaathi.html          Flagship product page
├── industries.html         12 industries
├── work.html               Portfolio with filtering
├── careers.html            Culture, roles, internships, benefits, hiring process
├── contact.html            Contact details only — no form anywhere on the site
├── privacy-policy.html
├── terms.html
├── cookie-policy.html
├── 404.html                Custom error page (noindex)
├── thank-you.html          Optional confirmation page (noindex)
│
├── assets/
│   ├── css/styles.css      Single stylesheet, 21 commented sections
│   ├── js/config.js        ← all contact details live here
│   ├── js/main.js          All behaviour; no inline handlers anywhere
│   ├── images/             Placeholders + social share images
│   ├── icons/              Favicons and app icons
│   ├── fonts/              Empty — for self-hosted fonts (see section 8)
│   └── videos/             Empty — for any video you add later
│
├── docs/                   SEO, performance, browser and production checklists
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── .htaccess               Apache: 404 page, security headers, caching, gzip
├── _headers                Netlify / Cloudflare Pages equivalent
├── netlify.toml            Netlify 404 routing
└── vercel.json             Vercel headers
```

---

## 5. Replacing the placeholder images

Every image on the site is a real file that renders correctly — nothing is broken or missing.
The generated SVGs are branded placeholders. **Keep the filename, change the extension in the
HTML if needed**, and the layout will not move.

| File                                | Used on               | Suggested replacement                |
| ----------------------------------- | --------------------- | ------------------------------------ |
| `about-team.svg`                    | about.html            | Team photograph, 3:2, ≥1200px wide   |
| `careers-culture.svg`               | careers.html          | Workplace photograph, 3:2            |
| `balsaathi-screen-growth.svg`       | balsaathi.html        | Real app screenshot, 4:3             |
| `balsaathi-screen-milestones.svg`   | balsaathi.html        | Real app screenshot, 4:3             |
| `balsaathi-screen-worker.svg`       | balsaathi.html        | Real app screenshot, 4:3             |
| `balsaathi-screen-immunisation.svg` | balsaathi.html        | Real app screenshot, 4:3             |
| `balsaathi-screen-nutrition.svg`    | balsaathi.html        | Real app screenshot, 4:3             |
| `balsaathi-screen-dashboard.svg`    | balsaathi.html        | Real dashboard screenshot, 4:3       |
| `portfolio-*.svg` (9 files)         | index.html, work.html | Project imagery, 640×300             |
| `og-default.jpg`                    | all pages             | Social share image, exactly 1200×630 |
| `og-balsaathi.jpg`                  | balsaathi.html        | Social share image, exactly 1200×630 |
| `sayneel-logo.png`                  | Schema.org markup     | Your real logo, square PNG, ≥512px   |

If you replace `about-team.svg` with `about-team.jpg`, update the one `src` reference in
`about.html`. Also update the `alt` text to describe the real photograph, and remove the
`<figcaption>` that says "Replace with …".

**Before publishing photographs of identifiable people** — particularly children, patients or
field beneficiaries — make sure you hold documented written consent.

Optimise photographs before upload. Aim for under 200 KB each:

```bash
# JPEG
convert input.jpg -resize 1600x -quality 82 -strip output.jpg
# or convert to WebP for smaller files
cwebp -q 82 input.jpg -o output.webp
```

---

## 6. Adding real statistics later

The counters on `index.html` use a `data-count` attribute:

```html
<div class="stat"><b data-count="12">0</b><span>Service practices</span></div>
```

To add a suffix or prefix:

```html
<b data-count="250" data-suffix="+">0</b>
<b data-count="98" data-suffix="%">0</b>
```

Numbers are formatted with Indian digit grouping automatically. Only publish a figure you can
evidence — the site currently makes no unverifiable claim, and that is a competitive advantage
with government and enterprise buyers, not a gap.

---

## 7. Deployment

### GitHub Pages

1. Create a repository and push these files to the default branch.
2. Settings → Pages → Source: _Deploy from a branch_ → branch `main`, folder `/ (root)`.
3. Add your custom domain under Settings → Pages → Custom domain.
4. GitHub Pages serves `404.html` automatically. `.htaccess` is ignored — security headers must
   then be set at the CDN layer (for example Cloudflare) instead.

### Netlify

1. Drag this folder onto the Netlify dashboard, or connect the repository.
2. Build command: _(leave empty)_. Publish directory: `.`
3. `_headers` and `netlify.toml` are picked up automatically.

### Vercel

1. Import the repository, framework preset **Other**, no build command, output directory `.`
2. `vercel.json` supplies the security headers.

### Shared hosting / cPanel

1. Upload everything to `public_html` via File Manager or FTP, preserving folders.
2. Ensure `.htaccess` uploaded (enable "show hidden files" in File Manager).
3. Install an SSL certificate, then uncomment the HTTPS redirect block in `.htaccess`.

### After any deployment

- Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Test the Open Graph cards at the LinkedIn Post Inspector and Twitter Card Validator.
- Confirm `https://yourdomain.com/404.html` is served for an unknown URL.

---

## 8. Self-hosting the font (optional, recommended)

The site loads Inter from Google Fonts. That is one third-party request, and it is the only one
on the site. To remove it entirely — better for privacy, and slightly faster:

1. Download Inter from <https://fonts.google.com/specimen/Inter> or <https://rsms.me/inter/>.
2. Put the `.woff2` files in `assets/fonts/`.
3. Add to the top of `assets/css/styles.css`:

```css
@font-face {
  font-family: "Inter";
  src: url("../fonts/Inter-Regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}
/* repeat for 500, 600, 700, 800 */
```

4. Delete the five Google Fonts `<link>` lines from the `<head>` of every `.html` file.
5. Update `cookie-policy.html` section 4, which currently discloses the Google Fonts request.

---

## 9. Technical notes

- **No contact form anywhere.** This was an explicit requirement. All contact routes are
  `mailto:` and `tel:` links. There is no PHP, no form handler and no backend of any kind.
  The audit script enforces this.
- **The newsletter box is UI only.** It validates the address format and then opens the
  visitor's mail client addressed to you, so no subscription is silently lost. To connect a
  real mailing list, replace the `newsletter()` block in `assets/js/main.js` with your
  provider's embed.
- **No inline event handlers.** Every behaviour is bound in `main.js`. The only inline
  attribute is `onload` on the non-blocking font stylesheet link, a standard loading pattern.
- **Theme preference** is stored in `localStorage` under `sayneel-theme` and never sent anywhere.
- **Dark mode** follows the operating system by default and remembers a manual override.
- **Reduced motion** is respected — all animation is disabled for visitors who ask for that.
- **Content Security Policy** is documented and applied in `.htaccess`, `_headers` and
  `vercel.json`. If you enable the Maps embed, add `frame-src https://www.google.com;` to it.

---

## 10. Accessibility

Built to **WCAG 2.2 Level AA** as the target: skip link, semantic landmarks, one `<h1>` per page,
logical heading order, visible focus rings, keyboard-operable navigation and filters, `aria-current`
on the active nav item, `aria-expanded` on the mobile menu, alt text on every image, labelled form
controls, and colour contrast checked in both themes.

Run a check yourself before launch with Lighthouse (in Chrome DevTools), axe DevTools or WAVE.

---

## 11. Checklists

See the `docs/` folder:

- `SEO-CHECKLIST.md`
- `PERFORMANCE-CHECKLIST.md`
- `BROWSER-COMPATIBILITY.md`
- `PRODUCTION-REVIEW.md`

---

© SayNeel Technologies Private Limited.
