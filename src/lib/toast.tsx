import { toast as sonnerToast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

interface ToastOptions {
    title?: string;
    description?: string;
    duration?: number;
}

export const toast = {
    success: (message: string, options?: ToastOptions) => {
        sonnerToast.success(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            icon: <CheckCircle2 className="w-5 h-5" />,
        });
    },

    error: (message: string, options?: ToastOptions) => {
        sonnerToast.error(message, {
            description: options?.description,
            duration: options?.duration || 5000,
            icon: <XCircle className="w-5 h-5" />,
        });
    },

    warning: (message: string, options?: ToastOptions) => {
        sonnerToast.warning(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            icon: <AlertCircle className="w-5 h-5" />,
        });
    },

    info: (message: string, options?: ToastOptions) => {
        sonnerToast.info(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            icon: <Info className="w-5 h-5" />,
        });
    },

    loading: (message: string, options?: ToastOptions) => {
        return sonnerToast.loading(message, {
            description: options?.description,
            icon: <Loader2 className="w-5 h-5 animate-spin" />,
        });
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return sonnerToast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        });
    },
};
