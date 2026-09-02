/**
 * Everything the site needs, in one file. No framework, no dependencies.
 */

/*
 * Reveal on scroll — fade and a 12px rise, once per element.
 *
 * The `js` class is what allows the CSS to hide these elements in the first
 * place, so a visitor without JavaScript sees the whole page immediately.
 */
function setUpReveals() {
    const targets = document.querySelectorAll('.reveal');

    if (targets.length === 0) {
        return;
    }

    // Without IntersectionObserver, show everything rather than nothing.
    if (! ('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-revealed'));

        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (! entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-revealed');

            // Once only. It should never replay on the way back up.
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.05,
    });

    targets.forEach((el) => observer.observe(el));
}

/*
 * Mobile navigation. The menu is a plain disclosure: one button, one panel.
 */
function setUpNavigation() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const panel = document.querySelector('[data-nav-panel]');

    if (! toggle || ! panel) {
        return;
    }

    const close = () => {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    };

    const open = () => {
        panel.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', () => {
        panel.hidden ? open() : close();
    });

    // Escape closes it, and focus goes back to the control that opened it.
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && ! panel.hidden) {
            close();
            toggle.focus();
        }
    });

    // Following a link inside the panel should not leave it hanging open.
    panel.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => close());
    });

    // Returning to a desktop width resets the panel to its closed state.
    const wide = window.matchMedia('(min-width: 768px)');

    wide.addEventListener('change', (event) => {
        if (event.matches) {
            close();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setUpReveals();
    setUpNavigation();
});
