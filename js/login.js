// Redirect away if already signed in.
if (Auth.isLoggedIn()) {
    const params = new URLSearchParams(window.location.search);
    window.location.replace(params.get('next') || 'index.html');
}

function nextDestination() {
    const params = new URLSearchParams(window.location.search);
    return params.get('next') || 'index.html';
}

// ── Tabs: Sign In / Create Account ──────────────────────────────────
const tabs = document.querySelectorAll('.login-tab');
const panels = {
    signin: document.getElementById('signin-form'),
    register: document.getElementById('register-form'),
};

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.panel;
        tabs.forEach(t => {
            const active = t === tab;
            t.classList.toggle('is-active', active);
            t.setAttribute('aria-selected', String(active));
        });
        Object.entries(panels).forEach(([key, panel]) => {
            panel.hidden = key !== target;
        });
    });
});

// ── Sign in ─────────────────────────────────────────────────────────
const signinForm = document.getElementById('signin-form');
const signinError = document.getElementById('signin-error');

signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signinError.hidden = true;
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    if (await Auth.login(email, password)) {
        window.location.replace(nextDestination());
    } else {
        signinError.hidden = false;
        document.getElementById('signin-password').value = '';
        document.getElementById('signin-password').focus();
    }
});

// ── Create account ──────────────────────────────────────────────────
const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.hidden = true;
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (password !== confirm) {
        registerError.textContent = 'Passwords do not match.';
        registerError.hidden = false;
        return;
    }

    const result = await Auth.register(name, email, password);
    if (result.ok) {
        window.location.replace(nextDestination());
    } else {
        registerError.textContent = result.error;
        registerError.hidden = false;
    }
});

// ── Browse as guest ─────────────────────────────────────────────────
document.getElementById('guest-btn').addEventListener('click', () => {
    Auth.loginAsGuest();
    window.location.replace(nextDestination());
});
