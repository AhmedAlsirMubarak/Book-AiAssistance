<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;
use App\Models\User;
use App\Models\agent_conversationMessages;
use App\Ai\Tools\SearchBooks;

class BookFinderAgent implements Agent, Conversational, HasTools
{
    use Promptable;

    public function __construct(
        public ?User $user = null, 
        public ?string $conversationId = null
    ) {



    }   
    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'prompt'
        You are a smart and friendly book sho assistant.
        You help users find books from our database.

        Our database contains:
        - Books (title,author,price)
        - Categories(each book belongs to a category)
             prompt;

        Your job is to understand user queries and extract:
        - author (if mentioned)
        - category (if mentioned)
        - price range (if user mentioned budget like " under $2000")

        Rules:
        - Alyways foucs on books available in our shop
        - Keep responses short and helpful
        -Mention book title, author,and price when suggesting

        If the user asks something unrelated:
        - Do not answer that question
        - Politely bring them back to books

        Example:
        USer: "Whats the weather?"
        You: "I can help you find books. What kind of books are you looking for?"

        User: "Tech me Laravel"
        You: I can suggest / recomend LAravel books for you"

        If the user gives a vague request:
        - Ask a follow-up question related to books 

        Example:
        "What kind of books do you prefer ? Author, category , or budget?"

        Important:
        - Never go off-topic
        - Alywas guide the user back to books


        Then you will use the extracted information to query our database and find relevant books for the user.
    }

    /**
     * Get the list of messages comprising the conversation so far.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
      if ($this->conversationId) {
        return agent_conversationMessages::where('conversation_id', $this->conversationId,$this->connection_aborted)
        ->latest()
        ->limit(20)
        ->get();
        ->map(function ($message) {
            return new Message(
                content: $message->content,
                role: $message->role,
            );
        });
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [new SearchBooks()];
    }
}
