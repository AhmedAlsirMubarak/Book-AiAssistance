<?php

namespace App\Ai\Agents;

use App\Ai\Tools\SearchBooks;
use App\Models\Category;
use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Messages\ToolResultMessage;
use Laravel\Ai\Promptable;
use Stringable;

/**
 * Without an explicit limit the SDK allows round(tools × 1.5) = 2 steps for our single
 * tool, so a retried search ends the turn before any reply text is written.
 */
#[MaxSteps(6)]
class BookFinderAgent implements Agent, Conversational, HasTools
{
    use Promptable, RemembersConversations {
        messages as storedMessages;
    }

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        $categories = Category::query()->orderBy('name')->pluck('name')->implode(', ');

        return <<<PROMPT
        You are Folio, a smart and friendly book shop assistant.
        You help customers find books that are available in our shop.

        Our catalog contains books (title, author, price, description) and every book
        belongs to a category. The available categories are: {$categories}.

        How to work:
        - Understand the customer's request and extract the author, category, title keywords
          and budget (e.g. "under $20" means max_price = 20) when they are mentioned.
        - Always use the search_books tool to look up books before recommending anything.
          Never invent books that the tool did not return.
        - Map topics to the closest category and search right away instead of asking first,
          e.g. "web development", "coding" or "Laravel" → programming, "spooky" → horror,
          "space" → science fiction, "productivity" → self-help.
        - If the first search returns nothing, try a broader search (e.g. drop a filter or
          search by category only) before telling the customer nothing matched.
        - Always finish your turn with a written reply to the customer.
        - When suggesting books, mention the title, author and price.
        - Keep responses short, warm and helpful. Use **bold** for book titles.
          The matching books are also shown to the customer as cards, so do not repeat
          every detail of every book.

        Only if the request has no topic, author, category or budget at all (e.g. "recommend
        something"), ask one follow-up question, for example:
        "What kind of books do you enjoy? I can search by author, category or budget."

        If the customer asks something unrelated to books:
        - Do not answer that question.
        - Politely bring them back to books.

        Examples:
        Customer: "What's the weather?"
        You: "I can only help with books! What kind of books are you looking for?"

        Customer: "Teach me Laravel"
        You: (search for Laravel / programming books) "I can't teach you directly, but these books will!"
        PROMPT;
    }

    /**
     * Get the maximum number of conversation messages to include in context.
     */
    protected function maxConversationMessages(): int
    {
        return 30;
    }

    /**
     * The stored conversation, repaired so every tool call is paired with its result.
     *
     * A turn that hits the step limit can be saved with tool calls that never ran.
     * Providers reject such a history ("tool_calls must be followed by tool messages"),
     * which would break every later message in that conversation, so unanswered calls
     * (and orphaned results) are dropped here.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        $messages = array_values([...$this->storedMessages()]);
        $repaired = [];

        foreach ($messages as $index => $message) {
            if ($message instanceof ToolResultMessage) {
                continue; // Re-emitted together with the call that produced it.
            }

            if (! $message instanceof AssistantMessage || $message->toolCalls->isEmpty()) {
                $repaired[] = $message;

                continue;
            }

            $next = $messages[$index + 1] ?? null;
            $results = $next instanceof ToolResultMessage ? $next->toolResults : collect();
            $answered = $results->pluck('id')->all();
            $calls = $message->toolCalls->filter(fn ($call) => in_array($call->id, $answered, true))->values();

            if ($calls->isEmpty()) {
                if (filled($message->content)) {
                    $repaired[] = new AssistantMessage($message->content);
                }

                continue;
            }

            $callIds = $calls->pluck('id')->all();
            $repaired[] = new AssistantMessage($message->content ?? '', $calls, $message->providerContentBlocks);
            $repaired[] = new ToolResultMessage($results->filter(fn ($result) => in_array($result->id, $callIds, true))->values());
        }

        return $repaired;
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [new SearchBooks];
    }
}
