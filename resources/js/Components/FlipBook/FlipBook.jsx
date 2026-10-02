import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const FLIP_MS = 900;
const STAGGER_MS = 110;

function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const update = () => setMatches(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, [query]);

    return matches;
}

/**
 * A 3D page-turning book.
 *
 * Pages are bound into sheets that rotate around the spine: on wide screens each sheet
 * carries two pages (front on the right, back on the left, like a real spread); on
 * narrow screens each sheet carries one page so the text stays readable.
 *
 * @param {{ pages: Array<{ render: (ctx) => React.ReactNode, number?: number, cover?: boolean }>,
 *           chapters: Array<{ label: string, page: number }> }} props
 */
export default function FlipBook({ pages, chapters = [] }) {
    const single = useMediaQuery('(max-width: 767px)');
    const perSheet = single ? 1 : 2;

    const sheets = useMemo(() => {
        const result = [];
        for (let i = 0; i < pages.length; i += perSheet) {
            result.push({ front: i, back: perSheet === 2 ? i + 1 : null });
        }
        return result;
    }, [pages.length, perSheet]);

    // In single-page mode the last sheet (the back cover) stays on stage instead of turning away.
    const maxFlip = perSheet === 1 ? sheets.length - 1 : sheets.length;

    const [flipped, setFlipped] = useState(0);
    const [animating, setAnimating] = useState({}); // sheet index -> { delay, forward }
    const timer = useRef(null);
    const touchStart = useRef(null);

    // Keep the reader on the same page when switching between one- and two-page layouts.
    const previousPerSheet = useRef(perSheet);
    useEffect(() => {
        if (previousPerSheet.current === perSheet) return;
        setFlipped((current) => {
            const firstVisible = previousPerSheet.current === 2 ? Math.max(0, current * 2 - 1) : current;
            return perSheet === 2 ? Math.ceil(firstVisible / 2) : firstVisible;
        });
        previousPerSheet.current = perSheet;
    }, [perSheet]);

    const turnTo = useCallback(
        (target) => {
            const to = Math.max(0, Math.min(maxFlip, target));
            if (to === flipped) return;

            const forward = to > flipped;
            const changing = {};
            const [from, until] = forward ? [flipped, to] : [to, flipped];
            for (let i = from; i < until; i++) {
                const order = forward ? i - from : until - 1 - i;
                changing[i] = { delay: order * STAGGER_MS, forward };
            }

            clearTimeout(timer.current);
            setAnimating(changing);
            setFlipped(to);
            timer.current = setTimeout(() => setAnimating({}), FLIP_MS + (until - from) * STAGGER_MS);
        },
        [flipped, maxFlip],
    );

    useEffect(() => () => clearTimeout(timer.current), []);

    const next = () => turnTo(flipped + 1);
    const previous = () => turnTo(flipped - 1);

    /** The sheet count needed so that the given page is on screen. */
    const sheetForPage = (page) => (perSheet === 2 ? Math.ceil(page / 2) : page);

    const zIndexFor = (index) => {
        const motion = animating[index];
        if (motion) {
            // Sheets in motion float above both stacks, in the order they land.
            return 100 + (motion.forward ? index : sheets.length - index);
        }
        return index < flipped ? index + 1 : sheets.length - index;
    };

    // Center the closed book (and the finished book) on its visible half.
    const shift = single ? 0 : flipped === 0 ? -25 : flipped === sheets.length ? 25 : 0;

    const visiblePages =
        perSheet === 2
            ? [flipped * 2 - 1, flipped * 2].filter((page) => page >= 0 && page < pages.length)
            : [flipped].filter((page) => page < pages.length);
    const numbers = visiblePages.map((page) => pages[page].number).filter(Boolean);
    const label =
        flipped === 0
            ? 'Cover'
            : flipped === sheets.length || (perSheet === 1 && pages[flipped]?.cover)
              ? 'Back cover'
              : numbers.length > 1
                ? `Pages ${numbers[0]}–${numbers[numbers.length - 1]}`
                : `Page ${numbers[0]}`;

    const activeChapter = [...chapters].reverse().find((chapter) => sheetForPage(chapter.page) <= flipped);

    const ctx = { goToPage: (page) => turnTo(sheetForPage(page)), single };

    // Keep the current chapter's chip in view when the row overflows (phones).
    const chipsRef = useRef(null);
    useEffect(() => {
        const row = chipsRef.current;
        const chip = row?.querySelector('[data-active]');
        if (!row || !chip) return;
        row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' });
    }, [activeChapter?.page]);

    return (
        <div
            className="flex flex-col items-center outline-none"
            tabIndex={0}
            aria-roledescription="flip book"
            aria-label="Folio guide. Use the left and right arrow keys to turn pages."
            onKeyDown={(e) => {
                if (e.key === 'ArrowRight') next();
                if (e.key === 'ArrowLeft') previous();
            }}
            onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
                if (touchStart.current === null) return;
                const dx = e.changedTouches[0].clientX - touchStart.current;
                if (Math.abs(dx) > 40) (dx < 0 ? next : previous)();
                touchStart.current = null;
            }}
        >
            <div className={`relative w-full ${single ? 'max-w-[400px]' : 'max-w-[920px]'}`}>
                {/* Soft shadow the book casts on the "table". */}
                <div
                    className="pointer-events-none absolute -bottom-8 left-1/2 h-16 w-[85%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl transition-transform duration-700"
                    style={{ transform: `translateX(calc(-50% + ${shift}%)) scaleX(${shift ? 0.55 : 1})` }}
                />

                <div
                    className="relative w-full transition-transform duration-700 ease-out"
                    style={{
                        aspectRatio: single ? '460 / 620' : '920 / 550',
                        perspective: '2600px',
                        transform: `translateX(${shift}%)`,
                    }}
                >
                    {/* Page-edge thickness under each stack. */}
                    {!single && flipped > 0 && <PageEdges side="left" />}
                    {flipped < maxFlip && <PageEdges side="right" single={single} />}

                    {sheets.map((sheet, index) => {
                        const isFlipped = index < flipped;
                        const motion = animating[index];

                        return (
                            <div
                                key={`${perSheet}-${index}`}
                                className="absolute top-0 h-full"
                                style={{
                                    left: single ? 0 : '50%',
                                    width: single ? '100%' : '50%',
                                    transformStyle: 'preserve-3d',
                                    transformOrigin: 'left center',
                                    transform: `rotateY(${isFlipped ? -180 : 0}deg)`,
                                    transition: `transform ${FLIP_MS}ms cubic-bezier(0.645, 0.045, 0.355, 1) ${motion?.delay ?? 0}ms${
                                        single ? `, visibility 0s linear ${isFlipped ? FLIP_MS + (motion?.delay ?? 0) : 0}ms` : ''
                                    }`,
                                    visibility: single && isFlipped ? 'hidden' : 'visible',
                                    zIndex: zIndexFor(index),
                                }}
                            >
                                <Face side="front" moving={Boolean(motion)} onClick={next}>
                                    {pages[sheet.front].render(ctx)}
                                </Face>
                                <Face side="back" moving={Boolean(motion)} onClick={previous}>
                                    {sheet.back !== null && pages[sheet.back] ? pages[sheet.back].render(ctx) : <Paper />}
                                </Face>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-12 flex w-full max-w-[920px] flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                    <NavButton onClick={previous} disabled={flipped === 0} label="Previous page">
                        <ChevronLeft className="h-5 w-5" />
                    </NavButton>
                    <span className="glass-subtle min-w-36 rounded-full px-4 py-2 text-center text-sm font-medium text-white/80" aria-live="polite">
                        {label}
                    </span>
                    <NavButton onClick={next} disabled={flipped === maxFlip} label="Next page">
                        <ChevronRight className="h-5 w-5" />
                    </NavButton>
                </div>

                {chapters.length > 0 && (
                    <div ref={chipsRef} className="flex max-w-full gap-1.5 overflow-x-auto px-2 pb-1 [scrollbar-width:none]">
                        {chapters.map((chapter) => {
                            const active = activeChapter?.page === chapter.page;
                            return (
                                <button
                                    key={chapter.page}
                                    type="button"
                                    data-active={active || undefined}
                                    onClick={() => turnTo(sheetForPage(chapter.page))}
                                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs transition ${
                                        active
                                            ? 'bg-white/20 font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]'
                                            : 'text-white/55 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {chapter.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function Face({ side, moving, onClick, children }) {
    const isFront = side === 'front';

    return (
        <div
            onClick={onClick}
            className="absolute inset-0 cursor-pointer overflow-hidden"
            style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: isFront ? 'none' : 'rotateY(180deg)',
                borderRadius: isFront ? '4px 14px 14px 4px' : '14px 4px 4px 14px',
            }}
        >
            {children}

            {/* Gutter shading next to the spine. */}
            <div
                className="pointer-events-none absolute inset-y-0 w-10"
                style={{
                    [isFront ? 'left' : 'right']: 0,
                    background: `linear-gradient(to ${isFront ? 'right' : 'left'}, rgb(0 0 0 / 0.22), rgb(0 0 0 / 0.06) 35%, transparent)`,
                }}
            />
            {/* Light sweeping across the page while it turns. */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `linear-gradient(${isFront ? 100 : 260}deg, rgb(255 255 255 / 0.25), transparent 40%, rgb(0 0 0 / 0.18))`,
                    opacity: moving ? 1 : 0,
                    transition: `opacity ${FLIP_MS / 2}ms ease`,
                }}
            />
        </div>
    );
}

function PageEdges({ side, single = false }) {
    return (
        <div
            aria-hidden="true"
            className="absolute top-0 h-full bg-[#ebe4d6]"
            style={{
                left: side === 'left' ? 0 : single ? 0 : '50%',
                width: single ? '100%' : '50%',
                borderRadius: side === 'left' ? '14px 4px 4px 14px' : '4px 14px 14px 4px',
                transform: `translate(${side === 'left' ? -5 : 5}px, 5px)`,
                boxShadow:
                    side === 'left'
                        ? '-1px 1px 0 #ddd5c4, -2px 2px 0 #d2c9b6, -3px 3px 0 #c7bda9, -12px 18px 30px -10px rgb(0 0 0 / 0.6)'
                        : '1px 1px 0 #ddd5c4, 2px 2px 0 #d2c9b6, 3px 3px 0 #c7bda9, 12px 18px 30px -10px rgb(0 0 0 / 0.6)',
            }}
        />
    );
}

function NavButton({ onClick, disabled, label, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className="glass-strong flex h-11 w-11 items-center justify-center rounded-full text-white/85 transition hover:scale-105 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
            {children}
        </button>
    );
}

/** A blank sheet of paper, used for the back of single-page sheets. */
export function Paper({ children, className = '' }) {
    return (
        <div
            className={`h-full w-full text-stone-800 ${className}`}
            style={{
                background: 'radial-gradient(ellipse at 30% 20%, #fbf8f1 0%, #f4eee2 60%, #ece4d4 100%)',
            }}
        >
            {children}
        </div>
    );
}
