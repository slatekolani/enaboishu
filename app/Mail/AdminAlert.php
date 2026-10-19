<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** A short alert to the school office: "New admission enquiry", "New message", … */
class AdminAlert extends Mailable
{
    use Queueable;

    /** @param array<string, string|null> $details label => value */
    public function __construct(
        public string $heading,
        public array $details,
        public string $actionUrl,
        public string $actionLabel = 'Open in the admin panel',
        public ?string $replyToAddress = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->heading.' — '.config('app.name'),
            replyTo: $this->replyToAddress ? [$this->replyToAddress] : [],
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.admin-alert');
    }
}
