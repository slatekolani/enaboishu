<?php

use App\Models\{Article, Event, Page, Post, SlugRedirect, User};
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    \App\Support\Site::forget();
    $this->seed([\Database\Seeders\RolesSeeder::class]);
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('makes the web address from the title when it is left empty', function () {
    $this->actingAs($this->admin)->post('/admin/content/posts', ['title' => 'Form Four Results 2026!', 'published_at' => now()->toDateString(), 'active' => '1'])->assertRedirect();

    expect(Post::firstOrFail()->slug)->toBe('form-four-results-2026');
    $this->get('/news/form-four-results-2026')->assertOk();
});

it('uses the web address the editor types, tidied up', function () {
    $this->actingAs($this->admin)->post('/admin/content/articles', ['title' => 'A long title about reading', 'slug' => 'Reading At Home ', 'published_at' => now()->toDateString(), 'active' => '1']);

    expect(Article::firstOrFail()->slug)->toBe('reading-at-home');
});

it('changes the address of an existing story and sends the old address to the new one', function () {
    $post = Post::create(['title' => 'Demo music festival', 'slug' => 'demo-music-festival', 'published_at' => now()->subDay(), 'active' => true]);

    $this->actingAs($this->admin)->post("/admin/content/posts/{$post->id}", ['title' => 'Choir wins the district music festival', 'slug' => 'choir-wins-district-festival', 'published_at' => now()->subDay()->toDateString(), 'active' => '1'])->assertRedirect();

    expect($post->fresh()->slug)->toBe('choir-wins-district-festival');
    $this->get('/news/demo-music-festival?lang=sw')->assertStatus(301)->assertRedirect(url('/news/choir-wins-district-festival?lang=sw'));
    $this->get('/news/choir-wins-district-festival')->assertOk();
    expect($this->get('/sitemap.xml')->getContent())->toContain('/news/choir-wins-district-festival')->not->toContain('/news/demo-music-festival');
});

it('keeps working after several renames, and lets an address be taken back', function () {
    $event = Event::create(['title' => 'Open day', 'slug' => 'open-day', 'starts_at' => now()->addWeek()->toDateString(), 'active' => true]);
    $save = fn (string $slug) => $this->actingAs($this->admin)->post("/admin/content/events/{$event->id}", ['title' => 'Open day', 'slug' => $slug, 'starts_at' => now()->addWeek()->toDateString(), 'active' => '1']);

    $save('open-day-2026');
    $save('parents-open-day');
    $this->get('/events/open-day')->assertRedirect(url('/events/parents-open-day'));
    $this->get('/events/open-day-2026')->assertRedirect(url('/events/parents-open-day'));

    $save('open-day'); // back to the first address
    $this->get('/events/open-day')->assertOk();
    $this->get('/events/parents-open-day')->assertRedirect(url('/events/open-day'));
    expect(SlugRedirect::where('old_slug', 'open-day')->exists())->toBeFalse();
});

it('refuses an address another item already uses', function () {
    Page::create(['title' => 'School fees', 'slug' => 'school-fees', 'menu_group' => 'Admissions', 'active' => true]);
    $page = Page::create(['title' => 'Uniform', 'slug' => 'uniform', 'menu_group' => 'Admissions', 'active' => true]);

    $this->actingAs($this->admin)->post("/admin/content/pages/{$page->id}", ['title' => 'Uniform', 'slug' => 'school-fees', 'menu_group' => 'Admissions', 'active' => '1'])
        ->assertSessionHasErrors('slug');
    expect($page->fresh()->slug)->toBe('uniform');
});

it('shows the full address in front of the field', function () {
    $this->actingAs($this->admin)->get('/admin/content/posts/create')->assertInertia(fn ($page) => $page
        ->where('resource.slug_from', 'title')
        ->where('resource.fields.1.name', 'slug')
        ->where('resource.fields.1.prefix', url('/news').'/'));
});

it('still shows "not found" for addresses that never existed', function () {
    $this->get('/news/never-existed')->assertNotFound();
});
