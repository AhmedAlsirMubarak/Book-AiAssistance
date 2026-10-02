import ApplicationLogo from '@/Components/ApplicationLogo';
import Aurora from '@/Components/Aurora';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ title, subtitle, children }) {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
            <Aurora />

            <Link href="/" className="mb-8 flex items-center gap-3">
                <ApplicationLogo className="h-12 w-12" />
                <span className="font-serif text-4xl tracking-tight text-white">Folio</span>
            </Link>

            <div className="glass-strong w-full max-w-md animate-rise rounded-[2rem] px-6 py-8 sm:px-9 sm:py-10">
                {title && (
                    <div className="mb-7 text-center">
                        <h1 className="font-serif text-3xl text-white">{title}</h1>
                        {subtitle && <p className="mt-2 text-sm text-white/55">{subtitle}</p>}
                    </div>
                )}

                {children}
            </div>

            <p className="mt-8 text-xs text-white/35">Your AI-powered book shop assistant</p>
        </div>
    );
}
