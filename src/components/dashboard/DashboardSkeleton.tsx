export function FunnelCardSkeleton() {
    return (
        <div className="border border-slate-200 rounded-lg p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>

            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5 mb-6"></div>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-100 rounded-lg p-3 h-20"></div>
                <div className="bg-gray-100 rounded-lg p-3 h-20"></div>
                <div className="bg-gray-100 rounded-lg p-3 h-20"></div>
            </div>

            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>

            <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="h-9 bg-gray-200 rounded"></div>
                <div className="h-9 bg-gray-200 rounded"></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="h-9 bg-gray-200 rounded"></div>
                <div className="h-9 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FunnelCardSkeleton />
                <FunnelCardSkeleton />
                <FunnelCardSkeleton />
            </div>
        </div>
    );
}
