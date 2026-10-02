import ApplicationLogo from '@/Components/ApplicationLogo';
import Aurora from '@/Components/Aurora';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    CircleAlert,
    CircleCheck,
    Library,
    LogOut,
    Menu,
    ShieldCheck,
    Sparkles,
    UserRound,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * @param {{ header?: React.ReactNode, fill?: boolean, children: React.ReactNode }} props
 *   `fill` locks the layout to the viewport height so the page can manage its own scrolling.
 */
export default function AuthenticatedLayout({ header, fill = false, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const initials = user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className={fill ? 'flex h-dvh flex-col' : 'min-h-dvh'}>
            <Aurora />

            <div className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
                <nav className="glass-strong mx-auto max-w-7xl rounded-[1.75rem]">
                    <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4">
                        <div className="flex items-center gap-6">
                            <Link href={route('dashboard')} className="flex items-center gap-2.5 rounded-full pr-2">
                                <ApplicationLogo className="h-9 w-9" />
                                <span className="font-serif text-2xl tracking-tight text-white">Folio</span>
                            </Link>

                            <div className="hidden items-center gap-1 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    <Sparkles className="h-4 w-4" />
                                    Assistant
                                </NavLink>
                                <NavLink href={route('books.index')} active={route().current('books.index')}>
                                    <Library className="h-4 w-4" />
                                    Catalog
                                </NavLink>
                                {user.is_admin && (
                                    <NavLink href={route('admin.books.index')} active={route().current('admin.*')}>
                                        <ShieldCheck className="h-4 w-4" />
                                        Admin
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.07] hover:text-white"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-violet-400 to-fuchsia-500 text-xs font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]">
                                            {initials}
                                        </span>
                                        {user.name}
                                        <ChevronDown className="h-4 w-4 opacity-60" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content width="48">
                                    <div className="px-3.5 pb-2 pt-1.5">
                                        <p className="truncate text-xs text-white/50">{user.email}</p>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        <span className="flex items-center gap-2">
                                            <UserRound className="h-4 w-4" /> Profile
                                        </span>
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        <span className="flex items-center gap-2">
                                            <LogOut className="h-4 w-4" /> Log out
                                        </span>
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowingNavigationDropdown((previous) => !previous)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white sm:hidden"
                            aria-label="Toggle navigation"
                            aria-expanded={showingNavigationDropdown}
                        >
                            {showingNavigationDropdown ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>

                    {showingNavigationDropdown && (
                        <div className="space-y-1 border-t border-white/10 p-3 sm:hidden">
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                                <Sparkles className="h-4 w-4" /> Assistant
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('books.index')} active={route().current('books.index')}>
                                <Library className="h-4 w-4" /> Catalog
                            </ResponsiveNavLink>
                            {user.is_admin && (
                                <ResponsiveNavLink href={route('admin.books.index')} active={route().current('admin.*')}>
                                    <ShieldCheck className="h-4 w-4" /> Admin
                                </ResponsiveNavLink>
                            )}
                            <div className="my-2 border-t border-white/10" />
                            <div className="px-4 py-1">
                                <p className="text-sm font-medium text-white">{user.name}</p>
                                <p className="text-xs text-white/50">{user.email}</p>
                            </div>
                            <ResponsiveNavLink href={route('profile.edit')} active={route().current('profile.edit')}>
                                <UserRound className="h-4 w-4" /> Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                <LogOut className="h-4 w-4" /> Log out
                            </ResponsiveNavLink>
                        </div>
                    )}
                </nav>
            </div>

            {header && (
                <header className="mx-auto w-full max-w-[83rem] px-5 pb-2 pt-8 sm:px-8 sm:pt-10">{header}</header>
            )}

            <main className={fill ? 'min-h-0 flex-1' : ''}>{children}</main>

            <FlashToast />
        </div>
    );
}

/**
 * Shows the session's success flash, or a non-field error, as a floating glass toast.
 */
function FlashToast() {
    const { flash, errors } = usePage().props;
    const message = flash?.success ?? errors?.category ?? null;
    const isError = !flash?.success && Boolean(errors?.category);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!message) return;
        setVisible(true);
        const timeout = setTimeout(() => setVisible(false), 4500);
        return () => clearTimeout(timeout);
    }, [message, flash, errors]);

    if (!message || !visible) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
            <div
                role="status"
                className="glass-strong pointer-events-auto flex animate-rise items-center gap-3 rounded-full py-2.5 pl-3 pr-2 text-sm text-white"
            >
                {isError ? (
                    <CircleAlert className="h-5 w-5 shrink-0 text-rose-300" />
                ) : (
                    <CircleCheck className="h-5 w-5 shrink-0 text-emerald-300" />
                )}
                <span>{message}</span>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                    aria-label="Dismiss"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
