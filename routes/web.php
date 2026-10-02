<?php

use App\Http\Controllers\AssistantController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\ProfileController;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'stats' => [
            'books' => Book::count(),
            'categories' => Category::count(),
        ],
        'featured' => Book::with('category')->inRandomOrder()->limit(4)->get()->map->toAssistantArray(),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard/{conversation?}', [AssistantController::class, 'index'])->name('dashboard');
    Route::post('/assistant/messages', [AssistantController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('assistant.messages.store');
    Route::delete('/assistant/conversations/{conversation}', [AssistantController::class, 'destroy'])
        ->name('assistant.conversations.destroy');

    Route::get('/books', [BookController::class, 'index'])->name('books.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
