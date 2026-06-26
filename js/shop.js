let allProducts = [];
let allRatings = {};
let activeCategory = 'all';
let searchQuery = '';
let sortOrder = 'default';
let showWishlistOnly = false;

async function initShop() {
    try {
        const [productsResp, reviewsResp] = await Promise.all([
            fetch('data/products.json'),
            fetch('data/reviews.json')
        ]);
        const { products } = await productsResp.json();
        const { reviews } = await reviewsResp.json();
        allProducts = products;
        buildRatings(reviews);
        buildFeatured();
        buildFilters();
        buildModal();
        render();
    } catch {
        document.getElementById('product-grid').innerHTML =
            '<p style="color:var(--color-muted);grid-column:1/-1">Could not load products. Please try again.</p>';
    }
}

function categorySlug(cat) {
    return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildRatings(seededReviews) {
    let localReviews = {};
    try { localReviews = JSON.parse(localStorage.getItem('sd_reviews')) || {}; } catch {}

    const allIds = new Set([...Object.keys(seededReviews), ...Object.keys(localReviews)]);
    allIds.forEach(id => {
        const combined = [...(seededReviews[id] || []), ...(localReviews[id] || [])];
        if (combined.length) {
            allRatings[parseInt(id, 10)] = combined.reduce((s, r) => s + r.rating, 0) / combined.length;
        }
    });
}

function renderStars(avg) {
    if (!avg) return '';
    const full = Math.round(avg);
    const stars = [1, 2, 3, 4, 5].map(i =>
        `<span class="star${i <= full ? ' is-full' : ''}">★</span>`
    ).join('');
    return `<span class="stars" aria-label="${avg.toFixed(1)} out of 5 stars">${stars}</span>`;
}

function buildFeatured() {
    const featured = allProducts.filter(p => p.featured);
    if (!featured.length) return;
    const section = document.getElementById('featured-section');
    if (!section) return;

    section.innerHTML = `
        <div class="container">
            <div class="featured-header">
                <p class="eyebrow featured-eyebrow">Staff Picks</p>
                <h2 class="featured-title">Hot Right Now</h2>
            </div>
            <div class="featured-scroller">
                <div class="featured-track">
                    ${featured.map(p => {
                        const slug = categorySlug(p.category);
                        const photo = p.image
                            ? `<img class="product-photo" src="${p.image}" alt="" loading="lazy" onerror="this.parentElement.classList.remove('has-photo');this.remove();">`
                            : '';
                        const starsHtml = renderStars(allRatings[p.id]);
                        return `
                            <article class="featured-card">
                                <a class="featured-img cat-${slug}${p.image ? ' has-photo' : ''}" href="product.html?id=${p.id}" aria-label="${p.name}">
                                    ${photo}
                                    <span class="product-img-label">${p.category}</span>
                                </a>
                                <div class="featured-body">
                                    <p class="product-category">${p.category}</p>
                                    <h3 class="product-name"><a class="product-name-link" href="product.html?id=${p.id}">${p.name}</a></h3>
                                    ${starsHtml ? `<div class="card-stars">${starsHtml}</div>` : ''}
                                    <div class="product-footer">
                                        <span class="product-price">$${p.price.toFixed(2)}</span>
                                        <button class="btn btn-primary add-to-cart" data-id="${p.id}">Add to Cart</button>
                                    </div>
                                </div>
                            </article>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    section.hidden = false;

    section.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id, 10);
            const product = allProducts.find(p => p.id === id);
            if (!product) return;
            Cart.add(product);
            btn.textContent = 'Added!';
            btn.classList.add('is-added');
            setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('is-added'); }, 1400);
        });
    });
}

function buildFilters() {
    const categories = ['all', ...new Set(allProducts.map(p => p.category))];
    const container = document.getElementById('filter-pills');
    container.innerHTML = categories.map(cat => `
        <button class="filter-pill${cat === 'all' ? ' is-active' : ''}" data-category="${cat}">
            ${cat === 'all' ? 'All Products' : cat}
        </button>
    `).join('');

    container.addEventListener('click', e => {
        const btn = e.target.closest('.filter-pill');
        if (!btn) return;
        activeCategory = btn.dataset.category;
        container.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        render();
    });
}

