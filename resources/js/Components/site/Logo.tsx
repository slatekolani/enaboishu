import { usePage } from '@inertiajs/react';
import { useMedia, useSite } from '@/lib/site';
import type { SharedProps } from '@/types/cms';

/** The school crest: an uploaded replacement if there is one, otherwise the bundled crest. */
export default function Logo({ className = 'h-14' }: { className?: string }) {
    const site = useSite();
    const media = useMedia();
    const { crest } = usePage<SharedProps & Record<string, unknown>>().props;

    return <img src={media(site.logo) ?? crest} alt={`${site.site_name} crest`} className={`${className} w-auto object-contain`} />;
}
