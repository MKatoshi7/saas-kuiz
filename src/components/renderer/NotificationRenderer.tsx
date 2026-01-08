import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface NotificationData {
    id?: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number; // in milliseconds, 0 = no auto-dismiss
    position?: NotificationPosition;
    showCloseButton?: boolean;
    icon?: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface NotificationRendererProps {
    data: NotificationData;
    onClose?: () => void;
    className?: string;
}

export function NotificationRenderer({ data, onClose, className = '' }: NotificationRendererProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    const {
        type,
        title,
        message,
        duration = 5000,
        showCloseButton = true,
        icon = true,
        action
    } = data;

    useEffect(() => {
        if (duration > 0) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev - (100 / (duration / 100));
                    if (newProgress <= 0) {
                        handleClose();
                        return 0;
                    }
                    return newProgress;
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300); // Wait for animation to complete
    };

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-500',
                    iconColor: 'text-green-600',
                    titleColor: 'text-green-900',
                    messageColor: 'text-green-700',
                    progressColor: 'bg-green-500'
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-500',
                    iconColor: 'text-red-600',
                    titleColor: 'text-red-900',
                    messageColor: 'text-red-700',
                    progressColor: 'bg-red-500'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-500',
                    iconColor: 'text-yellow-600',
                    titleColor: 'text-yellow-900',
                    messageColor: 'text-yellow-700',
                    progressColor: 'bg-yellow-500'
                };
            default: // info
                return {
                    icon: Info,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-500',
                    iconColor: 'text-blue-600',
                    titleColor: 'text-blue-900',
                    messageColor: 'text-blue-700',
                    progressColor: 'bg-blue-500'
                };
        }
    };

    const config = getTypeConfig();
    const Icon = config.icon;

    return (
        <div
            className={`
                notification-component
                ${config.bgColor} ${config.borderColor}
                border-l-4 rounded-lg shadow-lg p-4 max-w-md w-full
                transition-all duration-300 ease-out
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
                ${className}
            `}
            role="alert"
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                {icon && (
                    <div className={`flex-shrink-0 ${config.iconColor}`}>
                        <Icon size={24} />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold ${config.titleColor} mb-1`}>
                        {title}
                    </h4>
                    {message && (
                        <p className={`text-sm ${config.messageColor}`}>
                            {message}
                        </p>
                    )}

                    {/* Action Button */}
                    {action && (
                        <button
                            onClick={action.onClick}
                            className={`
                                mt-2 text-sm font-medium ${config.iconColor}
                                hover:underline focus:outline-none
                            `}
                        >
                            {action.label}
                        </button>
                    )}
                </div>

                {/* Close Button */}
                {showCloseButton && (
                    <button
                        onClick={handleClose}
                        className={`
                            flex-shrink-0 ${config.iconColor} hover:opacity-70
                            transition-opacity focus:outline-none
                        `}
                        aria-label="Fechar notificação"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            {duration > 0 && (
                <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}

// Toast Container Component
interface ToastContainerProps {
    position?: NotificationPosition;
    children: React.ReactNode;
}

export function ToastContainer({ position = 'top-right', children }: ToastContainerProps) {
    const getPositionClasses = () => {
        switch (position) {
            case 'top-left':
                return 'top-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 -translate-x-1/2';
            case 'top-right':
                return 'top-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'bottom-center':
                return 'bottom-4 left-1/2 -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-4 right-4';
            default:
                return 'top-4 right-4';
        }
    };

    return (
        <div
            className={`
                fixed ${getPositionClasses()}
                z-50 flex flex-col gap-3
                pointer-events-none
            `}
        >
            <div className="pointer-events-auto">
                {children}
            </div>
        </div>
    );
}

// Hook for managing notifications
export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    const addNotification = (notification: Omit<NotificationData, 'id'>) => {
        const id = `notification-${Date.now()}-${Math.random()}`;
        setNotifications(prev => [...prev, { ...notification, id }]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const success = (title: string, message?: string, options?: Partial<NotificationData>) => {
        addNotification({ type: 'success', title, message, ...options });
    };

    const error = (title: string, message?: string, options?: Partial<NotificationData>) => {
        addNotification({ type: 'error', title, message, ...options });
    };

    const info = (title: string, message?: string, options?: Partial<NotificationData>) => {
        addNotification({ type: 'info', title, message, ...options });
    };

    const warning = (title: string, message?: string, options?: Partial<NotificationData>) => {
        addNotification({ type: 'warning', title, message, ...options });
    };

    return {
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        info,
        warning
    };
}

export default NotificationRenderer;
