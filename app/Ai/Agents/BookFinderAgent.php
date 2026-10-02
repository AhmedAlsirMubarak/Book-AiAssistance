<?php

namespace App\Ai\Agents;

use App\Ai\Tools\SearchBooks;
use App\Models\Category;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Promptable;
use Stringable;

class BookFinderAgent implements Agent, Conversational, HasTools
{
    use Promptable, RemembersConversations;

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
        - If the first search returns nothing, try a broader search (e.g. drop a filter)
          before telling the customer nothing matched.
        - When suggesting books, mention the title, author and price.
        - Keep responses short, warm and helpful. Use **bold** for book titles.
          The matching books are also shown to the customer as cards, so do not repeat
          every detail of every book.

        If the customer gives a vague request, ask one follow-up question, for example:
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
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [new SearchBooks];
    }
}
