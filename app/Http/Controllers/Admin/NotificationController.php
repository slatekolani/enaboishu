<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\SubmissionReceived;
use App\Models\NotificationLog;
use App\Models\NotificationRecipient;
use App\Support\Audit;
use App\Support\Notifier;
use App\Support\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    private const PROBLEMS = ['failed', 'skipped'];

    public function index(Request $request)
    {
        $status = $request->query('status') === 'problems' ? 'problems' : null;

        return Inertia::render('Admin/Notifications', [
            'mail' => ['driver' => config('mail.default'), 'from' => config('mail.from.address'), 'host' => config('mail.mailers.smtp.host')],
            'recipients' => NotificationRecipient::where('active', true)->orderBy('sort')->get(['id', 'name', 'title', 'email']),
            'logs' => NotificationLog::query()
                ->when($status, fn ($q) => $q->whereIn('status', self::PROBLEMS))
                ->latest('id')->paginate(30)->withQueryString(),
            'today' => [
                'email' => NotificationLog::whereIn('status', ['sent', 'logged'])->whereDate('created_at', today())->count(),
                'problems' => NotificationLog::where('status', 'failed')->whereDate('created_at', today())->count(),
            ],
            'filters' => ['status' => $status],
        ]);
    }

    /** Send a test email to check that the school's mail account is set up. */
    public function test(Request $request)
    {
        $data = $request->validate(['to' => 'required|email|max:160']);

        $school = Site::all('en')['site_name'] ?? config('app.name');
        $log = Notifier::email('test', 'test', null, $data['to'], new SubmissionReceived(
            subjectLine: "Test email from the {$school} website",
            paragraphs: ['This is a test message from the website.', 'If you can read it, email notifications are working.'],
            signoff: [$school],
        ));
        Audit::log("Sent a test email to {$log->to}", null, [], 'created');

        return back()->with(in_array($log->status, self::PROBLEMS, true) ? 'error' : 'success', match ($log->status) {
            'sent' => 'Test email sent to '.$log->to.'.',
            'logged' => 'Written to the log file only: set MAIL_MAILER=smtp in .env to deliver emails.',
            default => 'Not sent: '.$log->error,
        });
    }
}
