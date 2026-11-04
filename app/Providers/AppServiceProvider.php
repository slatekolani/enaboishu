<?php

namespace App\Providers;

use App\Support\Meta;
use Illuminate\Support\Facades\View;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Every page gets link-preview tags; controllers can pass more specific ones.
        // Tell search engines as soon as news, articles, events or pages are published, changed or removed.
        \App\Support\IndexNow::watch();

        View::composer('app', function ($view) {
            if (! array_key_exists('meta', $view->getData())) {
                $view->with('meta', Meta::make());
            }
        });
        //
    }
}
