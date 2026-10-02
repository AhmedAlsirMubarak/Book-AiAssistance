import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ' +
                (active
                    ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_4px_14px_-6px_rgb(0_0_0/0.6)]'
                    : 'text-white/60 hover:bg-white/[0.07] hover:text-white') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
