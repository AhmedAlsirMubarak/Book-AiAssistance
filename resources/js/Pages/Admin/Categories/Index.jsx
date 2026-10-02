import AdminHeader from '@/Components/AdminHeader';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';

export default function AdminCategoriesIndex({ categories }) {
    const create = useForm({ name: '' });
    const [editingId, setEditingId] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const deletingRef = useRef(false);

    const submitCreate = (e) => {
        e.preventDefault();
        create.post(route('admin.categories.store'), {
            preserveScroll: true,
            onSuccess: () => create.reset(),
        });
    };

    const destroy = () => {
        if (!deleting || deletingRef.current) return;
        deletingRef.current = true;
        setIsDeleting(true);

        router.delete(route('admin.categories.destroy', deleting.id), {
            preserveScroll: true,
            onFinish: () => {
                deletingRef.current = false;
                setIsDeleting(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AuthenticatedLayout header={<AdminHeader title="Manage categories" />}>
            <Head title="Admin · Categories" />

            <div className="mx-auto max-w-[83rem] px-3 pb-16 pt-6 sm:px-6">
                <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
                    <form onSubmit={submitCreate} className="glass h-fit rounded-[1.75rem] p-5 sm:p-6">
                        <h2 className="font-semibold text-white">New category</h2>
                        <p className="mt-1 text-sm text-white/50">
                            The assistant uses category names to understand requests like “horror books”.
                        </p>
                        <TextInput
                            value={create.data.name}
                            onChange={(e) => create.setData('name', e.target.value)}
                            placeholder="e.g. poetry"
                            className="mt-4 block w-full"
                            aria-label="Category name"
                            required
                        />
                        <InputError message={create.errors.name} className="mt-2" />
                        <PrimaryButton className="mt-4 w-full" disabled={create.processing}>
                            <Plus className="h-4 w-4" /> Add category
                        </PrimaryButton>
                    </form>

                    <div className="glass overflow-hidden rounded-[1.75rem]">
                        {categories.length === 0 ? (
                            <p className="px-6 py-16 text-center text-sm text-white/50">No categories yet.</p>
                        ) : (
                            <ul className="divide-y divide-white/[0.07]">
                                {categories.map((category) =>
                                    editingId === category.id ? (
                                        <EditRow key={category.id} category={category} onDone={() => setEditingId(null)} />
                                    ) : (
                                        <li key={category.id} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/[0.04]">
                                            <span className="flex-1 font-medium capitalize text-white">{category.name}</span>
                                            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/65">
                                                {category.books_count} {category.books_count === 1 ? 'book' : 'books'}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(category.id)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                                                    aria-label={`Rename ${category.name}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleting(category)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-rose-500/20 hover:text-rose-200"
                                                    aria-label={`Delete ${category.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={deleting !== null} onClose={() => setDeleting(null)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-white">Delete “{deleting?.name}”?</h2>
                    <p className="mt-2 text-sm text-white/60">
                        {deleting?.books_count > 0
                            ? `This category still has ${deleting.books_count} book(s). Move or delete them before deleting the category.`
                            : 'This category is empty and will be permanently removed.'}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeleting(null)}>Cancel</SecondaryButton>
                        <DangerButton onClick={destroy} disabled={isDeleting || deleting?.books_count > 0}>
                            Delete
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

function EditRow({ category, onDone }) {
    const { data, setData, put, processing, errors } = useForm({ name: category.name });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.categories.update', category.id), {
            preserveScroll: true,
            onSuccess: onDone,
        });
    };

    return (
        <li className="bg-white/[0.04] px-5 py-3">
            <form onSubmit={submit} className="flex items-center gap-2">
                <TextInput
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="flex-1 !py-1.5"
                    aria-label="Category name"
                    isFocused
                    onKeyDown={(e) => e.key === 'Escape' && onDone()}
                />
                <button
                    type="submit"
                    disabled={processing}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-emerald-300 transition hover:bg-emerald-500/20"
                    aria-label="Save"
                >
                    <Check className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={onDone}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10"
                    aria-label="Cancel"
                >
                    <X className="h-4 w-4" />
                </button>
            </form>
            <InputError message={errors.name} className="mt-2" />
        </li>
    );
}
