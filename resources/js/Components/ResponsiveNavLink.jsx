import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-start text-base font-medium transition duration-150 focus:outline-none ${
                active
                    ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]'
                    : 'text-white/65 hover:bg-white/[0.07] hover:text-white'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
