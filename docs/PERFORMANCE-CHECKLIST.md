# Performance Checklist — SayNeel Technologies Website

## Measured payload

Actual file sizes in this build:

| Asset | Uncompressed | Gzipped |
|-------|--------------|---------|
| `assets/css/styles.css` | 31.6 KB | ~7.9 KB |
| `assets/js/main.js` | 12.3 KB | ~3.5 KB |
| `assets/js/config.js` | 2.6 KB | ~1.0 KB |
| `index.html` (largest page) | 72.9 KB | ~20 KB |
| Typical inner page | 20–33 KB | ~6–9 KB |
| All images and icons combined | 256 KB | — |
| **Whole site** | **744 KB** | — |

There is no framework, no jQuery, no icon font, no CSS library and no build output.
Total JavaScript on any page is under 15 KB uncompressed.

## Implemented

| Technique | Status | Detail |
|-----------|--------|--------|
| Single external stylesheet | ✅ | One request, cached across all pages; no duplicate rules |
| Single external script | ✅ | `main.js` loaded with `defer` so it never blocks rendering |
| No render-blocking fonts | ✅ | Google Fonts loaded with `media="print"` + `onload` swap, plus a `<noscript>` fallback |
| Font preconnect | ✅ | `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` |
| `font-display: swap` | ✅ | Requested in the Google Fonts URL — text is visible immediately |
| Lazy loading | ✅ | Every content `<img>` has `loading="lazy"` and `decoding="async"` |
| Explicit image dimensions | ✅ | `width` and `height` on every `<img>` — prevents layout shift (CLS) |
| Vector graphics | ✅ | All illustrations and covers are SVG — sharp at any resolution, tiny |
| SVG favicon | ✅ | One scalable file instead of a stack of PNG requests |
| No layout-shifting ads or embeds | ✅ | None on the site |
| CSS containment via simple selectors | ✅ | Flat class-based selectors, no deep descendant chains |
| Hardware-accelerated animation | ✅ | Only `transform` and `opacity` are animated |
| `prefers-reduced-motion` respected | ✅ | All animation and smooth scrolling disabled when requested |
| IntersectionObserver for reveals and counters | ✅ | No scroll-event animation loops |
| Passive scroll listeners | ✅ | `{ passive: true }` on both scroll handlers |
| Gzip / Brotli compression | ✅ | Configured in `.htaccess`; automatic on Netlify, Vercel and Cloudflare |
| Long cache headers on assets | ✅ | One year immutable for `/assets/*`, one hour for HTML |
| No web fonts loaded for icons | ✅ | Emoji and inline SVG only |
| No third-party trackers | ✅ | Zero analytics, ad or social scripts |

## Expected Lighthouse results

On a normal host with HTTPS and compression enabled, this site should score in the
**95–100** range for Performance, Accessibility, Best Practices and SEO. Core Web Vitals:

- **LCP** — the hero heading is text, styled with a system-font fallback that swaps to Inter.
  No image blocks the largest paint.
- **CLS** — every image has explicit dimensions and the font swap uses a metric-similar
  system fallback, so near zero.
- **INP** — all handlers are trivial; no long tasks.

## Optional further optimisation

Ordered by benefit relative to effort.

1. **Self-host Inter** (README section 8). Removes the last third-party request, saves a DNS
   lookup and TLS handshake, and eliminates the Google Fonts disclosure in the cookie policy.
2. **Serve modern image formats** when you replace the placeholders with photographs:
   ```bash
   cwebp -q 82 photo.jpg -o photo.webp
   ```
   ```html
   <picture>
     <source srcset="assets/images/about-team.webp" type="image/webp">
     <img src="assets/images/about-team.jpg" alt="…" loading="lazy" width="900" height="600">
   </picture>
   ```
3. **Put a CDN in front** — Cloudflare's free tier gives Brotli, HTTP/3 and edge caching, which
   matters most for visitors outside India.
4. **Minify CSS and HTML** if you want the last few kilobytes. Gzip already recovers most of it, and
   the unminified files are far easier for you to maintain. Only do this if you add a build step.
5. **Split the home page** if it grows further. At 73 KB it is fine, but it is the largest document
   on the site because it carries every required section.

## Things deliberately not done

- **No minification pipeline** — you asked for something you can upload and edit directly.
  Readable source is worth more than 6 KB here.
- **No service worker** — a static marketing site does not need offline caching, and a stale
  service worker is a common cause of "the site won't update" support tickets.
- **No image CDN or lazy-hydration framework** — nothing on the page needs it.

## Verify after deployment

```
https://pagespeed.web.dev/            — run for index.html, services.html, balsaathi.html
https://www.webpagetest.org/          — test from a Mumbai node with a 4G profile
https://gtmetrix.com/
```

Test on a real entry-level Android phone over 4G before you consider it done. That is the device
class your BalSaathi audience uses, and it is the honest measure.
