class SiteNavigation {
    constructor() {
        this.header = document.querySelector('.site-header');
        this.nav = document.getElementById('siteNav');
        this.toggle = document.querySelector('.menu-toggle');
        this.links = Array.from(document.querySelectorAll('.nav-link'));
        this.sections = Array.from(document.querySelectorAll('main section[id]'));
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.init();
    }

    init() {
        this.bindToggle();
        this.bindLinks();
        this.bindOutsideClick();
        this.updateActiveLink();

        window.addEventListener('scroll', () => this.updateActiveLink(), { passive: true });
        window.addEventListener('resize', () => this.handleResize());
    }

    bindToggle() {
        if (!this.toggle || !this.nav) {
            return;
        }

        this.toggle.addEventListener('click', () => {
            const isOpen = this.toggle.getAttribute('aria-expanded') === 'true';
            this.toggle.setAttribute('aria-expanded', String(!isOpen));
            this.nav.classList.toggle('is-open', !isOpen);
        });
    }

    bindLinks() {
        this.links.forEach((link) => {
            link.addEventListener('click', (event) => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) {
                    return;
                }

                const target = document.querySelector(href);
                if (!target) {
                    return;
                }

                event.preventDefault();
                target.scrollIntoView({
                    behavior: this.prefersReducedMotion ? 'auto' : 'smooth',
                    block: 'start'
                });

                this.closeMenu();
            });
        });
    }

    bindOutsideClick() {
        document.addEventListener('click', (event) => {
            if (!this.nav || !this.toggle) {
                return;
            }

            const clickedInsideNav = this.nav.contains(event.target);
            const clickedToggle = this.toggle.contains(event.target);

            if (!clickedInsideNav && !clickedToggle) {
                this.closeMenu();
            }
        });
    }

    handleResize() {
        if (window.innerWidth > 860) {
            this.closeMenu();
        }
    }

    closeMenu() {
        if (!this.nav || !this.toggle) {
            return;
        }

        this.nav.classList.remove('is-open');
        this.toggle.setAttribute('aria-expanded', 'false');
    }

    updateActiveLink() {
        const offset = this.header ? this.header.offsetHeight + 24 : 110;
        const scrollPosition = window.scrollY + offset;
        let currentId = this.sections[0]?.id || '';

        this.sections.forEach((section) => {
            if (scrollPosition >= section.offsetTop) {
                currentId = section.id;
            }
        });

        this.links.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${currentId}`;
            link.classList.toggle('is-active', isActive);

            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }
}

class RevealController {
    constructor() {
        this.elements = Array.from(document.querySelectorAll('.reveal'));
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.init();
    }

    init() {
        if (this.prefersReducedMotion || !('IntersectionObserver' in window)) {
            this.elements.forEach((element) => element.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        this.elements.forEach((element) => observer.observe(element));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SiteNavigation();
    new RevealController();

    const year = document.getElementById('currentYear');
    if (year) {
        year.textContent = String(new Date().getFullYear());
    }
});

const utils = {
    debounce: (fn, wait) => {
        let timeoutId;

        return (...args) => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => fn(...args), wait);
        };
    },

    throttle: (fn, wait) => {
        let lastRun = 0;

        return (...args) => {
            const now = Date.now();
            if (now - lastRun < wait) {
                return;
            }

            lastRun = now;
            fn(...args);
        };
    }
};

window.portfolioUtils = utils;
