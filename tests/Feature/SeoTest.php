<?php

use App\Models\{Event, Page, Post, Setting, User};
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed([\Database\Seeders\RolesSeeder::class]);
});

it('writes title, description, canonical, language alternates and school details into every page', function () {
    $html = $this->get('/about')->assertOk()->getContent();

    expect($html)
        ->toContain('<meta name="robots" content="index, follow')
        ->toContain('<link rel="canonical" href="'.url('/about').'">')
        ->toContain('hreflang="sw" href="'.url('/about').'?lang=sw"')
        ->toContain('"@type":["HighSchool","EducationalOrganization"]')
        ->toContain('"@type":"BreadcrumbList"')
        ->toContain('rel="apple-touch-icon"')
        ->toContain('rel="manifest"');
});

it('uses the search title and description set for a built-in page in the CMS', function () {
    Setting::create(['key' => 'seo_title_student_life', 'value' => 'Clubs, sports and boarding life']);
    Setting::create(['key' => 'seo_desc_student_life', 'value' => 'Debate, football, science club and more at Enaboishu.']);

    $html = $this->get('/student-life')->assertOk()->getContent();

    expect($html)->toContain('<title inertia>Clubs, sports and boarding life | ')
        ->toContain('content="Debate, football, science club and more at Enaboishu."');
});

it('uses a story\'s own search fields and describes it as a news article', function () {
    Post::create(['title' => 'Form Four results', 'slug' => 'form-four-results', 'excerpt' => 'Our best year yet.', 'body' => '<p>Full story</p>', 'published_at' => now()->subDay(), 'active' => true,
        'seo_title' => 'CSEE 2026 results at Enaboishu', 'seo_description' => 'Ninety-eight percent of candidates passed.']);

    $html = $this->get('/news/form-four-results')->assertOk()->getContent();

    expect($html)->toContain('CSEE 2026 results at Enaboishu |')
        ->toContain('Ninety-eight percent of candidates passed.')
        ->toContain('"@type":"NewsArticle"')
        ->toContain('"headline":"Form Four results"')
        ->toContain('article:published_time');
});

it('describes events for Google', function () {
    Event::create(['title' => 'Open day', 'slug' => 'open-day', 'starts_at' => now()->addWeek()->toDateString(), 'location' => 'School hall', 'active' => true]);

    expect($this->get('/events/open-day')->assertOk()->getContent())->toContain('"@type":"Event"')->toContain('"name":"School hall"');
});

it('lists every public page, story and custom page in the sitemap and leaves hidden ones out', function () {
    Post::create(['title' => 'Sports day', 'slug' => 'sports-day', 'published_at' => now()->subDay(), 'active' => true]);
    Post::create(['title' => 'Draft', 'slug' => 'draft', 'published_at' => now()->subDay(), 'active' => false]);
    Page::create(['title' => 'School fees', 'slug' => 'school-fees', 'menu_group' => 'Admissions', 'active' => true]);
    Setting::create(['key' => 'menu_show_alumni', 'value' => 'Hide']);

    $xml = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8')->getContent();

    expect($xml)->toContain('<loc>'.url('/news/sports-day').'</loc>')
        ->toContain('<loc>'.url('/pages/school-fees').'</loc>')
        ->toContain('<loc>'.url('/contact').'</loc>')
        ->toContain('hreflang="sw"')
        ->not->toContain('/news/draft')
        ->not->toContain('<loc>'.url('/alumni').'</loc>');
    expect(simplexml_load_string($xml))->not->toBeFalse();
});

it('serves robots.txt with the sitemap, and blocks everything when the school switches listing off', function () {
    $this->get('/robots.txt')->assertOk()->assertSee('Disallow: /admin')->assertSee('Sitemap: '.url('/sitemap.xml'));

    Setting::create(['key' => 'seo_indexing', 'value' => 'Block']);
    \App\Support\Site::forget();

    $this->get('/robots.txt')->assertSee("Disallow: /\n", false)->assertDontSee('Sitemap:');
    expect($this->get('/')->getContent())->toContain('content="noindex, nofollow"');
    expect($this->get('/sitemap.xml')->getContent())->not->toContain('<loc>');
});

it('keeps the admin panel, login and error pages out of search results', function () {
    expect($this->get('/login')->getContent())->toContain('noindex, nofollow');
    expect($this->get('/pages/does-not-exist')->assertNotFound()->getContent())->toContain('noindex, nofollow');

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    expect($this->actingAs($admin)->get('/admin')->getContent())->toContain('noindex, nofollow');
});

it('opens a page in Kiswahili from ?lang=sw and points the canonical address at that version', function () {
    $html = $this->get('/contact?lang=sw')->assertOk()->getContent();

    expect($html)->toContain('<html lang="sw">')->toContain('<link rel="canonical" href="'.url('/contact').'?lang=sw">');
});

it('serves the favicon set and a web-app manifest', function () {
    foreach (['favicon.ico', 'favicon-32x32.png', 'apple-touch-icon.png', 'icon-512.png'] as $file) {
        expect(public_path($file))->toBeFile();
    }
    expect(getimagesize(public_path('icon-512.png'))[0])->toBe(512);

    $this->get('/site.webmanifest')->assertOk()->assertJsonPath('icons.1.sizes', '512x512')->assertJsonPath('theme_color', '#0d2140');
});

it('previews the home page link with the school logo, even when the slides have photos', function () {
    \App\Models\Slide::create(['title' => 'Welcome', 'image' => 'demo/slide-1.jpg', 'active' => true]);

    $html = $this->get('/')->assertOk()->getContent();

    expect($html)->toContain('<meta property="og:image" content="'.url('/images/share-logo.jpg'))
        ->toContain('<meta property="og:image:width" content="1200">')
        ->toContain('<meta name="twitter:image" content="'.url('/images/share-logo.jpg'))
        ->not->toContain('og:image" content="'.url('/uploads/demo/slide-1'));
    [$width, $height] = getimagesize(public_path('images/share-logo.jpg'));
    expect([$width, $height])->toBe([1200, 630]);
});
