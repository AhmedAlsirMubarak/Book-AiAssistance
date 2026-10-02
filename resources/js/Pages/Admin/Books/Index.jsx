import AdminHeader from '@/Components/AdminHeader';
import BookCover from '@/Components/BookCover';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPrice } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import { BookPlus, Pencil, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AdminBooksIndex({ books, filters, stats }) {
    const [query, setQuery] = useState(filters.q ?? '');
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const timeout = setTimeout(
            () => router.get(route('admin.books.index'), query ? { q: query } : {}, { preserveState: true, replace: true }),
            300,
        );
        return () => clearTimeout(timeout);
    }, [query]);

    const deletingRef = useRef(false);

    const destroy = () => {
        if (!deleting || deletingRef.current) return;
        deletingRef.current = true;
        setProcessing(true);

        router.delete(route('admin.books.destroy', deleting.id), {
            preserveScroll: true,
            onFinish: () => {
                deletingRef.current = false;
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <AdminHeader
                    title="Manage books"
                    action={
                        <Link
                            href={route('admin.books.create')}
                            className="btn-liquid inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                        >
                            <BookPlus className="h-4 w-4" /> Add book
                        </Link>
                    }
                />
            }
        >
            <Head title="Admin · Books" />

            <div className="mx-auto max-w-[83rem] px-3 pb-16 pt-6 sm:px-6">
                <div className="glass overflow-hidden rounded-[1.75rem]">
                    <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <label className="glass-subtle flex flex-1 items-center gap-3 rounded-2xl px-4 sm:max-w-md">
                            <Search className="h-4 w-4 shrink-0 text-white/45" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search books…"
                                className="w-full border-0 bg-transparent px-0 py-2.5 text-white placeholder:text-white/40 focus:ring-0"
                            />
                        </label>
                        <p className="text-sm text-white/50">
                            {stats.books} books · {stats.categories} categories
                        </p>
                    </div>

                    {books.data.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <p className="font-semibold text-white">No books found</p>
                            <p className="mt-1 text-sm text-white/50">
                                {filters.q ? 'Try a different search.' : 'Add your first book to get started.'}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-white/[0.07]">
                            {books.data.map((book) => (
                                <li key={book.id} className="flex items-center gap-4 px-4 py-3 transition hover:bg-white/[0.04] sm:px-5">
                                    <BookCover book={book} className="h-16 w-11 shrink-0 !p-1 [&_p]:hidden" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-white">{book.title}</p>
                                        <p className="truncate text-sm text-white/55">{book.author}</p>
                                    </div>
                                    <span className="hidden rounded-full bg-white/10 px-2.5 py-0.5 text-xs capitalize text-white/70 md:inline">
                                        {book.category}
                                    </span>
                                    <span className="w-20 text-right font-semibold text-fuchsia-200">{formatPrice(book.price)}</span>
                                    <div className="flex gap-1">
                                        <Link
                                            href={route('admin.books.edit', book.id)}
                                            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                                            aria-label={`Edit “${book.title}”`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setDeleting(book)}
                                            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-rose-500/20 hover:text-rose-200"
                                            aria-label={`Delete “${book.title}”`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {books.last_page > 1 && (
                    <nav className="mt-8 flex justify-center" aria-label="Pagination">
                        <div className="glass-subtle flex flex-wrap items-center gap-1 rounded-full p-1.5">
                            {books.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`min-w-9 rounded-full px-3 py-1.5 text-center text-sm transition ${
                                        link.active
                                            ? 'bg-white/20 font-semibold text-white'
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

            <Modal show={deleting !== null} onClose={() => setDeleting(null)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-white">Delete this book?</h2>
                    <p className="mt-2 text-sm text-white/60">
                        “{deleting?.title}” will be removed from the catalog and the assistant will stop recommending it.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeleting(null)}>Cancel</SecondaryButton>
                        <DangerButton onClick={destroy} disabled={processing}>
                            Delete
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
