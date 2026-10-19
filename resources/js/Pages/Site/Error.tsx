import { Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import Logo from '@/Components/site/Logo';
import { Ornament } from '@/Components/site/Parts';
import { useSite } from '@/lib/site';

/** Styled error page (404 and friends). Wording: Site settings → Error pages. */
export default function Error({ status }: { status: number }) {
    const site = useSite();
    const key = [403, 404, 500, 503].includes(status) ? status : 500;

    return (
        <SiteLayout title={site[`error_${key}_title`] ?? 'Error'}>
            <section className="ground-navy relative overflow-hidden text-white">
                <div aria-hidden className="pointer-events-none absolute inset-3 border border-white/10 sm:inset-5" />
                <div className="container-site relative py-24 text-center sm:py-32">
                    <Logo className="mx-auto h-20" />
                    <p className="mt-8 font-serif text-[7rem] font-semibold leading-none text-crest-300 sm:text-[9rem]">{status}</p>
                    <h1 className="mt-2 text-4xl !text-white sm:text-5xl">{site[`error_${key}_title`]}</h1>
                    <Ornament className="mx-auto mt-6 text-crest-300" width="w-32" />
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-100">{site[`error_${key}_text`]}</p>
                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <Link href={route('home')} className="btn-ivory">{site.error_home}</Link>
                        <Link href={route('contact')} className="btn-outline-light">{site.error_contact}</Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
