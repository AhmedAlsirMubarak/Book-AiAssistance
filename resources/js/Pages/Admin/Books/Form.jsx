import AdminHeader from '@/Components/AdminHeader';
import BookCover from '@/Components/BookCover';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPrice } from '@/lib/format';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AdminBookForm({ book, categories }) {
    const editing = book !== null;

    const { data, setData, post, processing, errors, progress } = useForm({
        title: book?.title ?? '',
        author: book?.author ?? '',
        category_id: book?.category_id ?? categories[0]?.id ?? '',
        price: book?.price ?? '',
        description: book?.description ?? '',
        cover: null,
        remove_cover: false,
        // File uploads must be sent as multipart POST; Laravel reads the real verb from _method.
        ...(editing ? { _method: 'put' } : {}),
    });

    const submit = (e) => {
        e.preventDefault();
        post(editing ? route('admin.books.update', book.id) : route('admin.books.store'), { forceFormData: true });
    };

    const category = categories.find((item) => item.id === Number(data.category_id));

    // Preview the newly chosen file, else the existing cover (unless it's being removed).
    const [selectedUrl, setSelectedUrl] = useState(null);
    useEffect(() => {
        if (!data.cover) return setSelectedUrl(null);
        const url = URL.createObjectURL(data.cover);
        setSelectedUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [data.cover]);

    const coverUrl = selectedUrl ?? (data.remove_cover ? null : book?.cover_url ?? null);

    return (
        <AuthenticatedLayout header={<AdminHeader title={editing ? 'Edit book' : 'Add a book'} />}>
            <Head title={editing ? `Edit ${book.title}` : 'Add book'} />

            <div className="mx-auto max-w-[83rem] px-3 pb-16 pt-6 sm:px-6">
                <Link
                    href={route('admin.books.index')}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to books
                </Link>

                <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
                    <form onSubmit={submit} className="glass space-y-5 rounded-[1.75rem] p-5 sm:p-8">
                        {categories.length === 0 && (
                            <div className="rounded-2xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                                You need at least one category first.{' '}
                                <Link href={route('admin.categories.index')} className="font-semibold underline">
                                    Create a category
                                </Link>
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="title" value="Title" />
                            <TextInput
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 block w-full"
                                isFocused
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="author" value="Author" />
                            <TextInput
                                id="author"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.author} className="mt-2" />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="category_id" value="Category" />
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 capitalize text-white focus:border-fuchsia-300/60 focus:ring-2 focus:ring-fuchsia-400/30"
                                    required
                                >
                                    {categories.map((item) => (
                                        <option key={item.id} value={item.id} className="bg-zinc-900 capitalize">
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.category_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="price" value="Price (USD)" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.price} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                rows={5}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-white placeholder:text-white/35 focus:border-fuchsia-300/60 focus:ring-2 focus:ring-fuchsia-400/30"
                                placeholder="A short blurb. The assistant searches descriptions too."
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Link
                                href={route('admin.books.index')}
                                className="glass-subtle rounded-full px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white"
                            >
                                Cancel
                            </Link>
                            <PrimaryButton disabled={processing || categories.length === 0}>
                                {editing ? 'Save changes' : 'Add book'}
                            </PrimaryButton>
                        </div>
                    </form>

                    <aside className="glass h-fit rounded-[1.75rem] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Preview</p>
                        <BookCover
                            book={{ title: data.title || 'Untitled', author: data.author || 'Author', cover_url: coverUrl }}
                            className="mx-auto mt-4 aspect-[2/3] w-40"
                        />

                        <CoverPicker
                            hasCover={coverUrl !== null}
                            onSelect={(file) => {
                                setData((current) => ({ ...current, cover: file, remove_cover: false }));
                            }}
                            onRemove={() => setData((current) => ({ ...current, cover: null, remove_cover: true }))}
                        />
                        {progress && (
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-linear-to-r from-violet-400 to-fuchsia-400 transition-all"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        )}
                        <InputError message={errors.cover} className="mt-2 text-center" />
                        <p className="mt-4 truncate text-center font-semibold text-white">{data.title || 'Untitled'}</p>
                        <p className="truncate text-center text-sm text-white/50">
                            {data.author || 'Author'}
                            {category && <span className="capitalize"> · {category.name}</span>}
                        </p>
                        {data.price !== '' && (
                            <p className="mt-2 text-center text-lg font-semibold text-fuchsia-200">{formatPrice(data.price)}</p>
                        )}
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function CoverPicker({ hasCover, onSelect, onRemove }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const pick = (file) => {
        if (file && file.type.startsWith('image/')) onSelect(file);
    };

    return (
        <div className="mt-4 space-y-2">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    pick(e.dataTransfer.files[0]);
                }}
                className={`flex w-full flex-col items-center gap-1 rounded-2xl border border-dashed px-4 py-4 text-center transition ${
                    dragging
                        ? 'border-fuchsia-300/70 bg-fuchsia-500/10'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/[0.05]'
                }`}
            >
                <ImagePlus className="h-5 w-5 text-fuchsia-200" />
                <span className="text-sm font-medium text-white/85">{hasCover ? 'Replace cover' : 'Upload cover'}</span>
                <span className="text-[11px] text-white/45">JPG, PNG or WebP · up to 2 MB · drag & drop</span>
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                    pick(e.target.files[0]);
                    e.target.value = '';
                }}
            />
            {hasCover && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium text-white/55 transition hover:bg-rose-500/15 hover:text-rose-200"
                >
                    <Trash2 className="h-3.5 w-3.5" /> Remove cover
                </button>
            )}
        </div>
    );
}