function buildModal() {
    const modal = document.createElement('div');
    modal.id = 'quick-view-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('hidden', '');
    modal.setAttribute('role', 'presentation');
    modal.innerHTML = `
        <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-product-name">
            <button class="modal-close" aria-label="Close quick view">&times;</button>
            <div class="modal-img-wrap" id="modal-img-wrap"></div>
            <div class="modal-info">
                <p class="product-category" id="modal-category"></p>
                <h2 class="modal-name" id="modal-product-name"></h2>
                <div class="modal-stars" id="modal-stars"></div>
                <p class="pdp-price" id="modal-price"></p>
                <p class="pdp-desc" id="modal-desc"></p>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="modal-add-to-cart">Add to Cart</button>
                    <a href="#" class="btn btn-secondary" id="modal-view-full">View Details</a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

    modal.querySelector('#modal-add-to-cart').addEventListener('click', function () {
        const id = parseInt(this.dataset.id, 10);
        const product = allProducts.find(p => p.id === id);
        if (!product) return;
        Cart.add(product);
        this.textContent = 'Added!';
        this.classList.add('is-added');
        setTimeout(() => { this.textContent = 'Add to Cart'; this.classList.remove('is-added'); }, 1400);
    });
}

function openModal(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    const modal = document.getElementById('quick-view-modal');
    const slug = categorySlug(product.category);

    const imgWrap = modal.querySelector('#modal-img-wrap');
    imgWrap.className = `modal-img-wrap cat-${slug}${product.image ? ' has-photo' : ''}`;
    imgWrap.innerHTML = product.image
        ? `<img src="${product.image}" alt="${product.name}" onerror="this.parentElement.classList.remove('has-photo');this.remove();">`
        : `<span class="product-img-label">${product.category}</span>`;

    modal.querySelector('#modal-category').textContent = product.category;
    modal.querySelector('#modal-product-name').textContent = product.name;
    modal.querySelector('#modal-stars').innerHTML = renderStars(allRatings[product.id]) || '';
    modal.querySelector('#modal-price').textContent = `$${product.price.toFixed(2)}`;
    modal.querySelector('#modal-desc').textContent = product.description;
    const addBtn = modal.querySelector('#modal-add-to-cart');
    addBtn.dataset.id = product.id;
    addBtn.textContent = 'Add to Cart';
    addBtn.classList.remove('is-added');
    modal.querySelector('#modal-view-full').href = `product.html?id=${product.id}`;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
}

function closeModal() {
    document.getElementById('quick-view-modal').hidden = true;
    document.body.style.overflow = '';
}

function getSorted(arr) {
    const copy = [...arr];
    if (sortOrder === 'price-asc') return copy.sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-desc') return copy.sort((a, b) => b.price - a.price);
    if (sortOrder === 'name-az') return copy.sort((a, b) => a.name.localeCompare(b.name));
    return copy;
}

function render() {
    const grid = document.getElementById('product-grid');
    const noResults = document.getElementById('no-results');
    const countEl = document.getElementById('result-count');
    const wishlistIds = typeof Wishlist !== 'undefined' ? Wishlist.get() : [];

    const filtered = allProducts.filter(p => {
        if (showWishlistOnly && !wishlistIds.includes(p.id)) return false;
        const matchCat = activeCategory === 'all' || p.category === activeCategory;
        const matchSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery) ||
            (p.description && p.description.toLowerCase().includes(searchQuery));
        return matchCat && matchSearch;
    });

    const sorted = getSorted(filtered);

    if (sorted.length === 0) {
        grid.innerHTML = '';
        noResults.hidden = false;
        noResults.textContent = showWishlistOnly
            ? 'No saved items yet. Click the ♥ on any product to save it.'
            : 'No products match your search.';
        if (countEl) countEl.hidden = true;
        return;
    }

    noResults.hidden = true;
    if (countEl) {
        countEl.textContent = showWishlistOnly
            ? `${sorted.length} saved item${sorted.length === 1 ? '' : 's'}`
            : `Showing ${sorted.length} of ${allProducts.length} products`;
        countEl.hidden = false;
    }

    grid.innerHTML = sorted.map(productCard).join('');

    grid.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id, 10);
            const product = allProducts.find(p => p.id === id);
            if (!product) return;
            Cart.add(product);
            btn.textContent = 'Added!';
            btn.classList.add('is-added');
            setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('is-added'); }, 1400);
        });
    });

    grid.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', () => openModal(parseInt(btn.dataset.id, 10)));
    });

    grid.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof Wishlist === 'undefined') return;
            const id = parseInt(btn.dataset.id, 10);
            const added = Wishlist.toggle(id);
            btn.classList.toggle('is-active', added);
            btn.setAttribute('aria-pressed', String(added));
            btn.setAttribute('aria-label', added ? 'Remove from saved items' : 'Save item');
            const svgPath = btn.querySelector('path');
            if (svgPath) svgPath.parentElement.setAttribute('fill', added ? 'currentColor' : 'none');
            if (showWishlistOnly && !added) render();
        });
    });
}

function productCard(p) {
    const slug = categorySlug(p.category);
    const badge = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
    const photo = p.image
        ? `<img class="product-photo" src="${p.image}" alt="" loading="lazy"
                onerror="this.parentElement.classList.remove('has-photo');this.remove();">`
        : '';
    const href = `product.html?id=${p.id}`;
    const starsHtml = renderStars(allRatings[p.id]);
    const isWishlisted = typeof Wishlist !== 'undefined' && Wishlist.has(p.id);
    const heartFill = isWishlisted ? 'currentColor' : 'none';

    return `
        <article class="product-card">
            <div class="product-card-media">
                <a class="product-img cat-${slug}${p.image ? ' has-photo' : ''}" href="${href}" aria-label="${p.name}">
                    ${photo}
                    <span class="product-img-label">${p.category}</span>
                    ${badge}
                </a>
                <button class="wishlist-btn${isWishlisted ? ' is-active' : ''}"
                    data-id="${p.id}"
                    aria-label="${isWishlisted ? 'Remove from saved items' : 'Save item'}"
                    aria-pressed="${isWishlisted ? 'true' : 'false'}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="${heartFill}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                <button class="quick-view-btn" data-id="${p.id}" aria-label="Quick view ${p.name}">Quick View</button>
            </div>
            <div class="product-body">
                <p class="product-category">${p.category}</p>
                <h3 class="product-name"><a class="product-name-link" href="${href}">${p.name}</a></h3>
                ${starsHtml ? `<div class="card-stars">${starsHtml}</div>` : ''}
                <p class="product-desc">${p.description}</p>
                <div class="product-footer">
                    <span class="product-price">$${p.price.toFixed(2)}</span>
                    <button class="btn btn-primary add-to-cart" data-id="${p.id}">Add to Cart</button>
                </div>
            </div>
        </article>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    initShop();

    document.getElementById('product-search')?.addEventListener('input', e => {
        searchQuery = e.target.value.toLowerCase().trim();
        render();
    });

    document.getElementById('sort-select')?.addEventListener('change', e => {
        sortOrder = e.target.value;
        render();
    });

    document.getElementById('wishlist-nav-btn')?.addEventListener('click', () => {
        showWishlistOnly = !showWishlistOnly;
        const btn = document.getElementById('wishlist-nav-btn');
        btn.classList.toggle('is-active', showWishlistOnly);
        btn.setAttribute('aria-pressed', String(showWishlistOnly));
        btn.setAttribute('aria-label', showWishlistOnly ? 'Show all products' : 'Show saved items');
        if (showWishlistOnly) {
            activeCategory = 'all';
            document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('is-active'));
            document.querySelector('.filter-pill[data-category="all"]')?.classList.add('is-active');
        }
        render();
    });
});
