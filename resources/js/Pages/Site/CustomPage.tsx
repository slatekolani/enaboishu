import SiteLayout from '@/Layouts/SiteLayout';
import { PageBanner } from '@/Components/site/Parts';
import RichText from '@/Components/site/RichText';
import PhotoGrid from '@/Components/site/PhotoGrid';
import ShareBar from '@/Components/site/ShareBar';
import { useSite } from '@/lib/site';
import type { CustomPage as CustomPageT } from '@/types/cms';

/** A page the school created in Admin → Pages (fees, uniform, school rules, …). */
export default function CustomPage({ page }: { page: CustomPageT }) {
    const site = useSite();

    return (
        <SiteLayout title={page.title} description={page.intro ?? undefined}>
            <PageBanner title={page.title} crumb={page.title} intro={page.intro} image={page.image} />
            <article className="py-16 sm:py-20">
                <div className="container-site max-w-3xl" data-reveal>
                    <RichText html={page.body} />
                    <PhotoGrid photos={page.photos ?? []} title={(page.photos?.length ?? 0) > 0 ? site.photos_title : null} />
                    {page.body && <ShareBar title={page.title} />}
                </div>
            </article>
        </SiteLayout>
    );
}
