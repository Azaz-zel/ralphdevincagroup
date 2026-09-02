<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\InboxController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\WorkController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public site
|--------------------------------------------------------------------------
|
| Page copy lives in the Blade views; every fact lives in config/site.php,
| config/divisions.php and config/projects.php. Per-page meta is resolved by
| route name in the layout component, which is why these names matter.
|
*/

Route::view('/', 'pages.home')->name('home');
Route::view('/about', 'pages.about')->name('about');
Route::view('/perfumery', 'pages.perfumery')->name('perfumery');
Route::view('/technology', 'pages.technology')->name('technology');
Route::view('/privacy', 'pages.privacy')->name('privacy');

Route::get('/work', [WorkController::class, 'index'])->name('work');
Route::get('/work/{project}', [WorkController::class, 'show'])->name('work.show');

Route::view('/contact', 'pages.contact')->name('contact');

Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');

Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contact.store');

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
|
| The owner reads inquiries here. There is deliberately no registration route:
| the single account is created with `php artisan admin:create`.
|
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

    Route::get('/inbox', [InboxController::class, 'index'])->name('inbox');
    Route::get('/inbox/{inquiry}', [InboxController::class, 'show'])->name('inbox.show');
    Route::patch('/inbox/{inquiry}', [InboxController::class, 'update'])->name('inbox.update');
});
