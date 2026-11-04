<?php

use App\Mail\AdminAlert;
use App\Models\{Enquiry, Message, NotificationRecipient, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    \App\Support\Site::forget();
    $this->seed([\Database\Seeders\RolesSeeder::class]);
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

function anEnquiry(array $extra = []): Enquiry
{
    return Enquiry::create(array_merge(['reference' => 'ENQ-2026-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT), 'student_name' => 'Neema Laizer',
        'class_applying' => 'Form I', 'guardian_name' => 'Joseph', 'phone' => '0712345678', 'status' => 'New'], $extra));
}

it('gives the dashboard everything needed to open, edit and delete an enquiry or message in place', function () {
    $enquiry = anEnquiry(['email' => 'joseph@example.com', 'message' => 'We would like a visit']);
    Message::create(['name' => 'Asha', 'email' => 'asha@example.com', 'subject' => 'Fees', 'body' => 'What are the fees?']);

    $this->actingAs($this->admin)->get('/admin')->assertInertia(fn (Assert $page) => $page
        ->where('enquiries.0.id', $enquiry->id)
        ->where('enquiries.0.guardian_name', 'Joseph')
        ->where('enquiries.0.message', 'We would like a visit')
        ->where('statusList', Enquiry::STATUSES)
        ->where('messages.0.body', 'What are the fees?')
        ->where('messages.0.email', 'asha@example.com'));
});

it('saves a status change made from the dashboard and comes back to the dashboard', function () {
    $enquiry = anEnquiry();

    $this->actingAs($this->admin)->from('/admin')->patch("/admin/enquiries/{$enquiry->id}", ['status' => 'Contacted', 'notes' => 'Called on Monday'])
        ->assertRedirect('/admin')->assertSessionHas('success');

    expect($enquiry->fresh())->status->toBe('Contacted')->notes->toBe('Called on Monday');
});

it('returns to the dashboard after deleting from it, and to the list after deleting from the list', function () {
    $this->actingAs($this->admin)->from('/admin')->delete('/admin/enquiries/'.anEnquiry()->id)->assertRedirect('/admin');

    $other = anEnquiry();
    $this->actingAs($this->admin)->from("/admin/enquiries?enquiry={$other->id}")->delete("/admin/enquiries/{$other->id}")->assertRedirect(route('admin.enquiries'));
    expect(Enquiry::count())->toBe(0);
});

it('opens an enquiry from its address even when it is not on the first page of the list', function () {
    $first = anEnquiry(['reference' => 'ENQ-2026-0001']);
    $this->travel(1)->minutes();
    foreach (range(2, 30) as $i) {
        anEnquiry(['reference' => sprintf('ENQ-2026-%04d', $i)]);
    }

    $this->actingAs($this->admin)->get("/admin/enquiries?enquiry={$first->id}")->assertInertia(fn (Assert $page) => $page
        ->where('filters.enquiry', $first->id)
        ->where('opened.reference', 'ENQ-2026-0001'));
});

it('marks a message as read and deletes it from the dashboard', function () {
    $message = Message::create(['name' => 'Asha', 'email' => 'asha@example.com', 'body' => 'Hello']);

    $this->actingAs($this->admin)->from('/admin')->patch("/admin/messages/{$message->id}/read")->assertRedirect('/admin');
    expect($message->fresh()->read_at)->not->toBeNull();

    $this->actingAs($this->admin)->from('/admin')->delete("/admin/messages/{$message->id}")->assertRedirect('/admin');
    expect(Message::count())->toBe(0);
});

it('never links to "?open=", which some hosting firewalls block', function () {
    Mail::fake();
    NotificationRecipient::create(['name' => 'Office', 'email' => 'office@example.com']);

    $this->post('/apply', ['student_name' => 'Baraka', 'class_applying' => 'Form I', 'guardian_name' => 'Mama Baraka', 'phone' => '0712 345 678', 'consent' => '1']);

    $id = Enquiry::firstOrFail()->id;
    Mail::assertSent(AdminAlert::class, fn ($m) => $m->actionUrl === route('admin.enquiries', ['enquiry' => $id]));
    foreach (glob(resource_path('js/Pages/Admin/*.tsx')) as $file) {
        expect(file_get_contents($file))->not->toContain('open: e.id');
    }
});
