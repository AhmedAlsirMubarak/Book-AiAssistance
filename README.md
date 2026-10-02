# Folio — Book AI Assistant

A Laravel book shop with a conversational AI assistant. Customers describe what they want in plain language ("fantasy under $20", "something by Stephen King") and the assistant searches the real catalog, replies with recommendations, and shows the matching books as cards.

The UI uses a dark "liquid glass" design: frosted, refractive glass panels over an animated aurora background.

## Features

- **AI assistant chat**: the agent pulls author, category, keywords and budget out of the message and calls a `search_books` tool against the database
- **Book result cards**: the books the tool returned appear as cards under each reply, including in saved conversations
- **Conversation history**: each user's conversations are saved. You can reopen them from the sidebar (or a drawer on mobile) and delete them
- **Catalog browser**: debounced search, category filters, a price filter, pagination, and an "Ask Folio about this" shortcut on every book
- **Auth & profile**: register, log in, reset your password, verify your email, and manage your profile (Laravel Breeze)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13, PHP 8.3+ |
| Frontend | Inertia.js 2 + React 18 |
| AI | Laravel AI (Agent + Tool + `RemembersConversations`) |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`), lucide-react icons |
| Database | MySQL |

## AI Architecture

- [`app/Ai/Agents/BookFinderAgent.php`](app/Ai/Agents/BookFinderAgent.php): the agent's instructions. It uses `RemembersConversations`, so messages are stored in `agent_conversations` / `agent_conversation_messages` automatically
- [`app/Ai/Tools/SearchBooks.php`](app/Ai/Tools/SearchBooks.php): filters by keywords, author, category and price range, and returns JSON
- [`app/Http/Controllers/AssistantController.php`](app/Http/Controllers/AssistantController.php): the chat page, the message endpoint (rate-limited to 20 requests a minute) and conversation deletion. It also turns tool results into book cards

The provider and model come from `.env`:

```env
AI_PROVIDER=openrouter               # any provider defined in config/ai.php
AI_ASSISTANT_MODEL=openai/gpt-4o-mini
OPEN_ROUTER_API_KEY=your-key-here
```

To use OpenAI directly, set `AI_PROVIDER=openai`, `AI_ASSISTANT_MODEL=gpt-4o-mini` and `OPENAI_API_KEY`.

## Getting Started

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate

# configure DB_* and the AI_* / API key values in .env, then:
php artisan migrate --seed
```

The seeder adds about 30 books in 7 categories and a demo user: **test@example.com** / **password**.

### Running locally

```bash
composer dev        # server, queue, logs and Vite together
```

Or, with Laragon, run `npm run dev` (or `npm run build`) and open `http://book-aiassistant.test`.

### Building for production

```bash
npm run build
php artisan config:cache
php artisan route:cache
```

## Routes

| Route | Purpose |
|-------|---------|
| `GET /` | Landing page |
| `GET /dashboard/{conversation?}` | Assistant chat (`?prompt=` pre-fills the input) |
| `POST /assistant/messages` | Send a message and get a JSON reply plus book cards |
| `DELETE /assistant/conversations/{id}` | Delete a conversation |
| `GET /books` | Catalog (`q`, `category`, `max_price`) |

## Testing

```bash
composer test
```

The tests use `BookFinderAgent::fake()`, so they never call the AI provider. `phpunit.xml` uses in-memory SQLite. If your PHP build doesn't include `pdo_sqlite`, run the tests against a MySQL database instead:

```bash
DB_CONNECTION=mysql DB_DATABASE=ai_agent_test php artisan test
```

## License

MIT
