# Book AI Assistant

A Laravel-based book shop assistant powered by AI. Users can search for books through a conversational interface — the AI agent understands natural language queries and finds matching books from the database.

## Features

- AI-powered conversational book search (by title, author, category, or price range)
- Conversation history stored per user
- Full authentication (register, login, password reset, email verification)
- Profile management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13.7, PHP 8.3+ |
| Frontend | Inertia.js 2.0 + React 18 |
| AI | Laravel AI 0.6.8 (Agent + Tool system) |
| Auth | Laravel Breeze (Inertia/React) |
| Database | MySQL |
| Styling | Tailwind CSS 3 |

## AI Architecture

- **`app/Ai/Agents/BookFinderAgent.php`** — Conversational agent that parses user queries
- **`app/Ai/Tools/SearchBooks.php`** — Tool that queries the database with filters (author, category, price range)

Supports OpenAI by default, plus Anthropic, Gemini, Groq, Azure, and others via `config/ai.php`.

## Getting Started

### Requirements

- PHP 8.3+
- Composer
- Node.js 18+
- An OpenAI API key (or another supported provider)

### Installation

```bash
git clone <repo-url>
cd Book-Aiassistant

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Configure your database and AI provider in `.env`:

```env
DB_CONNECTION=sqlite

OPENAI_API_KEY=your-key-here
```

Then run migrations and seed the books:

```bash
php artisan migrate --seed
```

### Running Locally

```bash
# Start all services (server, queue, logs, Vite)
composer dev
```

Or separately:

```bash
php artisan serve
npm run dev
```

### Building for Production

```bash
npm run build
php artisan config:cache
php artisan route:cache
```

## Database

| Table | Purpose |
|-------|---------|
| `users` | Authentication |
| `categories` | Book categories |
| `books` | Book catalog (title, author, category, price) |
| `agent_conversations` | Conversation sessions per user |
| `agent_conversation_messages` | Individual messages in each conversation |

## Testing

```bash
composer test
```

## License

MIT
