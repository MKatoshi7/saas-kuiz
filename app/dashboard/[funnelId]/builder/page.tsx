import { BuilderWrapper } from './BuilderWrapper';
import { getSession } from '@/lib/auth';
import { checkSubscription } from '@/lib/subscription';
import { redirect } from 'next/navigation';

export default async function BuilderPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId } = await params;
    const session = await getSession();

    if (!session) redirect('/login');

    const hasAccess = await checkSubscription(session.userId);
    if (!hasAccess) {
        redirect('/dashboard/subscription-expired'); // Need to create this page or redirect to billing
    }

    return <BuilderWrapper funnelId={funnelId} />;
}
