<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use inertia\Inertia;
use app\Models\Book;
use App\Ai\Agents\BookFinderAgent;
use Illuminate\Support\Str;


class BookController extends Controller
{
    public function search(Request $request)
    {
        $quaryText = $request->input('query');
        $conversationId = $request->session()->get('chat_conversation_id') ?? (string) Str::uuid();
        $request->session()->put('chat_conversation_id', $conversationId);


        // Prompt the AI Agent

        $response = bookFinderAgent::make(
            user:$request->user(),
            conversationId: $conversationId
        )->prompt(
            $quaryText,
            model:'openai/gpt-4o-mini'
            );

        return response()->json([
            'response' => (string) $response,
            'user_query' => $quaryText,
        ]);
    }
}