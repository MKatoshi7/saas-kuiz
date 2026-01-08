import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function DashboardLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <DashboardSkeleton />
        </div>
    );
}
