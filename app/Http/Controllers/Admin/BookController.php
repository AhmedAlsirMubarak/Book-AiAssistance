<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * List books for management.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('q')->limit(100, '')->toString();

        return Inertia::render('Admin/Books/Index', [
            'books' => Book::query()
                ->with('category')
                ->search($search ?: null)
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Book $book) => $book->toAssistantArray()),
            'filters' => ['q' => $search],
            'stats' => [
                'books' => Book::count(),
                'categories' => Category::count(),
            ],
        ]);
    }

    /**
     * Show the form for adding a book.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Books/Form', [
            'book' => null,
            'categories' => $this->categories(),
        ]);
    }

    /**
     * Store a new book.
     */
    public function store(Request $request): RedirectResponse
    {
        $book = new Book($this->validated($request));
        $this->syncCover($request, $book);
        $book->save();

        return to_route('admin.books.index')->with('success', "“{$book->title}” was added to the catalog.");
    }

    /**
     * Show the form for editing a book.
     */
    public function edit(Book $book): Response
    {
        return Inertia::render('Admin/Books/Form', [
            'book' => [...$book->toAssistantArray(), 'category_id' => $book->category_id],
            'categories' => $this->categories(),
        ]);
    }

    /**
     * Update a book.
     */
    public function update(Request $request, Book $book): RedirectResponse
    {
        $book->fill($this->validated($request));
        $this->syncCover($request, $book);
        $book->save();

        return to_route('admin.books.index')->with('success', "“{$book->title}” was updated.");
    }

    /**
     * Remove a book from the catalog.
     */
    public function destroy(Book $book): RedirectResponse
    {
        $book->delete();

        return back()->with('success', "“{$book->title}” was removed from the catalog.");
    }

    /**
     * @return array<string, mixed>
     */
    protected function validated(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'description' => ['nullable', 'string', 'max:2000'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:min_width=100,min_height=150'],
            'remove_cover' => ['boolean'],
        ]);

        return Arr::except($validated, ['cover', 'remove_cover']);
    }

    /**
     * Store a newly uploaded cover, or remove the current one, replacing the old file either way.
     */
    protected function syncCover(Request $request, Book $book): void
    {
        if ($request->hasFile('cover')) {
            $book->deleteCover();
            $book->cover_path = $request->file('cover')->store('covers', 'public');
        } elseif ($request->boolean('remove_cover')) {
            $book->deleteCover();
            $book->cover_path = null;
        }
    }

    protected function categories()
    {
        return Category::query()->orderBy('name')->get(['id', 'name']);
    }
}
