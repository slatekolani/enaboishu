<?php

namespace App\Http\Middleware;

use App\Support\Site;
use Closure;
use Illuminate\Http\Request;

/** Public pages use the visitor's chosen language (or ?lang=en|sw); the admin panel stays in English. */
class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->is('admin*')) {
            $default = (Site::all('en')['default_language'] ?? 'English') === 'Kiswahili' ? 'sw' : 'en';
            // ?lang=sw gives each language its own address (used by search engines and shared links).
            $chosen = $request->query('lang');
            if (is_string($chosen) && in_array($chosen, Site::LOCALES, true)) {
                $request->session()->put('locale', $chosen);
            }
            $locale = $request->session()->get('locale', $default);
            app()->setLocale(in_array($locale, Site::LOCALES, true) ? $locale : 'en');
        }

        return $next($request);
    }
}
