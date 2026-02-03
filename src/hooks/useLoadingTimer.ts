import { useState, useEffect, useRef } from "react";

export const useLoadingTimer = (duration: number, onComplete: () => void) => {
    const [progress, setProgress] = useState(0);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        console.log('🚀 useLoadingTimer started with duration:', duration);
        const startTime = Date.now();
        let animationId: number;
        let timeoutId: NodeJS.Timeout;
        let frameCount = 0;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const nextProgress = Math.min((elapsed / duration) * 100, 100);

            frameCount++;
            if (frameCount % 60 === 0) {
                console.log('🎬 Animation frame:', { frameCount, elapsed, nextProgress });
            }

            setProgress(nextProgress);

            if (nextProgress < 100) {
                animationId = requestAnimationFrame(animate);
            } else {
                console.log('✅ Progress reached 100%, waiting 500ms before callback');
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
            console.log('🛑 useLoadingTimer cleanup');
            cancelAnimationFrame(animationId);
            clearTimeout(timeoutId);
        };
    }, [duration]);

    return progress;
};
