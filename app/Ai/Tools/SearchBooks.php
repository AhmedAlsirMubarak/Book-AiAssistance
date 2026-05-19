<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use App\Models\Book;


class SearchBooks implements Tool
{
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Search the book shop for books by author, category, or title, including filtering by price';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $quary = Book::query()-> with('category');

        if ($author = $request['author'] ?? null) {
            $quary->where('author','like', '%' . $author . '%');
        }
        if($category = $request['category'] ?? null)  {
            $quary->wherehas('category', function ($query) use ($category) {
                $query->where('name','like', '%' . $category . '%');
            });
        }

        if($max_price = $request['max_price'] ?? null) {
            $quary->where('price', '<=', $max_price );
        }

        if ($q = $request['q'] ?? null) {
            $quary->where(function ($sub) use ($q) {
                $sub->where('title', 'like', '%' . $q . '%')
                    ->orWhere('author', 'like', '%' . $q . '%');
                
            });
        }

        $books = $quary->limit(5)->get();

        if ($books->isEmpty()) {
            return 'Sorry, I could not find any books matching your criteria.';
        }

        return $books->map(function ($book) {

            return sprintf(
            '%s by %s - $%s (Category: %s)',
            $book->title,
            $book->author,
            $book->price,
            $book->category->name
            );
        })->implode("\n");
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'author' => $schema->string()->nullable(),
            'category' => $schema->string()->nullable(),
            'max_price' => $schema->number()->nullable(),
            'q' => $schema->string()->nullable()->description('Search term for titles or authors'),
        ];
    }
}
