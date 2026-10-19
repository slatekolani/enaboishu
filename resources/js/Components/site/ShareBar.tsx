import { useEffect, useState } from 'react';
import { useSite } from '@/lib/site';
import { toast } from '@/lib/alerts';

/** Share a story: WhatsApp first (how most school news travels), then Facebook and copy-link. */
export default function ShareBar({ title }: { title: string }) {
    const site = useSite();
    const [url, setUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [native, setNative] = useState(false);

    useEffect(() => {
        setUrl(window.location.href);
        setNative(typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches);
    }, []);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast('success', site.share_copied ?? 'Link copied');
            setTimeout(() => setCopied(false), 2500);
        } catch {
            window.prompt(site.share_copy ?? 'Copy link', url);
        }
    };

    const btn = 'inline-flex items-center gap-2 border border-rule bg-white px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-navy-900 transition-colors hover:border-navy-900';
    const text = encodeURIComponent(`${title} ${url}`);

    return (
        <div className="mt-12 flex flex-wrap items-center gap-3 border-y border-rule py-5">
            {site.share_label && <span className="mr-2 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-slate-500">{site.share_label}</span>}
            <a href={`https://wa.me/?text=${text}`} target="_blank" rel="noreferrer" className={`${btn} !border-[#1f7a4d] !bg-[#1f7a4d] !text-white hover:!bg-[#17603c]`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.2Z" />
                </svg>
                WhatsApp
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className={btn}>Facebook</a>
            <button type="button" onClick={copy} className={btn} aria-live="polite">{copied ? site.share_copied : site.share_copy}</button>
            {native && (
                <button type="button" className={btn} onClick={() => navigator.share({ title, url }).catch(() => {})}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 12v8h16v-8M12 3v13M7 8l5-5 5 5" /></svg>
                </button>
            )}
        </div>
    );
}
