function renderCart() {
    const cart = Cart.get();
    const container = document.getElementById('cart-items');
    const emptyState = document.getElementById('cart-empty');
    const summary = document.getElementById('cart-summary');

    if (cart.length === 0) {
        container.innerHTML = '';
        emptyState.hidden = false;
        summary.hidden = true;
        return;
    }

    emptyState.hidden = true;
    summary.hidden = false;

    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <p class="cart-item-name">${item.name}</p>
                <p class="cart-item-cat">${item.category}</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                <span class="cart-item-qty">${item.qty}</span>
                <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
            <button class="cart-remove" data-id="${item.id}" aria-label="Remove ${item.name}">✕</button>
        </div>
    `).join('');

    document.getElementById('cart-subtotal').textContent = `$${Cart.total().toFixed(2)}`;
    const n = Cart.count();
    document.getElementById('cart-count-items').textContent = `${n} item${n !== 1 ? 's' : ''}`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    document.getElementById('cart-items').addEventListener('click', e => {
        const id = parseInt(e.target.dataset.id, 10);
        if (isNaN(id)) return;

        if (e.target.classList.contains('cart-remove')) {
            Cart.remove(id);
        } else if (e.target.classList.contains('qty-btn')) {
            const item = Cart.get().find(i => i.id === id);
            if (!item) return;
            const newQty = e.target.dataset.action === 'inc' ? item.qty + 1 : item.qty - 1;
            if (newQty < 1) { Cart.remove(id); } else { Cart.setQty(id, newQty); }
        }
        renderCart();
    });

    const clearBtn = document.getElementById('clear-cart');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            Cart.clear();
            renderCart();
        });
    }
});
