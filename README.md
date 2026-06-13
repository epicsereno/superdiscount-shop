# Super Discount — Online Shop

Standalone storefront for **Super Discount El Sereno** (3118 N Eastern Ave, Los Angeles, CA 90032).

Live: https://epicsereno.github.io/superdiscount-shop/
Main site: https://epicsereno.github.io/superdiscount/

This is the e-commerce shop, kept separate from the marketing homepage. It's a
static site (no build step) — plain HTML/CSS/vanilla JS with a client-side cart
(localStorage) and a demo auth layer (sessionStorage, guest browsing supported).

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Product catalog with category filters + search |
| `product.html?id=N` | Product detail page (reads `data/products.json` + `data/reviews.json`) |
| `cart.html` | Cart review |
| `login.html` | Demo login / guest browsing |

## Data & thumbnails

Products live in `data/products.json`. Each product gets a generated SVG
thumbnail in `public/images/products/`. Regenerate after editing the catalog
(the generator lives in the dev repo `super_discount-sereno`):

```bash
npm run thumbs:products
```

## Local preview

```bash
python3 -m http.server 8000   # then open http://127.0.0.1:8000/
```

## Notes

- The shop is fully open to the public — no login required to browse or add to
  cart. `login.html` and the demo auth layer remain available but optional.
- "Home"/Services/About/Find Us links point back to the marketing homepage.
