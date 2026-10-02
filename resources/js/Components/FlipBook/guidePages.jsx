import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { Paper } from './FlipBook';

/* ---------------------------------------------------------------------------
 * Building blocks
 * ------------------------------------------------------------------------- */

function PageLayout({ chapter, title, number, children }) {
    return (
        <Paper className="flex flex-col px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
            {chapter && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-700/80">{chapter}</p>
            )}
            {title && <h3 className="mt-1 font-serif text-[1.65rem] leading-tight text-stone-900 sm:text-3xl">{title}</h3>}
            <div className="mt-3 min-h-0 flex-1 text-[13px] leading-relaxed text-stone-700 sm:text-sm">{children}</div>
            {number && <p className="pt-2 text-center font-serif text-xs text-stone-400">{number}</p>}
        </Paper>
    );
}

function Figure({ src, alt, caption }) {
    return (
        <figure className="my-3">
            <div className="overflow-hidden rounded-lg bg-stone-900 shadow-[0_8px_20px_-8px_rgb(0_0_0/0.55)] ring-1 ring-black/10">
                <img src={src} alt={alt} loading="lazy" draggable="false" className="block aspect-video w-full object-cover" />
            </div>
            {caption && <figcaption className="mt-1.5 text-center text-[11px] italic text-stone-500">{caption}</figcaption>}
        </figure>
    );
}

function Steps({ items }) {
    return (
        <ol className="mt-3 space-y-2.5">
            {items.map((item, index) => (
                <li key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.45)]">
                        {index + 1}
                    </span>
                    <span className="pt-0.5">{item}</span>
                </li>
            ))}
        </ol>
    );
}

function Prompt({ children }) {
    return (
        <span className="inline-block rounded-full rounded-br-sm bg-linear-to-br from-violet-500 to-fuchsia-500 px-3 py-1 text-[12px] font-medium text-white shadow-sm">
            {children}
        </span>
    );
}

function Cover({ back = false }) {
    return (
        <div
            className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-8 text-center text-white"
            style={{
                background:
                    'radial-gradient(circle at 75% 15%, rgb(255 255 255 / 0.35), transparent 35%), linear-gradient(150deg, #6d28d9 0%, #a21caf 55%, #e11d48 100%)',
            }}
        >
            {/* Embossed frame and glossy highlight. */}
            <div className="pointer-events-none absolute inset-4 rounded-lg border border-white/25 shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-white/20 to-transparent" />

            {back ? (
                <>
                    <ApplicationLogo className="h-12 w-12 opacity-90 drop-shadow-lg" />
                    <p className="mt-5 max-w-[16rem] font-serif text-2xl italic leading-snug">“Find your next book by just asking.”</p>
                    <p className="mt-8 text-[11px] uppercase tracking-[0.25em] text-white/60">Folio · Built by Ahmed Alsir</p>
                </>
            ) : (
                <>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">A guide to</p>
                    <ApplicationLogo className="mt-6 h-20 w-20 drop-shadow-[0_12px_25px_rgb(0_0_0/0.35)]" />
                    <h3 className="mt-6 font-serif text-5xl leading-none drop-shadow">Folio</h3>
                    <p className="mt-3 font-serif text-lg italic text-white/85">How to find your next book</p>
                    <span className="mt-10 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
                        Tap to open →
                    </span>
                </>
            )}
        </div>
    );
}

/* ---------------------------------------------------------------------------
 * The guide
 * ------------------------------------------------------------------------- */

export const guideChapters = [
    { label: 'Cover', page: 0 },
    { label: 'Ask', page: 2 },
    { label: 'Results', page: 4 },
    { label: 'Catalog', page: 6 },
    { label: 'History', page: 7 },
    { label: 'Admins', page: 8 },
    { label: 'Get started', page: 10 },
];

const contents = [
    ['Ask in plain words', 2],
    ['Read the results', 4],
    ['Tips for better answers', 5],
    ['Browse the catalog', 6],
    ['Pick up where you left off', 7],
    ['For admins', 8],
    ['Ready to read', 10],
];

