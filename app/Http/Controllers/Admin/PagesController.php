<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Admin → Pages: every page of the website in one list. Built-in pages open an editor that
 * gathers that page's hero (banner), wording and menu entry; the school's own pages are listed below.
 */
class PagesController extends Controller
{
    public function index(Request $request)
    {
        $isAdmin = $request->user()->hasRole('admin');
        $en = Site::all('en');

        $builtIn = ! $isAdmin ? [] : collect(config('cms.site_pages'))->map(fn ($p, $key) => [
            'key' => $key,
            'label' => $p['label'],
            'path' => parse_url(route($p['route']), PHP_URL_PATH),
            'url' => route($p['route']),
            'title' => isset($p['title']) ? $en[$p['title']] : null,
            'banner' => isset($p['banner']) ? ($en[$p['banner']] ?: null) : null,
            'hidden' => isset($p['show']) && ($en[$p['show']] ?? 'Show') === 'Hide',
            'manage' => $this->manageLinks($p),
        ])->values();

        return Inertia::render('Admin/Pages', [
            'builtIn' => $builtIn,
            'sharedBanner' => $en['page_banner'] ?? null,
            'custom' => Page::orderBy('sort')->orderBy('id')->get(['id', 'title', 'slug', 'menu_group', 'image', 'active', 'updated_at'])
                ->map(fn ($p) => $p->only(['id', 'title', 'slug', 'menu_group', 'image', 'active']) + ['url' => route('pages.show', $p->slug)]),
        ]);
    }

    public function edit(Request $request, string $key)
    {
        $page = config("cms.site_pages.$key");
        abort_unless($page, 404);
        $lang = $request->query('lang') === 'sw' ? 'sw' : 'en';

        $fields = Site::fields();
        $names = collect($page['groups'] ?? [])->flatMap(fn ($g) => collect(config("cms.settings.$g"))->pluck('name'))
            ->merge($page['fields'] ?? [])
            ->merge(array_filter([$page['nav'] ?? null, $page['show'] ?? null]))
            ->merge($seo = ['seo_title_'.str_replace('-', '_', $key), 'seo_desc_'.str_replace('-', '_', $key)])
            ->unique()
            ->filter(fn ($n) => isset($fields[$n]))
            ->filter(fn ($n) => $lang === 'en' || Site::translatable($fields[$n]));

        // Sections: the hero (banner) first, then the menu entry, then everything else on the page.
        $hero = array_values(array_filter([$page['title'] ?? null, $page['intro'] ?? null, $page['banner'] ?? null], fn ($n) => $names->contains($n)));
        $menu = array_values(array_filter([$page['nav'] ?? null, $page['show'] ?? null], fn ($n) => $names->contains($n)));
        $search = array_values(array_filter($seo, fn ($n) => $names->contains($n)));
        $rest = $names->diff($hero)->diff($menu)->diff($search)->values()->all();
        $pick = fn (array $list) => array_map(fn ($n) => $fields[$n], $list);

        return Inertia::render('Admin/PageSettings', [
            'page' => ['key' => $key, 'label' => $page['label'], 'url' => route($page['route']), 'manage' => $this->manageLinks($page), 'isHome' => $key === 'home'],
            'lang' => $lang,
            'sections' => array_values(array_filter([
                ['key' => 'hero', 'title' => 'Hero (banner)', 'fields' => $pick($hero)],
                ['key' => 'text', 'title' => $key === 'home' ? 'Home page text and sections' : 'Text on the page', 'fields' => $pick($rest)],
                ['key' => 'menu', 'title' => 'Menu', 'fields' => $pick($menu)],
                ['key' => 'seo', 'title' => 'Search engines (Google)', 'fields' => $pick($search)],
            ], fn ($s) => $s['fields'])),
            'values' => $lang === 'sw' ? Site::swRaw() : Site::all('en'),
            'english' => Site::all('en'),
            'swDefaults' => config('cms_sw'),
            'heroKeys' => ['title' => $page['title'] ?? null, 'intro' => $page['intro'] ?? null, 'banner' => $page['banner'] ?? null],
        ]);
    }

    private function manageLinks(array $page): array
    {
        return array_map(fn ($m) => [
            'label' => $m[0],
            'url' => str_starts_with($m[1], '@') ? route(substr($m[1], 1)) : route('admin.resource.index', $m[1]),
        ], $page['manage'] ?? []);
    }
}
