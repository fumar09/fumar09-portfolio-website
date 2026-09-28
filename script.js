const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function prefersReducedMotion() {
    return prefersReducedMotionQuery.matches;
}

function rafThrottle(callback) {
    let scheduled = false;
    let latestArgs = [];

    return (...args) => {
        latestArgs = args;

        if (scheduled) {
            return;
        }

        scheduled = true;
        window.requestAnimationFrame(() => {
            scheduled = false;
            callback(...latestArgs);
        });
    };
}

function easeOutQuint(progress) {
    return 1 - Math.pow(1 - progress, 5);
}

function setupThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (!toggle) {
        return;
    }

    const updateThemeControl = () => {
        const isLight = document.documentElement.dataset.theme === 'light';
        const label = isLight ? 'Switch to dark theme' : 'Switch to light theme';

        toggle.setAttribute('aria-pressed', String(isLight));
        toggle.setAttribute('aria-label', label);
        toggle.setAttribute('title', label);

        if (themeColor) {
            themeColor.content = isLight ? '#f4f3ef' : '#141512';
        }
    };

    updateThemeControl();

    toggle.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
        document.documentElement.dataset.theme = nextTheme;

        try {
            localStorage.setItem('portfolio-theme', nextTheme);
        } catch (error) {
            // Keep the selected theme for this page view if storage is unavailable.
        }

        updateThemeControl();
    });
}

function smoothScrollToTarget(target, offset = 0) {
    const start = window.scrollY;
    const destination = Math.max(0, start + target.getBoundingClientRect().top - offset);

    if (prefersReducedMotion()) {
        window.scrollTo({ top: destination, behavior: 'auto' });
        return Promise.resolve();
    }

    const distance = destination - start;
    if (Math.abs(distance) < 2) {
        window.scrollTo({ top: destination, behavior: 'auto' });
        return Promise.resolve();
    }

    const duration = Math.min(1100, Math.max(560, Math.abs(distance) * 0.55));

    return new Promise((resolve) => {
        let startTime = null;

        const step = (timestamp) => {
            if (startTime === null) {
                startTime = timestamp;
            }

            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuint(progress);

            window.scrollTo({ top: start + distance * eased, behavior: 'auto' });

            if (progress < 1) {
                window.requestAnimationFrame(step);
                return;
            }

            resolve();
        };

        window.requestAnimationFrame(step);
    });
}

function setupNavigation() {
    const header = document.querySelector('.site-header');
    const nav = document.getElementById('siteNav');
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    const scrollLinks = Array.from(document.querySelectorAll('a[href^="#"]:not([href="#"])')).filter((link) => {
        const selector = link.getAttribute('href');
        return selector && document.querySelector(selector);
    });
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const closeMenu = () => {
        if (!nav || !toggle) {
            return;
        }

        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    const setHeaderState = () => {
        if (!header) {
            return;
        }

        header.classList.toggle('is-scrolled', window.scrollY > 12);
    };

    const activateLinkById = (id) => {
        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('is-active', isActive);

            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const updateActiveLink = () => {
        setHeaderState();

        const activationLine = Math.max((header?.offsetHeight || 0) + 28, window.innerHeight * 0.32);
        let currentId = sections[0]?.id || '';

        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= activationLine) {
                currentId = section.id;
            }
        });

        activateLinkById(currentId);
    };

    const handleAnchorClick = async (event) => {
        const link = event.currentTarget;
        if (!(link instanceof HTMLAnchorElement)) {
            return;
        }

        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        const targetSelector = link.getAttribute('href');
        if (!targetSelector) {
            return;
        }

        const target = document.querySelector(targetSelector);
        if (!target) {
            return;
        }

        event.preventDefault();
        closeMenu();

        const offset = (header?.offsetHeight || 0) + 18;
        await smoothScrollToTarget(target, offset);

        try {
            if (window.history?.replaceState) {
                window.history.replaceState(null, '', targetSelector);
            } else {
                window.location.hash = targetSelector;
            }
        } catch (error) {
            window.location.hash = targetSelector;
        }

        if (target.id) {
            activateLinkById(target.id);
        }
    };

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!isOpen));
            nav.classList.toggle('is-open', !isOpen);
        });
    }

    scrollLinks.forEach((link) => {
        link.addEventListener('click', handleAnchorClick);
    });

    document.addEventListener('click', (event) => {
        if (!nav || !toggle) {
            return;
        }

        if (nav.contains(event.target) || toggle.contains(event.target)) {
            return;
        }

        closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    const syncViewportState = rafThrottle(() => {
        updateActiveLink();
    });

    updateActiveLink();

    window.addEventListener('load', () => {
        const hashId = window.location.hash.replace('#', '');
        if (hashId && navLinks.some((link) => link.getAttribute('href') === `#${hashId}`)) {
            activateLinkById(hashId);
        } else {
            updateActiveLink();
        }
    });

    window.addEventListener('hashchange', () => {
        const hashId = window.location.hash.replace('#', '');
        if (hashId && navLinks.some((link) => link.getAttribute('href') === `#${hashId}`)) {
            activateLinkById(hashId);
            return;
        }

        updateActiveLink();
    });

    window.addEventListener('scroll', syncViewportState, { passive: true });
    window.addEventListener('resize', rafThrottle(() => {
        if (window.innerWidth > 860) {
            closeMenu();
        }

        updateActiveLink();
    }));
}

function setupReveal() {
    const elements = Array.from(document.querySelectorAll('.reveal'));

    elements.forEach((element, index) => {
        element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
    });

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
        elements.forEach((element) => element.classList.add('is-visible'));
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
        threshold: 0.16,
        rootMargin: '0px 0px -12% 0px'
    });

    elements.forEach((element) => observer.observe(element));
}

function setupFloatingCta() {
    const floatingCta = document.querySelector('.floating-cta');
    const contactSection = document.getElementById('contact');
    let contactVisible = false;

    if (!floatingCta) {
        return;
    }

    const toggleVisibility = () => {
        const shouldShow = window.innerWidth > 620
            && window.scrollY > Math.max(220, window.innerHeight * 0.48)
            && !contactVisible;

        floatingCta.classList.toggle('is-visible', shouldShow);
    };

    if (contactSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.target !== contactSection) {
                    return;
                }

                contactVisible = entry.isIntersecting;
                toggleVisibility();
            });
        }, {
            threshold: 0.22
        });

        observer.observe(contactSection);
    }

    toggleVisibility();
    window.addEventListener('scroll', rafThrottle(toggleVisibility), { passive: true });
    window.addEventListener('resize', rafThrottle(toggleVisibility));
}

document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
    setupNavigation();
    setupReveal();
    setupFloatingCta();

    const year = document.getElementById('currentYear');
    if (year) {
        year.textContent = String(new Date().getFullYear());
    }
});
