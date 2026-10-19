<?php

use App\Models\{Article, Event, Message, Post, Setting, StaffMember, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function admin(): User
{
    $user = User::factory()->create();
    $user->assignRole(Role::findOrCreate('admin'));

    return $user;
}

it('shows every public page', function (string $path) {
    $this->get($path)->assertOk();
})->with(['/', '/about', '/academics', '/admissions', '/staff', '/news', '/articles', '/events', '/gallery', '/contact']);

it('keeps the admin area private', function () {
    $this->get('/admin')->assertRedirect('/login');

    $this->actingAs(User::factory()->create())->get('/admin')->assertForbidden();
    $this->actingAs(admin())->get('/admin')->assertOk();
});

it('lets an admin add a staff member with a photo that then appears on the site', function () {
    Storage::fake('uploads');

    $this->actingAs(admin())->post('/admin/content/staff', [
        'name' => 'Asha Mushi',
        'position' => 'Head of Science',
        'department' => 'Teaching',
        'sort' => 1,
        'active' => true,
        'photo' => UploadedFile::fake()->image('asha.jpg', 400, 500),
    ])->assertRedirect('/admin/content/staff');

    $member = StaffMember::firstOrFail();
    Storage::disk('uploads')->assertExists($member->photo);

    $this->get('/staff')->assertInertia(fn (Assert $page) => $page
        ->component('Site/Staff')
        ->where('staff.0.name', 'Asha Mushi'));

    // Editing without a new file keeps the photo; removing it deletes the file.
    $this->actingAs(admin())->post("/admin/content/staff/{$member->id}", [
        'name' => 'Asha Mushi', 'position' => 'Head of Science', 'department' => 'Teaching', 'active' => true,
    ])->assertRedirect();
    expect($member->fresh()->photo)->not->toBeNull();

    $this->actingAs(admin())->post("/admin/content/staff/{$member->id}", [
        'name' => 'Asha Mushi', 'position' => 'Head of Science', 'department' => 'Teaching', 'active' => true, '_remove_photo' => true,
    ]);
    expect($member->fresh()->photo)->toBeNull();
});

it('rejects non-image uploads', function () {
    Storage::fake('uploads');

    $this->actingAs(admin())->post('/admin/content/staff', [
        'name' => 'X', 'position' => 'Y', 'department' => 'Teaching',
        'photo' => UploadedFile::fake()->create('evil.php', 10, 'application/x-php'),
    ])->assertSessionHasErrors('photo');
});

it('edits site text from settings and shows it on the page', function () {
    $this->actingAs(admin())->post('/admin/settings', ['site_name' => 'Enaboishu Sec', 'tagline' => 'Arusha'])
        ->assertRedirect();

    expect(Setting::where('key', 'site_name')->value('value'))->toBe('Enaboishu Sec');

    $this->get('/')->assertInertia(fn (Assert $page) => $page->where('site.site_name', 'Enaboishu Sec'));
});

it('hides inactive and future items from the public', function () {
    $this->actingAs(admin())->post('/admin/content/posts', [
        'title' => 'Hidden post', 'published_at' => now()->addDays(5)->toDateString(), 'active' => true,
    ]);
    $this->get('/news/hidden-post')->assertNotFound();
});

it('stores contact messages and ignores honeypot spam', function () {
    $this->post('/contact', ['name' => 'Parent', 'email' => 'p@example.com', 'body' => 'Hello'])->assertRedirect();
    $this->post('/contact', ['name' => 'Bot', 'email' => 'b@example.com', 'body' => 'spam', 'website' => 'http://x'])->assertRedirect();

    expect(Message::count())->toBe(1);
});

it('lets admins rename menu labels and headings, restoring defaults for cleared labels', function () {
    $this->actingAs(admin())->post('/admin/settings', [
        'nav_about' => 'Kuhusu Sisi',
        'news_eyebrow' => '',
        'form_button' => '',
    ])->assertRedirect();

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('site.nav_about', 'Kuhusu Sisi')
        ->where('site.news_eyebrow', null)          // optional text can be hidden
        ->where('site.form_button', 'Send message')); // required label falls back
});

it('uses the editable thank-you message on the contact form', function () {
    $this->actingAs(admin())->post('/admin/settings', ['form_success' => 'Asante! We will reply soon.']);

    $this->post('/contact', ['name' => 'Parent', 'email' => 'p@example.com', 'body' => 'Hello'])
        ->assertSessionHas('success', 'Asante! We will reply soon.');
});

it('stores uploads in the public folder, not storage', function () {
    expect(config('filesystems.disks.uploads.root'))->toBe(public_path('uploads'));
});

