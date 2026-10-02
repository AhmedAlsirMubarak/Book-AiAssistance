import BookCover from '@/Components/BookCover';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPrice } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import { Search, SearchX, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const priceOptions = [
    { label: 'Any price', value: '' },
    { label: 'Under $10', value: '10' },
    { label: 'Under $15', value: '15' },
    { label: 'Under $20', value: '20' },
    { label: 'Under $30', value: '30' },
];

export default function BooksIndex({ books, categories, filters }) {
    const [query, setQuery] = useState(filters.q ?? '');
    const firstRender = useRef(true);

    const apply = (changes) => {
        const next = { ...filters, q: query, ...changes };
        router.get(
            route('books.index'),
            Object.fromEntries(Object.entries(next).filter(([, value]) => value !== '' && value != null)),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Debounce the free-text search.
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const timeout = setTimeout(() => apply({ q: query }), 300);
        return () => clearTimeout(timeout);
    }, [query]);

    const activeCategory = filters.category ? Number(filters.category) : null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200/70">The collection</p>
                        <h1 className="mt-1 font-serif text-4xl text-white sm:text-5xl">Browse the catalog</h1>
                    </div>
                    <p className="text-sm text-white/50">{books.total} books on the shelf</p>
                </div>
            }
        >
            <Head title="Catalog" />

            <div className="mx-auto max-w-[83rem] px-3 pb-16 pt-6 sm:px-6">
                <div className="glass rounded-[1.75rem] p-3 sm:p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <label className="glass-subtle flex flex-1 items-center gap-3 rounded-2xl px-4">
                            <Search className="h-4 w-4 shrink-0 text-white/45" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search titles, authors, or descriptions…"
                                className="w-full border-0 bg-transparent px-0 py-3 text-white placeholder:text-white/40 focus:ring-0"
                            />
                        </label>
                        <select
                            value={filters.max_price ?? ''}
                            onChange={(e) => apply({ max_price: e.target.value })}
                            className="glass-subtle rounded-2xl border-0 py-3 pl-4 pr-10 text-sm text-white focus:ring-2 focus:ring-fuchsia-400/30"
                            aria-label="Maximum price"
                        >
                            {priceOptions.map((option) => (
                                <option key={option.value} value={option.value} className="bg-zinc-900">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        <CategoryPill active={!activeCategory} onClick={() => apply({ category: '' })}>
                            All
                        </CategoryPill>
                        {categories.map((category) => (
                            <CategoryPill
                                key={category.id}
                                active={activeCategory === category.id}
                                onClick={() => apply({ category: category.id })}
                            >
                                {category.name}
                                <span className="ml-1.5 text-white/40">{category.books_count}</span>
                            </CategoryPill>
                        ))}
                    </div>
                </div>

                {books.data.length === 0 ? (
                    <div className="glass-subtle mt-8 flex flex-col items-center rounded-[1.75rem] px-6 py-16 text-center">
                        <SearchX className="h-10 w-10 text-white/35" />
                        <h2 className="mt-4 text-lg font-semibold text-white">No books match those filters</h2>
                        <p className="mt-1 text-sm text-white/50">Try a different search, or ask the assistant for ideas.</p>
                        <Link
                            href={route('dashboard', { prompt: query || undefined })}
                            className="btn-liquid mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                        >
                            <Sparkles className="h-4 w-4" /> Ask Folio
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {books.data.map((book, index) => (
                            <BookCard key={book.id} book={book} index={index} />
                        ))}
                    </div>
                )}

                {books.last_page > 1 && (
                    <nav className="mt-10 flex justify-center" aria-label="Pagination">
                        <div className="glass-subtle flex flex-wrap items-center gap-1 rounded-full p-1.5">
                            {books.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    preserveState
                                    className={`min-w-9 rounded-full px-3 py-1.5 text-center text-sm transition ${
                                        link.active
                                            ? 'bg-white/20 font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]'
                                            : link.url
                                              ? 'text-white/65 hover:bg-white/10 hover:text-white'
                                              : 'pointer-events-none text-white/25'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </nav>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function CategoryPill({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm capitalize transition ${
                active
                    ? 'bg-white/20 font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_6px_16px_-8px_rgb(0_0_0/0.6)]'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
        >
            {children}
        </button>
    );
}

function BookCard({ book, index }) {
    return (
        <article
            style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
            className="glass group flex animate-rise flex-col rounded-[1.5rem] p-4 transition duration-300 hover:-translate-y-1"
        >
            <div className="flex gap-4">
                <BookCover
                    book={book}
                    className="h-36 w-24 shrink-0 transition duration-500 group-hover:-rotate-2 group-hover:scale-[1.03]"
                />
                <div className="flex min-w-0 flex-col">
                    {book.category && (
                        <span className="self-start rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium capitalize text-white/70">
                            {book.category}
                        </span>
                    )}
                    <h2 className="mt-2 line-clamp-3 font-semibold leading-snug text-white">{book.title}</h2>
                    <p className="mt-1 truncate text-sm text-white/55">{book.author}</p>
                    <p className="mt-auto pt-2 text-lg font-semibold text-fuchsia-200">{formatPrice(book.price)}</p>
                </div>
            </div>

            {book.description && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/55">{book.description}</p>}

            <Link
                href={route('dashboard', { prompt: `Tell me about "${book.title}" and suggest similar books.` })}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/75 transition hover:border-fuchsia-300/40 hover:bg-white/10 hover:text-white"
            >
                <Sparkles className="h-3.5 w-3.5" /> Ask Folio about this
            </Link>
        </article>
    );
}
