'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title = 'Tem certeza?',
    description = 'Esta ação não pode ser desfeita.',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    isLoading = false,
}: ConfirmDialogProps) {
    const icons = {
        danger: <Trash2 className="w-6 h-6 text-red-600" />,
        warning: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
        info: <Info className="w-6 h-6 text-blue-600" />,
    };

    const buttonStyles = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-600',
        warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600',
        info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-600',
    };

    const handleConfirm = () => {
        onConfirm();
        if (!isLoading) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        {icons[variant]}
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={buttonStyles[variant]}
                    >
                        {isLoading ? 'Processando...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
