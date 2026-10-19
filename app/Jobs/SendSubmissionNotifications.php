<?php

namespace App\Jobs;

use App\Support\Notifier;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Sends the confirmations and staff alerts for one website submission.
 * With the default "sync" queue it runs straight after the page has been sent to the visitor (defer);
 * with a real queue (QUEUE_CONNECTION=database + a worker) it runs in the background.
 */
class SendSubmissionNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $event, public array $data, public string $locale) {}

    public function handle(): void
    {
        Notifier::submission($this->event, $this->data, $this->locale);
    }

    public static function fire(string $event, array $data): void
    {
        $job = new self($event, $data, app()->getLocale());

        if (config('queue.default') === 'sync') {
            // Run once the page has been sent, so the visitor does not wait for the mail server.
            \Illuminate\Support\defer(fn () => dispatch_sync($job));
        } else {
            dispatch($job);
        }
    }
}
