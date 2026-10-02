import ApplicationLogo from '@/Components/ApplicationLogo';
import BookCover from '@/Components/BookCover';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatMessage, formatPrice, timeAgo } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUp,
    BookOpenText,
    Code2,
    Ghost,
    History,
    MessageSquareText,
    Plus,
    RotateCcw,
    Trash2,
    Wand2,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const suggestions = [
    { icon: Wand2, label: 'Fantasy books under $20', hint: 'Category + budget' },
    { icon: Ghost, label: 'What do you have by Stephen King?', hint: 'Search by author' },
    { icon: Code2, label: 'I want to get better at programming', hint: 'Recommendations' },
    { icon: BookOpenText, label: 'A classic novel for the weekend', hint: 'Something timeless' },
];

export default function Dashboard({ conversations: initialConversations, conversation, messages: initialMessages, prompt }) {
    const [conversations, setConversations] = useState(initialConversations);
    const [conversationId, setConversationId] = useState(conversation?.id ?? null);
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState(prompt ?? '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const deletingRef = useRef(false);

    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    // Sync with the server whenever Inertia navigates to another conversation.
    useEffect(() => {
        setConversations(initialConversations);
        setConversationId(conversation?.id ?? null);
        setMessages(initialMessages);
        setError(null);
        setHistoryOpen(false);
    }, [conversation?.id, initialConversations, initialMessages]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isLoading, error]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [conversationId]);

    const resizeInput = () => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    };

    useEffect(resizeInput, [input]);

    const send = async (text) => {
        const message = text.trim();
        if (!message || isLoading) return;

        setError(null);
        setInput('');
        setMessages((current) => [...current, { role: 'user', content: message, books: [] }]);
        setIsLoading(true);

        try {
            const { data } = await window.axios.post(route('assistant.messages.store'), {
                message,
                conversation_id: conversationId,
            });

            setMessages((current) => [...current, data.reply]);

            if (data.conversation) {
                setConversations((current) => [
                    data.conversation,
                    ...current.filter((item) => item.id !== data.conversation.id),
                ]);

                if (!conversationId) {
                    setConversationId(data.conversation.id);
                    window.history.replaceState(
                        window.history.state,
                        '',
                        route('dashboard', data.conversation.id),
                    );
                }
            }
        } catch (e) {
            const status = e.response?.status;
            setError({
                text: message,
                message:
                    status === 429
                        ? "You're sending messages a little fast. Take a breath and try again in a minute."
                        : e.response?.data?.message ?? 'Something went wrong. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const retry = () => {
        if (!error) return;
        const { text } = error;
        setMessages((current) => current.slice(0, -1));
        send(text);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        send(input);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send(input);
        }
    };

    const confirmDelete = () => {
        // Guard with a ref so a double-click can't send a second DELETE (which would 404).
        if (!deleting || deletingRef.current) return;
        deletingRef.current = true;
        setIsDeleting(true);

        router.delete(route('assistant.conversations.destroy', deleting.id), {
            preserveScroll: true,
            onFinish: () => {
                deletingRef.current = false;
                setIsDeleting(false);
                setDeleting(null);
            },
        });
    };

    const activeTitle = conversations.find((item) => item.id === conversationId)?.title;

    const history = (
        <ConversationList
            conversations={conversations}
            activeId={conversationId}
            onDelete={setDeleting}
        />
    );

    return (
        <AuthenticatedLayout fill>
            <Head title={activeTitle ?? 'Assistant'} />

            <div className="mx-auto flex h-full max-w-[83rem] gap-4 px-3 pb-3 pt-4 sm:px-6 sm:pb-6">
                {/* Conversation history (desktop) */}
                <aside className="glass hidden w-72 shrink-0 flex-col overflow-hidden rounded-[1.75rem] lg:flex">
                    {history}
                </aside>

                {/* Conversation history (mobile drawer) */}
                {historyOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setHistoryOpen(false)} />
                        <aside className="glass-strong absolute inset-y-3 left-3 flex w-[min(20rem,calc(100%-1.5rem))] animate-rise flex-col overflow-hidden rounded-[1.75rem]">
                            <button
                                type="button"
                                onClick={() => setHistoryOpen(false)}
                                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
                                aria-label="Close history"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            {history}
                        </aside>
                    </div>
                )}

                {/* Chat */}
                <section className="glass flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.75rem]">
                    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setHistoryOpen(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
                            aria-label="Show conversations"
                        >
                            <History className="h-[18px] w-[18px]" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-sm font-semibold text-white">{activeTitle ?? 'New conversation'}</h1>
                            <p className="flex items-center gap-1.5 text-xs text-white/45">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153)]" />
                                Folio is ready to help
                            </p>
                        </div>
                        {conversationId && (
                            <Link
                                href={route('dashboard')}
                                className="glass-subtle flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-white/80 transition hover:text-white lg:hidden"
                            >
                                <Plus className="h-3.5 w-3.5" /> New chat
                            </Link>
                        )}
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
                        {messages.length === 0 ? (
                            <EmptyState onPick={send} />
                        ) : (
                            <div className="mx-auto flex max-w-3xl flex-col gap-6">
                                {messages.map((message, index) => (
                                    <ChatMessage key={index} message={message} />
                                ))}

                                {isLoading && <TypingIndicator />}

                                {error && (
                                    <div className="flex animate-rise items-start gap-3 pl-12">
                                        <div className="rounded-2xl border border-rose-300/25 bg-rose-500/15 px-4 py-3 text-sm text-rose-100 backdrop-blur-xl">
                                            <p>{error.message}</p>
                                            <button
                                                type="button"
                                                onClick={retry}
                                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-200 hover:text-white"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5" /> Try again
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="px-3 pb-3 sm:px-6 sm:pb-5">
                        <div className="glass-strong mx-auto flex max-w-3xl items-end gap-2 rounded-[1.6rem] p-2 pl-5 transition focus-within:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_0_0_1px_rgb(232_121_249/0.35),0_18px_50px_-18px_rgb(0_0_0/0.65)]">
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                maxLength={1000}
                                placeholder="Ask Folio for a book…"
                                className="max-h-40 flex-1 resize-none border-0 bg-transparent px-0 py-2.5 text-[15px] text-white placeholder:text-white/40 focus:ring-0"
                                aria-label="Message"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="btn-liquid flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:brightness-110 active:scale-95 disabled:opacity-35 disabled:saturate-50"
                                aria-label="Send message"
                            >
                                <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
                            </button>
                        </div>
                        <p className="mt-2 text-center text-[11px] text-white/35">
                            Folio only recommends books from our catalog. Press Enter to send, Shift + Enter for a new line.
                        </p>
                    </form>
                </section>
            </div>

            <Modal show={deleting !== null} onClose={() => !isDeleting && setDeleting(null)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-white">Delete this conversation?</h2>
                    <p className="mt-2 text-sm text-white/60">
                        “{deleting?.title}” and all of its messages will be permanently removed.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeleting(null)} disabled={isDeleting}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting…' : 'Delete'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

function ConversationList({ conversations, activeId, onDelete }) {
    return (
        <>
            <div className="p-3">
                <Link
                    href={route('dashboard')}
                    className="btn-liquid flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                    <Plus className="h-4 w-4" strokeWidth={2.5} /> New chat
                </Link>
            </div>

            <p className="px-5 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                Recent
            </p>

            <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
                {conversations.length === 0 && (
                    <div className="mx-2 rounded-2xl border border-dashed border-white/15 px-4 py-6 text-center text-xs text-white/45">
                        Your conversations will appear here.
                    </div>
                )}

                {conversations.map((item) => {
                    const active = item.id === activeId;
                    return (
                        <div
                            key={item.id}
                            className={`group relative flex items-center rounded-2xl transition ${
                                active
                                    ? 'bg-white/[0.13] shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]'
                                    : 'hover:bg-white/[0.06]'
                            }`}
                        >
                            <Link
                                href={route('dashboard', item.id)}
                                preserveScroll
                                className="flex min-w-0 flex-1 items-start gap-3 px-3 py-2.5"
                            >
                                <MessageSquareText
                                    className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-fuchsia-300' : 'text-white/35'}`}
                                />
                                <span className="min-w-0">
                                    <span className={`block truncate text-sm ${active ? 'text-white' : 'text-white/75'}`}>
                                        {item.title}
                                    </span>
                                    <span className="block text-[11px] text-white/35">{timeAgo(item.updated_at)}</span>
                                </span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => onDelete(item)}
                                className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/40 opacity-100 transition hover:bg-rose-500/20 hover:text-rose-200 focus:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                aria-label={`Delete “${item.title}”`}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function EmptyState({ onPick }) {
    return (
        <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center py-6 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 scale-150 rounded-full bg-fuchsia-500/30 blur-2xl" />
                <ApplicationLogo className="relative h-16 w-16 drop-shadow-[0_10px_25px_rgb(217_70_239/0.45)]" />
            </div>
            <h2 className="font-serif text-4xl leading-tight text-white sm:text-5xl">
                What should you <span className="text-shimmer italic">read next?</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/55">
                Tell me an author you love, a genre you're in the mood for, or how much you'd like to spend.
            </p>

            <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
                {suggestions.map(({ icon: Icon, label, hint }, index) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => onPick(label)}
                        style={{ animationDelay: `${index * 70}ms` }}
                        className="glass-subtle group flex animate-rise items-center gap-3.5 rounded-2xl p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.09]"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-white/20 to-white/5 text-fuchsia-200 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]">
                            <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-medium text-white/90 group-hover:text-white">{label}</span>
                            <span className="block text-xs text-white/40">{hint}</span>
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function ChatMessage({ message }) {
    if (message.role === 'user') {
        return (
            <div className="flex animate-rise justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-linear-to-br from-violet-500/85 to-fuchsia-500/80 px-4 py-2.5 text-[15px] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_10px_30px_-12px_rgb(192_38_211/0.7)] backdrop-blur-xl">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className="flex animate-rise items-start gap-3">
            <ApplicationLogo className="mt-0.5 h-9 w-9 shrink-0" />
            <div className="min-w-0 flex-1">
                {message.content?.trim() && (
                    <div
                        className="glass-subtle prose-chat inline-block max-w-full rounded-3xl rounded-tl-lg px-4 py-3 text-[15px] leading-relaxed text-white/85"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                )}

                {message.books?.length > 0 && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {message.books.map((book, index) => (
                            <BookResult key={book.id} book={book} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function BookResult({ book, index }) {
    return (
        <div
            style={{ animationDelay: `${index * 60}ms` }}
            className="glass-subtle flex animate-rise gap-3.5 rounded-2xl p-3 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08]"
        >
            <BookCover book={book} className="h-24 w-16 shrink-0 !p-2 [&_p:first-of-type]:text-[11px]" />
            <div className="flex min-w-0 flex-1 flex-col">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{book.title}</p>
                <p className="mt-0.5 truncate text-xs text-white/55">{book.author}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    {book.category && (
                        <span className="truncate rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium capitalize text-white/70">
                            {book.category}
                        </span>
                    )}
                    <span className="text-sm font-semibold text-fuchsia-200">{formatPrice(book.price)}</span>
                </div>
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex animate-rise items-start gap-3">
            <ApplicationLogo className="mt-0.5 h-9 w-9 shrink-0" />
            <div className="glass-subtle flex items-center gap-1.5 rounded-3xl rounded-tl-lg px-5 py-4" aria-label="Folio is typing">
                {[0, 150, 300].map((delay) => (
                    <span
                        key={delay}
                        style={{ animationDelay: `${delay}ms` }}
                        className="h-2 w-2 animate-blink rounded-full bg-linear-to-br from-violet-300 to-fuchsia-300"
                    />
                ))}
            </div>
        </div>
    );
}
