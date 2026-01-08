import { Plus, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
}

export function EmptyState({
    title = 'Nenhum funil criado',
    description = 'Comece criando seu primeiro funil de quiz para capturar leads',
    actionLabel = 'Criar Primeiro Funil',
    actionHref,
    onAction,
    icon,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                {icon || <Inbox className="w-10 h-10 text-gray-400" />}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>

            {onAction ? (
                <Button onClick={onAction} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    {actionLabel}
                </Button>
            ) : actionHref ? (
                <Link href={actionHref}>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                        {actionLabel}
                    </Button>
                </Link>
            ) : null}
        </div>
    );
}
