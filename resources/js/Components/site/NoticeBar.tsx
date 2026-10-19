import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { useSite } from '@/lib/site';
import { cn } from '@/lib/utils';
import type { Notice } from '@/types/cms';

const TONES: Record<Notice['tone'], string> = {
    Information: 'bg-navy-800 text-white',
    Important: 'bg-crest-200 text-navy-950',
    Urgent: 'bg-[#8a1c1c] text-white',
};
const LABEL_TONE: Record<Notice['tone'], string> = {
    Information: 'bg-crest-300 text-navy-950',
    Important: 'bg-navy-900 text-white',
    Urgent: 'bg-white text-[#8a1c1c]',
};

const key = (n: Notice) => `notice-dismissed-${n.id}-${n.updated_at}`;
const dismissed = (n: Notice) => {
    try {
        return localStorage.getItem(key(n)) === '1';
    } catch {
        return false;
    }
};

/** Announcements across the top of every page. Several notices take turns; each can be dismissed. */
export default function NoticeBar({ notices }: { notices: Notice[] }) {
    const site = useSite();
    const [hidden, setHidden] = useState<number[]>([]);
    const [index, setIndex] = useState(0);
    const [ready, setReady] = useState(false);

    // Dismissals live in this browser only; read them after mount to avoid a flash.
    useEffect(() => {
        setHidden(notices.filter(dismissed).map((n) => n.id));
        setReady(true);
    }, [notices]);

    const visible = notices.filter((n) => !hidden.includes(n.id));

    useEffect(() => {
        if (visible.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const t = setInterval(() => setIndex((i) => (i + 1) % visible.length), 7000);
        return () => clearInterval(t);
    }, [visible.length]);

    if (!ready || visible.length === 0) return null;
    const notice = visible[index % visible.length];
    const toneLabel = site[`notice_${notice.tone.toLowerCase()}`] ?? notice.tone;

    const dismiss = () => {
        try {
            localStorage.setItem(key(notice), '1');
        } catch {
            /* private browsing: hide for this visit only */
        }
        setHidden((h) => [...h, notice.id]);
        setIndex(0);
    };

    const link = notice.link_url && notice.link_label
        ? /^https?:/i.test(notice.link_url)
            ? <a href={notice.link_url} className="font-semibold underline underline-offset-4">{notice.link_label}</a>
            : <Link href={notice.link_url} className="font-semibold underline underline-offset-4">{notice.link_label}</Link>
        : null;

    return (
        <div role="region" aria-label={toneLabel} className={cn('relative text-[14px]', TONES[notice.tone])}>
            <div className="container-site flex items-center gap-3 py-2.5 pr-12">
                <span className={cn('hidden shrink-0 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.18em] sm:inline', LABEL_TONE[notice.tone])}>{toneLabel}</span>
                <p key={notice.id} className="rise min-w-0 flex-1 leading-snug" aria-live="polite">
                    {notice.message} {link && <span className="ml-1 whitespace-nowrap">{link} →</span>}
                </p>
                {visible.length > 1 && <span className="hidden shrink-0 font-serif text-sm opacity-70 sm:inline">{(index % visible.length) + 1} / {visible.length}</span>}
            </div>
            <button type="button" onClick={dismiss} aria-label={site.notice_dismiss ?? 'Dismiss'} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 opacity-80 hover:opacity-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
        </div>
    );
}
