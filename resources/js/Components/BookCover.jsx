import { useEffect, useState } from 'react';

const palettes = [
    ['#7c3aed', '#db2777'],
    ['#0891b2', '#6366f1'],
    ['#ea580c', '#e11d48'],
    ['#059669', '#0ea5e9'],
    ['#9333ea', '#2563eb'],
    ['#ca8a04', '#dc2626'],
    ['#be185d', '#7c3aed'],
    ['#0f766e', '#65a30d'],
];

function hash(value) {
    let h = 0;
    for (let i = 0; i < value.length; i++) {
        h = (h * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

/**
 * A generated, glossy book cover derived from the book's title.
 */
export default function BookCover({ book, className = '' }) {
    const [failed, setFailed] = useState(false);

    useEffect(() => setFailed(false), [book.cover_url]);

    if (book.cover_url && !failed) {
        return (
            <div
                className={`relative overflow-hidden rounded-xl bg-white/10 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.8)] ${className}`}
            >
                <img
                    src={book.cover_url}
                    alt={`Cover of ${book.title}`}
                    loading="lazy"
                    onError={() => setFailed(true)}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-r from-black/35 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/20 to-transparent" />
                <div className="absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_0_0_1px_rgb(255_255_255/0.08)]" />
            </div>
        );
    }

    const [from, to] = palettes[hash(book.title) % palettes.length];

    return (
        <div
            className={`relative flex flex-col justify-between overflow-hidden rounded-xl p-3 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.8)] ${className}`}
            style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
        >
            <div className="absolute inset-y-0 left-0 w-2 bg-black/25" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/35 to-transparent" />
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-xl" />
            <p className="relative line-clamp-4 pl-1.5 font-serif text-[15px] leading-tight text-white drop-shadow">
                {book.title}
            </p>
            <p className="relative line-clamp-1 pl-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/75">
                {book.author}
            </p>
        </div>
    );
}
