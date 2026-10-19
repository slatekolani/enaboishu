import { useSite } from '@/lib/site';
import { cn } from '@/lib/utils';

const ICONS: Record<string, JSX.Element> = {
    Instagram: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1.3" />
        </>
    ),
    WhatsApp: <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.2Z" />,
};

/** The school's social accounts that have a link in Site settings, in a fixed order. */
export function useSocialLinks() {
    const site = useSite();
    return [
        { name: 'Instagram', href: site.instagram },
        { name: 'WhatsApp', href: site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}` : null },
    ].filter((s): s is { name: string; href: string } => !!s.href);
}

export default function SocialIcons({ size = 'sm', className = '' }: { size?: 'sm' | 'md'; className?: string }) {
    const links = useSocialLinks();
    if (links.length === 0) return null;
    const box = size === 'sm' ? 'h-7 w-7' : 'h-10 w-10 border border-white/20 hover:border-white';
    const icon = size === 'sm' ? 15 : 18;

    return (
        <ul className={cn('flex items-center gap-1', className)}>
            {links.map((s) => (
                <li key={s.name}>
                    <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.name}
                        title={s.name}
                        className={cn('flex items-center justify-center text-navy-200 transition-colors hover:text-white', box)}
                    >
                        <svg width={icon} height={icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>{ICONS[s.name]}</svg>
                    </a>
                </li>
            ))}
        </ul>
    );
}
