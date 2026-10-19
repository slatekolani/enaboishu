<?php

use App\Models\{Download, Notice, Post, Result, Setting, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function editor(): User
{
    $user = User::factory()->create();
    $user->assignRole(Role::findOrCreate('admin'));

    return $user;
}

/* ---------- Photo compression ---------- */

it('shrinks large photos and keeps them upright and light', function () {
    Storage::fake('uploads');

    $this->actingAs(editor())->post('/admin/content/posts', [
        'title' => 'Big photo', 'published_at' => now()->toDateString(), 'active' => true,
        'image' => UploadedFile::fake()->image('huge.jpg', 4000, 3000),
        'photos_new' => [UploadedFile::fake()->image('g.jpg', 3600, 2400)],
    ])->assertRedirect();

    $post = Post::firstOrFail();
    [$w, $h] = getimagesizefromstring(Storage::disk('uploads')->get($post->image));
    expect(max($w, $h))->toBe(2000)->and($w)->toBeGreaterThan($h);   // scaled down, shape kept

    [$gw] = getimagesizefromstring(Storage::disk('uploads')->get($post->photos[0]));
    expect($gw)->toBe(1800);                                          // gallery photos a little smaller
    expect(pathinfo($post->image, PATHINFO_EXTENSION))->toBeIn(['webp', 'jpg']);
});

it('keeps logos with transparent backgrounds as PNG', function () {
    Storage::fake('uploads');
    $png = imagecreatetruecolor(300, 300);
    imagesavealpha($png, true);
    imagefill($png, 0, 0, imagecolorallocatealpha($png, 0, 0, 0, 127));
    ob_start();
    imagepng($png);
    $file = UploadedFile::fake()->createWithContent('crest.png', ob_get_clean());

    $this->actingAs(editor())->post('/admin/settings', ['logo' => $file])->assertRedirect();

    expect(Setting::where('key', 'logo')->value('value'))->toEndWith('.png');
});

/* ---------- Notice board ---------- */

it('shows notices only between their start and end dates', function () {
    Notice::create(['message' => 'School reopens Monday', 'starts_at' => now()->subDay(), 'ends_at' => now()->addDay()]);
    Notice::create(['message' => 'Old notice', 'ends_at' => now()->subDay()]);
    Notice::create(['message' => 'Future notice', 'starts_at' => now()->addWeek()]);
    Notice::create(['message' => 'Switched off', 'active' => false]);

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->has('notices', 1)
        ->where('notices.0.message', 'School reopens Monday'));
});

/* ---------- Downloads centre ---------- */

it('records file details, counts downloads and lists documents by form', function () {
    Storage::fake('uploads');

    $this->actingAs(editor())->post('/admin/content/downloads', [
        'title' => 'Form One Joining Instructions', 'category' => 'Joining instructions', 'form_level' => 'Form I',
        'file' => UploadedFile::fake()->create('joining.pdf', 300, 'application/pdf'), 'active' => true,
    ])->assertRedirect('/admin/content/downloads');

    $doc = Download::firstOrFail();
    expect($doc->file_type)->toBe('PDF')->and($doc->file_size)->toBeGreaterThan(300 * 1000);

    $this->get('/downloads')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Site/Downloads')->where('downloads.0.form_level', 'Form I'));

    $this->get("/downloads/{$doc->id}/file")->assertRedirect(asset('uploads/'.$doc->file));
    $this->get("/downloads/{$doc->id}/file");
    expect($doc->fresh()->downloads_count)->toBe(2);

    $doc->update(['active' => false]);
    $this->get("/downloads/{$doc->id}/file")->assertNotFound();
});

/* ---------- Academic results ---------- */

