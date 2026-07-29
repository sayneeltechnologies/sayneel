# Browser Compatibility — SayNeel Technologies Website

## Support policy

| Browser | Versions supported | Notes |
|---------|--------------------|-------|
| Chrome (desktop & Android) | 90+ (2021 onward) | Primary target — the dominant browser in India |
| Edge | 90+ | Chromium-based, behaves as Chrome |
| Firefox | 88+ | Fully supported |
| Safari (macOS) | 15+ | Fully supported |
| Safari (iOS) | 15+ | Fully supported |
| Samsung Internet | 14+ | Significant share on Android in India — supported |
| Opera / Brave / Vivaldi | Current | Chromium-based |
| Internet Explorer 11 | **Not supported** | Retired by Microsoft in June 2022 |

Older browsers than the versions above still render a readable, navigable site. They lose visual
polish (blur effects, colour mixing) but never content or functionality.

## Modern features used, and what happens without them

| Feature | Fallback behaviour |
|---------|--------------------|
| CSS custom properties | Required. Universal since 2017; no fallback provided |
| CSS Grid | Required. Universal since 2017 |
| Flexbox | Required. Universal |
| `backdrop-filter` | Wrapped in `@supports`; the header falls back to an opaque background |
| `color-mix()` | Used only for translucent surfaces. Older browsers render the element fully opaque — visually plainer, functionally identical |
| `aspect-ratio` | Used on screenshot figures only; images still display without it |
| `IntersectionObserver` | Feature-detected. Without it, counters run immediately and reveal animations show content straight away |
| `localStorage` | Wrapped in try/catch. If blocked, the theme toggle still works for the session but is not remembered |
| `scroll-behavior: smooth` | Cosmetic. Jumps instantly without it |
| `prefers-reduced-motion` | Progressive enhancement — animation stays on where unsupported |
| `prefers-color-scheme` | Falls back to light theme; the manual toggle still works |
| `<details>` / `<summary>` | Native accordion; universally supported since 2020 |
| SVG images | Universal |
| `loading="lazy"` | Ignored where unsupported; images simply load eagerly |

## JavaScript compatibility

`main.js` is written in **ES5-compatible syntax** — `var`, function expressions, no arrow
functions, no template literals, no optional chaining, no `const`/`let`. It uses no transpiler
and no polyfills, and runs unmodified in any browser from roughly 2015 onward. Every module
is individually guarded, so a missing element or a blocked API never breaks the rest of the page.

## Progressive enhancement — with JavaScript disabled

The site remains usable. Specifically:

- All content is present in the HTML — nothing is rendered client-side.
- All navigation links work.
- All contact details are hard-coded in the markup, including `mailto:` and `tel:` hrefs.
- The FAQ accordion works (native `<details>`).
- Only these degrade: theme toggle, scroll reveal animation (content shows immediately),
  animated counters (numbers show statically), portfolio filtering, BalSaathi audience tabs
  (the first panel stays visible), back-to-top button, and newsletter validation.

## Responsive breakpoints

| Width | Layout |
|-------|--------|
| ≥ 1200px | Full desktop, 1200px content column |
| 1081–1199px | Desktop, fluid |
| ≤ 1080px | Navigation collapses to the hamburger drawer |
| ≤ 1000px | 3- and 4-column grids become 2 columns |
| ≤ 900px | Split sections stack; hero visual hidden; phone mock recentres |
| ≤ 768px | Section padding reduced; stats card becomes 2×2; footer to 2 columns |
| ≤ 640px | All grids single column; CTA bands and cards tighten |
| ≤ 480px | Footer to a single column |

## Verified in this build

Rendering was checked with headless Chromium at **1440×1000** and **390×844** across
index, about, services, balsaathi, industries, work, careers, contact, privacy-policy and 404.
Interactive behaviour was tested programmatically and passed on all of:
theme toggle and persistence, animated counters, header scroll state, active-nav marking,
mobile drawer open, ARIA state and Escape-to-close, portfolio filtering, BalSaathi audience
panel switching, back-to-top visibility and scroll, newsletter validation messaging, and
skip-link as the first tab stop.

**Console errors: none.**

## Manual testing to do before launch

- [ ] Chrome on Windows and on Android
- [ ] Safari on macOS and on iPhone — check the sticky header and `backdrop-filter`
- [ ] Firefox on desktop
- [ ] Samsung Internet on an Android device
- [ ] An entry-level Android phone over a real 4G connection
- [ ] A tablet in both portrait and landscape
- [ ] Both light and dark system themes
- [ ] Full keyboard-only navigation of every page
- [ ] A screen reader — NVDA on Windows or VoiceOver on macOS/iOS
- [ ] Browser zoom at 200%
