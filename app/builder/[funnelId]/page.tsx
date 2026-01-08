import BuilderPageClient from './BuilderPageClient';

export default async function BuilderPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId } = await params;
    return <BuilderPageClient funnelId={funnelId} />;
}
