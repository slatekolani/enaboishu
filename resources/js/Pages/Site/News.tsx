import { Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Empty, PageBanner, Photo, fmtDate } from '@/Components/site/Parts';
import { useMedia, useSite } from '@/lib/site';
import type { Paginated, Post } from '@/types/cms';

export default function News({ posts }: { posts: Paginated<Post> }) {
    const site = useSite();
    const media = useMedia();

    return (
        <SiteLayout title={site.news_page_title ?? ''}>
            <PageBanner title={site.news_page_title ?? ''} crumb={site.nav_news ?? ''} intro={site.news_intro} page="news" />
            <div className="py-16 sm:py-20">
                <div className="container-site">
                    {posts.data.length === 0 && <Empty>{site.news_empty}</Empty>}
                    <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group data-reveal-step="120">
                        {posts.data.map((p) => (
                            <article key={p.id}>
                                {p.image && (
                                    <Link href={route('news.show', p.slug)} className="block overflow-hidden">
                                        <Photo src={media(p.image)} ratio="aspect-[16/10]" className="transition-transform duration-500 hover:scale-[1.03]" />
                                    </Link>
                                )}
                                <time className={`block text-sm text-slate-500 ${p.image ? 'mt-5' : 'border-t-2 border-navy-800 pt-5'}`}>{fmtDate(p.published_at)}</time>
                                <h2 className="mt-2 text-2xl leading-snug">
                                    <Link href={route('news.show', p.slug)} className="hover:text-crest-700">{p.title}</Link>
                                </h2>
                                {p.excerpt && <p className="mt-3 leading-relaxed text-slate-600">{p.excerpt}</p>}
                            </article>
                        ))}
                    </div>

                    {posts.links.length > 3 && (
                        <nav aria-label="Pagination" className="mt-14 flex flex-wrap justify-center gap-2">
                            {posts.links.map((l, i) =>
                                l.url ? (
                                    <Link key={i} href={l.url} className={`border px-4 py-2 text-sm ${l.active ? 'border-navy-800 bg-navy-800 text-white' : 'border-rule hover:border-navy-800'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
                                ) : (
                                    <span key={i} className="border border-rule px-4 py-2 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: l.label }} />
                                ),
                            )}
                        </nav>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}