it('publishes examination results', function () {
    $this->actingAs(editor())->post('/admin/content/results', [
        'year' => 2025, 'exam' => 'CSEE', 'candidates' => 120,
        'div_1' => 20, 'div_2' => 40, 'div_3' => 35, 'div_4' => 20, 'div_0' => 5, 'gpa' => '2.9', 'active' => true,
    ])->assertRedirect('/admin/content/results');

    $this->get('/results')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Site/Results')->where('results.0.div_2', 40)->where('results.0.candidates', 120));
});

/* ---------- Kiswahili / English ---------- */

it('switches the public site to Kiswahili, with built-in labels and translated content', function () {
    Post::create([
        'title' => 'Sports day results', 'slug' => 'sports-day', 'published_at' => now()->toDateString(),
        'translations' => ['sw' => ['title' => 'Matokeo ya michezo']],
    ]);

    $this->get('/')->assertInertia(fn (Assert $page) => $page->where('locale', 'en')->where('site.nav_home', 'Home'));

    $this->get('/language/sw')->assertRedirect();

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('locale', 'sw')
        ->where('site.nav_home', 'Nyumbani')
        ->where('posts.0.title', 'Matokeo ya michezo')
        ->missing('posts.0.translations'));

    // Fields without a Kiswahili version stay in English.
    $this->get('/news/sports-day')->assertInertia(fn (Assert $page) => $page->where('post.slug', 'sports-day'));

    // The admin panel always shows the English text, plus the stored translations.
    $this->actingAs(editor())->get('/admin/content/posts')->assertInertia(fn (Assert $page) => $page
        ->where('rows.0.title', 'Sports day results')
        ->where('rows.0.translations.sw.title', 'Matokeo ya michezo'));
});

it('saves Kiswahili content and Kiswahili site text from the admin', function () {
    $this->actingAs(editor())->post('/admin/content/posts', [
        'title' => 'Prize giving', 'published_at' => now()->toDateString(), 'active' => true,
        'translations' => ['sw' => ['title' => 'Utoaji wa zawadi', 'body' => '<p><strong>Hongera</strong></p><script>x</script>']],
    ])->assertRedirect();

    $sw = Post::firstOrFail()->translations['sw'];
    expect($sw['title'])->toBe('Utoaji wa zawadi')->and($sw['body'])->toContain('<strong>Hongera</strong>')->not->toContain('script');

    $this->actingAs(editor())->post('/admin/settings', ['_lang' => 'sw', 'news_title' => 'Habari za shule'])->assertRedirect();
    expect(Setting::where('key', 'news_title__sw')->value('value'))->toBe('Habari za shule');

    $this->withSession(['locale' => 'sw'])->get('/')->assertInertia(fn (Assert $page) => $page->where('site.news_title', 'Habari za shule'));
    // English is untouched.
    $this->get('/language/en');
    $this->get('/')->assertInertia(fn (Assert $page) => $page->where('site.news_title', 'Latest news'));
});

it('uses the school\'s own English wording instead of a built-in translation once it has been changed', function () {
    $this->actingAs(editor())->post('/admin/settings', ['news_link' => 'Read all our news']);

    $this->withSession(['locale' => 'sw'])->get('/')
        ->assertInertia(fn (Assert $page) => $page->where('site.news_link', 'Read all our news')->where('site.news_eyebrow', 'Gazeti la Shule'));
});

/* ---------- Link previews ---------- */

it('writes link-preview tags into the page for WhatsApp and Facebook', function () {
    Post::create(['title' => 'Science fair winners', 'slug' => 'science-fair', 'excerpt' => 'Our students took first place.', 'published_at' => now()->toDateString()]);

    $this->get('/news/science-fair')
        ->assertSee('<meta property="og:title" content="Science fair winners | Enaboishu Secondary School">', false)
        ->assertSee('<meta property="og:description" content="Our students took first place.">', false)
        ->assertSee('property="og:image"', false)
        ->assertSee('<meta property="og:type" content="article">', false);
});

it('opens every new public page', function (string $path) {
    $this->get($path)->assertOk();
})->with(['/downloads', '/results']);
