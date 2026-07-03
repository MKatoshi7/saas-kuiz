'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'dirty';

interface UseAutoSaveOptions<T> {
    data: T;
    onSave: (data: T) => Promise<boolean>;
    delay?: number;
    enabled?: boolean;
    /**
     * Compara o payload com o último salvo.
     * Se retornar true, considera que NÃO houve mudança e não salva.
     * Default: shallow JSON.
     */
    isEqual?: (a: T, b: T) => boolean;
}

export function useAutoSave<T>({
    data,
    onSave,
    delay = 3000,
    enabled = true,
    isEqual,
}: UseAutoSaveOptions<T>) {
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSavingRef = useRef(false);
    const lastSavedPayloadRef = useRef<T | null>(null);

    const areEqual = useMemo(() => {
        if (isEqual) return isEqual;
        return (a: T, b: T) => {
            try {
                return JSON.stringify(a) === JSON.stringify(b);
            } catch {
                return false;
            }
        };
    }, [isEqual]);

    const triggerSave = useCallback(async (payload: T) => {
        if (isSavingRef.current || !enabled) return false;
        if (lastSavedPayloadRef.current && areEqual(payload, lastSavedPayloadRef.current)) {
            return true;
        }
        try {
            isSavingRef.current = true;
            setStatus('saving');
            setError(null);

            const ok = await onSave(payload);

            if (ok) {
                lastSavedPayloadRef.current = payload;
                setLastSaved(new Date());
                setStatus('saved');
                setTimeout(() => setStatus('idle'), 2500);
            } else {
                setStatus('error');
                setError('Falha ao salvar');
            }
            return ok;
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to save');
            return false;
        } finally {
            isSavingRef.current = false;
        }
    }, [onSave, enabled, areEqual]);

    const scheduleSave = useCallback((payload: T) => {
        if (!enabled) return;
        if (lastSavedPayloadRef.current && areEqual(payload, lastSavedPayloadRef.current)) {
            return;
        }
        setStatus('dirty');
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            triggerSave(payload);
        }, delay);
    }, [delay, triggerSave, enabled, areEqual]);

    const saveNow = useCallback(async (payload?: T) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        const dataToSave = payload ?? data;
        return triggerSave(dataToSave);
    }, [data, triggerSave]);

    useEffect(() => {
        scheduleSave(data);
    }, [data, scheduleSave]);

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
        saveNow,
        isSaving: isSavingRef.current || status === 'saving',
        isDirty: status === 'dirty',
    };
}
