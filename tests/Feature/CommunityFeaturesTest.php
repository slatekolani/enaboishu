<?php

use App\Mail\AdminAlert;
use App\Models\{Alumnus, Club, Enquiry, Setting, StudentLeader, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function withRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole(Role::findOrCreate($role));

    return $user;
}

function alertsTo(string ...$emails): void
{
    foreach ($emails as $email) {
        \App\Models\NotificationRecipient::create(['name' => $email, 'email' => $email]);
    }
}

/* ---------- Student life ---------- */

it('shows clubs, sports and student leaders', function () {
    Club::create(['name' => 'Debate Club', 'kind' => 'Club', 'patron' => 'Mr. Mollel']);
    Club::create(['name' => 'Football', 'kind' => 'Sport']);
    Club::create(['name' => 'Hidden club', 'active' => false]);
    StudentLeader::create(['name' => 'Head Prefect Example', 'role' => 'Head Prefect']);

    $this->get('/student-life')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Site/StudentLife')
        ->has('clubs', 2)
        ->has('leaders', 1));
});

/* ---------- Alumni ---------- */

it('shows only featured alumni stories the school approved and the person agreed to, and never their contact details', function () {
    Alumnus::create(['name' => 'Listed Person', 'graduation_year' => 2015, 'email' => 'listed@example.com', 'phone' => '0700000000', 'approved' => true, 'show_publicly' => true, 'featured' => true]);
    Alumnus::create(['name' => 'Not Approved', 'approved' => false, 'show_publicly' => true, 'featured' => true]);
    Alumnus::create(['name' => 'No Consent', 'approved' => true, 'show_publicly' => false, 'featured' => true]);
    Alumnus::create(['name' => 'Not Featured', 'approved' => true, 'show_publicly' => true]);

    $response = $this->get('/alumni');
    $response->assertInertia(fn (Assert $page) => $page
        ->has('featured', 1)
        ->where('featured.0.name', 'Listed Person')
        ->missing('featured.0.email')
        ->missing('featured.0.phone')
        ->missing('directory'));
    expect($response->getContent())->not->toContain('listed@example.com')->not->toContain('0700000000');
});

it('no longer takes alumni sign-ups from the website', function () {
    $this->post('/alumni', ['name' => 'New Alum', 'email' => 'alum@example.com'])->assertStatus(405);
    expect(Alumnus::count())->toBe(0);
});

/* ---------- Admission enquiries ---------- */

it('accepts an online admission enquiry with a reference number and alerts the office', function () {
    Mail::fake();
    alertsTo('admissions@example.com', 'head@example.com');

    $this->post('/apply', [
        'student_name' => 'Neema Example', 'class_applying' => 'Form I', 'guardian_name' => 'Parent Example',
        'phone' => '0712 345 678', 'consent' => '1',
    ])->assertRedirect('/apply')->assertSessionHas('enquiry_reference');

    $enquiry = Enquiry::firstOrFail();
    expect($enquiry->reference)->toMatch('/^ENQ-\d{4}-0001$/')->and($enquiry->status)->toBe('New');

    $this->get('/apply')->assertInertia(fn (Assert $page) => $page->where('reference', $enquiry->reference));

    foreach (['admissions@example.com', 'head@example.com'] as $to) {
        Mail::assertSent(AdminAlert::class, fn ($mail) => $mail->hasTo($to) && $mail->details['Reference'] === $enquiry->reference);
    }
});

it('requires the essentials and consent on the enquiry form', function () {
    $this->post('/apply', ['student_name' => 'X', 'phone' => 'abc'])
        ->assertSessionHasErrors(['class_applying', 'guardian_name', 'phone', 'consent']);
    expect(Enquiry::count())->toBe(0);
});

it('still accepts the enquiry when the email server is down', function () {
    alertsTo('office@example.com');
    Mail::shouldReceive('to')->andThrow(new RuntimeException('SMTP unreachable'));

    $this->post('/apply', ['student_name' => 'A', 'class_applying' => 'Form II', 'guardian_name' => 'B', 'phone' => '0712345678', 'consent' => '1'])
        ->assertRedirect('/apply');
    expect(Enquiry::count())->toBe(1);
});

