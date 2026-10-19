import { Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Empty, PageBanner } from '@/Components/site/Parts';
import { ArticlePlate } from '@/Components/site/HomeUpdates';
import { useSite } from '@/lib/site';
import type { Article, Paginated } from '@/types/cms';

export default function Articles({ articles }: { articles: Paginated<Article> }) {
    const site = useSite();

    return (
        <SiteLayout title={site.articles_page_title ?? ''}>
            <PageBanner title={site.articles_page_title ?? ''} crumb={site.nav_articles ?? ''} intro={site.articles_intro} page="articles" />
            <div className="py-20 sm:py-24">
                <div className="container-site">
                    {articles.data.length === 0 ? (
                        <Empty>{site.articles_empty}</Empty>
                    ) : (
                        <div className="grid gap-x-10 gap-y-20 md:grid-cols-2 lg:grid-cols-3" data-reveal-group data-reveal-step="140">
                            {articles.data.map((a, i) => <ArticlePlate key={a.id} article={a} index={i} light={false} />)}
                        </div>
                    )}
                    {articles.links.length > 3 && (
                        <nav aria-label="Pagination" className="mt-16 flex flex-wrap justify-center gap-2">
                            {articles.links.map((l, i) =>
                                l.url ? (
                                    <Link key={i} href={l.url} className={`border px-4 py-2 text-sm ${l.active ? 'border-navy-900 bg-navy-900 text-white' : 'border-rule bg-white hover:border-navy-900'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
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
