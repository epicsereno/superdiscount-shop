const REVIEWS_KEY = 'sd_reviews';

let product = null;
let allProducts = [];

function categorySlug(cat) {
    return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getProductId() {
    return parseInt(new URLSearchParams(location.search).get('id'), 10);
}

/* ── Reviews: seeded JSON + visitor-submitted localStorage ──────────── */

function getLocalReviews(id) {
    try {
        const all = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {};
        return all[id] || [];
    } catch {
        return [];
    }
}

function addLocalReview(id, review) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {}; } catch { all = {}; }
    (all[id] = all[id] || []).push(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
}

function getAllReviews(id, seeded) {
    return [...(seeded[id] || []), ...getLocalReviews(id)];
}

function stars(rating, extraClass = '') {
    const full = Math.round(rating);
    let out = '';
    for (let i = 1; i <= 5; i++) {
        out += `<span class="star${i <= full ? ' is-full' : ''}" aria-hidden="true">★</span>`;
    }
    return `<span class="stars ${extraClass}" role="img" aria-label="${rating.toFixed(1)} out of 5 stars">${out}</span>`;
}

/* ── Render the product detail ──────────────────────────────────────── */

function renderProduct(reviews) {
    const root = document.getElementById('pdp-root');
    const slug = categorySlug(product.category);
    const list = getAllReviews(product.id, reviews);
    const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

    document.title = `${product.name} | Super Discount El Sereno`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = `${product.description} — In stock at Super Discount El Sereno, 3118 N Eastern Ave, Los Angeles. Open daily 9:30 AM–9 PM.`;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = `${product.name} | Super Discount El Sereno`;
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = `${product.description} — In stock at Super Discount El Sereno, 3118 N Eastern Ave, Los Angeles.`;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `https://epicsereno.github.io/superdiscount-shop/product.html?id=${product.id}`;

    document.getElementById('crumb-name').textContent = product.name;
    const crumbCat = document.getElementById('crumb-category');
    crumbCat.textContent = product.category;

    const ratingLine = list.length
        ? `${stars(avg)} <a class="pdp-rating-link" href="#reviews-section">${avg.toFixed(1)} · ${list.length} review${list.length === 1 ? '' : 's'}</a>`
        : `<a class="pdp-rating-link" href="#reviews-section">No reviews yet — be the first</a>`;

    const photo = product.image
        ? `<img class="pdp-photo" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"
                onerror="this.parentElement.classList.remove('has-photo');this.remove();">`
        : '';
    const badge = product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : '';

    root.innerHTML = `
        <div class="pdp-layout">
            <div class="pdp-media cat-${slug}${product.image ? ' has-photo' : ''}">
                ${photo}
                <span class="pdp-media-label">${escapeHtml(product.category)}</span>
                ${badge}
            </div>
            <div class="pdp-info">
                <p class="product-category">${escapeHtml(product.category)}</p>
                <h1 class="pdp-name">${escapeHtml(product.name)}</h1>
                <p class="pdp-rating">${ratingLine}</p>
                <p class="pdp-price">$${product.price.toFixed(2)}</p>
                <p class="pdp-desc">${escapeHtml(product.description || '')}</p>
                <div class="pdp-buy">
                    <div class="qty-stepper" role="group" aria-label="Quantity">
                        <button type="button" class="qty-btn" id="qty-minus" aria-label="Decrease quantity">−</button>
                        <input type="number" id="qty-input" class="qty-input" value="1" min="1" max="99" inputmode="numeric" aria-label="Quantity">
                        <button type="button" class="qty-btn" id="qty-plus" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="btn btn-primary pdp-add" id="pdp-add">Add to Cart</button>
                </div>
                <p class="pdp-note">In stock at <strong>3118 N Eastern Ave</strong> — add to cart, then call
                    <a href="tel:+13232238115">(323) 223-8115</a> or stop by to pick up.</p>
            </div>
        </div>
    `;

    crumbCat.href = `index.html?cat=${encodeURIComponent(product.category)}`;

    const qtyInput = document.getElementById('qty-input');
    const clampQty = () => {
        let v = parseInt(qtyInput.value, 10);
        if (!v || v < 1) v = 1;
        if (v > 99) v = 99;
        qtyInput.value = v;
        return v;
    };
    document.getElementById('qty-minus').addEventListener('click', () => { qtyInput.value = Math.max(1, clampQty() - 1); });
    document.getElementById('qty-plus').addEventListener('click', () => { qtyInput.value = Math.min(99, clampQty() + 1); });
    qtyInput.addEventListener('change', clampQty);

    const addBtn = document.getElementById('pdp-add');
    addBtn.addEventListener('click', () => {
        Cart.add(product, clampQty());
        addBtn.textContent = 'Added!';
        addBtn.classList.add('is-added');
        setTimeout(() => {
            addBtn.textContent = 'Add to Cart';
            addBtn.classList.remove('is-added');
        }, 1400);
    });
}

/* ── Reviews block ──────────────────────────────────────────────────── */

