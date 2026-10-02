export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <svg
            {...props}
            className={className}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="folio-a" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a78bfa" />
                    <stop offset="0.55" stopColor="#e879f9" />
                    <stop offset="1" stopColor="#fb7185" />
                </linearGradient>
                <linearGradient id="folio-b" x1="20" y1="6" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fff" stopOpacity="0.75" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
            </defs>
            <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#folio-a)" />
            <rect x="2.5" y="2.5" width="35" height="17" rx="10.5" fill="url(#folio-b)" opacity="0.5" />
            <path
                d="M11 13.5c3.2-1.4 6.2-1.2 9 .8v14c-2.8-2-5.8-2.2-9-.8v-14Z"
                fill="#fff"
                fillOpacity="0.95"
            />
            <path
                d="M29 13.5c-3.2-1.4-6.2-1.2-9 .8v14c2.8-2 5.8-2.2 9-.8v-14Z"
                fill="#fff"
                fillOpacity="0.7"
            />
            <path d="m29.5 7.5.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" fill="#fff" />
        </svg>
    );
}
