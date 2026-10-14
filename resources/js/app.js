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
    const wide = window.matchMedia('(min-width: 1024px)');

    wide.addEventListener('change', (event) => {
        if (event.matches) {
            close();
        }
    });
}

/*
 * Work list: the row in focus decides which screenshot the sticky viewer
 * shows. Hover and keyboard focus both count, so it works without a mouse.
 */
function setUpWorkViewer() {
    document.querySelectorAll('[data-work]').forEach((root) => {
        const items = root.querySelectorAll('[data-work-item]');
        const shots = root.querySelectorAll('[data-work-shot]');
        const name = root.querySelector('[data-work-name]');
        const link = root.querySelector('[data-work-link]');

        const show = (index) => {
            items.forEach((item, i) => item.classList.toggle('is-active', i === index));
            shots.forEach((shot, i) => shot.classList.toggle('is-active', i === index));

            if (name) name.textContent = items[index].dataset.name;
            if (link) link.href = items[index].dataset.href;
        };

        items.forEach((item, index) => {
            item.addEventListener('pointerenter', () => show(index));
            item.addEventListener('focusin', () => show(index));
        });
    });
}

/*
 * Division panes: a soft light follows the pointer. Writes the position to the
 * pane itself, so only that element restyles. The box is measured once on
 * entry, so moving never forces a layout read after a style write.
 */
function setUpPaneLight() {
    if (! window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        return;
    }

    document.querySelectorAll('.pane').forEach((pane) => {
        let box = null;

        pane.addEventListener('pointerenter', () => { box = pane.getBoundingClientRect(); });
        pane.addEventListener('pointermove', (event) => {
            box ??= pane.getBoundingClientRect();
            pane.style.setProperty('--mx', `${event.clientX - box.left}px`);
            pane.style.setProperty('--my', `${event.clientY - box.top}px`);
        });
    });
}

/*
 * Project form. Everything here is an enhancement: without JavaScript the form
 * still saves, empty rows are ignored, and screenshots are added one per slot.
 */
function setUpProjectForm() {
    const form = document.querySelector('[data-project-form]');

    if (! form) {
        return;
    }

    // Repeatable rows: facts, decisions, screenshot slots. Each list carries a
    // <template> whose __INDEX__ placeholder becomes the next free number.
    form.querySelectorAll('[data-repeat]').forEach((list) => {
        const template = list.querySelector('template');
        const rows = list.querySelector('[data-repeat-rows]');
        let next = rows.children.length;

        list.querySelector('[data-repeat-add]')?.addEventListener('click', () => {
            rows.insertAdjacentHTML('beforeend', template.innerHTML.replaceAll('__INDEX__', String(next++)));
            rows.lastElementChild.querySelector('input, textarea')?.focus();
            markDirty();
        });
    });

    form.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-repeat-remove]');

        if (remove) {
            remove.closest('[data-repeat-row]').remove();
            markDirty();
        }
    });

    // A chosen screenshot previews in its own slot before it is uploaded.
    form.addEventListener('change', (event) => {
        const input = event.target;

        if (input.matches('input[type="file"][data-preview]') && input.files?.[0]) {
            const preview = input.closest('[data-repeat-row]')?.querySelector('[data-preview-image]');

            if (preview) {
                URL.revokeObjectURL(preview.src);
                preview.src = URL.createObjectURL(input.files[0]);
                preview.hidden = false;
            }
        }
    });

    // The address follows the name until someone edits it by hand.
    const name = form.querySelector('[data-slug-source]');
    const slug = form.querySelector('[data-slug]');
    let slugTouched = slug?.value !== '';

    slug?.addEventListener('input', () => { slugTouched = true; });
    name?.addEventListener('input', () => {
        if (! slugTouched && slug) {
            slug.value = name.value
                .toLowerCase()
                .normalize('NFKD').replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 80);
        }
    });

    // Unsaved changes are named, and leaving with them asks first.
    const status = document.querySelector('[data-save-status]');
    let dirty = false;
    let submitting = false;

    function markDirty() {
        dirty = true;

        if (status) {
            status.dataset.dirty = 'true';
            status.querySelector('[data-save-text]').textContent = 'Unsaved changes.';
        }
    }

    form.addEventListener('input', markDirty);
    form.addEventListener('submit', () => { submitting = true; });

    window.addEventListener('beforeunload', (event) => {
        if (dirty && ! submitting) {
            event.preventDefault();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setUpReveals();
    setUpNavigation();
    setUpWorkViewer();
    setUpPaneLight();
    setUpProjectForm();
});
