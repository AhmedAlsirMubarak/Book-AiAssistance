export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-md border-white/25 bg-white/10 text-fuchsia-500 shadow-sm focus:ring-fuchsia-400/60 focus:ring-offset-0 ' +
                className
            }
        />
    );
}
