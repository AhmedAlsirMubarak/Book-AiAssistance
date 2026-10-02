<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * Browse the book catalog.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'integer'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $books = Book::query()
            ->with('category')
            ->search($filters['q'] ?? null)
            ->when($filters['category'] ?? null, fn ($query, $category) => $query->where('category_id', $category))
            ->when($filters['max_price'] ?? null, fn ($query, $max) => $query->where('price', '<=', $max))
            ->orderBy('title')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Book $book) => $book->toAssistantArray());

        return Inertia::render('Books/Index', [
            'books' => $books,
            'categories' => Category::query()->withCount('books')->orderBy('name')->get(['id', 'name']),
            'filters' => (object) $filters,
        ]);
    }
}
