import { useState, useEffect, useRef, useCallback } from "react";

export const useLoadingTimer = (duration: number, onComplete: () => void) => {
    const [progress, setProgress] = useState(0);
    const onCompleteRef = useRef(onComplete);
    const startTimeRef = useRef<number>(0);
    const animFrameRef = useRef<number>(0);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        startTimeRef.current = Date.now();

        const tick = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const next = Math.min((elapsed / duration) * 100, 100);
            setProgress(next);

            if (next < 100) {
                animFrameRef.current = requestAnimationFrame(tick);
            } else {
                setTimeout(() => {
                    onCompleteRef.current?.();
                }, 600);
            }
        };

        animFrameRef.current = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(animFrameRef.current);
    }, [duration]);

    return progress;
};