it('lets the office move an enquiry along, keep notes and export a spreadsheet', function () {
    $enquiry = Enquiry::create(['reference' => 'ENQ-2026-0001', 'student_name' => '=HYPERLINK("x")', 'guardian_name' => 'P', 'phone' => '0712345678', 'class_applying' => 'Form I']);
    $admin = withRole('admin');

    $this->actingAs($admin)->patch("/admin/enquiries/{$enquiry->id}", ['status' => 'Visit booked', 'notes' => 'Friday 10 am'])->assertRedirect();
    expect($enquiry->fresh()->status)->toBe('Visit booked')->and($enquiry->fresh()->notes)->toBe('Friday 10 am');

    $csv = $this->actingAs($admin)->get('/admin/enquiries/export')->assertOk()->streamedContent();
    expect($csv)->toContain('Reference,Received,Status')->toContain('ENQ-2026-0001')
        ->toContain("'=HYPERLINK"); // formula neutralised for Excel

    expect(Activity::where('description', 'like', '%ENQ-2026-0001%Visit booked%')->exists())->toBeTrue();
});

/* ---------- Roles ---------- */

it('limits editors to day-to-day content', function () {
    $editor = withRole('editor');

    foreach (['/admin', '/admin/content/posts', '/admin/content/events', '/admin/content/notices', '/admin/content/clubs', '/admin/content/gallery'] as $allowed) {
        $this->actingAs($editor)->get($allowed)->assertOk();
    }
    foreach (['/admin/settings', '/admin/messages', '/admin/enquiries', '/admin/users', '/admin/history', '/admin/content/alumni', '/admin/content/slides', '/admin/content/staff', '/admin/content/results'] as $blocked) {
        $this->actingAs($editor)->get($blocked)->assertForbidden();
    }
    $this->actingAs($editor)->post('/admin/content/slides', ['title' => 'x'])->assertForbidden();
});

it('lets an administrator create editors, but never remove the last administrator', function () {
    $admin = withRole('admin');

    $this->actingAs($admin)->post('/admin/users', [
        'name' => 'Teacher Editor', 'email' => 'teacher@example.com', 'role' => 'editor',
        'password' => 'a-long-password-1', 'password_confirmation' => 'a-long-password-1',
    ])->assertRedirect();
    expect(User::where('email', 'teacher@example.com')->firstOrFail()->hasRole('editor'))->toBeTrue();

    $this->actingAs($admin)->delete("/admin/users/{$admin->id}")->assertSessionHasErrors('user');
    $this->actingAs($admin)->patch("/admin/users/{$admin->id}", ['name' => $admin->name, 'email' => $admin->email, 'role' => 'editor'])
        ->assertSessionHasErrors('role');
    expect($admin->fresh()->hasRole('admin'))->toBeTrue();
});

/* ---------- Change history ---------- */

it('records who changed what', function () {
    $editor = withRole('editor');
    $editor->update(['name' => 'Mwalimu Editor']);

    $this->actingAs($editor)->post('/admin/content/posts', ['title' => 'Sports day', 'published_at' => now()->toDateString(), 'active' => true]);
    $post = \App\Models\Post::firstOrFail();
    $this->actingAs($editor)->post("/admin/content/posts/{$post->id}", ['title' => 'Sports day results', 'published_at' => now()->toDateString(), 'active' => true]);
    $this->actingAs(withRole('admin'))->post('/admin/settings', ['tagline' => 'Arusha']);

    $this->actingAs(withRole('admin'))->get('/admin/history')->assertInertia(fn (Assert $page) => $page
        ->where('activities.data.0.description', 'Edited site settings')
        ->where('activities.data.1.who', 'Mwalimu Editor')
        ->where('activities.data.1.fields', ['Headline'])
        ->where('activities.data.2.description', 'Added news story “Sports day”'));
});

it('never lets a visitor inject email headers through the reply-to address', function () {
    Mail::fake();
    alertsTo('office@example.com');
    $base = ['name' => 'P', 'staff_heading' => 'Test', 'staff_details' => ['A' => 'b'], 'admin_url' => 'https://example.com'];

    \App\Support\Notifier::submission('message', $base + ['email' => "parent@example.com\r\nBcc: victim@example.com"]);
    \App\Support\Notifier::submission('message', $base + ['email' => 'parent@example.com']);

    $alerts = Mail::sent(AdminAlert::class)->values();
    expect($alerts)->toHaveCount(2)
        ->and($alerts[0]->replyToAddress)->toBeNull()
        ->and($alerts[1]->replyToAddress)->toBe('parent@example.com');
    // The forged address never receives a confirmation either.
    Mail::assertNotSent(\App\Mail\SubmissionReceived::class, fn ($m) => str_contains(implode(',', array_column($m->to, 'address')), 'victim'));
});