it('saves a news story with a cover, several gallery photos and cleaned formatting', function () {
    Storage::fake('uploads');

    $this->actingAs(admin())->post('/admin/content/posts', [
        'title' => 'Science Fair',
        'published_at' => now()->toDateString(),
        'active' => true,
        'body' => '<p>Students showed <strong>great</strong> work.</p><script>alert(1)</script><p onclick="x()">Hi</p>',
        'image' => UploadedFile::fake()->image('cover.jpg', 1600, 1000),
        'photos_new' => [
            UploadedFile::fake()->image('a.jpg'),
            UploadedFile::fake()->image('b.jpg'),
            UploadedFile::fake()->image('c.jpg'),
        ],
    ])->assertRedirect('/admin/content/posts');

    $post = Post::firstOrFail();
    expect($post->photos)->toHaveCount(3);
    foreach ($post->photos as $path) {
        Storage::disk('uploads')->assertExists($path);
    }
    expect($post->body)->toContain('<strong>great</strong>')
        ->not->toContain('<script')
        ->not->toContain('onclick');

    // Removing one photo and adding another keeps the rest.
    [$first, $second, $third] = $post->photos;
    $this->actingAs(admin())->post("/admin/content/posts/{$post->id}", [
        'title' => 'Science Fair', 'published_at' => now()->toDateString(), 'active' => true,
        'photos_keep' => [$first, $third],
        'photos_new' => [UploadedFile::fake()->image('d.jpg')],
    ])->assertRedirect();

    $post->refresh();
    expect($post->photos)->toHaveCount(3)->toContain($first, $third)->not->toContain($second);
    Storage::disk('uploads')->assertMissing($second);

    $this->get("/news/{$post->slug}")->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Site/Post')->has('post.photos', 3));
});

it('rejects non-image files in a gallery', function () {
    Storage::fake('uploads');

    $this->actingAs(admin())->post('/admin/content/events', [
        'title' => 'Sports Day', 'starts_at' => now()->addWeek()->toDateString(), 'active' => true,
        'photos_new' => [UploadedFile::fake()->create('notes.pdf', 20, 'application/pdf')],
    ])->assertSessionHasErrors('photos_new.0');
});

it('publishes articles and events with their own pages and shows them on the home page', function () {
    $this->actingAs(admin())->post('/admin/content/articles', [
        'title' => 'Reading for Pleasure', 'author' => 'Ms. Lyimo', 'published_at' => now()->toDateString(),
        'body' => '<h3>Why it matters</h3><p>Reading <em>widely</em> builds vocabulary.</p>', 'active' => true,
    ]);
    $this->actingAs(admin())->post('/admin/content/events', [
        'title' => 'Parents Day', 'starts_at' => now()->addDays(10)->toDateString(), 'time' => '9:00 am',
        'location' => 'Main hall', 'active' => true,
    ]);

    $article = Article::firstOrFail();
    $event = Event::firstOrFail();
    expect($event->slug)->toBe('parents-day');

    $this->get("/articles/{$article->slug}")->assertOk();
    $this->get("/events/{$event->slug}")->assertOk();

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('articles.0.title', 'Reading for Pleasure')
        ->where('events.0.title', 'Parents Day'));
});

it('cleans formatted text saved in site settings', function () {
    $this->actingAs(admin())->post('/admin/settings', [
        'home_welcome_text' => '<p><em>Karibu</em> <a href="javascript:alert(1)">x</a></p><iframe src="https://evil.test"></iframe>',
    ]);

    $value = Setting::where('key', 'home_welcome_text')->value('value');
    expect($value)->toContain('<em>Karibu</em>')->not->toContain('javascript:')->not->toContain('iframe');
});

it('records a staff member\'s department, class and description', function () {
    Storage::fake('uploads');

    $this->actingAs(admin())->post('/admin/content/staff', [
        'name' => 'Neema Laizer', 'position' => 'Biology Teacher', 'department' => 'Teaching',
        'academic_department' => 'Sciences', 'subjects' => 'Biology, Chemistry',
        'class_assigned' => 'Class teacher, Form 2A', 'bio' => 'Leads the school environment club.',
        'active' => true, 'photo' => UploadedFile::fake()->image('neema.jpg', 800, 1000),
    ])->assertRedirect('/admin/content/staff');

    $this->get('/staff')->assertInertia(fn (Assert $page) => $page
        ->where('staff.0.academic_department', 'Sciences')
        ->where('staff.0.class_assigned', 'Class teacher, Form 2A')
        ->where('staff.0.bio', 'Leads the school environment club.'));
});
