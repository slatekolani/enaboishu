<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\{Article, Event, Page, Post};
use App\Support\{Meta, Site, SiteIcons};
use Illuminate\Support\Carbon;

/** sitemap.xml, robots.txt and the web-app manifest, all built from the CMS content. */
class SeoController extends Controller
{
    /** The content each built-in page shows: its "last changed" date is the newest of these (and of the page text). */
    private const PAGE_CONTENT = [
        'home' => [Post::class, Article::class, Event::class, \App\Models\Slide::class, \App\Models\Notice::class],
        'about' => [\App\Models\CoreValue::class, \App\Models\StaffMember::class],
        'academics' => [\App\Models\Program::class, \App\Models\Facility::class],
        'results' => [\App\Models\Result::class],
        'downloads' => [\App\Models\Download::class],
        'admissions' => [\App\Models\Download::class],
        'staff' => [\App\Models\StaffMember::class],
        'student-life' => [\App\Models\Club::class, \App\Models\StudentLeader::class],
        'alumni' => [\App\Models\Alumnus::class],
        'news' => [Post::class],
        'articles' => [Article::class],
        'events' => [Event::class],
        'gallery' => [\App\Models\GalleryItem::class],
    ];

    public function sitemap()
    {
        $site = Site::all('en');
        $urls = [];
        $add = function (string $loc, $modified = null, string $freq = 'monthly', string $priority = '0.6', array $images = []) use (&$urls) {
            $urls[] = [
                'loc' => $loc,
                'lastmod' => $modified ? Carbon::parse($modified)->toAtomString() : null,
                'freq' => $freq,
                'priority' => $priority,
                'images' => array_values(array_unique(array_map(fn ($img) => asset('uploads/'.$img), array_filter($images)))),
            ];
        };
        $photos = fn ($item) => [$item->image, ...array_slice((array) ($item->photos ?? []), 0, 9)];

        if (Meta::indexingAllowed()) {
            $settingsUpdated = \App\Models\Setting::where('key', 'not like', 'indexnow\_%')->max('updated_at');
            foreach (config('cms.site_pages') as $key => $p) {
                // Pages switched off in the menu (Show/Hide) are left out, like on the website.
                if (isset($p['show']) && ($site[$p['show']] ?? 'Show') === 'Hide') {
                    continue;
                }
                $dates = array_map(fn ($model) => $model::max('updated_at'), self::PAGE_CONTENT[$key] ?? []);
                $banner = isset($p['banner']) ? ($site[$p['banner']] ?? null) : null;
                $add(route($p['route']), collect([$settingsUpdated, ...$dates])->filter()->max(),
                    in_array($key, ['home', 'news', 'events', 'articles'], true) ? 'daily' : 'monthly', $key === 'home' ? '1.0' : '0.8', [$banner]);
            }
            Page::where('active', true)->orderBy('sort')->get(['slug', 'image', 'photos', 'updated_at'])
                ->each(fn ($p) => $add(route('pages.show', $p->slug), $p->updated_at, 'monthly', '0.7', $photos($p)));
            Post::where('active', true)->whereDate('published_at', '<=', now())->latest('published_at')->get(['slug', 'image', 'photos', 'updated_at'])
                ->each(fn ($p) => $add(route('news.show', $p->slug), $p->updated_at, 'yearly', '0.6', $photos($p)));
            Article::where('active', true)->whereDate('published_at', '<=', now())->latest('published_at')->get(['slug', 'image', 'photos', 'updated_at'])
                ->each(fn ($a) => $add(route('articles.show', $a->slug), $a->updated_at, 'yearly', '0.6', $photos($a)));
            Event::where('active', true)->latest('starts_at')->get(['slug', 'image', 'photos', 'updated_at'])
                ->each(fn ($e) => $add(route('events.show', $e->slug), $e->updated_at, 'monthly', '0.5', $photos($e)));
        }

        return response()->view('seo.sitemap', ['urls' => $urls], 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    /** RSS feed of the latest news, articles and events; Google and news readers use it to find new posts quickly. */
    public function feed()
    {
        $site = Site::all('en');
        $items = collect();

        if (Meta::indexingAllowed()) {
            $published = fn ($q) => $q->where('active', true)->whereDate('published_at', '<=', now())->latest('published_at')->take(30);
            $published(Post::query())->get()->each(fn ($p) => $items->push(['title' => $p->title, 'url' => route('news.show', $p->slug), 'date' => $p->published_at, 'text' => $p->excerpt ?: $p->body, 'image' => $p->image, 'category' => $site['nav_news'] ?? 'News']));
            $published(Article::query())->get()->each(fn ($a) => $items->push(['title' => $a->title, 'url' => route('articles.show', $a->slug), 'date' => $a->published_at, 'text' => $a->excerpt ?: $a->body, 'image' => $a->image, 'category' => $site['nav_articles'] ?? 'Articles', 'author' => $a->author]));
            Event::where('active', true)->latest('updated_at')->take(15)->get()->each(fn ($e) => $items->push(['title' => $e->title, 'url' => route('events.show', $e->slug), 'date' => $e->updated_at, 'text' => $e->summary ?: $e->description, 'image' => $e->image, 'category' => $site['nav_events'] ?? 'Events']));
        }

        $items = $items->sortByDesc(fn ($i) => Carbon::parse($i['date'])->timestamp)->take(40)->values();

        return response()->view('seo.feed', [
            'site' => $site,
            'items' => $items,
            'updated' => $items->isNotEmpty() ? Carbon::parse($items->first()['date']) : now(),
        ], 200, ['Content-Type' => 'application/rss+xml; charset=UTF-8']);
    }

    /** The IndexNow key, published so search engines can check our notifications are genuine. */
    public function indexNowKey()
    {
        return response(\App\Support\IndexNow::key(), 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function robots()
    {
        $lines = ['User-agent: *'];
        if (Meta::indexingAllowed()) {
            array_push($lines, 'Disallow: /admin', 'Disallow: /login', 'Disallow: /language/', 'Disallow: /profile', 'Allow: /', '', 'Sitemap: '.route('sitemap'), 'Sitemap: '.route('feed'));
        } else {
            $lines[] = 'Disallow: /';
        }

        return response(implode("\n", $lines)."\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function manifest()
    {
        $site = Site::all(app()->getLocale());
        $icons = SiteIcons::urls();

        return response()->json([
            'name' => $site['site_name'] ?? config('app.name'),
            'short_name' => $site['short_name'] ?: ($site['site_name'] ?? config('app.name')),
            'description' => Meta::clean($site['meta_description'] ?? ''),
            'start_url' => '/',
            'display' => 'browser',
            'background_color' => '#f9f7f2',
            'theme_color' => '#0d2140',
            'icons' => [
                ['src' => $icons['icon-192.png'], 'sizes' => '192x192', 'type' => 'image/png'],
                ['src' => $icons['icon-512.png'], 'sizes' => '512x512', 'type' => 'image/png'],
            ],
        ], 200, ['Content-Type' => 'application/manifest+json']);
    }
}
