<?php

use App\Http\Controllers\Admin\BookController as AdminBookController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\AssistantController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\ProfileController;
use App\Models\Book;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        // Newest additions and edits first, only books with a real cover image (never the
        // generated placeholder). The landing page polls this to stay current.
        'featured' => Book::with('category')
            ->whereNotNull('cover_path')
            ->latest('updated_at')
            ->latest('id')
            ->limit(24)
            ->get()
            ->filter(fn (Book $book) => Storage::disk('public')->exists($book->cover_path))
            ->take(12)
            ->values()
            ->map(fn (Book $book) => [
                ...$book->toAssistantArray(),
                'is_new' => $book->created_at?->gt(now()->subDays(7)) ?? false,
            ]),
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

Route::middleware(['auth', 'verified', 'can:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', '/admin/books')->name('index');
    Route::resource('books', AdminBookController::class)->except('show');
    Route::resource('categories', AdminCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
