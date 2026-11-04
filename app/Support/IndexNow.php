<?php

namespace App\Support;

use App\Models\{Article, Event, Page, Post, Setting};
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Tells search engines straight away when something is published, changed or removed, using the
 * IndexNow protocol (Bing, Yandex, Seznam, Naver and others share every notification). Google does
 * not take notifications; it re-reads sitemap.xml and feed.xml, which always list the latest content.
 *
 * Addresses changed during one request are collected and sent once, after the page has been sent.
 */
class IndexNow
{
    public const ENDPOINT = 'https://api.indexnow.org/indexnow';

    /** Where each kind of content is shown on the website: [single page route, list page route]. */
    private const ROUTES = [
        Post::class => ['news.show', 'news'],
        Article::class => ['articles.show', 'articles'],
        Event::class => ['events.show', 'events'],
        Page::class => ['pages.show', null],
    ];

    private static array $pending = [];

    private static bool $scheduled = false;

    public static function watch(): void
    {
        foreach (array_keys(self::ROUTES) as $model) {
            $model::saved(fn (Model $m) => self::changed($m));
            $model::deleted(fn (Model $m) => self::changed($m, deleted: true));
        }
    }

    /** The key search engines use to check that notifications really come from this website. */
    public static function key(): string
    {
        return Setting::firstOrCreate(['key' => 'indexnow_key'], ['value' => bin2hex(random_bytes(16))])->value;
    }

    public static function enabled(): bool
    {
        $site = Site::all('en');
        $host = parse_url(config('app.url'), PHP_URL_HOST) ?: '';

        // Never from a computer the public cannot reach: search engines would only reject it.
        $local = $host === '' || in_array($host, ['localhost', '127.0.0.1', '::1'], true) || preg_match('/\.(test|local|localhost)$/', $host);

        return ! $local && Meta::indexingAllowed() && ($site['seo_auto_notify'] ?? 'On') !== 'Off';
    }

    private static function changed(Model $m, bool $deleted = false): void
    {
        // Only content the public can see now, or could see before this change, is worth announcing.
        $visible = fn (array $a) => ! empty($a['active']) && (! array_key_exists('published_at', $a) || $a['published_at'] === null || substr((string) $a['published_at'], 0, 10) <= now()->toDateString());
        if (! $visible($m->getAttributes()) && ! $visible($m->getOriginal())) {
            return;
        }

        [$show, $list] = self::ROUTES[$m::class];
        $slugs = array_unique(array_filter([$m->slug, $m->getOriginal('slug')]));
        $urls = array_map(fn ($slug) => self::url($show, $slug), $slugs);
        $urls[] = $list ? self::url($list) : null;
        $urls[] = self::url('home');

        self::queue(array_filter($urls));
    }

    /** Addresses on the website's official address (APP_URL), whatever address the editor is using. */
    private static function url(string $route, mixed $parameters = []): string
    {
        $path = route($route, $parameters, false);

        return rtrim(config('app.url'), '/').($path === '/' ? '' : $path);
    }

    public static function queue(array $urls): void
    {
        if (! self::enabled()) {
            return;
        }
        self::$pending = array_values(array_unique([...self::$pending, ...$urls]));

        if (! self::$scheduled) {
            self::$scheduled = true;
            \Illuminate\Support\defer(fn () => self::flush());
        }
    }

    /** Send everything collected; returns the search engines' answer (HTTP status), or null when nothing was sent. */
    public static function flush(): ?int
    {
        $urls = self::$pending;
        self::$pending = [];
        self::$scheduled = false;
        if (! $urls) {
            return null;
        }

        try {
            $response = Http::timeout(8)->acceptJson()->post(self::ENDPOINT, [
                'host' => parse_url(config('app.url'), PHP_URL_HOST),
                'key' => self::key(),
                'keyLocation' => self::url('indexnow.key'),
                'urlList' => array_slice($urls, 0, 10000),
            ]);
            $status = $response->status();
        } catch (\Throwable $e) {
            Log::warning('IndexNow: could not reach the search engines: '.$e->getMessage());
            $status = 0;
        }

        // 200 and 202 both mean accepted (202: the key is still being checked, normal the first time).
        $ok = in_array($status, [200, 202], true);
        Setting::updateOrCreate(['key' => 'indexnow_last'], ['value' => json_encode([
            'at' => now()->toIso8601String(), 'count' => count($urls), 'ok' => $ok, 'status' => $status,
        ])]);
        if (! $ok) {
            Log::warning("IndexNow: search engines answered {$status} for ".count($urls).' address(es).');
        }

        return $status;
    }
}
