export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-full border border-rose-300/30 bg-linear-to-b from-rose-500/90 to-rose-600/90 px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_10px_24px_-10px_rgb(244_63_94/0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 active:scale-[0.98] ${
                    disabled && 'opacity-40'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
