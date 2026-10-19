<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** "We have received your …" confirmation sent to the person who filled in a website form. */
class SubmissionReceived extends Mailable
{
    use Queueable;

    /** @param string[] $paragraphs */
    public function __construct(
        public string $subjectLine,
        public array $paragraphs,
        public array $signoff,
        public ?string $reference = null,
        public ?string $schoolEmail = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
            replyTo: $this->schoolEmail ? [$this->schoolEmail] : [],
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.submission-received');
    }
}
