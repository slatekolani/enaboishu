<?php

use App\Http\Controllers\Admin\{DashboardController, EnquiryController, HistoryController, MessageController, NotificationController, PagesController, ResourceController, SettingsController, UserController};
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Site\SeoController;
use App\Http\Controllers\Site\SiteController;
use Illuminate\Support\Facades\Route;

/* Search engines and browsers */
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');
Route::get('/site.webmanifest', [SeoController::class, 'manifest'])->name('manifest');

/* Public website */
Route::controller(SiteController::class)->group(function () {
    Route::get('/', 'home')->name('home');
    Route::get('/about', 'about')->name('about');
    Route::get('/academics', 'academics')->name('academics');
    Route::get('/admissions', 'admissions')->name('admissions');
    Route::get('/staff', 'staff')->name('staff');
    Route::get('/news', 'news')->name('news');
    Route::get('/news/{slug}', 'post')->name('news.show');
    Route::get('/articles', 'articlesIndex')->name('articles');
    Route::get('/articles/{slug}', 'article')->name('articles.show');
    Route::get('/downloads', 'downloads')->name('downloads');
    Route::get('/downloads/{download}/file', 'download')->name('downloads.file');
    Route::get('/results', 'results')->name('results');
    Route::get('/language/{locale}', 'language')->name('language');
    Route::get('/student-life', 'studentLife')->name('student-life');
    Route::get('/alumni', 'alumni')->name('alumni');
    Route::get('/apply', 'apply')->name('apply');
    Route::post('/apply', 'submitApplication')->middleware('throttle:5,1')->name('apply.submit');
    Route::get('/events', 'events')->name('events');
    Route::get('/events/{slug}', 'event')->name('events.show');
    Route::get('/gallery', 'gallery')->name('gallery');
    Route::get('/contact', 'contact')->name('contact');
    Route::get('/pages/{slug}', 'customPage')->name('pages.show');
    Route::post('/contact', 'sendMessage')->middleware('throttle:5,1')->name('contact.send');
});

/* Content management */
Route::middleware(['auth', 'role:admin|editor'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::get('/pages', [PagesController::class, 'index'])->name('pages');

    // Administrators only: site-wide settings, people's personal data, accounts and history.
    Route::middleware('role:admin')->group(function () {
        Route::get('/settings', [SettingsController::class, 'edit'])->name('settings');
        Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');

        Route::get('/messages', [MessageController::class, 'index'])->name('messages');
        Route::patch('/messages/{message}/read', [MessageController::class, 'read'])->name('messages.read');
        Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');

        Route::get('/enquiries', [EnquiryController::class, 'index'])->name('enquiries');
        Route::get('/enquiries/export', [EnquiryController::class, 'export'])->name('enquiries.export');
        Route::patch('/enquiries/{enquiry}', [EnquiryController::class, 'update'])->name('enquiries.update');
        Route::delete('/enquiries/{enquiry}', [EnquiryController::class, 'destroy'])->name('enquiries.destroy');

        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        Route::get('/history', HistoryController::class)->name('history');
        Route::get('/pages/{key}/edit', [PagesController::class, 'edit'])->name('pages.edit');

        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications');
        Route::post('/notifications/test', [NotificationController::class, 'test'])->middleware('throttle:10,1')->name('notifications.test');
    });

    Route::prefix('content/{resource}')->name('resource.')->controller(ResourceController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}/edit', 'edit')->name('edit');
        Route::post('/{id}', 'update')->name('update'); // multipart-safe update
        Route::delete('/{id}', 'destroy')->name('destroy');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/dashboard', fn () => redirect()->route('admin.dashboard'))->middleware('auth')->name('dashboard');

require __DIR__.'/auth.php';
