<?php

namespace App\Http\Middleware;

use App\Models\Notice;
use App\Models\Page;
use App\Support\Site;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $isAdmin = $request->is('admin*');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()?->only(['id', 'name', 'email', 'email_verified_at']),
                'isAdmin' => (bool) $request->user()?->hasRole('admin'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'mediaBase' => asset('uploads'),
            'crest' => asset('images/crest.png'),
            // Public settings are only needed by the public site.
            'locale' => app()->getLocale(),
            'site' => fn () => $isAdmin ? ['site_name' => Site::all('en')['site_name']] : $this->publicSettings(),
            // School-created pages that appear in the menu and footer.
            'menuPages' => fn () => $isAdmin ? [] : Page::where('active', true)->where('menu_group', '!=', 'Not in the menu')
                ->orderBy('sort')->orderBy('id')->get(['id', 'title', 'slug', 'menu_group', 'translations']),
            'notices' => fn () => $isAdmin ? [] : Notice::where('active', true)
                ->where(fn ($q) => $q->whereNull('starts_at')->orWhereDate('starts_at', '<=', now()))
                ->where(fn ($q) => $q->whereNull('ends_at')->orWhereDate('ends_at', '>=', now()))
                ->orderBy('sort')->orderByDesc('id')->get(['id', 'message', 'tone', 'link_label', 'link_url', 'updated_at', 'translations']),
            'unreadMessages' => fn () => $isAdmin && $request->user()?->hasRole('admin')
                ? \App\Models\Message::whereNull('read_at')->count()
                : 0,
            'newEnquiries' => fn () => $isAdmin && $request->user()?->hasRole('admin')
                ? \App\Models\Enquiry::where('status', 'New')->count()
                : 0,
        ];
    }

    private function publicSettings(): array
    {
        $s = Site::all(app()->getLocale());
        // The map link is rendered in an iframe, so only accept Google Maps embeds.
        if (! empty($s['map_url']) && ! str_starts_with($s['map_url'], 'https://www.google.com/maps/embed')) {
            $s['map_url'] = null;
        }

        return $s;
    }
}
