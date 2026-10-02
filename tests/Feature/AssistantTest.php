<?php

namespace Tests\Feature;

use App\Ai\Agents\BookFinderAgent;
use App\Ai\Tools\SearchBooks;
use App\Models\AgentConversation;
use App\Models\Book;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request as ToolRequest;
use Tests\TestCase;

class AssistantTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_use_the_assistant(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
        $this->postJson('/assistant/messages', ['message' => 'Hi'])->assertUnauthorized();
    }

    public function test_the_assistant_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Dashboard')->has('conversations', 0));
    }

    public function test_a_message_starts_a_conversation(): void
    {
        BookFinderAgent::fake(['Try **Dune** by Frank Herbert.']);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/assistant/messages', ['message' => 'Any sci-fi under $20?'])
            ->assertOk()
            ->assertJsonPath('reply.content', 'Try **Dune** by Frank Herbert.')
            ->assertJsonStructure(['conversation' => ['id', 'title'], 'reply' => ['role', 'content', 'books']]);

        $this->assertDatabaseCount('agent_conversations', 1);
        $this->assertDatabaseCount('agent_conversation_messages', 2);
    }

    public function test_users_cannot_access_other_users_conversations(): void
    {
        $owner = User::factory()->create();
        $conversation = AgentConversation::create(['id' => (string) str()->uuid(), 'user_id' => $owner->id, 'title' => 'Mine']);

        $intruder = User::factory()->create();

        $this->actingAs($intruder)->get("/dashboard/{$conversation->id}")->assertNotFound();
        $this->actingAs($intruder)->delete("/assistant/conversations/{$conversation->id}")->assertNotFound();
        $this->actingAs($intruder)
            ->postJson('/assistant/messages', ['message' => 'Hi', 'conversation_id' => $conversation->id])
            ->assertNotFound();
    }

    public function test_conversations_can_be_deleted(): void
    {
        $user = User::factory()->create();
        $conversation = AgentConversation::create(['id' => (string) str()->uuid(), 'user_id' => $user->id, 'title' => 'Mine']);

        $this->actingAs($user)
            ->from("/dashboard/{$conversation->id}")
            ->delete("/assistant/conversations/{$conversation->id}")
            ->assertRedirect('/dashboard');

        $this->assertDatabaseMissing('agent_conversations', ['id' => $conversation->id]);
    }

    public function test_deleting_another_conversation_keeps_the_current_one_open(): void
    {
        $user = User::factory()->create();
        $current = AgentConversation::create(['id' => (string) str()->uuid(), 'user_id' => $user->id, 'title' => 'Current']);
        $other = AgentConversation::create(['id' => (string) str()->uuid(), 'user_id' => $user->id, 'title' => 'Other']);

        $this->actingAs($user)
            ->from("/dashboard/{$current->id}")
            ->delete("/assistant/conversations/{$other->id}")
            ->assertRedirect("/dashboard/{$current->id}");
    }

    public function test_the_search_tool_filters_books(): void
    {
        $fantasy = Category::factory()->create(['name' => 'fantasy']);
        $horror = Category::factory()->create(['name' => 'horror']);
        Book::factory()->for($fantasy)->create(['title' => 'The Hobbit', 'author' => 'J.R.R. Tolkien', 'price' => 13.99]);
        Book::factory()->for($fantasy)->create(['title' => 'A Game of Thrones', 'author' => 'George R.R. Martin', 'price' => 29.99]);
        Book::factory()->for($horror)->create(['title' => 'The Shining', 'author' => 'Stephen King', 'price' => 15.99]);

        $result = json_decode((string) (new SearchBooks)->handle(new ToolRequest([
            'category' => 'fantasy',
            'max_price' => 20,
        ])), true);

        $this->assertCount(1, $result['books']);
        $this->assertSame('The Hobbit', $result['books'][0]['title']);
    }

    public function test_the_catalog_can_be_browsed(): void
    {
        $user = User::factory()->create();
        Book::factory()->count(3)->create();

        $this->actingAs($user)
            ->get('/books')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Books/Index')->has('books.data', 3));
    }
}
