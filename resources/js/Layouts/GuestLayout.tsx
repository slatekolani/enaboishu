import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import Logo from '@/Components/site/Logo';
import { useSite } from '@/lib/site';

export default function Guest({ children }: PropsWithChildren) {
    const site = useSite();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-10">
            <Link href="/" className="flex flex-col items-center gap-3 text-center">
                <Logo className="h-16 w-16" />
                <span className="font-serif text-2xl font-bold text-navy-900">{site.site_name}</span>
                <span className="text-xs uppercase tracking-[0.16em] text-slate-500">{site.login_title}</span>
            </Link>

            <div className="mt-8 w-full overflow-hidden border border-rule border-t-4 border-t-navy-800 bg-white px-6 py-6 shadow-sm sm:max-w-md">
                {children}
            </div>

            <Link href="/" className="mt-6 text-sm text-slate-500 hover:text-navy-800">← {site.login_back}</Link>
        </div>
    );
}
