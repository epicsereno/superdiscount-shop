const Wishlist = (() => {
    const KEY = 'sd_wishlist';

    function get() {
        try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
    }

    function save(ids) {
        localStorage.setItem(KEY, JSON.stringify(ids));
        _updateBadge();
    }

    function toggle(id) {
        const ids = get();
        const idx = ids.indexOf(id);
        if (idx >= 0) ids.splice(idx, 1);
        else ids.push(id);
        save(ids);
        return idx < 0;
    }

    function has(id) { return get().includes(id); }
    function count() { return get().length; }

    function _updateBadge() {
        const badge = document.getElementById('wishlist-count');
        if (!badge) return;
        const n = count();
        badge.textContent = n;
        badge.hidden = n === 0;
    }

    document.addEventListener('DOMContentLoaded', _updateBadge);

    return { get, toggle, has, count, updateBadge: _updateBadge };
})();
