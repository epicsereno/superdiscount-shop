# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static e-commerce shop for **Super Discount El Sereno** (3118 N Eastern Ave, Los Angeles, CA 90032). No build step, no framework, no package manager — plain HTML/CSS/vanilla JS deployed to GitHub Pages at https://epicsereno.github.io/superdiscount-shop/. This repo is separate from the marketing homepage (https://epicsereno.github.io/superdiscount/).

## Local development

```bash
python3 -m http.server 8000   # open http://127.0.0.1:8000/
```

The site must be served (not opened as `file://`) because JS fetches `data/products.json` and `data/reviews.json` via `fetch()`.

There are no tests, no linter, and no build process.

## Architecture

### Pages and their scripts

Each HTML page loads scripts in a specific order via `<script>` tags at the bottom of `<body>`:

| Page | Scripts loaded |
|------|---------------|
| `index.html` | `main.js` → `auth.js` → `cart.js` → `shop.js` |
| `product.html` | `main.js` → `auth.js` → `cart.js` → `product.js` |
| `cart.html` | `main.js` → `auth.js` → `cart.js` → `cart-page.js` |
| `login.html` | `auth.js` → `login.js` |

Script load order matters: `cart.js` must precede any page script that calls `Cart.*`, and `auth.js` must precede any page script that calls `Auth.*`.

### Global singletons

Two IIFE-based modules are exposed as globals — no module system:

- **`Cart`** (`js/cart.js`) — reads/writes `localStorage` under key `sd_cart`. Stores `[{ id, name, price, category, qty }]`. Methods: `get`, `add`, `remove`, `setQty`, `count`, `total`, `clear`. Automatically updates the `#cart-count` badge on every mutation.

- **`Auth`** (`js/auth.js`) — session in `sessionStorage` under key `sd_session` (base64-encoded JSON). Customer accounts stored in `localStorage` under `sd_users` (SHA-256 hashed passwords via `crypto.subtle`). Hardcoded staff accounts (`STORE_USERS`) are compared plain-text. Roles: `staff`, `customer`, `guest`. The site is fully public — no page calls `Auth.requireAuth()` anymore, but the auth layer remains available.

### Data

- `data/products.json` — single source of truth. Shape: `{ "products": [{ id, name, category, price, description, image?, badge? }] }`. Categories: Beverages, Snacks & Candy, School Supplies, Party Supplies, Household Goods, Personal Care, Spray Paint & Art.
- `data/reviews.json` — seeded reviews. Shape: `{ "reviews": { "<productId>": [{ name, rating, text, date }] } }`. Visitor-submitted reviews are merged from `localStorage` key `sd_reviews` at render time in `product.js`.

Product thumbnail SVGs live in `public/images/products/` named `{id}-{slug}.svg`. They are generated externally (`npm run thumbs:products` in the sibling `super_discount-sereno` dev repo) and committed here.

### CSS

Two stylesheets coexist — `css/styles.css` is the primary (light/warm theme, used by all pages). `style.css` at the root is a dark brand redesign (v2) that is not currently linked by any page. Design tokens are CSS custom properties defined in `:root`; primary color is `--color-primary: #D72B2B`, font is DM Sans (Google Fonts) + Bebas Neue for display.

Category-colored product image placeholders use dynamically generated `cat-{slug}` CSS classes where `slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-')`.

### Navigation

External links (Home, Services, About, Find Us) all point back to the marketing site at `https://epicsereno.github.io/superdiscount/`. Internal links use relative paths (e.g. `index.html`, `product.html?id=N`, `cart.html`).

## Key conventions

- **No innerHTML for user content** — `product.js` uses `escapeHtml()` for all dynamic user-supplied strings (reviews, product fields rendered into HTML). `shop.js` renders trusted JSON data directly without escaping (acceptable since it's not user input), but `product.js` escapes everything as a safer default.
- **Product IDs are integers** — always parse with `parseInt(..., 10)` before comparing or storing.
- **Cart stores a snapshot** — name, price, and category are copied into the cart at add-time, not re-fetched from `products.json` on render. Price changes don't retroactively update open carts.
- **`?next=` redirect param** — `login.js` reads `?next=<encoded-path>` and redirects there after sign-in. Use `encodeURIComponent(window.location.pathname + window.location.search)` when constructing the link.
- **No checkout** — the cart is informational. The intended flow is: add items → call `(323) 223-8115` or visit the store for pickup.
