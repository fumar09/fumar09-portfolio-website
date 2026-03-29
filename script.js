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

class ContactBuilder {
    constructor() {
        this.form = document.getElementById('contactBuilder');
        this.nameInput = document.getElementById('contactName');
        this.projectType = document.getElementById('contactProjectType');
        this.timeline = document.getElementById('contactTimeline');
        this.goal = document.getElementById('contactGoal');
        this.preview = document.getElementById('contactPreviewText');
        this.copyButton = document.getElementById('copyProjectBrief');
        this.chips = Array.from(document.querySelectorAll('.contact-chip'));
        this.copyTimeout = null;

        this.init();
    }

    init() {
        if (!this.form || !this.preview || !this.copyButton) {
            return;
        }

        [this.nameInput, this.projectType, this.timeline, this.goal].forEach((field) => {
            if (!field) {
                return;
            }

            const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
            field.addEventListener(eventName, () => {
                if (field === this.goal) {
                    this.clearChipSelection();
                }
                this.updatePreview();
            });
        });

        this.chips.forEach((chip) => {
            chip.addEventListener('click', () => {
                const value = chip.getAttribute('data-chip-value') || '';
                if (this.goal) {
                    this.goal.value = value;
                }

                this.chips.forEach((item) => item.classList.toggle('is-selected', item === chip));
                this.updatePreview();
            });
        });

        this.copyButton.addEventListener('click', () => this.copyPreview());
        this.updatePreview();
    }

    clearChipSelection() {
        this.chips.forEach((chip) => chip.classList.remove('is-selected'));
    }

    buildMessage() {
        const name = this.nameInput?.value.trim();
        const type = this.projectType?.value || 'Website cleanup';
        const timeline = this.timeline?.value || 'Flexible';
        const goal = this.goal?.value.trim();
        const opening = name ? `Hello Connie, I'm ${name}.` : 'Hello Connie,';
        const normalizedGoal = goal ? goal.replace(/\s+/g, ' ').replace(/[.!?]+$/, '') : 'make the interface cleaner, more organized, and easier to use';

        return `${opening} I need help with a ${type} project. My timeline is ${timeline.toLowerCase()}. The main thing I want to improve is ${normalizedGoal}.`;
    }

    updatePreview() {
        if (!this.preview) {
            return;
        }

        this.preview.textContent = this.buildMessage();
    }

    async copyPreview() {
        const message = this.buildMessage();

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(message);
            } else {
                const helper = document.createElement('textarea');
                helper.value = message;
                document.body.appendChild(helper);
                helper.select();
                document.execCommand('copy');
                helper.remove();
            }

            this.copyButton.textContent = 'Copied';
            window.clearTimeout(this.copyTimeout);
            this.copyTimeout = window.setTimeout(() => {
                this.copyButton.textContent = 'Copy and Send Brief';
            }, 1800);
        } catch (error) {
            this.copyButton.textContent = 'Copy failed';
            window.clearTimeout(this.copyTimeout);
            this.copyTimeout = window.setTimeout(() => {
                this.copyButton.textContent = 'Copy and Send Brief';
            }, 1800);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SiteNavigation();
    new RevealController();
    new ContactBuilder();

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
