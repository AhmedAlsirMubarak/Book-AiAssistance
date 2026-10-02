import ApplicationLogo from '@/Components/ApplicationLogo';
import Aurora from '@/Components/Aurora';
import BookCover from '@/Components/BookCover';
import FlipBook from '@/Components/FlipBook/FlipBook';
import { guideChapters, guidePages } from '@/Components/FlipBook/guidePages';
import ShelfCarousel from '@/Components/ShelfCarousel';
import { formatPrice } from '@/lib/format';
import { Head, Link, usePoll } from '@inertiajs/react';
import { ArrowRight, History, MessagesSquare, SlidersHorizontal } from 'lucide-react';
import { useMemo } from 'react';

const features = [
    {
        icon: MessagesSquare,
        title: 'Just ask',
        body: 'Describe what you want in plain words — “something spooky under $20” — and Folio does the searching.',
    },
    {
        icon: SlidersHorizontal,
        title: 'Smart filters',
        body: 'Author, category and budget are pulled straight from your message and matched against the real catalog.',
    },
    {
        icon: History,
        title: 'Remembers the thread',
        body: 'Every conversation is saved, so you can pick up where you left off and refine as you go.',
    },
];

export default function Welcome({ auth, canLogin, canRegister, featured }) {
    const cta = auth.user ? route('dashboard') : canRegister ? route('register') : route('login');

    // Re-fetch just the shelf every minute so new books appear without a reload.
    usePoll(60_000, { only: ['featured'] });

    const guide = useMemo(() => guidePages({ startHref: cta }), [cta]);

    return (
        <>
            <Head title="Your AI book shop assistant" />
            <Aurora />

            <div className="min-h-dvh">
                <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
                    <nav className="glass-strong mx-auto flex h-14 max-w-6xl items-center justify-between rounded-[1.75rem] px-3 sm:h-16 sm:px-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <ApplicationLogo className="h-9 w-9" />
                            <span className="font-serif text-2xl tracking-tight text-white">Folio</span>
                        </Link>

                        {canLogin && (
                            <div className="flex items-center gap-1">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="btn-liquid rounded-full px-5 py-2 text-sm font-semibold text-white"
                                    >
                                        Open assistant
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={route('register')}
                                                className="btn-liquid rounded-full px-5 py-2 text-sm font-semibold text-white"
                                            >
                                                Get started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </nav>
                </header>

                <main className="mx-auto max-w-6xl px-4 sm:px-6">
                    <section className="grid items-center gap-12 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_1fr]">
                        <div className="animate-rise">
                            <h1 className="font-serif text-5xl leading-[1.02] tracking-tight text-white sm:text-7xl">
                                Find your next book by <span className="text-shimmer italic">just asking.</span>
                            </h1>
                            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
                                Folio is a conversational book shop assistant. Tell it who you love to read, what
                                you're in the mood for and what you'd like to spend — it finds the right shelf.
                            </p>
                            <div className="mt-9 flex flex-wrap items-center gap-3">
                                <Link
                                    href={cta}
                                    className="btn-liquid group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white"
                                >
                                    Start a conversation
                                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                                </Link>
                                {!auth.user && canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="glass-subtle rounded-full px-6 py-3.5 font-medium text-white/80 transition hover:text-white"
                                    >
                                        I have an account
                                    </Link>
                                )}
                            </div>
                        </div>

                        <ChatPreview />
                    </section>

                    <section className="grid gap-4 pb-20 md:grid-cols-3">
                        {features.map(({ icon: Icon, title, body }) => (
                            <div key={title} className="glass rounded-[1.75rem] p-6">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-white/25 to-white/5 text-fuchsia-200 shadow-[inset_0_1px_0_rgb(255_255_255/0.4)]">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
                            </div>
                        ))}
                    </section>

                    <section className="pb-28" aria-labelledby="guide-heading">
                        <div className="mx-auto mb-12 max-w-xl text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">New here?</p>
                            <h2 id="guide-heading" className="mt-2 font-serif text-4xl text-white sm:text-5xl">
                                Flip through the <span className="text-shimmer italic">guide</span>
                            </h2>
                            <p className="mt-3 text-sm text-white/55">
                                Everything Folio can do, in a few pages. Click a page, swipe, or use your arrow keys to turn it.
                            </p>
                        </div>
                        <FlipBook pages={guide} chapters={guideChapters} />
                    </section>

                    {featured.length > 0 && (
                        <section className="pb-24">
                            <div className="mb-6 flex items-end justify-between">
                                <div>
                                    <h2 className="font-serif text-3xl text-white sm:text-4xl">On the shelf today</h2>
                                    <p className="mt-1 text-sm text-white/45">Fresh arrivals and recent updates</p>
                                </div>
                                <Link
                                    href={auth.user ? route('books.index') : cta}
                                    className="text-sm font-medium text-white/60 transition hover:text-white"
                                >
                                    Browse all →
                                </Link>
                            </div>
                            <ShelfCarousel
                                books={featured}
                                hrefFor={(book) =>
                                    auth.user
                                        ? route('dashboard', { prompt: `Tell me about "${book.title}" and suggest similar books.` })
                                        : cta
                                }
                            />
                        </section>
                    )}
                </main>

                <footer className="border-t border-white/10 py-8 text-center text-xs text-white/35">
                    © {new Date().getFullYear()} Folio · Built by Ahmed Alsir
                </footer>
            </div>
        </>
    );
}

const previewBook = {
    title: 'The Shining',
    author: 'Stephen King',
    price: 15.99,
    cover_url: '/images/covers/the-shining.jpg', // via Open Library (covers.openlibrary.org)
};

function ChatPreview() {
    const book = previewBook;

    return (
        <div className="relative animate-rise [animation-delay:120ms]">
            <div className="absolute -inset-6 rounded-[3rem] bg-linear-to-br from-violet-500/25 via-fuchsia-500/20 to-cyan-400/20 blur-3xl" />
            <div className="glass-strong relative rounded-[2rem] p-5 sm:p-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <ApplicationLogo className="h-9 w-9" />
                    <div>
                        <p className="text-sm font-semibold text-white">Folio</p>
                        <p className="text-xs text-white/45">Book shop assistant</p>
                    </div>
                </div>

                <div className="space-y-4 pt-5 text-sm">
                    <div className="flex justify-end">
                        <p className="max-w-[80%] rounded-3xl rounded-br-lg bg-linear-to-br from-violet-500/85 to-fuchsia-500/80 px-4 py-2.5 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.4)]">
                            Something by Stephen King, under $20?
                        </p>
                    </div>
                    <div className="glass-subtle max-w-[88%] rounded-3xl rounded-tl-lg px-4 py-3 text-white/85">
                        Great taste! I found <strong className="text-white">The Shining</strong> for $15.99 and{' '}
                        <strong className="text-white">It</strong> for $18.99. Want something shorter?
                    </div>
                    {(
                        <div className="glass-subtle flex max-w-[92%] items-center gap-5 rounded-3xl p-4">
                            <BookCover
                                book={book}
                                className="aspect-2/3 w-28 shrink-0 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.9)] transition duration-500 hover:-rotate-2 hover:scale-105 sm:w-32"
                            />
                            <div className="min-w-0">
                                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/70">
                                    Horror
                                </span>
                                <p className="mt-2 font-serif text-2xl leading-tight text-white">{book.title}</p>
                                <p className="mt-0.5 truncate text-sm text-white/55">{book.author}</p>
                                <p className="mt-3 text-xl font-semibold text-fuchsia-200">{formatPrice(book.price)}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="glass-subtle mt-5 flex items-center justify-between rounded-full py-2 pl-5 pr-2 text-sm text-white/40">
                    Ask for a book…
                    <span className="btn-liquid flex h-9 w-9 items-center justify-center rounded-full text-white">
                        <ArrowRight className="h-4 w-4 -rotate-90" />
                    </span>
                </div>
            </div>
        </div>
    );
}
