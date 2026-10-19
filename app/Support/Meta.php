<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Everything search engines and link previews read from a page's <head>, written on the server:
 * title, description, share image, canonical address, English/Kiswahili alternates, robots rules
 * and structured data (schema.org JSON-LD) describing the school and the page.
 */
class Meta
{
    /** Query parameters that make a different page (everything else is ignored for the canonical address). */
    private const KEEP_QUERY = ['page'];

    public static function make(?string $title = null, ?string $description = null, ?string $image = null, string $type = 'website', array $extra = []): array
    {
        $locale = app()->getLocale();
        $site = Site::all($locale);
        $name = $site['site_name'] ?? config('app.name');
        // The home page always previews with the school logo; other pages use their own photo,
        // then the default link-preview image from Site settings, then the logo.
        $logo = ['url' => self::logoCard(), 'width' => 1200, 'height' => 630, 'alt' => $name];
        $image = ! empty($extra['logo_preview']) ? null : ImageOptimizer::shareImage($image ?: ($site['share_image'] ?? null));
        $title = trim((string) $title);

        $url = self::canonical();
        $meta = [
            'title' => $title === '' || $title === $name ? $name : (str_contains($title, $name) ? $title : "{$title} | {$name}"),
            'description' => self::clean($description ?: ($site['meta_description'] ?? '')),
            'image' => $image ? asset('uploads/'.$image) : $logo['url'],
            'image_size' => $image ? null : $logo,
            'url' => $locale === 'en' ? $url : self::withLang($url, $locale),
            'type' => $type,
            'site_name' => $name,
            'locale' => $locale === 'sw' ? 'sw_TZ' : 'en_GB',
            'robots' => self::robots($extra['noindex'] ?? false),
            'alternates' => self::alternates($url),
            'verification' => array_filter(['google-site-verification' => $site['google_verification'] ?? null, 'msvalidate.01' => $site['bing_verification'] ?? null]),
            'published' => $extra['published'] ?? null,
            'modified' => $extra['modified'] ?? null,
            'icons' => SiteIcons::urls(),
            'theme' => '#0d2140',
        ];
        $meta['jsonld'] = array_values(array_filter([self::organization($site), ...($extra['schema'] ?? [])]));

        return $meta;
    }

    /** The 1200 × 630 logo card for link previews; the version number makes WhatsApp fetch a changed logo. */
    public static function logoCard(): string
    {
        $file = public_path('images/share-logo.jpg');

        return asset('images/share-logo.jpg').(is_file($file) ? '?v='.filemtime($file) : '');
    }

    /** Plain text, one line, cut at a word near 160 characters (what Google shows). */
    public static function clean(?string $text, int $limit = 160): string
    {
        $text = html_entity_decode(strip_tags(str_replace(['</p>', '<br>', '<br/>', '<br />'], ' ', (string) $text)), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return Str::limit(trim(preg_replace('/\s+/u', ' ', $text)), $limit, '…', true);
    }

    public static function indexingAllowed(): bool
    {
        return (Site::all('en')['seo_indexing'] ?? 'Allow') !== 'Block';
    }

    private static function robots(bool $noindex): string
    {
        $private = request()->is('admin', 'admin/*', 'login', 'register', 'forgot-password', 'reset-password*', 'verify-email*', 'confirm-password', 'profile', 'language/*');

        return $noindex || $private || ! self::indexingAllowed() ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';
    }

    private static function canonical(): string
    {
        $query = array_filter(request()->only(self::KEEP_QUERY), fn ($v) => $v !== null && $v !== '' && $v !== '1' && is_scalar($v));

        return url()->current().($query ? '?'.http_build_query($query) : '');
    }

    private static function withLang(string $url, string $lang): string
    {
        return $url.(str_contains($url, '?') ? '&' : '?').'lang='.$lang;
    }

    /** The same page in each language: ?lang=sw opens it in Kiswahili. */
    private static function alternates(string $url): array
    {
        return [
            ['hreflang' => 'en', 'href' => self::withLang($url, 'en')],
            ['hreflang' => 'sw', 'href' => self::withLang($url, 'sw')],
            ['hreflang' => 'x-default', 'href' => $url],
        ];
    }

    /** The school itself, on every page: name, crest, address, phone and social profiles. */
    private static function organization(array $site): array
    {
        $address = array_filter([
            '@type' => 'PostalAddress',
            'streetAddress' => self::clean($site['address'] ?? null) ?: null,
            'addressLocality' => 'Arusha',
            'addressCountry' => 'TZ',
        ]);

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => ['HighSchool', 'EducationalOrganization'],
            '@id' => url('/').'#school',
            'name' => $site['site_name'] ?? config('app.name'),
            'alternateName' => $site['short_name'] ?? null,
            'slogan' => $site['motto'] ?? null,
            'description' => self::clean($site['meta_description'] ?? null) ?: null,
            'url' => url('/'),
            'logo' => ! empty($site['logo']) ? asset('uploads/'.$site['logo']) : asset('images/crest.png'),
            'image' => asset('icon-512.png'),
            'telephone' => $site['phone'] ?? null,
            'email' => $site['email'] ?? null,
            'address' => $address,
            'areaServed' => $site['seo_place'] ?? 'Arusha, Tanzania',
            'sameAs' => array_values(array_filter([$site['instagram'] ?? null, $site['facebook'] ?? null, $site['youtube'] ?? null, $site['twitter'] ?? null, $site['tiktok'] ?? null, $site['linkedin'] ?? null])),
        ], fn ($v) => $v !== null && $v !== '' && $v !== []);
    }

    /** A news story or article. */
    public static function article(string $type, string $headline, ?string $description, ?string $image, ?string $published, ?string $modified, ?string $author = null): array
    {
        $site = Site::all(app()->getLocale());

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => $type,
            'headline' => Str::limit($headline, 110, ''),
            'description' => self::clean($description) ?: null,
            'image' => $image ? [asset('uploads/'.$image)] : null,
            'datePublished' => $published,
            'dateModified' => $modified ?: $published,
            'author' => $author ? ['@type' => 'Person', 'name' => $author] : ['@type' => 'Organization', 'name' => $site['site_name'] ?? config('app.name'), 'url' => url('/')],
            'publisher' => ['@id' => url('/').'#school'],
            'mainEntityOfPage' => url()->current(),
            'inLanguage' => app()->getLocale(),
        ]);
    }

    /** A school event (open day, prize giving, sports day …). */
    public static function event(string $name, ?string $description, ?string $image, ?string $start, ?string $end, ?string $location): array
    {
        $site = Site::all(app()->getLocale());

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Event',
            'name' => $name,
            'description' => self::clean($description) ?: null,
            'image' => $image ? [asset('uploads/'.$image)] : null,
            'startDate' => $start,
            'endDate' => $end ?: $start,
            'eventStatus' => 'https://schema.org/EventScheduled',
            'eventAttendanceMode' => 'https://schema.org/OfflineEventAttendanceMode',
            'location' => ['@type' => 'Place', 'name' => $location ?: ($site['site_name'] ?? config('app.name')), 'address' => $site['seo_place'] ?? 'Arusha, Tanzania'],
            'organizer' => ['@id' => url('/').'#school'],
            'url' => url()->current(),
        ]);
    }

    /** Home › Section › Page, shown by Google instead of the raw address. */
    public static function breadcrumbs(array $trail): array
    {
        $items = [];
        foreach (array_values($trail) as $i => [$name, $url]) {
            $items[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $name, 'item' => $url];
        }

        return ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $items];
    }
}
