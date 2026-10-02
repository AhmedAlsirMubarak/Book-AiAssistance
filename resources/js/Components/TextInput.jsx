import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-white shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)] backdrop-blur-md transition placeholder:text-white/35 focus:border-fuchsia-300/60 focus:bg-white/10 focus:ring-2 focus:ring-fuchsia-400/30 ' +
                className
            }
            ref={localRef}
        />
    );
});
