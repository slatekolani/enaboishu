<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class HistoryController extends Controller
{
    public function __invoke(Request $request)
    {
        $userId = (int) $request->query('user');

        $activities = Activity::with('causer')
            ->where('log_name', 'admin')
            ->when($userId, fn ($q) => $q->where('causer_id', $userId)->where('causer_type', User::class))
            ->latest('id')
            ->paginate(40)
            ->withQueryString()
            ->through(fn (Activity $a) => [
                'id' => $a->id,
                'description' => $a->description,
                'event' => $a->event,
                'who' => $a->causer?->name ?? 'System',
                'fields' => $a->properties['fields'] ?? [],
                'resource' => $a->properties['resource'] ?? null,
                'at' => $a->created_at->toIso8601String(),
            ]);

        return Inertia::render('Admin/History', [
            'activities' => $activities,
            'users' => User::orderBy('name')->get(['id', 'name']),
            'filters' => ['user' => $userId ?: null],
        ]);
    }
}
