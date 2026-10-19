import { useEffect, useRef, useState } from 'react';

/** Counts a figure such as "600+" or "1,200" up from zero when it scrolls into view. */
export default function CountUp({ value, duration = 1800 }: { value: string; duration?: number }) {
    const match = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
    const ref = useRef<HTMLSpanElement>(null);
    const [shown, setShown] = useState(match ? `${match[1]}0${match[3]}` : value);

    useEffect(() => {
        if (!match || !ref.current) return;
        const [, prefix, num, suffix] = match;
        const target = parseFloat(num.replace(/,/g, ''));
        const decimals = num.includes('.') ? num.split('.')[1].length : 0;
        const commas = num.includes(',');
        const format = (n: number) => {
            const fixed = n.toFixed(decimals);
            return commas ? Number(fixed).toLocaleString('en-US', { minimumFractionDigits: decimals }) : fixed;
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setShown(value);
            return;
        }

        let frame = 0;
        const io = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            io.disconnect();
            const start = performance.now();
            const tick = (now: number) => {
                const t = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                setShown(`${prefix}${format(target * eased)}${suffix}`);
                if (t < 1) frame = requestAnimationFrame(tick);
            };
            frame = requestAnimationFrame(tick);
        });
        io.observe(ref.current);
        return () => {
            io.disconnect();
            cancelAnimationFrame(frame);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <span ref={ref} aria-label={value}>
            <span aria-hidden>{shown}</span>
        </span>
    );
}
