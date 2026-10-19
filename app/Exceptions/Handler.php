<?php

namespace App\Exceptions;

use App\Support\Meta;
use App\Support\Site;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /** Errors shown to visitors as a styled page in the school design, with wording from Site settings → Error pages. */
    private const STYLED = [403, 404, 500, 503];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e): Response
    {
        $response = parent::render($request, $e);
        $status = $response->getStatusCode();

        // Keep Laravel's detailed error screen for developers (APP_DEBUG=true) on real crashes,
        // and leave API/JSON responses and the admin panel's 403s alone.
        $developerCrash = $status >= 500 && config('app.debug');
        if (! in_array($status, self::STYLED, true) || $developerCrash || $request->expectsJson() && ! $request->header('X-Inertia')) {
            return $response;
        }

        try {
            return $this->styledError($request, $status);
        } catch (Throwable) {
            return $response; // never let the error page itself fail
        }
    }

    private function styledError(Request $request, int $status): Response
    {
        // A missing page can happen before the session has started, so the props normally shared by
        // the HandleInertiaRequests middleware are provided here.
        $locale = $request->hasSession() ? $request->session()->get('locale') : null;
        if (! in_array($locale, Site::LOCALES, true)) {
            $locale = (Site::all('en')['default_language'] ?? 'English') === 'Kiswahili' ? 'sw' : 'en';
        }
        app()->setLocale($locale);
        $site = Site::all($locale);

        Inertia::share([
            'auth' => ['user' => null, 'isAdmin' => false],
            'flash' => ['success' => null, 'error' => null],
            'mediaBase' => asset('uploads'),
            'crest' => asset('images/crest.png'),
            'locale' => $locale,
            'site' => $site,
            'notices' => [],
            'menuPages' => [],
            'unreadMessages' => 0, 'newEnquiries' => 0,
        ]);

        return Inertia::render('Site/Error', ['status' => $status])
            ->withViewData('meta', Meta::make($site["error_{$status}_title"] ?? 'Error', extra: ['noindex' => true]))
            ->toResponse($request)
            ->setStatusCode($status);
    }
}
