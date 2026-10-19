<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\{Article, Event, Page, Post};
use App\Support\{Meta, Site, SiteIcons};
use Illuminate\Support\Carbon;

/** sitemap.xml, robots.txt and the web-app manifest, all built from the CMS content. */
class SeoController extends Controller
{
    public function sitemap()
    {
        $site = Site::all('en');
        $urls = [];
        $add = function (string $loc, $modified = null, string $freq = 'monthly', string $priority = '0.6') use (&$urls) {
            $urls[] = ['loc' => $loc, 'lastmod' => $modified ? Carbon::parse($modified)->toDateString() : null, 'freq' => $freq, 'priority' => $priority];
        };

        if (Meta::indexingAllowed()) {
            $settingsUpdated = \App\Models\Setting::max('updated_at');
            foreach (config('cms.site_pages') as $key => $p) {
                // Pages switched off in the menu (Show/Hide) are left out, like on the website.
                if (isset($p['show']) && ($site[$p['show']] ?? 'Show') === 'Hide') {
                    continue;
                }
                $add(route($p['route']), $settingsUpdated, in_array($key, ['home', 'news', 'events', 'articles'], true) ? 'weekly' : 'monthly', $key === 'home' ? '1.0' : '0.8');
            }
            Page::where('active', true)->orderBy('sort')->get(['slug', 'updated_at'])
                ->each(fn ($p) => $add(route('pages.show', $p->slug), $p->updated_at, 'monthly', '0.7'));
            Post::where('active', true)->whereDate('published_at', '<=', now())->latest('published_at')->get(['slug', 'updated_at'])
                ->each(fn ($p) => $add(route('news.show', $p->slug), $p->updated_at, 'yearly', '0.6'));
            Article::where('active', true)->whereDate('published_at', '<=', now())->latest('published_at')->get(['slug', 'updated_at'])
                ->each(fn ($a) => $add(route('articles.show', $a->slug), $a->updated_at, 'yearly', '0.6'));
            Event::where('active', true)->latest('starts_at')->get(['slug', 'updated_at'])
                ->each(fn ($e) => $add(route('events.show', $e->slug), $e->updated_at, 'monthly', '0.5'));
        }

        return response()->view('seo.sitemap', ['urls' => $urls], 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function robots()
    {
        $lines = ['User-agent: *'];
        if (Meta::indexingAllowed()) {
            array_push($lines, 'Disallow: /admin', 'Disallow: /login', 'Disallow: /language/', 'Disallow: /profile', 'Allow: /', '', 'Sitemap: '.route('sitemap'));
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
