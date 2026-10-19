<?php

use App\Models\{Page, Setting, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function adminUser(): User
{
    $u = User::factory()->create();
    $u->assignRole(Role::findOrCreate('admin'));

    return $u;
}

it('gives every inner page its own editable banner photo', function () {
    Storage::fake('uploads');

    $this->actingAs(adminUser())->post('/admin/settings', [
        'banner_alumni' => UploadedFile::fake()->image('alumni-banner.jpg', 1920, 800),
        'alumni_title' => 'Our alumni',
        'alumni_intro' => 'Once Enaboishu, always Enaboishu.',
    ])->assertRedirect();

    $banner = Setting::where('key', 'banner_alumni')->value('value');
    Storage::disk('uploads')->assertExists($banner);

    $this->get('/alumni')->assertInertia(fn (Assert $page) => $page
        ->where('site.banner_alumni', $banner)
        ->where('site.alumni_title', 'Our alumni')
        ->where('site.alumni_intro', 'Once Enaboishu, always Enaboishu.')
        ->where('site.banner_staff', null)); // other pages fall back to the shared photo
});

it('lets the school create its own pages and place them in the menu', function () {
    $this->actingAs(adminUser())->post('/admin/content/pages', [
        'title' => 'School fees', 'menu_group' => 'Admissions', 'intro' => 'Fees for 2027',
        'body' => '<p>Fees are paid <strong>per term</strong>.</p>', 'active' => true,
    ])->assertRedirect('/admin/pages');
    $this->actingAs(adminUser())->post('/admin/content/pages', [
        'title' => 'Hidden link page', 'menu_group' => 'Not in the menu', 'active' => true,
    ]);

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->has('menuPages', 1)
        ->where('menuPages.0.title', 'School fees')
        ->where('menuPages.0.menu_group', 'Admissions'));

    $this->get('/pages/school-fees')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Site/CustomPage')->where('page.title', 'School fees'));
    $this->get('/pages/hidden-link-page')->assertOk(); // reachable by link even though not in the menu

    Page::where('slug', 'school-fees')->update(['active' => false]);
    $this->get('/pages/school-fees')->assertNotFound();
});

it('shows a styled, editable error page for missing pages', function () {
    $this->get('/this-page-does-not-exist')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('Site/Error')->where('status', 404)->where('site.error_404_title', 'Page not found'));

    $this->get('/news/no-such-story')->assertNotFound()->assertInertia(fn (Assert $page) => $page->component('Site/Error'));

    Setting::create(['key' => 'error_404_title', 'value' => 'Hatukuipata']);
    $this->get('/missing')->assertInertia(fn (Assert $page) => $page->where('site.error_404_title', 'Hatukuipata'));
});

it('keeps the admin panel\'s own access errors working', function () {
    $editor = User::factory()->create();
    $editor->assignRole(Role::findOrCreate('editor'));
    $this->actingAs($editor)->get('/admin/settings')->assertForbidden();
});

it('never deletes shared demo files when an entry is edited or removed', function () {
    Storage::fake('uploads');
    Storage::disk('uploads')->put('demo/shared.jpg', 'x');
    $item = \App\Models\GalleryItem::create(['image' => 'demo/shared.jpg', 'category' => 'Campus']);

    $this->actingAs(adminUser())->delete("/admin/content/gallery/{$item->id}")->assertRedirect();

    Storage::disk('uploads')->assertExists('demo/shared.jpg');
});

it('lists every website page in Admin → Pages with its hero, and opens an editor per page', function () {
    $admin = adminUser();
    Page::create(['title' => 'Uniform', 'slug' => 'uniform', 'menu_group' => 'About']);

    $this->actingAs($admin)->get('/admin/pages')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Pages')
        ->has('builtIn', count(config('cms.site_pages')))
        ->where('builtIn.0.key', 'home')
        ->where('custom.0.title', 'Uniform'));

    $this->actingAs($admin)->get('/admin/pages/alumni/edit')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Admin/PageSettings')
        ->where('sections.0.key', 'hero')
        ->where('sections.0.fields.0.name', 'alumni_title')
        ->where('sections.0.fields.1.name', 'alumni_intro')
        ->where('sections.0.fields.2.name', 'banner_alumni')
        ->where('heroKeys.banner', 'banner_alumni'));

    // Kiswahili editor offers only words (no photos), still starting with the hero.
    $this->actingAs($admin)->get('/admin/pages/alumni/edit?lang=sw')->assertInertia(fn (Assert $page) => $page
        ->where('lang', 'sw')->where('sections.0.fields.0.name', 'alumni_title')->missing('sections.0.fields.2'));

    $this->actingAs($admin)->get('/admin/pages/nope/edit')->assertNotFound();
});

it('lets editors manage their own pages but not the built-in page settings', function () {
    $editor = User::factory()->create();
    $editor->assignRole(Role::findOrCreate('editor'));

    $this->actingAs($editor)->get('/admin/pages')->assertOk()->assertInertia(fn (Assert $page) => $page->has('builtIn', 0));
    $this->actingAs($editor)->get('/admin/pages/about/edit')->assertForbidden();

    $this->actingAs($editor)->post('/admin/content/pages', ['title' => 'Boarding', 'menu_group' => 'About', 'active' => true])
        ->assertRedirect('/admin/pages');
});
