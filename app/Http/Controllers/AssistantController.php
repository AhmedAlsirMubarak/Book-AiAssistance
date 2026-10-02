<?php

namespace App\Http\Controllers;

use App\Ai\Agents\BookFinderAgent;
use App\Models\AgentConversation;
use App\Models\AgentConversationMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AssistantController extends Controller
{
    /**
     * Show the assistant chat, optionally opening an existing conversation.
     */
    public function index(Request $request, ?AgentConversation $conversation = null): Response
    {
        if ($conversation) {
            $this->authorizeConversation($request, $conversation);
        }

        return Inertia::render('Dashboard', [
            'conversations' => $request->user()->conversations()
                ->latest('updated_at')
                ->limit(50)
                ->get(['id', 'title', 'updated_at']),
            'conversation' => $conversation?->only('id', 'title'),
            'messages' => $conversation ? $this->transcript($conversation) : [],
            'prompt' => $request->string('prompt')->limit(500, '')->toString(),
        ]);
    }

    /**
     * Send a message to the assistant and return its reply.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'conversation_id' => ['nullable', 'string', 'max:36'],
        ]);

        $user = $request->user();
        $agent = BookFinderAgent::make();

        if ($data['conversation_id'] ?? null) {
            $conversation = $user->conversations()->findOrFail($data['conversation_id']);
            $agent->continue($conversation->id, as: $user);
        } else {
            $agent->forUser($user);
        }

        try {
            $response = $agent->prompt(
                $data['message'],
                provider: config('ai.default'),
                model: config('ai.assistant_model'),
            );
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'The assistant is unavailable right now. Please check the AI provider configuration and try again.',
            ], 503);
        }

        $conversation = AgentConversation::find($response->conversationId);
        $conversation?->touch();

        return response()->json([
            'conversation' => $conversation?->only('id', 'title', 'updated_at'),
            'reply' => [
                'role' => 'assistant',
                'content' => $response->text,
                'books' => $this->booksFromToolResults(
                    $response->toolResults->map(fn ($result) => $result->toArray())->all()
                ),
            ],
        ]);
    }

    /**
     * Delete a conversation and all of its messages.
     */
    public function destroy(Request $request, AgentConversation $conversation): RedirectResponse
    {
        $this->authorizeConversation($request, $conversation);

        $conversation->messages()->delete();
        $conversation->delete();

        // Stay on the conversation being viewed, unless that's the one that was deleted.
        return str_contains(url()->previous(), $conversation->id) || url()->previous() === url()->current()
            ? to_route('dashboard')
            : back();
    }

    /**
     * Ensure the conversation belongs to the authenticated user.
     */
    protected function authorizeConversation(Request $request, AgentConversation $conversation): void
    {
        abort_unless((int) $conversation->user_id === (int) $request->user()->id, 404);
    }

    /**
     * Build the chat transcript for a conversation.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function transcript(AgentConversation $conversation): array
    {
        return $conversation->messages()
            ->whereIn('role', ['user', 'assistant'])
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->map(fn (AgentConversationMessage $message) => [
                'role' => $message->role,
                'content' => $message->content,
                'books' => $this->booksFromToolResults($message->tool_results ?? []),
            ])
            ->values()
            ->all();
    }

    /**
     * Extract the books returned by the search tool so the UI can render them as cards.
     *
     * @param  array<int, array<string, mixed>>  $toolResults
     * @return array<int, array<string, mixed>>
     */
    protected function booksFromToolResults(array $toolResults): array
    {
        return collect($toolResults)
            ->where('name', 'search_books')
            ->flatMap(function (array $result) {
                $decoded = is_string($result['result'] ?? null) ? json_decode($result['result'], true) : null;

                return $decoded['books'] ?? [];
            })
            ->unique('id')
            ->values()
            ->all();
    }
}
