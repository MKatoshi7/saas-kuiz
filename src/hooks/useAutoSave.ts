'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
    onSave: () => Promise<void>;
    delay?: number;
    enabled?: boolean;
}

export function useAutoSave({ onSave, delay = 5000, enabled = true }: UseAutoSaveOptions) {
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSavingRef = useRef(false);

    const triggerSave = useCallback(async () => {
        if (isSavingRef.current || !enabled) return;

        try {
            isSavingRef.current = true;
            setStatus('saving');
            setError(null);

            await onSave();

            setStatus('saved');
            setLastSaved(new Date());

            // Reset to idle after 3 seconds
            setTimeout(() => {
                setStatus('idle');
            }, 3000);
        } catch (err) {
            // Silenciar erro no auto-save
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to save');

            // Reset error after 5 seconds
            setTimeout(() => {
                setStatus('idle');
                setError(null);
            }, 5000);
        } finally {
            isSavingRef.current = false;
        }
    }, [onSave, enabled]);

    const scheduleSave = useCallback(() => {
        if (!enabled) return;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Schedule new save
        saveTimeoutRef.current = setTimeout(() => {
            triggerSave();
        }, delay);
    }, [delay, triggerSave, enabled]);

    const saveNow = useCallback(async () => {
        // Cancel scheduled save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        await triggerSave();
    }, [triggerSave]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return {
        status,
        lastSaved,
        error,
        scheduleSave,
        saveNow,
        isSaving: status === 'saving',
    };
}
