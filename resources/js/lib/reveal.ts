import { useEffect } from 'react';

/**
 * Scroll-reveal for the public site.
 *
 *   data-reveal="up|left|right|zoom|fade|curtain"  the element glides in when it reaches the screen
 *   data-reveal-group="up"                         each child is revealed in turn (staggered)
 *   data-reveal-step="120"                         stagger between children, in ms
 *
 * Once an element has finished its entrance the attributes are removed, so its own
 * hover transitions behave normally afterwards. Visitors who ask their device for
 * reduced motion see everything immediately.
 */
export function useScrollReveal(key: unknown) {
    useEffect(() => {
        const root = document.querySelector('main')?.parentElement;
        if (!root) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const finish = (el: HTMLElement) => {
            el.removeAttribute('data-reveal');
            el.removeAttribute('data-revealed');
            el.style.removeProperty('--reveal-delay');
            el.setAttribute('data-reveal-done', '');
        };

        const prepare = () => {
            root.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
                const step = Number(group.dataset.revealStep || 110);
                Array.from(group.children).forEach((child, i) => {
                    const el = child as HTMLElement;
                    if (el.hasAttribute('data-reveal') || el.hasAttribute('data-reveal-done')) return;
                    el.setAttribute('data-reveal', group.dataset.revealGroup || 'up');
                    el.style.setProperty('--reveal-delay', `${Math.min(i, 8) * step}ms`);
                });
            });
            return root.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])');
        };

        if (reduce) {
            prepare().forEach(finish);
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target as HTMLElement;
                    io.unobserve(el);
                    el.setAttribute('data-revealed', '');
                    const delay = parseFloat(el.style.getPropertyValue('--reveal-delay')) || 0;
                    window.setTimeout(() => finish(el), delay + 1400);
                });
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0 },
        );

        const observeAll = () => prepare().forEach((el) => io.observe(el));
        observeAll();
        const mo = new MutationObserver(observeAll);
        mo.observe(root, { childList: true, subtree: true });

        return () => {
            io.disconnect();
            mo.disconnect();
        };
    }, [key]);
}
