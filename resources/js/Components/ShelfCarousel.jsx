import BookCover from '@/Components/BookCover';
import { formatPrice } from '@/lib/format';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const AUTO_ADVANCE_MS = 3500;

/**
 * A horizontally scrolling shelf of books that advances on its own, pauses on
 * hover / focus / touch, loops back to the start, and can be swiped or stepped
 * with the arrow buttons.
 */
export default function ShelfCarousel({ books, hrefFor }) {
    const trackRef = useRef(null);
    const [paused, setPaused] = useState(false);
    const [edges, setEdges] = useState({ start: true, end: false });

    const updateEdges = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setEdges({
            start: el.scrollLeft <= 4,
            end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
        });
    }, []);

    const step = useCallback((direction) => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.querySelector('[data-shelf-card]');
        const distance = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
        const atStart = el.scrollLeft <= 4;

        if (direction > 0 && atEnd) {
            el.scrollTo({ left: 0, behavior: 'smooth' });
        } else if (direction < 0 && atStart) {
            el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
        } else {
            el.scrollBy({ left: direction * distance, behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        updateEdges();
        window.addEventListener('resize', updateEdges);
        return () => window.removeEventListener('resize', updateEdges);
    }, [books, updateEdges]);

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (paused || reduceMotion) return;

        const interval = setInterval(() => {
            if (!document.hidden) step(1);
        }, AUTO_ADVANCE_MS);
        return () => clearInterval(interval);
    }, [paused, step]);

    return (
        <div
            className="group/shelf relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}
        >
            <div
                ref={trackRef}
                onScroll={updateEdges}
                className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:scroll-px-6 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent)',
                }}
                aria-label="Newest books"
            >
                {books.map((book, index) => (
                    <Link
                        key={book.id}
                        href={hrefFor(book)}
                        data-shelf-card
                        style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                        className="glass group w-[11.5rem] shrink-0 animate-rise snap-start rounded-[1.5rem] p-3.5 transition duration-300 hover:-translate-y-1 sm:w-60"
                    >
                        <div className="relative">
                            <BookCover
                                book={book}
                                className="aspect-2/3 w-full transition duration-500 group-hover:scale-[1.02]"
                            />
                            {book.is_new && (
                                <span className="btn-liquid absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                    New
                                </span>
                            )}
                        </div>
                        <p className="mt-3 truncate text-sm font-semibold text-white">{book.title}</p>
                        <div className="mt-0.5 flex items-center justify-between gap-2 text-xs">
                            <span className="truncate text-white/50">{book.author}</span>
                            <span className="font-semibold text-fuchsia-200">{formatPrice(book.price)}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {!(edges.start && edges.end) && (
                <>
                    <ShelfButton direction={-1} onClick={() => step(-1)} />
                    <ShelfButton direction={1} onClick={() => step(1)} />
                </>
            )}
        </div>
    );
}

function ShelfButton({ direction, onClick }) {
    const Icon = direction < 0 ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={direction < 0 ? 'Previous books' : 'Next books'}
            className={`glass-strong absolute top-[40%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white/85 opacity-0 transition hover:scale-105 hover:text-white focus:opacity-100 group-hover/shelf:opacity-100 sm:flex ${
                direction < 0 ? '-left-3' : '-right-3'
            }`}
        >
            <Icon className="h-5 w-5" />
        </button>
    );
}
