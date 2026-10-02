<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WelcomeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    /**
     * Create a book that has a real stored cover image.
     */
    protected function bookWithCover(array $attributes = []): Book
    {
        return Book::factory()->create([
            'cover_path' => UploadedFile::fake()->image('cover.jpg', 200, 300)->store('covers', 'public'),
            ...$attributes,
        ]);
    }

    public function test_the_shelf_shows_the_most_recently_updated_books_first(): void
    {
        $old = $this->bookWithCover(['created_at' => now()->subMonth(), 'updated_at' => now()->subMonth()]);
        $fresh = $this->bookWithCover();
        $edited = $this->bookWithCover(['created_at' => now()->subMonth(), 'updated_at' => now()->addMinute()]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Welcome')
                ->where('featured.0.id', $edited->id)
                ->where('featured.1.id', $fresh->id)
                ->where('featured.2.id', $old->id)
                ->where('featured.1.is_new', true)
                ->where('featured.2.is_new', false));
    }

    public function test_the_shelf_only_shows_books_with_cover_images(): void
    {
        $withCover = $this->bookWithCover(['updated_at' => now()->subDay()]);
        Book::factory()->create(['cover_path' => null]);
        Book::factory()->create(['cover_path' => 'covers/missing-file.jpg']);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('featured', 1)
                ->where('featured.0.id', $withCover->id)
                ->where('featured.0.cover_url', "/storage/{$withCover->cover_path}"));
    }

    public function test_the_shelf_can_be_partially_reloaded(): void
    {
        foreach (range(1, 15) as $i) {
            $this->bookWithCover();
        }

        $this->get('/', [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (string) (new HandleInertiaRequests)->version(request()),
            'X-Inertia-Partial-Component' => 'Welcome',
            'X-Inertia-Partial-Data' => 'featured',
        ])
            ->assertOk()
            ->assertJsonCount(12, 'props.featured')
            ->assertJsonMissingPath('props.canLogin');
    }
}
