const AUTH_KEY = 'sd_session';
const USERS_KEY = 'sd_users';

// Store staff — fixed accounts. Customer accounts are created via register()
// and stored (hashed) in localStorage under USERS_KEY.
// Passwords are stored as SHA-256 hashes (same algorithm used for customers).
const STORE_USERS = [
    { email: 'owner@superdiscount.com', hash: 'b7540d00d8fe9a100cd1db7ba9dd1ee96d4b00bfcf5492f7fa27b2edac1058b1', name: 'Store Owner' },
    { email: 'admin@superdiscount.com', hash: 'ed9ddd682e60887ec196a79e28ce47a4656110217b047984580dc61d700dbeb8', name: 'Store Admin' }
];

const Auth = (() => {
    // NOTE: This is a client-side demo. localStorage/sessionStorage are visible to
    // anyone with the device, so this is not real account security — it persists a
    // cart/session for convenience, nothing sensitive should depend on it.
    async function hashPassword(password) {
        const data = new TextEncoder().encode(password);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function getCustomers() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
        catch { return []; }
    }

    function saveCustomers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function normalizeEmail(email) {
        return email.toLowerCase().trim();
    }

    function startSession(user) {
        sessionStorage.setItem(AUTH_KEY, btoa(JSON.stringify({
            email: user.email || null,
            name: user.name || null,
            role: user.role,
            ts: Date.now(),
        })));
    }

    function isLoggedIn() {
        return !!sessionStorage.getItem(AUTH_KEY);
    }

    function getUser() {
        try {
            const raw = sessionStorage.getItem(AUTH_KEY);
            return raw ? JSON.parse(atob(raw)) : null;
        } catch {
            return null;
        }
    }

    function isGuest() {
        const user = getUser();
        return !!user && user.role === 'guest';
    }

    async function register(name, email, password) {
        const cleanName = (name || '').trim();
        const cleanEmail = normalizeEmail(email || '');

        if (!cleanName) return { ok: false, error: 'Please enter your name.' };
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
            return { ok: false, error: 'Please enter a valid email address.' };
        }
        if (!password || password.length < 6) {
            return { ok: false, error: 'Password must be at least 6 characters.' };
        }

        const staffTaken = STORE_USERS.some(u => normalizeEmail(u.email) === cleanEmail);
        const customers = getCustomers();
        const customerTaken = customers.some(u => u.email === cleanEmail);
        if (staffTaken || customerTaken) {
            return { ok: false, error: 'An account with this email already exists.' };
        }

        customers.push({
            name: cleanName,
            email: cleanEmail,
            hash: await hashPassword(password),
            role: 'customer',
        });
        saveCustomers(customers);
        startSession({ email: cleanEmail, name: cleanName, role: 'customer' });
        return { ok: true };
    }

    async function login(email, password) {
        const cleanEmail = normalizeEmail(email || '');

        const hash = await hashPassword(password);
        const staff = STORE_USERS.find(
            u => normalizeEmail(u.email) === cleanEmail && u.hash === hash
        );
        if (staff) {
            startSession({ email: staff.email, name: staff.name, role: 'staff' });
            return true;
        }

        const customer = getCustomers().find(u => u.email === cleanEmail && u.hash === hash);
        if (customer) {
            startSession({ email: customer.email, name: customer.name, role: 'customer' });
            return true;
        }

        return false;
    }

    function loginAsGuest() {
        startSession({ name: 'Guest', role: 'guest' });
    }

    function logout() {
        sessionStorage.removeItem(AUTH_KEY);
        window.location.href = 'login.html';
    }

    function requireAuth() {
        if (!isLoggedIn()) {
            const next = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.replace('login.html?next=' + next);
        }
    }

    function syncNav() {
        const user = getUser();
        const signOutEl = document.getElementById('nav-signout');
        const userEmailEl = document.getElementById('nav-user-email');
        if (signOutEl) signOutEl.hidden = !user;
        if (userEmailEl && user) userEmailEl.textContent = user.name || user.email || 'Guest';
    }

    document.addEventListener('DOMContentLoaded', syncNav);

    return { isLoggedIn, getUser, isGuest, register, login, loginAsGuest, logout, requireAuth };
})();
