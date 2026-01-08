import { useState, useEffect, useRef } from "react";

export const useLoadingTimer = (duration: number, onComplete: () => void) => {
    const [progress, setProgress] = useState(0);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const startTime = Date.now();
        let animationId: number;
        let timeoutId: NodeJS.Timeout;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const nextProgress = Math.min((elapsed / duration) * 100, 100);

            setProgress(nextProgress);

            if (nextProgress < 100) {
                animationId = requestAnimationFrame(animate);
            } else {
                // Aguarda um pequeno delay (500ms) no 100% antes de mudar de tela
                // para o usuário ver que terminou.
                timeoutId = setTimeout(() => {
                    if (onCompleteRef.current) {
                        onCompleteRef.current();
                    }
                }, 500);
            }
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
            clearTimeout(timeoutId);
        };
    }, [duration]);

    return progress;
};
