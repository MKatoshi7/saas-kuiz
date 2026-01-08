import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CustomDomainSettings } from "@/components/settings/CustomDomainSettings";
import { SubdomainSettings } from "@/components/settings/SubdomainSettings";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId } = await params;

    const funnel = await prisma.funnel.findFirst({
        where: {
            OR: [
                { id: funnelId },
                { slug: funnelId }
            ]
        }
    });

    if (!funnel) return <div>Funil não encontrado</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto h-full overflow-y-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Configurações do Funil</h2>
                <p className="text-slate-500">Gerencie as configurações gerais, domínio e integrações.</p>
            </div>

            <div className="space-y-6">
                {/* General & Marketing Settings */}
                <SettingsForm funnel={funnel} />

                {/* Subdomain Settings */}
                <SubdomainSettings
                    funnelId={funnel.id}
                    currentSlug={funnel.slug}
                />

                {/* Custom Domain */}
                <CustomDomainSettings
                    funnelId={funnel.id}
                    initialDomain={funnel.customDomain || undefined}
                    currentSlug={funnel.slug}
                />

                {/* Danger Zone */}
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
                        <CardDescription>Ações irreversíveis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 mb-4">
                            Ao excluir este funil, todos os dados, leads e estatísticas associados serão perdidos permanentemente.
                        </p>
                        <Button variant="destructive">Excluir Funil</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
