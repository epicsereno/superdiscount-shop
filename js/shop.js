let allProducts = [];
let activeCategory = 'all';
let searchQuery = '';

async function initShop() {
    try {
        const resp = await fetch('data/products.json');
        const data = await resp.json();
        allProducts = data.products;
        buildFilters();
        render();
    } catch {
        document.getElementById('product-grid').innerHTML =
            '<p style="color:var(--color-muted);grid-column:1/-1">Could not load products. Please try again.</p>';
    }
}

function categorySlug(cat) {
    return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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

function render() {
    const grid = document.getElementById('product-grid');
    const noResults = document.getElementById('no-results');

    const filtered = allProducts.filter(p => {
        const matchCat = activeCategory === 'all' || p.category === activeCategory;
        const matchSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery) ||
            (p.description && p.description.toLowerCase().includes(searchQuery));
        return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        noResults.hidden = false;
        return;
    }

    noResults.hidden = true;
    grid.innerHTML = filtered.map(productCard).join('');

    grid.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id, 10);
            const product = allProducts.find(p => p.id === id);
            if (!product) return;
            Cart.add(product);
            btn.textContent = 'Added!';
            btn.classList.add('is-added');
            setTimeout(() => {
                btn.textContent = 'Add to Cart';
                btn.classList.remove('is-added');
            }, 1400);
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
    return `
        <article class="product-card">
            <a class="product-img cat-${slug}${p.image ? ' has-photo' : ''}" href="${href}" aria-label="${p.name}">
                ${photo}
                <span class="product-img-label">${p.category}</span>
                ${badge}
            </a>
            <div class="product-body">
                <p class="product-category">${p.category}</p>
                <h3 class="product-name"><a class="product-name-link" href="${href}">${p.name}</a></h3>
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

    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            searchQuery = e.target.value.toLowerCase().trim();
            render();
        });
    }
});
