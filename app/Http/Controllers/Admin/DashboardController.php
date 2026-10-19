<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Enquiry;
use App\Models\Event;
use App\Models\Message;
use App\Models\Notice;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    /** Content cards, grouped the same way as the side menu. */
    private const GROUPS = [
        'Website' => ['pages', 'notices', 'slides', 'stats', 'testimonials'],
        'School' => ['staff', 'programs', 'results', 'facilities', 'core_values', 'downloads'],
        'Student life' => ['clubs', 'leaders', 'alumni'],
        'Updates' => ['posts', 'articles', 'events', 'gallery'],
    ];

    public function __invoke()
    {
        $user = auth()->user();
        $admin = $user->hasRole('admin');
        $monthStart = now()->startOfMonth();

        $published = Post::where('created_at', '>=', $monthStart)->count() + Article::where('created_at', '>=', $monthStart)->count();
        $upcoming = Event::where('active', true)->whereDate('starts_at', '>=', today());

        $figures = $admin ? [
            ['label' => 'New admission enquiries', 'value' => Enquiry::where('status', 'New')->count(), 'url' => route('admin.enquiries'), 'note' => Enquiry::where('created_at', '>=', now()->subDays(7))->count().' in the last 7 days'],
            ['label' => 'Unread messages', 'value' => Message::whereNull('read_at')->count(), 'url' => route('admin.messages'), 'note' => Message::count().' messages in total'],
            ['label' => 'News & articles this month', 'value' => $published, 'url' => route('admin.resource.index', 'posts'), 'note' => 'Since '.$monthStart->format('j F')],
            ['label' => 'Upcoming events', 'value' => (clone $upcoming)->count(), 'url' => route('admin.resource.index', 'events'), 'note' => $this->nextEventNote()],
        ] : [
            ['label' => 'Upcoming events', 'value' => (clone $upcoming)->count(), 'url' => route('admin.resource.index', 'events'), 'note' => $this->nextEventNote()],
            ['label' => 'News & articles this month', 'value' => $published, 'url' => route('admin.resource.index', 'posts'), 'note' => 'Since '.$monthStart->format('j F')],
            ['label' => 'Notices showing now', 'value' => $this->liveNotices(), 'url' => route('admin.resource.index', 'notices'), 'note' => 'On the notice bar'],
            ['label' => 'My changes this week', 'value' => Activity::where('log_name', 'admin')->where('causer_id', $user->id)->where('causer_type', User::class)->where('created_at', '>=', now()->subDays(7))->count(), 'url' => route('admin.dashboard'), 'note' => 'Last 7 days'],
        ];

        return Inertia::render('Admin/Dashboard', [
            'isAdmin' => $admin,
            'firstName' => explode(' ', trim($user->name))[0],
            'figures' => $figures,
            'trend' => $admin ? $this->enquiryTrend() : [],
            'statuses' => $admin ? $this->enquiryStatuses() : [],
            'enquiries' => $admin ? Enquiry::latest()->take(5)->get(['id', 'reference', 'student_name', 'class_applying', 'status', 'created_at']) : [],
            'messages' => $admin ? Message::latest()->take(5)->get(['id', 'name', 'subject', 'created_at', 'read_at']) : [],
            'events' => (clone $upcoming)->orderBy('starts_at')->take(4)->get(['id', 'title', 'starts_at', 'location']),
            'activity' => $this->activity($admin ? null : $user->id),
            'groups' => $this->groups($admin),
        ]);
    }

    private function nextEventNote(): string
    {
        $next = Event::where('active', true)->whereDate('starts_at', '>=', today())->orderBy('starts_at')->first();

        return $next ? 'Next: '.Carbon::parse($next->starts_at)->format('j M') : 'None scheduled';
    }

    private function liveNotices(): int
    {
        return Notice::where('active', true)
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhereDate('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhereDate('ends_at', '>=', now()))
            ->count();
    }

    /** Enquiries received in each of the last eight weeks (Monday to Sunday), oldest first. */
    private function enquiryTrend(): array
    {
        $start = now()->startOfWeek()->subWeeks(7);
        $dates = Enquiry::where('created_at', '>=', $start)->pluck('created_at');

        return collect(range(0, 7))->map(function ($i) use ($start, $dates) {
            $from = $start->copy()->addWeeks($i);
            $to = $from->copy()->addWeek();

            return [
                'label' => $from->format('j M'),
                'count' => $dates->filter(fn ($d) => $d >= $from && $d < $to)->count(),
            ];
        })->all();
    }

    private function enquiryStatuses(): array
    {
        $counts = Enquiry::selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');

        return collect(Enquiry::STATUSES)->map(fn ($s) => ['status' => $s, 'count' => (int) ($counts[$s] ?? 0)])->all();
    }

    private function activity(?int $userId): array
    {
        $resources = config('cms.resources');

        return Activity::with('causer')->where('log_name', 'admin')
            ->when($userId, fn ($q) => $q->where('causer_id', $userId)->where('causer_type', User::class))
            ->latest('id')->take(6)->get()
            ->map(fn (Activity $a) => [
                'id' => $a->id,
                'who' => $a->causer?->name ?? 'System',
                'event' => $a->event,
                'description' => $a->description,
                'area' => $resources[$a->properties['resource'] ?? '']['label'] ?? null,
                'at' => $a->created_at->toIso8601String(),
            ])->all();
    }

    private function groups(bool $admin): array
    {
        $resources = config('cms.resources');

        return collect(self::GROUPS)->map(fn ($keys, $group) => [
            'group' => $group,
            'items' => collect($keys)
                ->filter(fn ($k) => isset($resources[$k]) && ($admin || ! empty($resources[$k]['editor'])))
                ->map(function ($k) use ($resources) {
                    $r = $resources[$k];
                    $updated = $r['model']::max('updated_at');

                    return [
                        'key' => $k,
                        'label' => $r['label'],
                        'count' => $r['model']::count(),
                        'updated' => $updated ? Carbon::parse($updated)->toIso8601String() : null,
                        'url' => isset($r['index_route']) ? route($r['index_route']) : route('admin.resource.index', $k),
                        'create' => route('admin.resource.create', $k),
                    ];
                })->values()->all(),
        ])->filter(fn ($g) => count($g['items']))->values()->all();
    }
}
