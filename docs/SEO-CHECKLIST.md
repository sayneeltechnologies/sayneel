# SEO Checklist — SayNeel Technologies Website

Status of every SEO item on this site. **Done** means it is implemented and was verified by the
automated audit run against all 13 pages. **Your action** means it needs something only you can do.

---

## On-page fundamentals

| Item                           | Status  | Detail                                                                                  |
| ------------------------------ | ------- | --------------------------------------------------------------------------------------- |
| Unique `<title>` on every page | ✅ Done | 50–70 characters, brand suffixed, keyword-led                                           |
| Unique meta description        | ✅ Done | 150–200 characters, written to earn the click, not stuffed                              |
| Meta keywords                  | ✅ Done | Present on all pages (ignored by Google; harmless, some regional engines still read it) |
| Canonical URL                  | ✅ Done | Self-referencing on every page; `/` for the home page                                   |
| Meta robots                    | ✅ Done | `index, follow` with `max-image-preview:large`; `noindex` on 404 and thank-you          |
| `lang` attribute               | ✅ Done | `en-IN` on every page                                                                   |
| Single `<h1>` per page         | ✅ Done | Verified by audit                                                                       |
| Logical heading order          | ✅ Done | h1 → h2 → h3, no skipped levels                                                         |
| Semantic HTML5 landmarks       | ✅ Done | `header`, `nav`, `main`, `section`, `article`, `footer`, `address`                      |
| Descriptive alt text           | ✅ Done | Every `<img>` has meaningful alt; decorative elements use `aria-hidden`                 |
| Internal linking               | ✅ Done | Every page reachable within two clicks; all internal links verified to resolve          |
| Breadcrumb navigation          | ✅ Done | Visible on all sub-pages, plus BreadcrumbList schema                                    |
| Descriptive, readable URLs     | ✅ Done | `/balsaathi.html`, `/privacy-policy.html`, etc.                                         |
| No broken links                | ✅ Done | All internal links and anchors resolve — verified by audit                              |

## Structured data (Schema.org, JSON-LD)

| Schema                            | Where                  | Status                                                                        |
| --------------------------------- | ---------------------- | ----------------------------------------------------------------------------- |
| `Organization`                    | index.html, about.html | ✅ Done — name, logo, email, phone, address, sameAs, knowsAbout, contactPoint |
| `WebSite`                         | index.html             | ✅ Done                                                                       |
| `SoftwareApplication` (BalSaathi) | balsaathi.html         | ✅ Done — HealthApplication category, featureList, offers                     |
| `FAQPage`                         | index.html             | ✅ Done — all 23 questions and answers                                        |
| `BreadcrumbList`                  | every content page     | ✅ Done                                                                       |
| `Service` × 4                     | services.html          | ✅ Done                                                                       |
| `ContactPage`                     | contact.html           | ✅ Done                                                                       |
| JSON-LD parses without error      | all                    | ✅ Done — verified by audit                                                   |

**Your action:** after deployment, test each page at
<https://search.google.com/test/rich-results>.

## Social sharing

| Item                                                                           | Status                                         |
| ------------------------------------------------------------------------------ | ---------------------------------------------- |
| `og:type`, `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale` | ✅ Done                                        |
| `og:image` 1200×630 with width, height and alt                                 | ✅ Done — `og-default.jpg`, `og-balsaathi.jpg` |
| `twitter:card` = `summary_large_image`                                         | ✅ Done                                        |
| `twitter:site`, `twitter:creator`, title, description, image                   | ✅ Done                                        |

**Your action:** replace `@sayneel` in the Twitter tags with your real handle, and re-test the cards
at the LinkedIn Post Inspector and Twitter Card Validator after go-live.

## Technical SEO

| Item                 | Status         | Detail                                                                                                               |
| -------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `robots.txt`         | ✅ Done        | Allows crawling, disallows 404 and thank-you, declares the sitemap, includes commented opt-out lines for AI crawlers |
| `sitemap.xml`        | ✅ Done        | All 11 indexable pages with lastmod, changefreq and priority                                                         |
| Favicon set          | ✅ Done        | SVG, 16px, 32px, `favicon.ico`, 180px Apple touch icon, 192/512 app icons                                            |
| Web app manifest     | ✅ Done        | `site.webmanifest`, all referenced icons exist                                                                       |
| Mobile-friendly      | ✅ Done        | Responsive at 390px, 768px, 1024px and 1440px — verified with rendered screenshots                                   |
| HTTPS                | ⚠️ Your action | Install an SSL certificate, then uncomment the redirect in `.htaccess`                                               |
| Custom 404           | ✅ Done        | `404.html`, wired up in `.htaccess` and `netlify.toml`                                                               |
| Page speed           | ✅ Done        | See `PERFORMANCE-CHECKLIST.md`                                                                                       |
| No duplicate content | ✅ Done        | Each page has distinct copy; canonicals prevent www/non-www duplication                                              |

## Content

| Item                                                  | Status                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| No Lorem Ipsum, TODO, "coming soon" or empty sections | ✅ Done — verified by audit across all pages                   |
| 23-question FAQ with schema                           | ✅ Done                                                        |
| Long-form service and industry pages                  | ✅ Done — 12 services, 12 industries, each with real substance |
| Product page for the flagship                         | ✅ Done — `balsaathi.html`                                     |
| Legal pages (privacy, terms, cookies)                 | ✅ Done — templates requiring an advocate's review             |
| No unverifiable statistics                            | ✅ Done — deliberate; see README section 6                     |

## Post-launch actions (yours)

1. Replace `https://www.sayneeltech.in` throughout with your live domain (README section 2, item 4).
2. Verify the domain in Google Search Console and Bing Webmaster Tools; submit `sitemap.xml`.
3. Create and verify a Google Business Profile for the Pune office — it is the single highest-value
   local SEO action for an Indian services company.
4. Set up analytics if you want it. If you do, update `cookie-policy.html` and add a consent
   mechanism before any non-essential cookie is set.
5. Build citations: LinkedIn company page, Clutch, GoodFirms, Justdial, IndiaMART.
6. Publish original writing. The site has no blog by design; add one when you have something to
   say. Engineering notes on offline-first architecture and healthcare data protection are the
   topics you can write about more credibly than your competitors.
