<?php

namespace App\Ai\Tools;

use App\Models\Book;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class SearchBooks implements Tool
{
    /**
     * Get the name of the tool.
     */
    public function name(): string
    {
        return 'search_books';
    }

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Search the book shop catalog by title keywords, author, or category, optionally filtered by a price range. Returns up to 6 matching books as JSON.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $books = Book::query()
            ->with('category')
            ->search($request['q'] ?? null)
            ->when($request['author'] ?? null, fn ($query, $author) => $query->where('author', 'like', "%{$author}%"))
            ->when($request['category'] ?? null, fn ($query, $category) => $query->whereHas(
                'category',
                fn ($query) => $query->where('name', 'like', "%{$category}%"),
            ))
            ->when($request['min_price'] ?? null, fn ($query, $min) => $query->where('price', '>=', $min))
            ->when($request['max_price'] ?? null, fn ($query, $max) => $query->where('price', '<=', $max))
            ->orderBy('price')
            ->limit(6)
            ->get();

        if ($books->isEmpty()) {
            return json_encode([
                'books' => [],
                'message' => 'No books matched these criteria. Consider broadening the search.',
            ]);
        }

        return json_encode([
            'books' => $books->map->toAssistantArray()->all(),
        ]);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'q' => $schema->string()->nullable()->description('Keywords to match against book titles, authors, or descriptions'),
            'author' => $schema->string()->nullable()->description('Author name, or part of it'),
            'category' => $schema->string()->nullable()->description('Category name, e.g. fantasy, programming'),
            'min_price' => $schema->number()->nullable()->description('Minimum price in USD'),
            'max_price' => $schema->number()->nullable()->description('Maximum price in USD'),
        ];
    }
}
