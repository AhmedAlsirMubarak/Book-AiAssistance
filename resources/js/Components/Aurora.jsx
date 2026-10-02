/**
 * The animated, colorful backdrop that the glass surfaces refract.
 */
export default function Aurora() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
            <div className="absolute -left-[10%] -top-[15%] h-[55vmax] w-[55vmax] animate-drift-a rounded-full bg-violet-600/45 blur-[110px]" />
            <div className="absolute -right-[15%] top-[10%] h-[50vmax] w-[50vmax] animate-drift-b rounded-full bg-fuchsia-500/30 blur-[120px]" />
            <div className="absolute -bottom-[25%] left-[20%] h-[50vmax] w-[50vmax] animate-drift-c rounded-full bg-cyan-500/25 blur-[120px]" />
            <div className="absolute bottom-[5%] right-[5%] h-[28vmax] w-[28vmax] animate-drift-a rounded-full bg-rose-400/25 blur-[100px]" />
            <div
                className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(7_7_13/0.75)_100%)]" />
        </div>
    );
}
