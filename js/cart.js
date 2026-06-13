const CART_KEY = 'sd_cart';

const Cart = (() => {
    function get() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
        catch { return []; }
    }

    function save(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateBadge();
    }

    function add(product, qty = 1) {
        const amount = Math.max(1, parseInt(qty, 10) || 1);
        const cart = get();
        const existing = cart.find(i => i.id === product.id);
        if (existing) {
            existing.qty += amount;
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, category: product.category, qty: amount });
        }
        save(cart);
    }

    function remove(id) {
        save(get().filter(i => i.id !== id));
    }

    function setQty(id, qty) {
        const cart = get();
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.qty = Math.max(1, parseInt(qty, 10) || 1);
        save(cart);
    }

    function count() {
        return get().reduce((n, i) => n + i.qty, 0);
    }

    function total() {
        return get().reduce((n, i) => n + i.price * i.qty, 0);
    }

    function clear() {
        localStorage.removeItem(CART_KEY);
        updateBadge();
    }

    function updateBadge() {
        const el = document.getElementById('cart-count');
        if (!el) return;
        const n = count();
        el.textContent = n;
        el.hidden = n === 0;
    }

    document.addEventListener('DOMContentLoaded', updateBadge);

    return { get, add, remove, setQty, count, total, clear };
})();
