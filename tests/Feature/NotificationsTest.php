<?php

use App\Mail\{AdminAlert, SubmissionReceived};
use App\Models\{NotificationLog, NotificationRecipient, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{Http, Mail};
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['mail.default' => 'array']);
    Mail::fake();
    Http::fake(); // the website must not call any outside service (there is no SMS any more)
});

function enquiry(array $extra = []): array
{
    return array_merge(['student_name' => 'Neema Laizer', 'class_applying' => 'Form I', 'guardian_name' => 'Joseph Laizer',
        'phone' => '0712 345 678', 'email' => 'joseph@example.com', 'consent' => '1'], $extra);
}

it('confirms an admission enquiry to the parent by email, and alerts the school', function () {
    NotificationRecipient::create(['name' => 'Head of School', 'email' => 'head@example.com']);
    NotificationRecipient::create(['name' => 'Secretary', 'email' => 'secretary@example.com']);
    NotificationRecipient::create(['name' => 'Not for enquiries', 'email' => 'other@example.com', 'on_enquiries' => false]);

    $this->post('/apply', enquiry())->assertRedirect('/apply');
    $ref = \App\Models\Enquiry::firstOrFail()->reference;

    Mail::assertSent(SubmissionReceived::class, fn ($m) => $m->hasTo('joseph@example.com') && str_contains($m->subjectLine, $ref) && $m->reference === $ref);
    Mail::assertSent(AdminAlert::class, fn ($m) => $m->hasTo('head@example.com'));
    Mail::assertSent(AdminAlert::class, fn ($m) => $m->hasTo('secretary@example.com'));
    Mail::assertNotSent(AdminAlert::class, fn ($m) => $m->hasTo('other@example.com'));
    Http::assertNothingSent();

    expect(NotificationLog::where('status', 'sent')->count())->toBe(3)
        ->and(NotificationLog::where('channel', '!=', 'email')->count())->toBe(0);
});

it('sends the confirmation in Kiswahili to a visitor using the Kiswahili site', function () {
    $this->withSession(['locale' => 'sw'])->post('/apply', enquiry());

    Mail::assertSent(SubmissionReceived::class, fn ($m) => str_starts_with($m->subjectLine, 'Tumepokea maombi yako ya udahili'));
});

it('confirms contact messages too', function () {
    NotificationRecipient::create(['name' => 'Office', 'email' => 'office@example.com']);

    $this->post('/contact', ['name' => 'Asha', 'email' => 'asha@example.com', 'phone' => '0765 111 222', 'body' => 'Hello'])->assertRedirect();
    Mail::assertSent(SubmissionReceived::class, fn ($m) => $m->hasTo('asha@example.com'));
    Mail::assertSent(AdminAlert::class, fn ($m) => $m->hasTo('office@example.com') && $m->heading === 'New message from the website');

});

it('sends nothing to a visitor who left no email address, and still keeps the enquiry', function () {
    $this->post('/apply', enquiry(['email' => null]))->assertRedirect('/apply')->assertSessionHas('enquiry_reference');

    expect(\App\Models\Enquiry::count())->toBe(1);
    Mail::assertNotSent(SubmissionReceived::class);
});

it('keeps the enquiry and logs the problem when the mail server fails', function () {
    Mail::shouldReceive('to')->andThrow(new RuntimeException('Connection refused'));

    $this->post('/apply', enquiry())->assertRedirect('/apply')->assertSessionHas('enquiry_reference');

    expect(\App\Models\Enquiry::count())->toBe(1);
    $log = NotificationLog::firstOrFail();
    expect($log->status)->toBe('failed')->and($log->error)->toContain('Connection refused');
});

it('gives administrators an email notifications page with test sending', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::findOrCreate('admin'));

    $this->actingAs($admin)->get('/admin/notifications')->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Notifications')->has('mail.from')->missing('sms'));

    $this->actingAs($admin)->post('/admin/notifications/test', ['to' => 'me@example.com'])->assertSessionHas('success');
    Mail::assertSent(SubmissionReceived::class, fn ($m) => $m->hasTo('me@example.com'));
    $this->actingAs($admin)->post('/admin/notifications/test', ['to' => 'not-an-email'])->assertSessionHasErrors('to');

    $editor = User::factory()->create();
    $editor->assignRole(Role::findOrCreate('editor'));
    $this->actingAs($editor)->get('/admin/notifications')->assertForbidden();
    $this->actingAs($editor)->get('/admin/content/recipients')->assertForbidden();
});

it('explains a wrong phone number in plain words, in the visitor\'s language', function () {
    $this->post('/contact', ['name' => 'A', 'email' => 'a@example.com', 'phone' => 'abc', 'body' => 'Hi'])
        ->assertSessionHasErrors(['phone' => 'Please enter a valid phone number, e.g. 0712 345 678.']);
    $this->withSession(['locale' => 'sw'])->post('/apply', ['student_name' => 'A', 'class_applying' => 'Form I', 'guardian_name' => 'B', 'phone' => 'x', 'consent' => '1'])
        ->assertSessionHasErrors(['phone' => 'Tafadhali weka namba sahihi ya simu, mfano 0712 345 678.']);
});
