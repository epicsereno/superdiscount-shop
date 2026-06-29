# TODO — Super Discount Shop

Concrete improvements for the static shop at https://epicsereno.github.io/superdiscount-shop/.

---

## Cart & Ordering

- [ ] Add a "Clear cart" button to `cart.html`
- [ ] Show an empty-cart illustration/message with a CTA back to the shop
- [ ] Display estimated total including a "call to confirm" note on the cart page
- [x] Add a `?id=` deep-link share button on each product card so customers can text a product link

## Product Catalog

- [ ] Add `stock` field to `data/products.json` and show "Low stock" / "Out of stock" badges
- [ ] Support product images via URL in `data/products.json` (in addition to local SVGs)
- [x] Persist active category + search query in the URL (`?q=&cat=`) so filters survive page refresh and can be shared
- [ ] Add "Back to top" button for long category lists

## Product Detail Page

- [x] Add "Add to Cart" button on related product cards (currently just "View")
- [ ] Implement image zoom / lightbox on click for products with photos
- [ ] Show review count in page `<title>` for SEO (e.g. `Coca-Cola 2L (12 reviews) | Super Discount`)

## Reviews

- [ ] Replace `localStorage`-only review storage with a free form backend (Formspree or a Google Sheet via Apps Script) so reviews survive device/browser changes
- [ ] Add review spam guard: rate-limit submissions per product per session
- [ ] Show "Verified purchase" badge for reviewers whose session has that product in order history

## Search & Filtering

- [x] Add keyboard shortcut (`/`) to focus the search input
- [ ] Announce filter result counts to screen readers via an `aria-live` region
- [ ] Support comma-separated tags in `data/products.json` and add tag filtering

## Auth & Staff

- [ ] Move hardcoded staff passwords in `js/auth.js` (`STORE_USERS`) out of the source file — store them as a hashed list in a JSON file that is `.gitignore`d or use GitHub secrets for a build step
- [ ] Add a basic staff dashboard page (`staff.html`) to view/export cart summaries
- [ ] Add a "Forgot password" reset flow for registered customers (email via Formspree or mailto)

## UI / Accessibility

- [ ] Link `style.css` (the dark theme v2) as an opt-in via a toggle button and save preference to `localStorage`
- [ ] Add a focus trap inside the quick-view modal (`buildModal` in `shop.js`)
- [ ] Add a visible "Skip to content" link at the top of each page for keyboard users
- [ ] Show skeleton loading cards while `data/products.json` is fetching

## SEO / Meta

- [x] Add per-product Open Graph tags in `product.html` (populated dynamically from JSON)
- [x] Add `<link rel="canonical">` on `product.html?id=N` pages
- [ ] Submit `sitemap.xml` to Google Search Console (listing all `product.html?id=N` URLs)

## Performance

- [ ] Add a service worker to cache `data/products.json`, `data/reviews.json`, and static assets for offline / slow-connection browsing
- [ ] Lazy-load below-the-fold product images with `loading="lazy"` (already done for cards — verify for featured section)

## Developer Experience

- [ ] Add a `data/products.schema.json` JSON Schema and a small validation script so catalog edits can be checked before commit
- [ ] Document the thumbnail generation command in README (already documented in CLAUDE.md — mirror it to README)
