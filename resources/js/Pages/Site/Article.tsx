import SiteLayout from '@/Layouts/SiteLayout';
import { ArrowLink, Ornament, PageBanner, fmtDate } from '@/Components/site/Parts';
import { ArticlePlate } from '@/Components/site/HomeUpdates';
import RichText from '@/Components/site/RichText';
import PhotoGrid from '@/Components/site/PhotoGrid';
import ShareBar from '@/Components/site/ShareBar';
import { readingMinutes, useMedia, useSite } from '@/lib/site';
import type { Article as ArticleT } from '@/types/cms';

export default function Article({ article, related }: { article: ArticleT; related: ArticleT[] }) {
    const site = useSite();
    const media = useMedia();
    const cover = media(article.image);

    return (
        <SiteLayout title={article.title} description={article.excerpt ?? undefined}>
            <PageBanner title={site.articles_page_title ?? ''} crumb={site.nav_articles ?? ''} page="articles" />

            <article className="py-16 sm:py-24">
                <header className="container-site max-w-3xl text-center">
                    <p className="eyebrow">{[article.category, fmtDate(article.published_at), `${readingMinutes(article.body)} ${site.minutes_read}`].filter(Boolean).join('  ·  ')}</p>
                    <h1 className="mt-5 text-[2.7rem] leading-[1.08] sm:text-[3.8rem]">{article.title}</h1>
                    {article.author && <p className="mt-5 font-serif text-xl italic text-slate-600">{site.by_label} {article.author}</p>}
                    <Ornament className="mx-auto mt-8 text-brass" width="w-32" />
                </header>

                {cover && (
                    <div className="container-site mt-12 max-w-4xl" data-reveal="curtain">
                        <img src={cover} alt="" className="aspect-[16/9] w-full object-cover" />
                    </div>
                )}

                <div className="container-site mt-12 max-w-[44rem]" data-reveal>
                    {article.excerpt && <p className="mb-10 border-l-2 border-brass pl-6 font-serif text-[1.5rem] italic leading-relaxed text-navy-900">{article.excerpt}</p>}
                    <RichText html={article.body} />
                    <PhotoGrid photos={article.photos ?? []} title={site.photos_title} />
                    <ShareBar title={article.title} />
                    <div className="mt-14 border-t border-rule pt-6"><ArrowLink href={route('articles')}>{site.articles_back}</ArrowLink></div>
                </div>
            </article>

            {related.length > 0 && (
                <section className="ground-navy py-20 text-white">
                    <div className="container-site">
                        {site.articles_more && <h2 className="mb-16 text-center text-4xl !text-white">{site.articles_more}</h2>}
                        <div className="grid gap-16 md:grid-cols-3 md:gap-10" data-reveal-group data-reveal-step="160">
                            {related.map((a, i) => <ArticlePlate key={a.id} article={a} index={i} />)}
                        </div>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
