<?php

namespace App\Support;

use App\Mail\AdminAlert;
use App\Mail\SubmissionReceived;
use App\Models\NotificationLog;
use App\Models\NotificationRecipient;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Email confirmations and alerts for website submissions (admission enquiries and contact messages).
 *
 * The person who submitted gets a confirmation email (when they gave an address), in the language
 * they were using. The school's notification recipients get an alert email. Every attempt is written
 * to the notification log. Nothing here ever throws: a failed email must not lose the submission.
 */
class Notifier
{
    /**
     * @param 'enquiry'|'message' $event
     * @param array{reference?:?string, name:string, email?:?string, phone?:?string, student?:?string, class?:?string,
     *              subject?:?string, year?:?string, staff_heading:string, staff_details:array, admin_url:string} $data
     */
    public static function submission(string $event, array $data, string $locale = 'en'): void
    {
        try {
            $vars = self::vars($data);
            self::confirmSender($event, $data, $vars, $locale);
            self::alertStaff($event, $data);
        } catch (\Throwable $e) {
            Log::error("Notifications for {$event} failed: ".$e->getMessage());
        }
    }

    /* ---------------- sender ---------------- */

    private static function confirmSender(string $event, array $data, array $vars, string $locale): void
    {
        $text = Site::all($locale);

        if (filled($data['email'] ?? null)) {
            $paragraphs = preg_split('/\R\s*\R/', self::fill($text["email_{$event}_body"] ?? '', $vars));
            self::email('sender', $event, $data['reference'] ?? null, $data['email'], new SubmissionReceived(
                subjectLine: self::fill($text["email_{$event}_subject"] ?? '', $vars),
                paragraphs: array_values(array_filter(array_map('trim', $paragraphs))),
                signoff: preg_split('/\R/', self::fill($text['email_signoff'] ?? '', $vars)),
                reference: $event === 'enquiry' ? ($data['reference'] ?? null) : null,
                schoolEmail: self::safeEmail(Site::all('en')['email'] ?? null),
            ));
        }
    }

    /* ---------------- staff ---------------- */

    private static function alertStaff(string $event, array $data): void
    {
        foreach (NotificationRecipient::query()->for($event)->orderBy('sort')->get() as $person) {
            if (filled($person->email)) {
                self::email('staff', $event, $data['reference'] ?? null, $person->email, new AdminAlert(
                    $data['staff_heading'], $data['staff_details'], $data['admin_url'],
                    replyToAddress: self::safeEmail($data['email'] ?? null),
                ));
            }
        }
    }

    /* ---------------- channels ---------------- */

    public static function email(string $audience, string $event, ?string $reference, string $address, \Illuminate\Mail\Mailable $mail): NotificationLog
    {
        $to = self::safeEmail($address);
        $log = NotificationLog::create([
            'channel' => 'email', 'audience' => $audience, 'event' => $event, 'reference' => $reference,
            'to' => $to ?? $address, 'subject' => $mail instanceof SubmissionReceived ? $mail->subjectLine : ($mail->heading ?? null),
            'status' => 'pending',
        ]);

        if (! $to) {
            $log->update(['status' => 'skipped', 'error' => 'Not a valid email address']);

            return $log;
        }

        try {
            Mail::to($to)->send($mail);
            $log->update(['status' => config('mail.default') === 'log' ? 'logged' : 'sent']);
        } catch (\Throwable $e) {
            $log->update(['status' => 'failed', 'error' => Str::limit($e->getMessage(), 500)]);
        }

        return $log;
    }

    /* ---------------- helpers ---------------- */

    private static function vars(array $data): array
    {
        $site = Site::all('en');

        return [
            'school' => $site['site_name'] ?? config('app.name'),
            'name' => self::clean($data['name'] ?? ''),
            'student' => self::clean($data['student'] ?? ''),
            'class' => $data['class'] ?? '',
            'reference' => $data['reference'] ?? '',
            'phone' => self::clean($data['phone'] ?? ''),
            'email' => $data['email'] ?? '',
            'subject' => self::clean($data['subject'] ?? ''),
            'year' => (string) ($data['year'] ?? ''),
        ];
    }

    public static function fill(string $template, array $vars): string
    {
        $out = strtr($template, collect($vars)->mapWithKeys(fn ($v, $k) => ['{'.$k.'}' => (string) $v])->all());
        // Tidy up after empty placeholders, e.g. "Parent: Neema, ." or "()".
        $out = preg_replace(['/\(\s*\)/', '/ +([,.])/', '/[ \t]{2,}/'], ['', '$1', ' '], $out);

        return trim($out);
    }

    /** Names typed by visitors go into messages to other people: keep them short and link-free. */
    private static function clean(string $value): string
    {
        $value = preg_replace('~(https?://|www\.)\S+~i', '', $value);

        return Str::limit(trim(preg_replace('/\s+/', ' ', $value)), 60, '…');
    }

    private static function safeEmail(?string $email): ?string
    {
        return $email && ! preg_match('/[\r\n,;<>]/', $email) && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }
}