function renderReviews(reviews) {
    const section = document.getElementById('reviews-section');
    const root = document.getElementById('reviews-root');
    const list = getAllReviews(product.id, reviews);
    const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

    const items = list.length
        ? list.map(r => `
            <li class="review">
                <div class="review-head">
                    <span class="review-name">${escapeHtml(r.name || 'Customer')}</span>
                    ${stars(r.rating)}
                    ${r.date ? `<span class="review-date">${escapeHtml(r.date)}</span>` : ''}
                </div>
                <p class="review-text">${escapeHtml(r.text || '')}</p>
            </li>`).join('')
        : '<li class="review review-empty">No reviews yet. Be the first to leave one!</li>';

    root.innerHTML = `
        <h2 class="reviews-heading">Customer Reviews</h2>
        <p class="reviews-summary">${list.length ? `${stars(avg)} <strong>${avg.toFixed(1)}</strong> out of 5 · ${list.length} review${list.length === 1 ? '' : 's'}` : 'No ratings yet'}</p>
        <ul class="review-list">${items}</ul>
        <form class="review-form" id="review-form" novalidate>
            <h3>Leave a review</h3>
            <div class="review-form-row">
                <label for="rv-name">Your name</label>
                <input type="text" id="rv-name" maxlength="40" required>
            </div>
            <div class="review-form-row">
                <label for="rv-rating">Rating</label>
                <select id="rv-rating" required>
                    <option value="5">★★★★★ — Excellent</option>
                    <option value="4">★★★★ — Good</option>
                    <option value="3">★★★ — Okay</option>
                    <option value="2">★★ — Poor</option>
                    <option value="1">★ — Bad</option>
                </select>
            </div>
            <div class="review-form-row">
                <label for="rv-text">Your review</label>
                <textarea id="rv-text" rows="3" maxlength="500" required></textarea>
            </div>
            <button type="submit" class="btn btn-secondary">Submit Review</button>
            <p class="review-form-msg" id="rv-msg" hidden></p>
        </form>
    `;
    section.hidden = false;

    document.getElementById('review-form').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('rv-name').value.trim();
        const text = document.getElementById('rv-text').value.trim();
        const rating = parseInt(document.getElementById('rv-rating').value, 10);
        const msg = document.getElementById('rv-msg');
        if (!name || !text) {
            msg.hidden = false;
            msg.textContent = 'Please add your name and a short review.';
            return;
        }
        addLocalReview(product.id, {
            name,
            rating,
            text,
            date: new Date().toISOString().slice(0, 10)
        });
        renderReviews(reviews);
        renderProduct(reviews);
    });
}

/* ── Related products ───────────────────────────────────────────────── */

function relatedCard(p) {
    const slug = categorySlug(p.category);
    const href = `product.html?id=${p.id}`;
    const photo = p.image
        ? `<img class="product-photo" src="${escapeHtml(p.image)}" alt="" loading="lazy"
                onerror="this.parentElement.classList.remove('has-photo');this.remove();">`
        : '';
    return `
        <article class="product-card">
            <a class="product-img cat-${slug}${p.image ? ' has-photo' : ''}" href="${href}" aria-label="${escapeHtml(p.name)}">
                ${photo}
                <span class="product-img-label">${escapeHtml(p.category)}</span>
            </a>
            <div class="product-body">
                <p class="product-category">${escapeHtml(p.category)}</p>
                <h3 class="product-name"><a class="product-name-link" href="${href}">${escapeHtml(p.name)}</a></h3>
                <div class="product-footer">
                    <span class="product-price">$${p.price.toFixed(2)}</span>
                    <button class="btn btn-primary related-add-to-cart" data-id="${p.id}">Add to Cart</button>
                </div>
            </div>
        </article>
    `;
}

function renderRelated() {
    const related = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);
    if (!related.length) return;
    const grid = document.getElementById('related-grid');
    grid.innerHTML = related.map(relatedCard).join('');
    document.getElementById('related-section').hidden = false;

    grid.querySelectorAll('.related-add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id, 10);
            const p = allProducts.find(x => x.id === id);
            if (!p) return;
            Cart.add(p);
            btn.textContent = 'Added!';
            btn.classList.add('is-added');
            setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('is-added'); }, 1400);
        });
    });
}

/* ── Init ───────────────────────────────────────────────────────────── */

async function initProduct() {
    const id = getProductId();
    const root = document.getElementById('pdp-root');

    if (!id) {
        root.innerHTML = '<p class="pdp-error">No product specified. <a href="index.html">Back to shop</a>.</p>';
        return;
    }

    try {
        const [pResp, rResp] = await Promise.all([
            fetch('data/products.json'),
            fetch('data/reviews.json').catch(() => null)
        ]);
        allProducts = (await pResp.json()).products;
        const reviews = rResp && rResp.ok ? (await rResp.json()).reviews || {} : {};

        product = allProducts.find(p => p.id === id);
        if (!product) {
            root.innerHTML = '<p class="pdp-error">Sorry, we couldn’t find that product. <a href="index.html">Back to shop</a>.</p>';
            return;
        }

        renderProduct(reviews);
        renderReviews(reviews);
        renderRelated();
    } catch {
        root.innerHTML = '<p class="pdp-error">Could not load this product. Please try again. <a href="index.html">Back to shop</a>.</p>';
    }
}

document.addEventListener('DOMContentLoaded', initProduct);
