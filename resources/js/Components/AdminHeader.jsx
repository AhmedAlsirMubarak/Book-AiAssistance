import { Link } from '@inertiajs/react';
import { BookCopy, Tags } from 'lucide-react';

const tabs = [
    { label: 'Books', icon: BookCopy, href: () => route('admin.books.index'), active: () => route().current('admin.books.*') },
    { label: 'Categories', icon: Tags, href: () => route('admin.categories.index'), active: () => route().current('admin.categories.*') },
];

export default function AdminHeader({ title, action }) {
    return (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200/70">Admin</p>
                <h1 className="mt-1 font-serif text-4xl text-white sm:text-5xl">{title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <nav className="glass-subtle flex rounded-full p-1" aria-label="Admin sections">
                    {tabs.map(({ label, icon: Icon, href, active }) => (
                        <Link
                            key={label}
                            href={href()}
                            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition ${
                                active()
                                    ? 'bg-white/20 font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    ))}
                </nav>
                {action}
            </div>
        </div>
    );
}
