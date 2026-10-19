<?php

use App\Models\{Article, Event, Post, Setting, Slide, StaffMember};
use App\Support\Site;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('fills the site with demo content and removes it again without a trace', function () {
    Storage::fake('uploads'); // never touch the real public/uploads folder from a test
    $this->seed([\Database\Seeders\RolesSeeder::class, \Database\Seeders\SiteSeeder::class]);
    Setting::create(['key' => 'phone', 'value' => '+255 111 111 111']); // the school's own value

    $before = ['slides' => Slide::where('active', true)->pluck('id')->all(), 'posts' => Post::count(), 'staff' => StaffMember::count(), 'articles' => Article::count()];

    $this->artisan('demo:seed')->assertSuccessful();
    Site::forget();
    expect(Site::all()['phone'])->toBe('+255 700 000 000')
        ->and(Post::count())->toBe($before['posts'] + 5)
        ->and(StaffMember::count())->toBe(8)
        ->and(Event::count())->toBe(5)
        ->and(Slide::where('active', true)->count())->toBe(3);

    // Every page shows the demo content without errors.
    foreach (['/', '/about', '/staff', '/student-life', '/alumni', '/academics', '/results', '/downloads', '/news', '/articles', '/events', '/gallery', '/apply'] as $page) {
        $this->get($page)->assertOk();
    }

    $this->artisan('demo:seed')->assertFailed(); // never installed twice

    $this->artisan('demo:clear')->assertSuccessful();
    Site::forget();
    expect(Site::all()['phone'])->toBe('+255 111 111 111')
        ->and(Setting::where('key', 'head_photo')->exists())->toBeFalse()
        ->and(Slide::where('active', true)->pluck('id')->all())->toBe($before['slides'])
        ->and(Post::count())->toBe($before['posts'])
        ->and(StaffMember::count())->toBe($before['staff'])
        ->and(Article::count())->toBe($before['articles']);
});
