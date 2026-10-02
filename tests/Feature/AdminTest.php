<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function admin(): User
    {
        return tap(User::factory()->create(), fn (User $user) => $user->forceFill(['is_admin' => true])->save());
    }

    public function test_regular_users_cannot_access_the_admin_area(): void
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user)->get('/admin/books')->assertForbidden();
        $this->actingAs($user)->get('/admin/categories')->assertForbidden();
        $this->actingAs($user)->post('/admin/categories', ['name' => 'poetry'])->assertForbidden();
        $this->actingAs($user)->delete("/admin/books/{$book->id}")->assertForbidden();

        $this->assertDatabaseHas('books', ['id' => $book->id]);
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/admin/books')->assertRedirect('/login');
    }

    public function test_users_cannot_make_themselves_admin(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patch('/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => true,
        ]);

        $this->assertFalse($user->fresh()->is_admin);
    }

    public function test_admins_can_view_the_admin_pages(): void
    {
        $admin = $this->admin();
        $book = Book::factory()->create();

        $this->actingAs($admin)->get('/admin/books')->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Books/Index')->has('books.data', 1));
        $this->actingAs($admin)->get('/admin/books/create')->assertOk();
        $this->actingAs($admin)->get("/admin/books/{$book->id}/edit")->assertOk();
        $this->actingAs($admin)->get('/admin/categories')->assertOk();
    }

    public function test_admins_can_add_update_and_delete_books(): void
    {
        $admin = $this->admin();
        $category = Category::factory()->create();

        $this->actingAs($admin)->post('/admin/books', [
            'title' => 'The Hobbit',
            'author' => 'J.R.R. Tolkien',
            'category_id' => $category->id,
            'price' => 13.99,
            'description' => 'A hobbit goes on an adventure.',
        ])->assertRedirect('/admin/books')->assertSessionHas('success');

        $book = Book::firstWhere('title', 'The Hobbit');
        $this->assertNotNull($book);

        $this->actingAs($admin)->put("/admin/books/{$book->id}", [
            'title' => 'The Hobbit',
            'author' => 'J.R.R. Tolkien',
            'category_id' => $category->id,
            'price' => 11.50,
        ])->assertRedirect('/admin/books');

        $this->assertEquals('11.50', $book->fresh()->price);

        $this->actingAs($admin)->delete("/admin/books/{$book->id}")->assertRedirect();
        $this->assertModelMissing($book);
    }

    public function test_admins_can_upload_replace_and_remove_cover_images(): void
    {
        Storage::fake('public');
        $admin = $this->admin();
        $category = Category::factory()->create();
        $fields = ['title' => 'Circe', 'author' => 'Madeline Miller', 'category_id' => $category->id, 'price' => 17.99];

        $this->actingAs($admin)->post('/admin/books', [
            ...$fields,
            'cover' => UploadedFile::fake()->image('circe.jpg', 400, 600),
        ])->assertSessionHasNoErrors();

        $book = Book::firstWhere('title', 'Circe');
        $first = $book->cover_path;
        Storage::disk('public')->assertExists($first);
        $this->assertSame("/storage/{$first}", $book->toAssistantArray()['cover_url']);

        // Replacing deletes the old file. Uploads go through POST with _method=PUT (multipart).
        $this->actingAs($admin)->post("/admin/books/{$book->id}", [
            ...$fields,
            '_method' => 'PUT',
            'cover' => UploadedFile::fake()->image('new.png', 400, 600),
        ])->assertSessionHasNoErrors();

        $second = $book->fresh()->cover_path;
        $this->assertNotSame($first, $second);
        Storage::disk('public')->assertMissing($first);
        Storage::disk('public')->assertExists($second);

        // Saving without a file keeps the current cover.
        $this->actingAs($admin)->put("/admin/books/{$book->id}", $fields);
        $this->assertSame($second, $book->fresh()->cover_path);

        $this->actingAs($admin)->put("/admin/books/{$book->id}", [...$fields, 'remove_cover' => true]);
        $this->assertNull($book->fresh()->cover_path);
        Storage::disk('public')->assertMissing($second);
    }

    public function test_deleting_a_book_deletes_its_cover(): void
    {
        Storage::fake('public');
        $path = UploadedFile::fake()->image('cover.jpg', 400, 600)->store('covers', 'public');
        $book = Book::factory()->create(['cover_path' => $path]);

        $this->actingAs($this->admin())->delete("/admin/books/{$book->id}");

        Storage::disk('public')->assertMissing($path);
    }

    public function test_covers_must_be_reasonable_images(): void
    {
        Storage::fake('public');
        $category = Category::factory()->create();
        $fields = ['title' => 'X', 'author' => 'Y', 'category_id' => $category->id, 'price' => 1];

        $this->actingAs($this->admin())
            ->post('/admin/books', [...$fields, 'cover' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf')])
            ->assertSessionHasErrors('cover');

        $this->actingAs($this->admin())
            ->post('/admin/books', [...$fields, 'cover' => UploadedFile::fake()->image('big.jpg', 400, 600)->size(5000)])
            ->assertSessionHasErrors('cover');
    }

    public function test_book_validation(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/books', ['title' => '', 'price' => -5, 'category_id' => 999])
            ->assertSessionHasErrors(['title', 'author', 'price', 'category_id']);
    }

    public function test_admins_can_manage_categories(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post('/admin/categories', ['name' => 'poetry'])->assertSessionHasNoErrors();
        $category = Category::firstWhere('name', 'poetry');

        $this->actingAs($admin)->post('/admin/categories', ['name' => 'poetry'])->assertSessionHasErrors('name');

        $this->actingAs($admin)->put("/admin/categories/{$category->id}", ['name' => 'verse'])->assertSessionHasNoErrors();
        $this->assertSame('verse', $category->fresh()->name);

        $this->actingAs($admin)->delete("/admin/categories/{$category->id}")->assertSessionHasNoErrors();
        $this->assertModelMissing($category);
    }

    public function test_categories_with_books_cannot_be_deleted(): void
    {
        $book = Book::factory()->create();

        $this->actingAs($this->admin())
            ->delete("/admin/categories/{$book->category_id}")
            ->assertSessionHasErrors('category');

        $this->assertModelExists($book);
    }

    public function test_the_make_admin_command_grants_and_revokes_access(): void
    {
        $user = User::factory()->create(['email' => 'owner@example.com']);

        $this->artisan('app:make-admin', ['email' => 'owner@example.com'])->assertSuccessful();
        $this->assertTrue($user->fresh()->is_admin);

        $this->artisan('app:make-admin', ['email' => 'owner@example.com', '--revoke' => true])->assertSuccessful();
        $this->assertFalse($user->fresh()->is_admin);

        $this->artisan('app:make-admin', ['email' => 'missing@example.com'])->assertFailed();
    }
}