export function guidePages({ startHref }) {
    return [
        { cover: true, render: () => <Cover /> },

        {
            number: 1,
            render: ({ goToPage }) => (
                <PageLayout chapter="Welcome" title="Contents" number={1}>
                    <p>
                        Folio is a book shop you can talk to. This little guide walks you through everything, from your
                        first question to managing the shelves.
                    </p>
                    <ul className="mt-4 space-y-1.5">
                        {contents.map(([title, page]) => (
                            <li key={title}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToPage(page);
                                    }}
                                    className="group flex w-full items-baseline gap-2 text-left hover:text-fuchsia-700"
                                >
                                    <span className="font-medium">{title}</span>
                                    <span className="flex-1 border-b border-dotted border-stone-300 group-hover:border-fuchsia-300" />
                                    <span className="font-serif text-stone-500">{page}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </PageLayout>
            ),
        },

        {
            number: 2,
            render: () => (
                <PageLayout chapter="Chapter 1" title="Ask in plain words" number={2}>
                    <p>No filters to learn. Describe what you want the way you'd ask a friend at the counter.</p>
                    <Steps
                        items={[
                            <>
                                Open <strong>Assistant</strong> from the top bar.
                            </>,
                            'Type your request, or tap one of the suggestions to start.',
                            <>
                                Press <strong>Enter</strong> to send. Use Shift + Enter for a new line.
                            </>,
                        ]}
                    />
                    <div className="mt-5 flex flex-wrap gap-2">
                        <Prompt>Fantasy under $20</Prompt>
                        <Prompt>Anything by Stephen King?</Prompt>
                        <Prompt>A classic for the weekend</Prompt>
                    </div>
                </PageLayout>
            ),
        },

        {
            number: 3,
            render: () => (
                <PageLayout number={3}>
                    <Figure
                        src="/images/guide/assistant.jpg"
                        alt="The assistant's start screen with suggestion cards"
                        caption="A fresh conversation, with suggestions to get you going"
                    />
                    <p>
                        Folio understands <strong>authors</strong>, <strong>categories</strong> and{' '}
                        <strong>budgets</strong>. It only recommends books we actually have on the shelf, so every
                        suggestion is one you can buy.
                    </p>
                </PageLayout>
            ),
        },

        {
            number: 4,
            render: () => (
                <PageLayout chapter="Chapter 2" title="Read the results" number={4}>
                    <Figure
                        src="/images/guide/results.jpg"
                        alt="An assistant reply listing spooky books with cover cards"
                        caption="“Something spooky under $20”"
                    />
                    <p>
                        Each reply has a short answer and a card for every matching book, with its cover, category and
                        price.
                    </p>
                </PageLayout>
            ),
        },

        {
            number: 5,
            render: () => (
                <PageLayout chapter="Chapter 2" title="Tips for better answers" number={5}>
                    <ul className="space-y-3">
                        <li>
                            <strong className="text-stone-900">Name a budget.</strong> “Under $15” or “below 20 dollars”
                            filters by price.
                        </li>
                        <li>
                            <strong className="text-stone-900">Mention an author or genre.</strong> “More like Brandon
                            Sanderson” or “some science fiction”.
                        </li>
                        <li>
                            <strong className="text-stone-900">Follow up.</strong> Folio remembers the conversation, so{' '}
                            <em>“anything shorter?”</em> or <em>“cheaper?”</em> just works.
                        </li>
                        <li>
                            <strong className="text-stone-900">Be vague, if you like.</strong> Not sure what you want?
                            Folio asks a question to narrow it down.
                        </li>
                    </ul>
                </PageLayout>
            ),
        },

        {
            number: 6,
            render: () => (
                <PageLayout chapter="Chapter 3" title="Browse the catalog" number={6}>
                    <Figure src="/images/guide/catalog.jpg" alt="The catalog page with book cards and filters" />
                    <p>
                        Prefer to browse? <strong>Catalog</strong> has search, category pills and a price filter. Every
                        book has an <strong>Ask Folio about this</strong> button that opens a chat about it.
                    </p>
                </PageLayout>
            ),
        },

        {
            number: 7,
            render: () => (
                <PageLayout chapter="Chapter 4" title="Pick up where you left off" number={7}>
                    <p>Every conversation is saved to your account, titled automatically from your first message.</p>
                    {/* A miniature of the conversation sidebar. */}
                    <div className="my-4 space-y-1.5 rounded-xl bg-stone-900 p-3 shadow-[0_8px_20px_-8px_rgb(0_0_0/0.55)]">
                        <div className="rounded-lg bg-linear-to-r from-violet-500 to-rose-400 py-1.5 text-center text-[11px] font-semibold text-white">
                            + New chat
                        </div>
                        {[
                            ['Something spooky under $20', 'just now', true],
                            ['Fantasy books under $20', '2 days ago'],
                            ['Getting better at programming', 'last week'],
                        ].map(([title, when, active]) => (
                            <div key={title} className={`rounded-lg px-2.5 py-1.5 ${active ? 'bg-white/15' : ''}`}>
                                <p className="truncate text-[11px] text-white/90">{title}</p>
                                <p className="text-[9px] text-white/40">{when}</p>
                            </div>
                        ))}
                    </div>
                    <p>
                        Open one from the <strong>Recent</strong> list to carry on, start a <strong>New chat</strong>{' '}
                        any time, or delete the ones you don't need.
                    </p>
                </PageLayout>
            ),
        },

        {
            number: 8,
            render: () => (
                <PageLayout chapter="Chapter 5" title="For admins" number={8}>
                    <Figure src="/images/guide/admin-books.jpg" alt="The admin book management list" />
                    <p>
                        Admins see an <strong>Admin</strong> link in the top bar. Add, edit or remove books and manage
                        categories. The assistant sees changes straight away.
                    </p>
                </PageLayout>
            ),
        },

        {
            number: 9,
            render: () => (
                <PageLayout chapter="Chapter 5" title="Give books a face" number={9}>
                    <Figure src="/images/guide/admin-edit.jpg" alt="Editing a book with its cover image preview" />
                    <p>
                        Drag a <strong>JPG, PNG or WebP</strong> cover onto the book form. Books with covers appear on
                        the homepage shelf, newest first.
                    </p>
                </PageLayout>
            ),
        },

        {
            number: 10,
            render: () => (
                <PageLayout number={10}>
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <ApplicationLogo className="h-14 w-14" />
                        <h3 className="mt-5 font-serif text-3xl leading-tight text-stone-900 sm:text-4xl">
                            Ready to <em className="text-fuchsia-700">read?</em>
                        </h3>
                        <p className="mt-3 max-w-[15rem]">Your next favourite book is one question away.</p>
                        <Link
                            href={startHref}
                            onClick={(e) => e.stopPropagation()}
                            className="btn-liquid mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-white"
                        >
                            Start a conversation →
                        </Link>
                    </div>
                </PageLayout>
            ),
        },

        { cover: true, render: () => <Cover back /> },
    ];
}
