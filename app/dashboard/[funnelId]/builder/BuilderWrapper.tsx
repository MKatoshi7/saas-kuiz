'use client';

import dynamic from 'next/dynamic';

const BuilderPageClient = dynamic(() => import('./BuilderPageClient'), {
    ssr: false,
    loading: () => (
        <div className="h-full flex flex-col items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 font-medium animate-pulse">Carregando editor...</p>
            </div>
        </div>
    ),
});

export function BuilderWrapper({ funnelId }: { funnelId: string }) {
    return <BuilderPageClient funnelId={funnelId} />;
}
