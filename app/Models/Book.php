<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Book extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'author', 'description', 'cover_path', 'price', 'category_id'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        // Clean up the stored cover image along with the book.
        static::deleted(fn (Book $book) => $book->deleteCover());
    }

    /**
     * The public URL of the cover image, relative to the site root so it works on any host.
     */
    public function coverUrl(): ?string
    {
        return $this->cover_path ? '/storage/'.$this->cover_path : null;
    }

    /**
     * Delete the stored cover image file, if there is one.
     */
    public function deleteCover(): void
    {
        if ($this->cover_path) {
            Storage::disk('public')->delete($this->cover_path);
        }
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Match the given keywords against the title, author, or description.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn (Builder $query) => $query->where(function (Builder $query) use ($term) {
            $query->where('title', 'like', "%{$term}%")
                ->orWhere('author', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        }));
    }

    /**
     * The representation shared with the AI agent and the chat UI.
     *
     * @return array<string, mixed>
     */
    public function toAssistantArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'author' => $this->author,
            'price' => (float) $this->price,
            'category' => $this->category?->name,
            'description' => $this->description,
            'cover_url' => $this->coverUrl(),
        ];
    }
}
