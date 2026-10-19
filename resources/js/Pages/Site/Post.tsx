import { Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import { ArrowLink, PageBanner, Photo, Prose, fmtDate } from '@/Components/site/Parts';
import { useMedia, useSite } from '@/lib/site';
import PhotoGrid from '@/Components/site/PhotoGrid';
import ShareBar from '@/Components/site/ShareBar';
import type { Post as PostT } from '@/types/cms';

export default function Post({ post, related }: { post: PostT; related: PostT[] }) {
    const media = useMedia();
    const site = useSite();

    return (
        <SiteLayout title={post.title} description={post.excerpt ?? undefined}>
            <PageBanner title={site.news_page_title ?? ''} crumb={site.nav_news ?? ''} page="news" />
            <article className="py-14 sm:py-20">
                <div className="container-site max-w-3xl" data-reveal>
                    <time className="eyebrow">{fmtDate(post.published_at)}</time>
                    <h1 className="mt-4 text-[2.6rem] leading-[1.1] sm:text-[3.4rem]">{post.title}</h1>
                    {post.excerpt && <p className="mt-5 text-xl leading-relaxed text-slate-600">{post.excerpt}</p>}
                    {post.image && <div className="my-10"><Photo src={media(post.image)} ratio="aspect-[16/9]" alt="" /></div>}
                    <Prose text={post.body} className="mt-8" />
                    <PhotoGrid photos={post.photos ?? []} title={site.photos_title} />
                    <ShareBar title={post.title} />
                    <div className="mt-12 border-t border-rule pt-6"><ArrowLink href={route('news')}>{site.news_back}</ArrowLink></div>
                </div>
            </article>

            {related.length > 0 && (
                <section className="bg-paper py-14">
                    <div className="container-site">
                        {site.news_more && <h2 className="mb-8 text-[2rem]">{site.news_more}</h2>}
                        <div className="grid gap-8 sm:grid-cols-3" data-reveal-group data-reveal-step="140">
                            {related.map((p) => (
                                <article key={p.id}>
                                    <Photo src={media(p.image)} ratio="aspect-[16/10]" className="mb-4" />
                                    <time className="block text-sm text-slate-500">{fmtDate(p.published_at)}</time>
                                    <h3 className="mt-1 text-[1.35rem]"><Link href={route('news.show', p.slug)} className="hover:text-crest-700">{p.title}</Link></h3>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
