const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");
const siteHeader = document.querySelector(".site-header");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        navLinks.classList.toggle("is-open", !isOpen);
        document.body.classList.toggle("menu-open", !isOpen);
    });

    navLinks.addEventListener("click", (event) => {
        if (event.target instanceof HTMLAnchorElement) {
            menuToggle.setAttribute("aria-expanded", "false");
            navLinks.classList.remove("is-open");
            document.body.classList.remove("menu-open");
        }
    });
}

if (siteHeader) {
    const syncHeaderShadow = () => {
        siteHeader.classList.toggle("is-scrolled", window.scrollY > 4);
    };

    syncHeaderShadow();
    window.addEventListener("scroll", syncHeaderShadow, { passive: true });
}
